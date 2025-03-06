import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    vue({
      customElement: true,
    }),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      name: "AtoaWebSdk",
      fileName: (format) => `atoa-web-sdk.${format}.js`,
    },
    rollupOptions: {
      external: [], // If you want to bundle Vue, don't list it as external
      output: {
        globals: {},
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
