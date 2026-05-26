# w1ck3ds0d4 profile v1 Roadmap

## What v1 is

The GitHub profile README repo: personal portfolio card with project tiles,
skill badges, and dynamically generated SVG stats (views, languages, streak,
trophies). Generated via `scripts/generate-stats.mjs` against the GitHub
GraphQL API. Stats SVGs cached in `assets/` and embedded in `README.md`.

## Current state

Profile is live with curated project tiles (VeilBreak, BlueFlame, Purrmadeath,
NanoFarm, MimicMe, GlassVault), skill badges, and stat widgets. Generator
script works. No CI for auto-refresh; manual stats refresh via the script.
ARCHITECTURE, SECURITY, CONTRIBUTING, HOW_IT_WORKS docs exist.

## v1 acceptance criteria

- [x] Live profile README with project tiles
- [x] Skill badges
- [x] Generated SVG stats (views, languages, streak, trophies)
- [x] `scripts/generate-stats.mjs` working
- [ ] Scheduled GitHub Action to refresh stats (daily)
- [ ] Project tiles for all v1-tagged sibling repos as they ship (NanoFarm v1.0.0, MimicMe v1.0.0, etc.)
- [ ] README disclaimer / contact section polished
- [ ] Documented threat model: PAT scopes, where the generator runs, what it writes
- [ ] Tag `v1.0.0` once the auto-refresh action is live

## Milestones to v1

### M1. Auto-refresh action (S)

- [ ] Add `.github/workflows/refresh-stats.yml`
- [ ] Schedule: daily at a fixed UTC time
- [ ] Reads `GITHUB_TOKEN` (or a dedicated PAT) with the minimum read-only scopes
- [ ] Commits any updated SVGs back to `assets/` with a `(chore) refresh profile stats` message
- [ ] No-op commit if nothing changed (skip via `git diff --quiet`)

**Acceptance:** stats SVGs stay fresh without manual intervention.

### M2. Project tile sync (S, ongoing)

- [ ] As each sibling repo tags `v1.0.0`, update its tile to link to the tagged release
- [ ] Reorder by recency / priority

**Acceptance:** the profile front-page never points to a "coming soon" tile for a v1-tagged product.

### M3. Threat model + tag (S)

- [ ] Document in SECURITY.md: PAT scopes, generator behaviour, write surface
- [ ] Confirm no SECRET leaks in generated SVGs
- [ ] Tag `v1.0.0`

**Acceptance:** documented; tag pushed.

## Beyond v1 (post-1.0 polish)

- Localized variants (e.g., Portuguese profile)
- Stats variants (per-org breakdown if joining one)
- Pinned post / blog snippet integration
- Newer stat widgets as GitHub adds features

## Out of scope for v1

- Public portfolio site (this stays a GitHub profile)
- Resume PDF generator
