import * as Cesium from "cesium";

export class CodeExecutor {
  constructor(viewer) {
    this.viewer = viewer;
    this.cleanupFunctions = [];
    this.styleElement = null;
    this.sandboxRoot = null;
    this.originalViewerParent = null;
    this.originalViewerNextSibling = null;
  }

  async execute(parsed) {
    try {
      // Clean up previous execution
      this.cleanup();

      let { script, template, style } = parsed;

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
        script = script.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "");
        script = script.replace(/import\s+['"].*?['"];?\s*/g, "");
        script = script.replace(/export\s+(default\s+)?/g, "");

        script = script.replace(
          /\b(let|const|var)\s+viewer\s*=\s*(?:ref\s*\(\s*null\s*\)|null)\s*;?\s*/g,
          "",
        );
        script = script.replace(
          /\b(let|const|var)\s+cesiumContainer\s*=\s*ref\s*\(\s*null\s*\)\s*;?\s*/g,
          "",
        );

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

  applyConfigToViewer(config) {
    if (!this.viewer || !this.viewer.container) return;

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
