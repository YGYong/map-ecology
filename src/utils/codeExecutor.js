import * as Cesium from "cesium";
import { resolveRuntimeAsset } from "./runtimeAssetMap";

export class CodeExecutor {
  constructor(viewer) {
    this.viewer = viewer;
    this.cleanupFunctions = [];
    this.styleElement = null;
    this.sandboxRoot = null;
    this.originalViewerParent = null;
    this.originalViewerNextSibling = null;
    this.initialTerrainProvider = viewer?.terrainProvider ?? null;
  }

  async execute(parsed) {
    try {
      // Clean up previous execution
      this.cleanup();

      let { script, template, style } = parsed;
      const fileName = parsed?.fileName || "";

      // 1. Process Style
      if (style) {
        this.processStyle(style);
      }

      // 2. Prepare Context (Initial)
      const viewerProxy = new Proxy(this.viewer, {
        get(target, prop) {
          if (prop === "value") return target;
          return Reflect.get(target, prop);
        },
        set(target, prop, value) {
          if (prop === "value") return true; // Ignore assignment to viewer.value
          return Reflect.set(target, prop, value);
        },
      });

      // Mock Cesium to intercept Viewer creation
      const self = this;
      const MockCesium = Object.defineProperties(
        {},
        Object.getOwnPropertyDescriptors(Cesium),
      );
      MockCesium.Viewer = function (container, options) {
        // Apply configuration to the real existing viewer
        self.applyConfigToViewer(options || {});
        // Return the proxy so user code continues to work with the "viewer" variable
        return viewerProxy;
      };
      // Copy prototype and static members
      MockCesium.Viewer.prototype = Cesium.Viewer.prototype;
      Object.assign(MockCesium.Viewer, Cesium.Viewer);

      const context = {
        Cesium: MockCesium,
        viewer: viewerProxy,
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

      // 3. Render Template
      if (template) {
        this.renderTemplate(template, context);
      }

      // 4. Inject Refs
      Object.keys(context.refs).forEach((refName) => {
        context[refName] = { value: context.refs[refName] };
      });

      // 5. Process Script
      if (script) {
        script = this.transformAssetImports(script);
        script = script.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "");
        script = script.replace(/import\s+['"].*?['"];?\s*/g, "");
        script = script.replace(/export\s+(default\s+)?/g, "");

        script = script.replace(
          /\b(let|const|var)\s+viewer\s*=\s*(?:ref\s*\(\s*null\s*\)|null)\s*;?\s*/g,
          "",
        );
        script = this.stripTemplateRefDeclarations(script, Object.keys(context.refs));

        // Transform variables
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

        // 6. Bind Events
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
    const assetExtRe = /\.(png|jpe?g|gif|webp|svg|bmp|tiff?|ktx2|glb|gltf|json|bin)(\?.*)?$/i;
    const importRe =
      /^\s*import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/gm;

    return script.replace(importRe, (full, varName, importPath) => {
      if (!assetExtRe.test(importPath)) return "";
      return `this.${varName} = __resolveAsset(${JSON.stringify(importPath)});`;
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

  applyConfigToViewer(config) {
    if (!this.viewer || !this.viewer.container) return;

    this.applyTerrainToViewer(config);

    const selectorMap = this.getWidgetSelectorMap();
    const findElement = (selectors) => {
      for (const selector of selectors) {
        const el = this.viewer.container.querySelector(selector);
        if (el) return el;
      }
      return null;
    };

    Object.keys(selectorMap).forEach((key) => {
      if (config[key] === undefined) return;
      if (key === "baseLayerPicker") {
        const { button, dropDown } = this.getBaseLayerPickerElements();
        const display = config[key] === false ? "none" : "";
        if (button) button.style.display = display;
        if (dropDown) dropDown.style.display = display;
        return;
      }
      const el = findElement(selectorMap[key]);
      if (!el) return;
      el.style.display = config[key] === false ? "none" : "";
    });

    if (config.baseLayer === false) {
      this.viewer.imageryLayers.removeAll();
    }
  }

  applyTerrainToViewer(config) {
    if (!this.viewer) return;

    const hasTerrainProviderKey = Object.prototype.hasOwnProperty.call(
      config,
      "terrainProvider",
    );
    const hasTerrainKey = Object.prototype.hasOwnProperty.call(config, "terrain");

    if (!hasTerrainProviderKey && !hasTerrainKey) return;

    try {
      if (hasTerrainProviderKey) {
        if (config.terrainProvider === false || config.terrainProvider === null) {
          if (Cesium.EllipsoidTerrainProvider) {
            this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
          }
        } else if (config.terrainProvider) {
          this.viewer.terrainProvider = config.terrainProvider;
        }
      }

      if (hasTerrainKey) {
        if (this.viewer.terrain !== undefined) {
          this.viewer.terrain = config.terrain;
        } else if (config.terrain && config.terrain.provider) {
          this.viewer.terrainProvider = config.terrain.provider;
        }
      }
    } catch (e) {
      console.warn("Failed to apply terrain config:", e);
    }
  }

  getWidgetSelectorMap() {
    return {
      geocoder: [
        ".cesium-viewer-geocoderContainer",
        ".cesium-geocoder-container",
        ".cesium-viewer-geocoder-container",
      ],
      homeButton: [".cesium-home-button"],
      sceneModePicker: [
        ".cesium-sceneModePicker-wrapper",
        ".cesium-sceneModePickerWrapper",
        ".cesium-sceneModePicker",
      ],
      baseLayerPicker: [
        ".cesium-baseLayerPicker-dropDown",
      ],
      navigationHelpButton: [
        ".cesium-navigationHelpButton-wrapper",
        ".cesium-navigationHelpButton",
        ".cesium-navigation-help-button",
      ],
      animation: [
        ".cesium-viewer-animationContainer",
        ".cesium-animationContainer",
      ],
      timeline: [".cesium-viewer-timelineContainer", ".cesium-timeline-main"],
      fullscreenButton: [
        ".cesium-viewer-fullscreenContainer",
        ".cesium-fullscreenButton",
        ".cesium-fullscreen-button",
      ],
    };
  }

  getBaseLayerPickerElements() {
    const dropDown = this.viewer.container.querySelector(
      ".cesium-baseLayerPicker-dropDown",
    );
    const img = this.viewer.container.querySelector(
      ".cesium-baseLayerPicker-selected",
    );
    const button = img ? img.closest("button") : null;
    return { button, dropDown };
  }

  processStyle(style) {
    const styleEl = document.createElement("style");
    styleEl.textContent = style;
    document.head.appendChild(styleEl);
    this.styleElement = styleEl;
  }

  renderTemplate(template, context) {
    if (!this.originalViewerParent) {
      this.originalViewerParent = this.viewer.container.parentNode;
      this.originalViewerNextSibling = this.viewer.container.nextSibling;
    }

    const sandbox = document.createElement("div");
    sandbox.className = "cesium-example-sandbox";
    sandbox.style.width = "100%";
    sandbox.style.height = "100%";
    sandbox.style.position = "relative";

    sandbox.innerHTML = template;

    // Find refs
    const allElements = sandbox.querySelectorAll("*");
    allElements.forEach((el) => {
      if (el.hasAttribute("ref")) {
        const refName = el.getAttribute("ref");
        context.refs[refName] = el;

        if (refName === "cesiumContainer") {
          el.innerHTML = "";
          el.appendChild(this.viewer.container);
        }
      }
    });

    // Fallback if no cesiumContainer ref
    if (!context.refs["cesiumContainer"]) {
      if (this.viewer.container.parentNode === this.originalViewerParent) {
        sandbox.appendChild(this.viewer.container);
      }
    }

    this.originalViewerParent.appendChild(sandbox);
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
              // Execute handler in context
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

    if (this.viewer && this.originalViewerParent) {
      if (this.viewer.container.parentNode !== this.originalViewerParent) {
        this.originalViewerParent.insertBefore(
          this.viewer.container,
          this.originalViewerNextSibling,
        );
      }
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

    // Reset Viewer State
    if (this.viewer) {
      if (this.initialTerrainProvider && this.viewer.terrainProvider) {
        this.viewer.terrainProvider = this.initialTerrainProvider;
      }

      const selectorMap = this.getWidgetSelectorMap();
      Object.values(selectorMap).forEach((selectors) => {
        selectors.forEach((selector) => {
          const el = this.viewer.container?.querySelector(selector);
          if (el) el.style.display = "";
        });
      });

      const { button, dropDown } = this.getBaseLayerPickerElements();
      if (button) button.style.display = "";
      if (dropDown) dropDown.style.display = "";

      if (
        this.viewer.cesiumWidget &&
        this.viewer.cesiumWidget.creditContainer
      ) {
        this.viewer.cesiumWidget.creditContainer.style.display = "";
      }
    }
  }
}
