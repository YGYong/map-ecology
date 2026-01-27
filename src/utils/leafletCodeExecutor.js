import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { DomCodeExecutor } from "./domCodeExecutor";

export class LeafletCodeExecutor extends DomCodeExecutor {
  constructor(hostElement) {
    super(hostElement, () => ({ L }));
  }
}

