function normalizeBaseUrl(value) {
  const v = String(value || "/");
  if (!v.endsWith("/")) return `${v}/`;
  return v;
}

export function getPublicBaseUrl() {
  return normalizeBaseUrl(import.meta.env.BASE_URL || "/");
}

export function getCesiumIonAccessToken() {
  return String(
    import.meta.env.VITE_CESIUM_ION_ACCESS_TOKEN ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZTEwODgwMS1iYTY0LTRhNmYtYWFhMS03MDEzMjlhYWNjOTciLCJpZCI6MzAwMTM5LCJpYXQiOjE3NDY1ODI5MTR9.P4bdCMYyoubNMaQ_-ZkU99mM8Da3o8HIo4A57stHRAg",
  ).trim();
}

export function getTiandituToken() {
  return String(
    import.meta.env.VITE_TIANDITU_TOKEN || "2b34f6afbcd235c2bc4bed3f7735f1f5",
  ).trim();
}
