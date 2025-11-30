import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const PYODIDE_EXCLUDE = [
  '!**/*.{md,html}',
  '!**/*.d.ts',
  '!**/node_modules',
]

function viteStaticCopyPyodide() {
  const pyodideDir = dirname(fileURLToPath(import.meta.resolve('pyodide')))
  return viteStaticCopy({
    targets: [
      {
        src: [join(pyodideDir, '*').replace(/\\/g, '/')].concat(PYODIDE_EXCLUDE),
        dest: 'assets',
      },
    ],
  })
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteStaticCopyPyodide()],
  optimizeDeps: {
    exclude: ['pyodide'],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
