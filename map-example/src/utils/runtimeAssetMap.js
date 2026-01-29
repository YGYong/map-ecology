const viewImgModules = import.meta.glob("/src/views/**/imgs/**/*", {
  eager: true,
  query: "?url",
  import: "default",
});

const srcAssetModules = import.meta.glob("/src/assets/**/*", {
  eager: true,
  query: "?url",
  import: "default",
});

function normalizeFileName(fileName) {
  if (!fileName) return "";
  return String(fileName).replace(/\\/g, "/").replace(/^\/+/, "");
}

function resolveRelativeToView(fileName, relativePath) {
  const normalized = normalizeFileName(fileName);
  if (!normalized) return "";
  const dir = normalized.includes("/")
    ? normalized.slice(0, normalized.lastIndexOf("/") + 1)
    : "";
  const baseUrl = `http://local.test/src/views/${dir}`;
  return new URL(relativePath, baseUrl).pathname;
}

export function resolveRuntimeAsset(fileName, importPath) {
  const raw = String(importPath || "").trim();
  if (!raw) return "";

  if (/^(https?:)?\/\//.test(raw) || raw.startsWith("data:")) return raw;

  if (raw.startsWith("@/")) {
    const key = `/src/${raw.slice(2)}`;
    return srcAssetModules[key] || viewImgModules[key] || raw;
  }

  if (raw.startsWith("/src/")) {
    return srcAssetModules[raw] || viewImgModules[raw] || raw;
  }

  if (raw.startsWith("./") || raw.startsWith("../")) {
    const key = resolveRelativeToView(fileName, raw);
    if (!key) return raw;
    return viewImgModules[key] || srcAssetModules[key] || raw;
  }

  if (raw.startsWith("/")) {
    return raw;
  }

  return raw;
}

