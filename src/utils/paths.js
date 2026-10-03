const baseUrl = import.meta.env.BASE_URL

export function appPath(path = '/') {
  const relativePath = path.startsWith('/') ? path.slice(1) : path
  return `${baseUrl}${relativePath}`
}

export function appPathname(pathname = window.location.pathname) {
  if (!pathname.startsWith(baseUrl)) return pathname
  const relativePath = pathname.slice(baseUrl.length)
  return relativePath ? `/${relativePath}` : '/'
}
