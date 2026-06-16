/**
 * Brand registry — the single source of truth for per-brand ASSETS and STRINGS.
 *
 * Colors live in `styles/brands.css` (so they apply during SSR / first paint).
 * This file holds everything JavaScript needs that CSS cannot provide:
 * logo images, org/display names, and decorative images.
 *
 * Images are imported (not referenced by /public path) so Vite BUNDLES them.
 * That is what lets the theme ship its own assets: a deck that installs this
 * theme gets the logos automatically, without copying anything into its own
 * public/ folder. (Slidev does not merge a consumed theme's public/ dir.)
 *
 * The active brand is chosen in a deck via frontmatter:
 *
 *   themeConfig:
 *     brand: rgi        # one of the keys below; defaults to "insep"
 *
 * To add a federation: add an entry here (import its logos into assets/, or
 * pass them per-deck via <BrandLogo src="…" />), plus a matching
 * [data-brand="…"] color block in styles/brands.css.
 */

import insepLogoLight from './assets/insep-logo-white-color.png'
import insepLogoDark from './assets/insep-logo-navy.png'
import insepLogoColor from './assets/insep-logo-color.png'
import rgiMark from './assets/insep-rgi-blue.png'
import rgiLockup from './assets/insep-rgi-lockup.png'

export type LogoTone = 'light' | 'dark' | 'color'

export interface BrandDef {
  /** Human-readable name, used in the footer when `org` is not set per-deck. */
  name: string
  /** Logo image per tone. `light` = for dark backgrounds, `dark` = for light backgrounds. */
  logos: Record<LogoTone, string>
  /** Optional lockup/wordmark used on the cover (e.g. institutional partnership lockup). */
  lockup?: string
  /** Optional decorative corner motif (top-right). Omit to disable for this brand. */
  corner?: string
}

export const brands: Record<string, BrandDef> = {
  insep: {
    name: 'INSEP',
    logos: {
      light: insepLogoLight,
      dark: insepLogoDark,
      color: insepLogoColor,
    },
    lockup: insepLogoColor,
  },
  rgi: {
    name: 'Réseau Grand INSEP',
    logos: {
      light: insepLogoLight,
      dark: rgiMark,
      color: rgiMark,
    },
    lockup: rgiLockup,
  },
}

export const DEFAULT_BRAND = 'insep'

export function getBrand(id?: string): BrandDef {
  return brands[id ?? DEFAULT_BRAND] ?? brands[DEFAULT_BRAND]
}
