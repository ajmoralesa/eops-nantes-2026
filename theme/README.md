# slidev-theme-insep

INSEP institutional [Slidev](https://sli.dev) theme — **brand-variant aware**.
One theme for all your talks: INSEP by default, with built-in support for
*Réseau Grand INSEP* and a clean path for federation / partner branding.

The point of this theme is to stop rebuilding the same scaffolding for every
talk. It owns the **structure and brand**; each deck owns only its **content**.

## Install

In a deck repo:

```bash
pnpm add github:ajmoralesa/slidev-theme-insep
```

Then in `slides.md` frontmatter:

```yaml
---
theme: slidev-theme-insep
---
```

Pin a version so old decks keep building when the theme evolves:

```bash
pnpm add github:ajmoralesa/slidev-theme-insep#v2.0.0
```

> Local development of the theme itself: `pnpm install && pnpm dev`
> (runs `example.md`, the showcase / smoke-test deck).

## Brand variants

Choose a brand in the deck frontmatter — nothing else to wire up:

```yaml
---
theme: slidev-theme-insep
themeConfig:
  brand: insep        # insep (default) | rgi
  author: A. Morales  # footer left text
  org: INSEP          # footer left text (defaults to the brand name)
---
```

- `insep` — navy/gold, navy cover, INSEP logo. The zero-config default.
- `rgi` — *Réseau Grand INSEP*, light cover, RGI lockup.

### Adding a federation (FFTri, FFESSM, FFD, …)

Two small steps, no forking:

1. **Colors** — add a block in `styles/brands.css`:

   ```css
   html[data-brand='fftri'] {
     --brand-primary: #003a70;
     --brand-primary-deep: #002a50;
     --brand-accent: #e2001a;
     --brand-accent-light: #ff6b7a;
     --brand-accent-pale: #ffe5e8;
     --brand-accent-dark: #b00014;
     --brand-contrast: #ffcc00;
     --brand-cover-bg: #003a70;
   }
   ```

2. **Logos & strings** — add an entry in `brand.ts` pointing at the logo files
   (drop them in this theme's `public/`, or in the deck's own `public/`).

For a one-off brand you don't want to ship in the theme, skip `brand.ts`:
set `brand` to anything, redefine the `--brand-*` variables in the deck's own
`style.css`, and pass logos explicitly via `<BrandLogo src="/my-logo.png" />`.

## Layouts

| Layout | Use |
|---|---|
| `cover` | Title slide. Props: `background`, `dim`, `logoTone`, `tagline`, `date`. |
| `default` | Standard content slide (title + body). |
| `section` | Part divider, centered, gold rule. |
| `fact` | One big number / statement. |
| `center` | Centered free content. |
| `two-cols` | Two columns (use `::right::`). |
| `image-left` / `image-right` | Full-bleed image one side, text the other. Prop: `image`. |
| `quote` | Large pull quote. |
| `end` | Closing slide over the brand image. Prop: `image`. |

## Components

- `<BrandLogo tone="light|dark|color" src? width? />` — the active brand's logo.
- `<BrandLockup src? width? />` — institutional lockup/wordmark.
- `<BrandCorner size="large|small" />` — decorative corner motif (auto-hides for brands without one).
- `<GoldDivider width? thickness? />` — the gold accent rule.

## Reusable content blocks

Brand-styled, every-talk building blocks (in `styles/utilities.css`):

```html
<div class="takeaway">The one thing to remember…</div>
<div class="note">An aside on a navy block</div>
<div class="ask">An open question for the room?</div>
<div class="ref">Source: Author et al., 2024</div>
```

Anything *talk-specific* (bespoke callouts, custom data-viz components) stays in
the deck — not here. That separation is what keeps this theme from drifting.

## Design tokens

Colors are CSS custom properties so brand variants work without rebuilding:
`--brand-primary`, `--brand-primary-deep`, `--brand-accent`,
`--brand-accent-light`, `--brand-accent-pale`, `--brand-accent-dark`,
`--brand-contrast`, `--brand-cover-bg`. Legacy `--insep-*` aliases are kept.

Uno shortcuts/tokens for the INSEP palette are also available in markup, e.g.
`text-brand-navy`, `bg-brand-gold-pale`.
