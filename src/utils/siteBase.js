// Vite supplies the GitHub Pages base during production builds. In local
// development, preserve an explicitly opened /lit-knu-web/ path as well.
export function getSiteBase() {
  const configured = import.meta.env.BASE_URL || '/'
  if (configured !== '/') return configured.endsWith('/') ? configured : `${configured}/`

  const pathname = window.location.pathname || '/'
  if (pathname === '/lit-knu-web' || pathname.startsWith('/lit-knu-web/')) return '/lit-knu-web/'
  return '/'
}
