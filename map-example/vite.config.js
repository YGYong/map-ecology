import { defineConfig, splitVendorChunkPlugin } from "vite";
import vue from "@vitejs/plugin-vue";
import cesium from "vite-plugin-cesium";
import { resolve } from "path";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    cesium(), 
    splitVendorChunkPlugin(),
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
  optimizeDeps: {
    include: ["cesium"],
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
            if (id.includes("ol") || id.includes("leaflet")) {
              return "map-libs";
            }
            return "vendor";
          }
        },
      },
    },
  },
});
