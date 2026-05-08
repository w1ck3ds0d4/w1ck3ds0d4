# Architecture

This is a GitHub profile-readme repo (the repository name matches the user `w1ck3ds0d4`). There is no application to architect, just a static profile page plus a small generator that produces the SVG widgets it embeds.

## Repository layout

```
.
├── README.md                       # The profile page rendered on github.com/w1ck3ds0d4
├── assets/                         # Generated, version-stamped SVGs referenced by README.md
│   ├── banner.YYYYMMDDHHMM.svg
│   ├── stats.YYYYMMDDHHMM.svg
│   ├── languages.YYYYMMDDHHMM.svg
│   ├── streak.YYYYMMDDHHMM.svg
│   └── trophies.YYYYMMDDHHMM.svg
├── scripts/
│   └── generate-stats.mjs          # Single Node script that produces all five SVGs
└── .github/
    └── workflows/
        └── update-stats.yml        # Daily cron + push trigger that runs the generator
```

## Asset organization

All five SVGs live directly in `assets/`. Filenames carry a `YYYYMMDDHHMM` version stamp (the `ASSET_VERSION` env var, set to `date -u +%Y%m%d%H%M` in the workflow). The README references the current stamp explicitly, so when a new version is written, the workflow rewrites the README links and prunes prior versions in the same commit. This is a cache-busting strategy: GitHub aggressively caches raw asset URLs through camo, and a fresh path forces a refetch.

## Script organization

`scripts/generate-stats.mjs` is one self-contained ES module. It has no `package.json` and no dependencies beyond Node 20's built-in `fetch` and `node:fs/promises`. Internally it splits into:

- GraphQL helpers: `gql()`, `fetchStats()`, `fetchLanguages()` against `api.github.com/graphql`.
- Pure computation: `computeStreaks()`, plus inline reductions for stars, active days, best day.
- SVG renderers: `bannerSVG()`, `statsSVG()`, `languagesSVG()`, `streakSVG()`, `trophiesSVG()`, with shared `THEME` colors and small geometry helpers (`polarToCartesian`, `donutSlice`, `flameIcon`).
- Entry point: `main()` orchestrates fetch, compute, render, write.

## Data flow

1. Workflow sets `ASSET_VERSION` from current UTC time.
2. Script reads `GH_PAT` (from the `PROFILE_STATS_PAT` secret) and `GH_USER`, hits the GitHub GraphQL API.
3. Script writes five SVGs to `assets/` using the version-stamped filenames.
4. Workflow prunes any older `assets/<name>*.svg` files, rewrites README links via `sed`, commits and pushes.
