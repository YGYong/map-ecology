import { getCesiumIonAccessToken, getTiandituToken } from "../config/tokens";

export function syncMapTokens() {
  window.CESIUM_ION_TOKEN = getCesiumIonAccessToken();
  window.TIANDITU_TOKEN = getTiandituToken();
}

export function configureCesium(Cesium) {
  syncMapTokens();
  window.Cesium = Cesium;

  if (window.CESIUM_ION_TOKEN) {
    Cesium.Ion.defaultAccessToken = window.CESIUM_ION_TOKEN;
  }
}
