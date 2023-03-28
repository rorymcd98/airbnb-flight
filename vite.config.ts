import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(
    { fastRefresh: false }),
    crx({manifest})
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
    sourcemap: true
   
  },
  server: {
    open: 'public/popup.html'
  }
})