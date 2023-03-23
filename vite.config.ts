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
   
  },
  server: {
    open: 'public/popup.html'
  }
})


const old = {
  rollupOptions: {
    input: {
      popup: resolve(__dirname, 'extension-frontend/src/popup/popup.tsx'),
      options: resolve(__dirname, 'extension-frontend/src/options/options.tsx')
    },
    output: {
      entryFileNames: '[name].js',
      chunkFileNames: '[name].js',
      assetFileNames: '[name][extname]',
      format: 'es',
      dir: resolve(__dirname, 'dist')
    }
  }
}