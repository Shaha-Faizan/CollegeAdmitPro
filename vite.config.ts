import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default async () => {
  return defineConfig({
    plugins: [
      react(),
      runtimeErrorOverlay(),
      ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID
        ? [
            (await import("@replit/vite-plugin-cartographer")).cartographer(),
            (await import("@replit/vite-plugin-dev-banner")).devBanner(),
          ]
        : []),
    ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // 🚀 INTEGRATION: Proxy configuration for backend
    proxy: {
      // Proxy requests starting with /api
      '/api': {
        target: 'http://localhost:5000', // Your backend's address
        changeOrigin: true, // Needed for virtual hosting
        // Optional: Rewrite the path if your backend doesn't expect /api
        // For example, if your backend only expects /users, you can rewrite:
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
    // End of Proxy Configuration
  },
});
};