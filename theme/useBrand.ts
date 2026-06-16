import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { type BrandDef, type LogoTone, DEFAULT_BRAND, getBrand } from './brand'

/**
 * Resolves the active brand from the deck's `themeConfig`.
 *
 * Reads `themeConfig.brand` (the brand id), `themeConfig.author` and
 * `themeConfig.org` (footer text). Everything has a safe INSEP default, so a
 * deck with no themeConfig renders as plain INSEP.
 */
export function useBrand() {
  const { $slidev } = useSlideContext()

  const config = computed<Record<string, any>>(
    () => ($slidev?.configs?.themeConfig as Record<string, any>) ?? {},
  )

  const brandId = computed<string>(() => (config.value.brand as string) ?? DEFAULT_BRAND)
  const brand = computed<BrandDef>(() => getBrand(brandId.value))

  const author = computed<string>(() => (config.value.author as string) ?? '')
  const org = computed<string>(() => (config.value.org as string) ?? brand.value.name)

  function logo(tone: LogoTone = 'dark'): string {
    return brand.value.logos[tone] ?? brand.value.logos.dark
  }

  return { brandId, brand, author, org, logo }
}
