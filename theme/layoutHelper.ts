export function resolveAssetUrl(url: string) {
  if (url.startsWith('/'))
    return url
  return new URL(url, import.meta.url).href
}

export function handleBackground(background?: string, dim = false): Record<string, string> {
  if (!background)
    return {}

  const isColor = background.startsWith('#')
    || background.startsWith('rgb')
    || background.startsWith('hsl')

  if (isColor) {
    return { background }
  }

  return {
    backgroundImage: `url("${resolveAssetUrl(background)}")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    ...(dim ? { filter: 'brightness(0.6)' } : {}),
  }
}
