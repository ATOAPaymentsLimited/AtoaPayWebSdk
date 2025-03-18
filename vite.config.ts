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
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      name: "AtoaPayWebSdk",
      fileName: (format) => {
        const env = process.env.VITE_ENV || "dev";
        return `atoa-web-client-sdk-${env}.${format}.js`;
      },
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
