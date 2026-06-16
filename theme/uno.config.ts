import { defineConfig } from 'unocss'

/**
 * Brand color shortcuts and theme tokens for use directly in slide markup,
 * e.g. `class="text-brand-navy bg-brand-gold-pale"`.
 *
 * These are the INSEP palette values. Per-deck brand variants override the
 * runtime CSS custom properties (see styles/brands.css); these Uno tokens
 * stay fixed and are convenient for INSEP-default decks.
 */
export default defineConfig({
  shortcuts: {
    'brand-bg-navy': 'bg-[#2C2F65]',
    'brand-bg-gold': 'bg-[#C59F69]',
    'brand-bg-red': 'bg-[#C5243D]',
    'brand-text-navy': 'text-[#2C2F65]',
    'brand-text-gold': 'text-[#B47746]',
  },
  theme: {
    colors: {
      brand: {
        navy: '#2C2F65',
        'navy-deep': '#002060',
        royal: '#000BA2',
        gold: '#C59F69',
        'gold-light': '#DCC68F',
        'gold-pale': '#F9E9CA',
        'gold-dark': '#B47746',
        red: '#C5243D',
      },
    },
  },
})
