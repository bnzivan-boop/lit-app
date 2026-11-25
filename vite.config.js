import { pbkdf2Sync } from 'node:crypto'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* BASE_PATH — папка на сайте (GitHub Pages: /lit-app/). Локально — корень */
const base = process.env.BASE_PATH ?? '/'

/* APP_CODE — код для входа. В сборку попадает только отпечаток, сам код нет. Пусто — входа нет */
const code = process.env.APP_CODE?.trim()
const codeHash = code ? pbkdf2Sync(code, 'lit-app', 600_000, 32, 'sha256').toString('hex') : ''

/** Картинки в коде и моках записаны от корня: '/assets/…'. Vite правит их в CSS и HTML, в скриптах правим сами */
const assetBase = () => ({
  name: 'asset-base',
  apply: 'build',
  generateBundle(_, bundle) {
    if (base === '/') return
    for (const file of Object.values(bundle))
      if (file.type === 'chunk') file.code = file.code.replace(/(["'`(])\/assets\//g, `$1${base}assets/`)
  },
})

export default defineConfig({
  base,
  plugins: [react(), assetBase()],
  define: { __CODE_HASH__: JSON.stringify(codeHash) },
  server: { port: 5173, strictPort: true },
})
