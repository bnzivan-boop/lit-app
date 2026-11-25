/** Папка сайта: '/' локально, '/lit-app/' на GitHub Pages */
export const BASE = import.meta.env.BASE_URL

/** Путь внутри приложения, без папки сайта */
export const appPath = () => `/${location.pathname.slice(BASE.length)}`
