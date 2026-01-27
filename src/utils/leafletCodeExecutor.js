import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet-draw/dist/leaflet.draw.css";

import L from "leaflet";
import "leaflet.markercluster";
import "leaflet-draw";
import "leaflet.heat";

import { DomCodeExecutor } from "./domCodeExecutor";

// Fix for leaflet-draw: it might reference L.Draw.Event which might be missing or different
// Also ensuring window.L is available for plugins that might rely on global
if (typeof window !== 'undefined') {
    window.L = L;
}

export class LeafletCodeExecutor extends DomCodeExecutor {
  constructor(hostElement) {
    super(hostElement, () => ({ L }));
  }
}

