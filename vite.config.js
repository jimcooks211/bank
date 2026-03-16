import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  base: '/bank/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Paypal Service',
        short_name: 'Paypal',
        start_url: '/bank/',
        display: 'standalone',
        background_color: '#002e93',
        theme_color: '#002e93',
        icons: [
          {
            src: '/bank/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/bank/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/bank/icons/apple-touch-icon-180x180.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
