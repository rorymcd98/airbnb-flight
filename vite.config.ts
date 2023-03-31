import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import dotenv from 'dotenv';
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.GOOGLE_MAPS_API_KEY),
  },
  plugins: [
    // EnvironmentPlugin(['GOOGLE_MAPS_API_KEY']),
    crx({manifest}),
  ],
  worker: {
    plugins: [
      react()
    ]
  },
  root: './',
  build: {
    emptyOutDir: true,
    target: 'chrome88',
    assetsDir: 'extension-frontend/src/assets',
    manifest: false,
  },
  server: {
    open: 'public/popup.html'
  }
})