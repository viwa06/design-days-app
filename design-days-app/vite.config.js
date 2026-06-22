import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',   // relative paths — works on GitHub Pages, Azure Static Web Apps, SharePoint CDN
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,  // base64 images make the bundle large
  },
})
