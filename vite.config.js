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
})
