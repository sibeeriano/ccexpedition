import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

function siteOriginPlugin(): Plugin {
  return {
    name: 'site-origin-meta',
    transformIndexHtml(html) {
      const siteOrigin =
        process.env.VITE_SITE_URL?.replace(/\/$/, '') ??
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:5173')

      return html.replaceAll('__SITE_ORIGIN__', siteOrigin)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    siteOriginPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'icon-192.png',
        'icon-512.png',
        'logo2.png',
        'logo32.png',
      ],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
