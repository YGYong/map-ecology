import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cesium from "vite-plugin-cesium";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), cesium()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ["cesium"],
  },
});
