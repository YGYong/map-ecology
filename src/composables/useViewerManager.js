import { ref, onUnmounted } from 'vue'
import * as Cesium from 'cesium'

/**
 * Composable for managing Cesium Viewer lifecycle
 * 
 * Provides methods to:
 * - Initialize a Cesium Viewer instance
 * - Clear scene entities and data sources
 * - Reset camera to default position
 * - Destroy the Viewer instance
 * 
 * Automatically destroys the Viewer on component unmount
 * 
 * Performance optimization (Requirement 9.5):
 * - Viewer instance is created once and reused across example switches
 * - Only scene content is cleared between examples, not the entire viewer
 * - This avoids expensive viewer recreation and improves performance
 * 
 * @returns {Object} ViewerManager interface
 */
export function useViewerManager() {
  const viewer = ref(null)

  /**
   * Initialize a new Cesium Viewer instance
   * Destroys any existing viewer before creating a new one
   * 
   * Requirement 9.5: Viewer instance is reused - this is only called once
   * when the component mounts, not when switching examples
   * 
   * @param {HTMLElement} container - The DOM element to render the viewer in
   */
  function initViewer(container) {
    if (viewer.value) {
      destroyViewer()
    }

    viewer.value = new Cesium.Viewer(container, {
      terrain: Cesium.Terrain.fromWorldTerrain(),
      imageryProvider: new Cesium.UrlTemplateImageryProvider({
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        credit: '© OpenStreetMap contributors'
      })
    })

    // Hide Cesium logo/credit container
    viewer.value.cesiumWidget.creditContainer.style.display = 'none'
  }

  /**
   * Clear all entities and data sources from the scene
   * Used before running new code to ensure a clean slate
   * 
   * Requirement 9.5: This method clears scene content WITHOUT destroying
   * the viewer instance, enabling viewer reuse for better performance
   */
  function clearScene() {
    if (viewer.value) {
      viewer.value.entities.removeAll()
      viewer.value.dataSources.removeAll()
    }
  }

  /**
   * Reset camera to default position
   * Default view: Beijing, China at 10km altitude
   */
  function resetCamera() {
    if (viewer.value) {
      viewer.value.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 10000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
          roll: 0
        }
      })
    }
  }

  /**
   * Destroy the Viewer instance and release resources
   * Sets viewer ref to null after destruction
   */
  function destroyViewer() {
    if (viewer.value) {
      viewer.value.destroy()
      viewer.value = null
    }
  }

  // Automatically destroy viewer when component unmounts
  onUnmounted(() => {
    destroyViewer()
  })

  return {
    viewer,
    initViewer,
    clearScene,
    resetCamera,
    destroyViewer
  }
}
