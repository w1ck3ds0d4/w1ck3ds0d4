# How it works

## GitHub profile rendering

GitHub treats a repository whose name exactly matches its owner's username as a special case: the `README.md` from the default branch of `w1ck3ds0d4/w1ck3ds0d4` is rendered on the user's profile page at `https://github.com/w1ck3ds0d4`.

`README.md` is rendered with GitHub's flavored Markdown, with two relevant quirks:

- A small set of inline HTML is permitted (`<div>`, `<table>`, `<img>`, `<a>`, `<p>`, `<br>`). This README leans on `<div align="center">`, `<table>`, and `<img>` for layout that plain Markdown cannot express.
- All `<img>` requests pass through GitHub's camo proxy, which caches by URL. That caching is the reason every generated SVG ships with a `YYYYMMDDHHMM` version suffix in its path: a new path is a fresh URL, which forces camo to refetch.

The README also embeds two third-party dynamic SVG endpoints directly: `readme-typing-svg.demolab.com` for the rotating tagline, and `komarev.com/ghpvc` for the profile-views counter. These are rendered server-side per request and need no local generation.

## What the scripts do

`scripts/generate-stats.mjs` is a single Node 20 ES module with zero npm dependencies. When run, it produces five SVGs in `assets/`:

| Output | Source data | Renderer |
| --- | --- | --- |
| `banner.<v>.svg` | none (procedural) | `bannerSVG()`, matrix-rain layers + animated centered title |
| `stats.<v>.svg` | GraphQL `user.{followers, pullRequests, issues, repositories.stargazerCount}` plus a `search()` query for issues fixed | `statsSVG()`, two-column key/value grid |
| `languages.<v>.svg` | GraphQL `user.repositories.languages` summed across the user's owned, non-fork repos | `languagesSVG()`, donut chart + two-column legend |
| `streak.<v>.svg` | GraphQL `contributionsCollection.contributionCalendar` aggregated per year since account creation | `streakSVG()`, computed via `computeStreaks()` over the per-day map |
| `trophies.<v>.svg` | derived from the totals above | `trophiesSVG()`, tier dots against fixed thresholds |

Two environment variables drive the script:

- `GH_PAT` (required): a GitHub personal access token used as the GraphQL bearer. Provided by the workflow from the `PROFILE_STATS_PAT` secret.
- `GH_USER` (optional, default `w1ck3ds0d4`): the login to query.
- `ASSET_VERSION` (optional): when set, the output filenames become `<name>.<ASSET_VERSION>.svg`; otherwise plain `<name>.svg`.

## Automation

`.github/workflows/update-stats.yml` runs the generator on three triggers: a daily cron (`0 0 * * *`), manual `workflow_dispatch`, and any push to `main` that touches `scripts/**` or the workflow itself. Each run:

1. Computes `ASSET_VERSION` as the current UTC `YYYYMMDDHHMM`.
2. Runs `node scripts/generate-stats.mjs` with `GH_PAT` and `GH_USER` in the environment.
3. Prunes every older `assets/<name>*.svg` for the five known names, keeping only the version just written.
4. Rewrites every `assets/<name>(\.<old>)?\.svg` reference in `README.md` to point at the new version using `sed`.
5. Commits as `github-actions[bot]` with message `(chore) refresh profile stats` and pushes, but only if `git diff --staged` is non-empty.

The net effect: the profile page on github.com always shows fresh, uncached widgets, and the working tree always contains exactly one version of each SVG.
