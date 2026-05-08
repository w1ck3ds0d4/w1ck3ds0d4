# Roadmap

This is a profile-readme repo, so there is no product roadmap. The README itself only lists currently shipping public projects (MimicMe, BlueFlame, ThreatLens, GlassVault, DarkVeil, RS3-Companion); it does not announce upcoming additions.

The reasonable forward-looking items for this specific repo are limited to its own surface:

## Possible profile additions

- A new tile in the "Public projects" table when another repo in the workspace becomes public (e.g. Aktivpath, VeilBreak, Purrmadeath, MaySeventh, DA-Task-Alert, MimicMe.tools/GlassVault.tools).
- An additional generated widget in `scripts/generate-stats.mjs` (e.g. a contribution heatmap, top-repo card) following the existing `<name>SVG()` pattern.
- A pinned-repos row, if/when that adds value beyond the manual project table.

## Generator improvements (only if needed)

- Cache the prior day's GraphQL response to reduce API churn during testing.
- Add a `--dry-run` flag that writes to a tmp dir without touching `assets/`.
- Move shared SVG helpers out of `generate-stats.mjs` if the file grows past a comfortable single-file size.

None of the above is committed work. There are no open issues or TODOs in the codebase.
