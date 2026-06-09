import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
//import tailwindcss from "@tailwindcss/vite"; // <--- Naya Tailwind plugin jod diya

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // tailwindcss(), // <--- Naya Tailwind plugin yahan add kiya
  ],
  resolve: {
    alias: [
      // 1. Aapka PURANA setting (Bilkul safe hai, delete nahi kiya):
      {
        find: "react",
        replacement: path.resolve(__dirname, "node_modules/react"),
      },
      {
        find: "react-dom",
        replacement: path.resolve(__dirname, "node_modules/react-dom"),
      },
      {
        find: "react-router-dom",
        replacement: path.resolve(__dirname, "node_modules/react-router-dom"),
      },

      // 2. Shadcn/ui ke liye NAYA setting (Jo error aa raha tha usko theek karega):
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },
});
