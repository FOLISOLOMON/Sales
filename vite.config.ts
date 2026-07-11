import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
<<<<<<< HEAD
import { VitePWA } from "vite-plugin-pwa"
=======
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
<<<<<<< HEAD
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      manifest: {
        name: "Veloura Manager",
        short_name: "Veloura",
        description: "Sales, inventory, and profit tracking for your perfume business",
        theme_color: "#0a0a0a",
        background_color: "#0a0a0a",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
=======
  plugins: [react(), tailwindcss()],
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
