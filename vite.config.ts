import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
  plugins: [react(), tailwindcss(), siteOriginPlugin()],
})
