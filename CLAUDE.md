# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Astro 5 frontend for "Choosing Our Adventure" (COA), a travel blog. Content is managed in Sanity CMS (project ID `8icb2evz`, dataset `production`). Deployed to Netlify.

## Commands

```bash
npm run dev       # start dev server
npm run build     # static build
npm run preview   # preview built output
```

No lint or test scripts are configured.

## Environment variables

Copy `.env.development` for local dev. Required vars:
- `PUBLIC_SANITY_PROJECT_ID` / `PUBLIC_SANITY_DATASET` / `PUBLIC_SANITY_API_VERSION` / `PUBLIC_SANITY_READ_TOKEN`
- `PUBLIC_MAPBOX_TOKEN` — Mapbox GL maps
- `PUBLIC_IG_TOKEN` / `PUBLIC_COA_IG_TOKEN` — Instagram feed widgets

## Architecture

### Data layer

All GROQ queries live in `src/lib/queries.js` and are imported into pages. Data is fetched at build time via `sanityClient.fetch()` from `sanity:client`. There is no server-side rendering — everything is statically generated.

`src/lib/helpers.js` provides: `formatBlogPostDate`, `formatUnixDate`, `getSanityImageUrl` (wraps `@sanity/image-url` builder), and `sSpeed` (shutter speed fraction formatter for photo EXIF data).

### Routing

| File | Route |
|------|-------|
| `src/pages/index.astro` | `/` — home, shows first 10 posts |
| `src/pages/[page].astro` | `/2`, `/3`, … — paginated archive |
| `src/pages/[slug].astro` | `/:slug` — individual article |
| `src/pages/[single].astro` | `/:slug` — CMS pages (`_type == 'page'`) |
| `src/pages/category/[slug].astro` | `/category/:slug` |
| `src/pages/country/[slug].astro` | `/country/:slug` |
| `src/pages/in-loving-memory.astro` | `/in-loving-memory` — static, standalone |

`[slug].astro` vs `[single].astro`: articles are `_type == 'article'`; static pages are `_type == 'page'`. Astro resolves the ambiguity at build time since both use `getStaticPaths`.

### Content rendering

`src/components/Handler.astro` wraps `astro-portabletext` and maps Sanity block types to Astro components:

| Sanity block type | Component |
|---|---|
| `image` / `imageFull` | `AstroImage.astro` |
| `gallery` | `AstroGallery.astro` (uses lightgallery) |
| `video` | `AstroVideoBlock.astro` |
| `mapbox` | `AstroMapBox.astro` (Mapbox GL) |
| `googleMyMap` | `AstroMapBlock.astro` |
| `chart` | `AstroChart.astro` (Chart.js) |
| `instagramPost` | `AstroIGEmbedBlock.astro` |
| `embed` | `AstroEmbed.astro` |
| `quotation` | `AstroQuotation.astro` |
| `contentGrid` | `AstroContentGrid.astro` |
| `break` | `AstroBreak.astro` |
| mark `internalLink` | `InternalLink.astro` |

### Maps

`AstroMapBox.astro` fetches map config from Sanity, serializes data to `data-*` attributes on a `<div>`, then hands off to client-side JS in `src/lib/maps/`. The orchestration entry point is `map-setup.js`; other files handle data conversion (`map-convert-data.js`), layer addition (`map-add-data.js`), and helpers.

Maps support multiple layers (`countries`, `cities`, `places`) plus a `customQuery` field for ad-hoc GROQ at build time.

### Layout and styles

`src/layouts/Layout.astro` is the single layout shell. It applies a `class` to `<body>` based on the `type` prop: `article`, `page`, or `archive {type}`. Fonts are Merriweather (serif) and Fira Sans (sans-serif), loaded from `@fontsource`. GTM container ID is `GTM-TC542ZZ`.

Styles in `src/styles/`: `reset.css`, `variables.css`, `main.css`, and a `components/` subdirectory.

### Sanity content types

`article`, `page`, `category`, `country`, `city`, `place`, `map`, `siteSettings`

The `siteNav` query (`src/lib/queries.js`) drives the navigation menu via `siteSettings[0].siteNav.menuItems`.
