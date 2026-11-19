import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base './' + HashRouter lets the built site work from any sub-path (e.g. GitHub Pages)
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
})
