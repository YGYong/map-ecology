function normalizeBaseUrl(value) {
  const v = String(value || "/");
  if (!v.endsWith("/")) return `${v}/`;
  return v;
}

export function getPublicBaseUrl() {
  return normalizeBaseUrl(import.meta.env.BASE_URL || "/");
}

export function getCesiumIonAccessToken() {
  return String(import.meta.env.VITE_CESIUM_ION_ACCESS_TOKEN || "").trim();
}

export function getTiandituToken() {
  return String(
    import.meta.env.VITE_TIANDITU_TOKEN || "2b34f6afbcd235c2bc4bed3f7735f1f5",
  ).trim();
}
