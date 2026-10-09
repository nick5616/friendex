import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Unique per build. The app compares this against /version.json to notice when
// a newer deploy is live (installed PWAs can stay suspended in memory for days).
const BUILD_ID = new Date().toISOString()

const versionFile = () => ({
  name: 'friendex-version-file',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify({ version: BUILD_ID }),
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), versionFile()],
  define: {
    __APP_VERSION__: JSON.stringify(BUILD_ID),
  },
  build: {
    // Vendor chunks are big but long-lived in cache, which is the point
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Libraries change far less often than app code. Splitting them into
        // their own chunks keeps their hashes stable across deploys, so returning
        // users only re-download the (small) app chunk after an update.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('firebase')) return 'vendor-firebase'
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'vendor-motion'
          if (id.includes('jsqr')) return
          return 'vendor'
        },
      },
    },
  },
})
