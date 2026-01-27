import { resolveRuntimeAsset } from "./runtimeAssetMap";

export class DomCodeExecutor {
  constructor(hostElement, contextFactory, moduleRegistry = null) {
    this.hostElement = hostElement;
    this.contextFactory = contextFactory;
    this.moduleRegistry = moduleRegistry;
    this.cleanupFunctions = [];
    this.styleElement = null;
    this.sandboxRoot = null;
    this.bindings = [];
    this.watchSubscriptions = new WeakMap();
  }

  async execute(parsed) {
    try {
      this.cleanup();
      this.bindings = [];
      this.watchSubscriptions = new WeakMap();

      let { script, template, style } = parsed;
      const fileName = parsed?.fileName || "";

      if (style) {
        this.processStyle(style);
      }

      const subscribeToRef = (refObj, fn) => {
        if (!refObj || typeof refObj !== "object") return () => {};
        let set = this.watchSubscriptions.get(refObj);
        if (!set) {
          set = new Set();
          this.watchSubscriptions.set(refObj, set);
        }
        set.add(fn);
        return () => set.delete(fn);
      };

      const notifyRefChange = (refObj, newVal, oldVal) => {
        const set = this.watchSubscriptions.get(refObj);
        if (!set) return;
        Array.from(set).forEach((fn) => {
          try {
            fn(newVal, oldVal);
          } catch (e) {
            console.error("watch callback error:", e);
          }
        });
      };

      const createRef = (val) => {
        let _value = val;
        const refObj = {};
        Object.defineProperty(refObj, "value", {
          get() {
            return _value;
          },
          set(next) {
            const prev = _value;
            _value = next;
            notifyRefChange(refObj, next, prev);
          },
          enumerable: true,
        });
        return refObj;
      };

      const context = {
        console: window.console,
        document: window.document,
        window: window,
        __resolveAsset: (importPath) => resolveRuntimeAsset(fileName, importPath),
        ref: (val) => createRef(val),
        reactive: (obj) => obj,
        computed: (getter) => ({
          get value() {
            return getter();
          },
        }),
        watch: (source, cb, options = {}) => {
          const resolveValue = (s) => {
            if (typeof s === "function") return s();
            if (Array.isArray(s)) return s.map(resolveValue);
            if (s && typeof s === "object" && "value" in s) return s.value;
            return s;
          };

          const collectRefs = (s, out) => {
            if (Array.isArray(s)) {
              s.forEach((item) => collectRefs(item, out));
              return;
            }
            if (s && typeof s === "object" && "value" in s) {
              out.add(s);
            }
          };

          const run = () => {
            try {
              cb(resolveValue(source), undefined);
            } catch (e) {
              console.error("watch error:", e);
            }
          };

          const refs = new Set();
          collectRefs(source, refs);
          const unsubs = Array.from(refs).map((r) => subscribeToRef(r, run));

          if (options && options.immediate) run();
          return () => unsubs.forEach((fn) => fn());
        },
        nextTick: () => Promise.resolve(),
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
        onBeforeUnmount: (fn) => {
          this.cleanupFunctions.push(fn);
        },
        __notifyRefChange: notifyRefChange,
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
          this.setupBindings(this.sandboxRoot, context);
          this.updateBindings();
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
              const exp = String(handlerExpression || "").trim();
              const treatAsFunctionRef =
                exp &&
                !exp.includes("(") &&
                !exp.includes("=") &&
                !exp.includes("++") &&
                !exp.includes("--") &&
                !exp.includes("?") &&
                !exp.includes(":");

              if (treatAsFunctionRef) {
                const getter = new Function(
                  "$event",
                  `
                  with(this) {
                    return (${exp});
                  }
                `,
                );
                const fn = getter.call(context, event);
                if (typeof fn === "function") {
                  fn.call(context, event);
                  return;
                }
              }

              const handler = new Function(
                "$event",
                `
                with(this) {
                  ${exp}
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

  setupBindings(root, context) {
    if (!root) return;
    const unwrap = (val) => {
      if (!val) return val;
      if (val instanceof Element) return val;
      if (typeof val === "object" && "value" in val) return val.value;
      return val;
    };

    const evalInContext = (expression) => {
      try {
        const fn = new Function(
          `
          with(this) {
            return (${expression});
          }
        `,
        );
        return unwrap(fn.call(context));
      } catch (e) {
        console.error("binding eval error:", e);
        return undefined;
      }
    };

    const setByPath = (path, value) => {
      const cleaned = String(path || "").trim();
      const m = cleaned.match(
        /^([a-zA-Z_$][a-zA-Z0-9_$]*)(?:\.([a-zA-Z0-9_$.]+))?$/,
      );
      if (!m) {
        try {
          const fn = new Function(
            "value",
            `
            with(this) {
              ${cleaned} = value;
            }
          `,
          );
          fn.call(context, value);
          this.updateBindings();
        } catch (e) {
          console.error("v-model set error:", e);
        }
        return;
      }

      const rootKey = m[1];
      const rest = m[2] ? m[2].split(".").filter(Boolean) : [];
      let target = context[rootKey];
      if (target && typeof target === "object" && "value" in target) {
        if (rest.length === 0) {
          const prev = target.value;
          target.value = value;
          if (context.__notifyRefChange) context.__notifyRefChange(target, value, prev);
          return;
        }
        target = target.value;
      }

      if (!target || typeof target !== "object") return;
      let obj = target;
      for (let i = 0; i < rest.length - 1; i++) {
        const key = rest[i];
        if (!obj[key] || typeof obj[key] !== "object") obj[key] = {};
        obj = obj[key];
      }
      const last = rest[rest.length - 1];
      obj[last] = value;
    };

    const updateTextNode = (node, raw) => {
      node.textContent = raw.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, exp) => {
        const v = evalInContext(exp);
        return v === undefined || v === null ? "" : String(v);
      });
    };

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeValue && node.nodeValue.includes("{{")) {
        textNodes.push({ node, raw: node.nodeValue });
      }
    }
    textNodes.forEach(({ node, raw }) => {
      this.bindings.push(() => updateTextNode(node, raw));
    });

    const elements = root.querySelectorAll("*");
    elements.forEach((el) => {
      if (el.hasAttribute("v-model")) {
        const exp = el.getAttribute("v-model");
        const isCheckbox = el.tagName === "INPUT" && el.type === "checkbox";
        const isRadio = el.tagName === "INPUT" && el.type === "radio";
        const eventName = isCheckbox || isRadio ? "change" : "input";

        const updateEl = () => {
          const v = evalInContext(exp);
          if (isCheckbox) {
            el.checked = Boolean(v);
          } else if (el.tagName === "SELECT") {
            el.value = v == null ? "" : String(v);
          } else {
            el.value = v == null ? "" : String(v);
          }
        };

        const fromEl = () => {
          let v = null;
          if (isCheckbox) v = el.checked;
          else v = el.value;

          if (el.type === "range" || el.type === "number") {
            const n = Number(v);
            if (!Number.isNaN(n)) v = n;
          }

          setByPath(exp, v);
          this.updateBindings();
        };

        el.addEventListener(eventName, fromEl);
        this.bindings.push(updateEl);
      }

      if (el.hasAttribute("v-show")) {
        const exp = el.getAttribute("v-show");
        const originalDisplay = el.style.display;
        this.bindings.push(() => {
          const ok = Boolean(evalInContext(exp));
          el.style.display = ok ? originalDisplay : "none";
        });
      }

      if (el.hasAttribute("v-if")) {
        const exp = el.getAttribute("v-if");
        const originalDisplay = el.style.display;
        this.bindings.push(() => {
          const ok = Boolean(evalInContext(exp));
          el.style.display = ok ? originalDisplay : "none";
        });
      }

      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith(":") || attr.name.startsWith("v-bind:")) {
          const bindName = attr.name.startsWith(":")
            ? attr.name.slice(1)
            : attr.name.slice(7);
          const exp = attr.value;

          this.bindings.push(() => {
            const v = evalInContext(exp);
            if (bindName === "class") {
              if (typeof v === "string") {
                el.className = v;
              } else if (Array.isArray(v)) {
                el.className = v.filter(Boolean).join(" ");
              } else if (v && typeof v === "object") {
                Object.keys(v).forEach((k) => {
                  if (v[k]) el.classList.add(k);
                  else el.classList.remove(k);
                });
              }
              return;
            }
            if (bindName === "style") {
              if (typeof v === "string") {
                el.setAttribute("style", v);
              } else if (v && typeof v === "object") {
                Object.keys(v).forEach((k) => {
                  el.style[k] = v[k];
                });
              }
              return;
            }
            if (bindName in el) {
              el[bindName] = v;
            } else if (v === false || v === null || v === undefined) {
              el.removeAttribute(bindName);
            } else {
              el.setAttribute(bindName, String(v));
            }
          });
        }
      });
    });
  }

  updateBindings() {
    this.bindings.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error("binding update error:", e);
      }
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

    this.bindings = [];
    this.watchSubscriptions = new WeakMap();
  }
}
