/**
 * Resolve a `public/` asset path against the deploy base URL.
 *
 * Assets in `public/` are served at `import.meta.env.BASE_URL` — `/` in dev, but
 * `/eops-nantes-2026/` on GitHub Pages (the deck is built with `--base /<repo>/`).
 * A bare `:src="'/foo.png'"` in markdown points at the domain root and 404s under
 * a sub-path, and `import.meta.env.BASE_URL` is NOT valid inside a markdown `:src`
 * expression (only inside a module). So every component that renders a public
 * asset must resolve its path through here.
 *
 *   import { asset } from './useAsset'
 *   <img :src="asset(src)">
 */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
