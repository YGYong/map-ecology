import { resolveRuntimeAsset } from "./runtimeAssetMap";

export class DomCodeExecutor {
  constructor(hostElement, contextFactory, moduleRegistry = null) {
    this.hostElement = hostElement;
    this.contextFactory = contextFactory;
    this.moduleRegistry = moduleRegistry;
    this.cleanupFunctions = [];
    this.styleElement = null;
    this.sandboxRoot = null;
  }

  async execute(parsed) {
    try {
      this.cleanup();

      let { script, template, style } = parsed;
      const fileName = parsed?.fileName || "";

      if (style) {
        this.processStyle(style);
      }

      const context = {
        console: window.console,
        document: window.document,
        window: window,
        __resolveAsset: (importPath) => resolveRuntimeAsset(fileName, importPath),
        ref: (val) => ({ value: val }),
        reactive: (obj) => obj,
        onMounted: (fn) => {
          setTimeout(() => {
            try {
              fn();
            } catch (error) {
              console.error("onMounted error:", error);
            }
          }, 0);
        },
        onUnmounted: (fn) => {
          this.cleanupFunctions.push(fn);
        },
        refs: {},
      };

      if (typeof this.contextFactory === "function") {
        Object.assign(context, await this.contextFactory());
      }

      if (template) {
        this.renderTemplate(template, context);
      }

      Object.keys(context.refs).forEach((refName) => {
        context[refName] = { value: context.refs[refName] };
      });

      if (script) {
        this.applyModuleImports(script, context);
        script = this.transformAssetImports(script);
        script = script.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "");
        script = script.replace(/import\s+['"].*?['"];?\s*/g, "");
        script = script.replace(/export\s+(default\s+)?/g, "");

        script = this.stripTemplateRefDeclarations(script, Object.keys(context.refs));

        script = script.replace(
          /^(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=/gm,
          "this.$1 =",
        );
        script = script.replace(
          /^function\s+([a-zA-Z0-9_$]+)\s*\(/gm,
          "this.$1 = function $1(",
        );

        const wrappedCode = `
          (function() {
            with(this) {
              try {
                ${script}
              } catch (error) {
                console.error('Script execution error:', error);
                throw error;
              }
            }
          }).call(this);
        `;

        const executor = new Function(wrappedCode);
        executor.call(context);

        if (this.sandboxRoot) {
          this.bindEvents(this.sandboxRoot, context);
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Execution error:", error);
      return {
        success: false,
        error: {
          type: "runtime",
          message: error.message,
          stack: error.stack,
        },
      };
    }
  }

  transformAssetImports(script) {
    const assetExtRe =
      /\.(png|jpe?g|gif|webp|svg|bmp|tiff?|ktx2|glb|gltf|json|bin)(\?.*)?$/i;
    const importRe =
      /^\s*import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/gm;

    return script.replace(importRe, (full, varName, importPath) => {
      if (!assetExtRe.test(importPath)) return "";
      return `this.${varName} = __resolveAsset(${JSON.stringify(importPath)});`;
    });
  }

  applyModuleImports(script, context) {
    if (!this.moduleRegistry) return;

    const defaultImportRe =
      /^\s*import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/gm;
    const namedImportRe =
      /^\s*import\s*\{\s*([^}]+)\s*\}\s*from\s+['"]([^'"]+)['"]\s*;?\s*$/gm;

    const resolveModule = (specifier) => {
      return this.moduleRegistry?.[specifier] || null;
    };

    script.replace(defaultImportRe, (full, localName, specifier) => {
      const mod = resolveModule(specifier);
      if (!mod) return full;
      context[localName] = mod.default ?? mod;
      return full;
    });

    script.replace(namedImportRe, (full, importsRaw, specifier) => {
      const mod = resolveModule(specifier);
      if (!mod) return full;

      const parts = importsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      parts.forEach((part) => {
        const m = part.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)(?:\s+as\s+([a-zA-Z_$][a-zA-Z0-9_$]*))?$/);
        if (!m) return;
        const imported = m[1];
        const local = m[2] || imported;
        if (mod[imported] !== undefined) {
          context[local] = mod[imported];
        }
      });

      return full;
    });
  }

  stripTemplateRefDeclarations(script, refNames) {
    if (!Array.isArray(refNames) || refNames.length === 0) return script;

    const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let result = script;

    refNames.forEach((refName) => {
      const name = escapeRegExp(refName);
      const re = new RegExp(
        `\\b(let|const|var)\\s+${name}\\s*=\\s*(?:ref\\s*\\(\\s*null\\s*\\)|ref\\s*\\(\\s*\\)|null)\\s*;?\\s*`,
        "g",
      );
      result = result.replace(re, "");
    });

    return result;
  }

  processStyle(style) {
    const styleEl = document.createElement("style");
    styleEl.textContent = style;
    document.head.appendChild(styleEl);
    this.styleElement = styleEl;
  }

  renderTemplate(template, context) {
    if (!this.hostElement) return;
    const sandbox = document.createElement("div");
    sandbox.className = "example-sandbox";
    sandbox.style.width = "100%";
    sandbox.style.height = "100%";
    sandbox.style.position = "relative";
    sandbox.innerHTML = template;

    const allElements = sandbox.querySelectorAll("*");
    allElements.forEach((el) => {
      if (el.hasAttribute("ref")) {
        const refName = el.getAttribute("ref");
        context.refs[refName] = el;
      }
    });

    this.hostElement.appendChild(sandbox);
    this.sandboxRoot = sandbox;
  }

  bindEvents(root, context) {
    const allElements = root.querySelectorAll("*");
    allElements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith("@") || attr.name.startsWith("v-on:")) {
          const eventName = attr.name.startsWith("@")
            ? attr.name.slice(1)
            : attr.name.slice(5);
          const handlerExpression = attr.value;

          el.addEventListener(eventName, (event) => {
            try {
              const handler = new Function(
                "$event",
                `
                with(this) {
                  ${handlerExpression}
                }
              `,
              );
              handler.call(context, event);
            } catch (err) {
              console.error(`Event handler error (${eventName}):`, err);
            }
          });
        }
      });
    });
  }

  cleanup() {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }

    if (this.sandboxRoot) {
      this.sandboxRoot.remove();
      this.sandboxRoot = null;
    }

    this.cleanupFunctions.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error(e);
      }
    });
    this.cleanupFunctions = [];

    if (this.hostElement) {
      this.hostElement.innerHTML = "";
    }
  }
}
