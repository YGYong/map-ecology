import * as Cesium from "cesium";
import { CodeExecutor } from "./codeExecutor";

let optionalDepsPromise = null;

const normalizeExport = (mod, preferredNames = []) => {
  if (!mod) return null;
  if (mod.default !== undefined) return mod.default;
  for (const name of preferredNames) {
    if (mod[name] !== undefined) return mod[name];
  }
  return mod;
};

const loadOptionalDeps = async () => {
  if (optionalDepsPromise) return optionalDepsPromise;

  optionalDepsPromise = (async () => {
    const contextAdditions = {};
    const registryAdditions = {};

    try {
      const navMod = await import("cesium-navigation-es6");
      const nav = normalizeExport(navMod);
      contextAdditions.CesiumNavigation = nav;
      registryAdditions["cesium-navigation-es6"] = navMod;
    } catch (e) {
      console.warn("Optional dep failed: cesium-navigation-es6", e);
    }

    try {
      const datMod = await import("dat.gui");
      const dat = normalizeExport(datMod);
      contextAdditions.dat = dat;
      registryAdditions["dat.gui"] = datMod;
    } catch (e) {
      console.warn("Optional dep failed: dat.gui", e);
    }

    return { contextAdditions, registryAdditions };
  })();

  return optionalDepsPromise;
};

export class CesiumCodeExecutor extends CodeExecutor {
  constructor(viewer, hostElement) {
    super(viewer, hostElement);

    const originalContextFactory = this.contextFactory;
    this.contextFactory = async () => {
      const baseContext = await originalContextFactory();
      const { contextAdditions, registryAdditions } = await loadOptionalDeps();

      // Update module registry
      this.moduleRegistry = {
        cesium: baseContext.Cesium,
        ...registryAdditions,
      };

      // Return combined context
      return {
        ...baseContext,
        ...contextAdditions,
      };
    };
  }
}
