import * as Cesium from "cesium";
import { DomCodeExecutor } from "./domCodeExecutor";

export class CodeExecutor extends DomCodeExecutor {
  constructor(viewer, hostElement, moduleRegistry = null) {
    super(hostElement, null, moduleRegistry);
    this.viewer = viewer;
    this.initialTerrainProvider = viewer?.terrainProvider ?? null;
    this.originalViewerParent = null;
    this.originalViewerNextSibling = null;

    // Set contextFactory to include Cesium and viewer
    this.contextFactory = async () => {
      const viewerProxy = new Proxy(this.viewer, {
        get(target, prop) {
          if (prop === "value") return target;
          return Reflect.get(target, prop);
        },
        set(target, prop, value) {
          if (prop === "value") return true;
          return Reflect.set(target, prop, value);
        },
      });

      const self = this;
      const MockCesium = {};
      Object.keys(Cesium).forEach((k) => {
        MockCesium[k] = Cesium[k];
      });
      MockCesium.Viewer = function (container, options) {
        self.applyConfigToViewer(options || {});
        return viewerProxy;
      };
      MockCesium.Viewer.prototype = Cesium.Viewer.prototype;
      Object.assign(MockCesium.Viewer, Cesium.Viewer);

      return {
        Cesium: MockCesium,
        viewer: viewerProxy,
      };
    };
  }

  renderTemplate(template, context) {
    if (!this.originalViewerParent && this.viewer.container) {
      this.originalViewerParent = this.viewer.container.parentNode;
      this.originalViewerNextSibling = this.viewer.container.nextSibling;
    }

    const host = this.hostElement || this.originalViewerParent;
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
    if (!context.refs["cesiumContainer"] && this.viewer.container) {
      if (this.viewer.container.parentNode === this.originalViewerParent) {
        sandbox.appendChild(this.viewer.container);
      }
    }

    if (host) {
      host.appendChild(sandbox);
    }
    this.sandboxRoot = sandbox;
  }

  cleanup() {
    super.cleanup();

    if (this.viewer && this.originalViewerParent) {
      if (this.viewer.container.parentNode !== this.originalViewerParent) {
        this.originalViewerParent.insertBefore(
          this.viewer.container,
          this.originalViewerNextSibling,
        );
      }
    }

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
      baseLayerPicker: [".cesium-baseLayerPicker-dropDown"],
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
    if (!this.viewer || !this.viewer.container) return { button: null, dropDown: null };
    const dropDown = this.viewer.container.querySelector(
      ".cesium-baseLayerPicker-dropDown",
    );
    const img = this.viewer.container.querySelector(
      ".cesium-baseLayerPicker-selected",
    );
    const button = img ? img.closest("button") : null;
    return { button, dropDown };
  }
}
