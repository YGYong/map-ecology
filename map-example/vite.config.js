import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import * as cesiumModule from "cesium";
import { cpSync, createReadStream, existsSync, rmSync, statSync } from "fs";
import { extname, join, normalize, resolve, sep } from "path";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

const base = "/map-ecology/example/";
const cesiumBaseUrl = `${base}cesium/`;

function cesiumGlobal() {
  const validExportNames = Object.keys(cesiumModule).filter((name) =>
    /^[A-Za-z_$][\w$]*$/.test(name) && name !== "default"
  );

  return {
    name: "cesium-global",
    enforce: "pre",
    resolveId(id) {
      if (id === "cesium") {
        return "\0cesium-global";
      }
    },
    load(id) {
      if (id !== "\0cesium-global") return null;

      return `
const Cesium = window.Cesium;
if (!Cesium) {
  throw new Error("Cesium global script is not loaded.");
}
${validExportNames.map((name) => `export const ${name} = Cesium.${name};`).join("\n")}
export default Cesium;
`;
    },
    configureServer(server) {
      const sourceRoot = resolve(__dirname, "node_modules/cesium/Build/Cesium");
      const urlPrefix = cesiumBaseUrl;

      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url?.split("?")[0] || "";
        if (!rawUrl.startsWith(urlPrefix)) {
          next();
          return;
        }

        const relativeUrl = decodeURIComponent(rawUrl.slice(urlPrefix.length));
        const filePath = normalize(join(sourceRoot, relativeUrl));
        if (!filePath.startsWith(sourceRoot + sep)) {
          res.statusCode = 403;
          res.end("Forbidden");
          return;
        }

        try {
          const stat = statSync(filePath);
          if (!stat.isFile()) {
            next();
            return;
          }

          const mimeTypes = {
            ".css": "text/css",
            ".js": "text/javascript",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".wasm": "application/wasm",
          };
          res.setHeader("Content-Type", mimeTypes[extname(filePath)] || "application/octet-stream");
          res.setHeader("Access-Control-Allow-Origin", "*");
          createReadStream(filePath).pipe(res);
        } catch {
          next();
        }
      });
    },
    transformIndexHtml() {
      return [
        {
          tag: "link",
          attrs: {
            rel: "stylesheet",
            href: `${cesiumBaseUrl}Widgets/widgets.css`,
          },
        },
        {
          tag: "script",
          attrs: {
            src: `${cesiumBaseUrl}Cesium.js`,
          },
        },
      ];
    },
  };
}

function copyCesiumPublicAssets() {
  return {
    name: "copy-cesium-public-assets",
    enforce: "post",
    closeBundle() {
      const sourceRoot = resolve(__dirname, "node_modules/cesium/Build/Cesium");
      const targetRoot = resolve(__dirname, "dist/cesium");
      const nestedBaseCopy = resolve(__dirname, "dist/map-ecology");

      ["Assets", "ThirdParty", "Workers", "Widgets"].forEach((dir) => {
        cpSync(resolve(sourceRoot, dir), resolve(targetRoot, dir), {
          recursive: true,
        });
      });
      cpSync(resolve(sourceRoot, "Cesium.js"), resolve(targetRoot, "Cesium.js"));

      if (existsSync(nestedBaseCopy)) {
        rmSync(nestedBaseCopy, { recursive: true, force: true });
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    cesiumGlobal(),
    vue(),
    copyCesiumPublicAssets(),
    ViteImageOptimizer({
      png: {
        quality: 70, // 压缩 PNG 质量
      },
      jpeg: {
        quality: 70, // 压缩 JPG 质量
      },
      jpg: {
        quality: 70,
      },
      webp: {
        lossless: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("cesium")) {
              return "cesium";
            }
            if (id.includes("element-plus")) {
              return "element-plus";
            }
            if (id.includes("echarts")) {
              return "echarts";
            }
            if (/node_modules[\\/](ol|ol-echarts|ol-wind)[\\/]/.test(id)) {
              return "openlayers";
            }
            if (
              /node_modules[\\/](leaflet|leaflet-draw|leaflet-image|leaflet-measure|leaflet\.heat|leaflet\.markercluster)[\\/]/.test(
                id,
              )
            ) {
              return "leaflet";
            }
          }
        },
      },
    },
  },
});
