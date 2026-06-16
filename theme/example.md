---
theme: ./
title: slidev-theme-insep — showcase
info: |
  Showcase / smoke-test deck for slidev-theme-insep.
  Run with `pnpm dev`.
themeConfig:
  brand: insep
  author: Antonio Morales-Artacho
  org: INSEP
layout: cover
tagline: Laboratoire Sport, Expertise & Performance
date: 2026
transition: slide-left
mdc: true
---

# slidev-theme-insep

Thème institutionnel pour présentations Slidev

---
layout: default
---

# Layout `default`

Le layout de contenu standard. Titre souligné or, puce or, et le motif d'angle de la marque.

- Première idée structurante
- Deuxième idée, avec du **gras** mis en avant
- Un lien vers [sli.dev](https://sli.dev) stylé à la marque

<div class="takeaway">

**À retenir :** une phrase de synthèse, encadré « takeaway » réutilisable.

</div>

<div class="ref">Source : Auteur et al., 2024</div>

---
layout: section
---

# Une nouvelle partie

Sous-titre de la section

---
layout: fact
---

# 96 %

de l'effet vient de la structure réutilisable

---
layout: two-cols
---

# Colonne gauche

Le contenu de gauche, séparé par un filet or.

- point A
- point B

::right::

# Colonne droite

Le contenu de droite.

- point C
- point D

---
layout: image-right
image: /insep-bandeau.png
---

# Texte + image

Layout `image-right` : texte à gauche, image plein-cadre à droite (et `image-left` pour l'inverse).

Les decks passent **leurs propres** images (depuis leur `public/`) à ces layouts.

<div class="note">

Bloc « note » — un aparté sur fond marine.

</div>

---
layout: quote
---

> « La vraie question n'est pas l'outil, mais ce qu'on en fait. »

---
layout: default
---

# Tableau & code

| Vague | Quoi | Exemple |
|---|---|---|
| Prédiction | régression | détection de talent |
| Perception | vision | analyse vidéo |

```ts
const vo2 = peak / mass
```

<div class="ask">Et vous, comment évalueriez-vous cette qualité ?</div>

---
layout: end
---

# Merci

À votre écoute
