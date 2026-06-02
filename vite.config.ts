import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.VITE_HOST ?? "127.0.0.1",
    port: 5173,
    watch: {
      usePolling: true
    }
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  }
});
