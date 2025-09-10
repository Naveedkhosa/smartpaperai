import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __dirname = dirname(fileURLToPath(import.meta.url));

// conditionally load cartographer plugin
let cartographerPlugin = [];
if (process.env.NODE_ENV !== "production" && process.env.REPL_ID) {
  try {
    const { cartographer } = require("@replit/vite-plugin-cartographer");
    cartographerPlugin.push(cartographer());
  } catch (e) {
    console.warn("Cartographer plugin not loaded:", e.message);
  }
}

export default defineConfig({
  plugins: [react(), runtimeErrorOverlay(), ...cartographerPlugin],
  resolve: {
    alias: {
      "@": resolve(__dirname, "client", "src"),
      "@shared": resolve(__dirname, "shared"),
      "@assets": resolve(__dirname, "attached_assets"),
    },
  },
  root: resolve(__dirname, "client"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
