import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// `base` ne s'applique qu'au build de production (GitHub Pages sert le
// projet depuis /AI-LF-Game/, pas la racine) — le serveur de dev reste sur
// "/" pour ne rien casser dans les scripts de vérification existants.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/AI-LF-Game/" : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "Liberté Financière",
        short_name: "Liberté Fin.",
        description: "Jeu de simulation financière — sortez de la course infernale (Rat Race) et visez l'indépendance financière.",
        lang: "fr",
        start_url: ".",
        scope: ".",
        display: "standalone",
        background_color: "#0B1220",
        theme_color: "#2F6FE0",
        orientation: "portrait",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      },
    }),
  ],
}));
