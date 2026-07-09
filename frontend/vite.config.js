import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('socket.io')) return 'vendor-socket';
            if (id.includes('jspdf')) return 'vendor-pdf';
            if (id.includes('@radix-ui') || id.includes('lucide')) return 'vendor-ui';
            if (id.includes('axios')) return 'vendor-axios';
            return 'vendor';
          }
        },
      },
    },
  },
});
