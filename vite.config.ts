import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

export default defineConfig({
  base: './',

  server: {
    host: "::",
    port: 3000,
  },

  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 500000,
    rollupOptions: {
      output: {
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
})
