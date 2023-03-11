import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ fastRefresh: false })],
  worker: {
    plugins: [react()]
  },
  root: 'frontend',
  build: {
    target: 'chrome88',
    assetsDir: 'frontend/src/assets',
    manifest: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'frontend/src/popup/popup.tsx'),
        options: resolve(__dirname, 'frontend/src/options/options.tsx')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        format: 'es',
        dir: resolve(__dirname, 'dist')
      }
    }
  },
  server: {
    open: 'public/popup.html'
  }
})
