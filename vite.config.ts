import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { minimal2023Preset } from "@vite-pwa/assets-generator/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      pwaAssets: {
        image: "public/favicon.svg",
        preset: {
          ...minimal2023Preset,
          transparent: {
            ...minimal2023Preset.transparent,
            padding: 0.1,
          },
          maskable: {
            ...minimal2023Preset.maskable,
            padding: 0.1,
            resizeOptions: { background: "#ffffff" },
          },
          apple: {
            ...minimal2023Preset.apple,
            padding: 0.1,
            resizeOptions: { background: "#ffffff" },
          },
        },
        overrideManifestIcons: true,
        injectThemeColor: true,
      },
      manifest: {
        name: "Jumpstart Mixer",
        short_name: "Jumpstart Mixer",
        description: "A tool for mixing Jumpstart packs",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        categories: ["games", "utilities"],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        navigateFallback: "/index.html",
        navigateFallbackAllowlist: [/^(?!\/__).*/u],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cards\.scryfall\.io\/.*/iu,
            handler: "CacheFirst",
            options: {
              cacheName: "scryfall-images",
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
