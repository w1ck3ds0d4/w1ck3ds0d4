# Security

A traditional security policy is not applicable here: this repo is a GitHub profile-readme. There is no installable software, no service, no user data, and no released binaries.

If you have found a security issue in one of the projects linked from `README.md` (MimicMe, BlueFlame, ThreatLens, GlassVault, DarkVeil, RS3-Companion), please file the report against that project's repository, not this one.

## Contact

For anything specific to this profile repo (e.g. a leaked secret in a generated SVG), email daniel.svs@outlook.com.

## Operational notes for this repo

The only sensitive surface is the GitHub Actions secret `PROFILE_STATS_PAT`, consumed by `.github/workflows/update-stats.yml` and passed to `scripts/generate-stats.mjs` as `GH_PAT`:

- The PAT is read-only with respect to public profile data and never appears in committed output. The script only emits SVG files under `assets/`.
- The workflow grants `permissions: contents: write` so it can commit refreshed SVGs and a rewritten `README.md`. It does not need any other scope.
- If the PAT is ever exposed in workflow logs or a generated file, rotate the `PROFILE_STATS_PAT` secret in repository settings.

## Reproducible-asset notes

Generated SVGs are not deterministic: the banner uses `Math.random()` for the matrix-rain layout, and stat values change daily. There is no signing or checksumming of `assets/*.svg`, and none is needed for a cosmetic profile page.
