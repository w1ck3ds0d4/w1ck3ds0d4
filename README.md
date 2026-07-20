<div align="center">

<img src="assets/banner.202607200256.svg" alt="banner" />

<a href="https://github.com/w1ck3ds0d4">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=22&duration=3500&pause=1000&color=64FFDA&center=true&vCenter=true&width=700&height=50&lines=%3E+Software+Engineer;%3E+Platform+%26+DevSecOps;%3E+Security+%26+Compliance+Tooling;%3E+Desktop%2C+Web+%26+AI+Apps" alt="typing" />
</a>

<br>

<a href="mailto:daniel.svs@outlook.com"><img src="https://img.shields.io/badge/-daniel.svs%40outlook.com-0a192f?style=for-the-badge&logo=microsoftoutlook&logoColor=white&labelColor=0078d4" alt="email" /></a>
<a href="https://github.com/w1ck3ds0d4"><img src="https://img.shields.io/badge/-w1ck3ds0d4-181717?style=for-the-badge&logo=github&logoColor=white" alt="github" /></a>
<img src="https://komarev.com/ghpvc/?username=w1ck3ds0d4&style=for-the-badge&color=64ffda&labelColor=0a192f&label=profile+views" alt="views" />

</div>

---

## What I work on

- **Security & compliance tooling** - CI security baselines, tamper-evident audit logging, SBOM/CVE evidence pipelines, AI evaluation environments
- **Backend & platform engineering** - .NET (Aspire, Orleans), Kubernetes, observability with OpenTelemetry, load-tested microservices
- **Desktop & mobile apps** - Tauri (Rust + React/Svelte), Flutter, Electron, .NET/Blazor
- **Intelligence tooling** - real-time data aggregation, MITM filter proxies, log correlation

## Stack

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Dart-0175C2?style=for-the-badge&logo=dart&logoColor=white" />
  <img src="https://img.shields.io/badge/C%23-512BD4?style=for-the-badge&logo=csharp&logoColor=white" />
  <img src="https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
</p>
<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Svelte-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" />
  <img src="https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white" />
  <img src="https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=black" />
  <img src="https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white" />
  <img src="https://img.shields.io/badge/Blazor-512BD4?style=for-the-badge&logo=blazor&logoColor=white" />
</p>
<p align="center">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white" />
  <img src="https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white" />
</p>
<p align="center">
  <img src="https://img.shields.io/badge/CesiumJS-6CADDF?style=for-the-badge&logo=cesium&logoColor=white" />
  <img src="https://img.shields.io/badge/PixiJS-E91E63?style=for-the-badge&logoColor=white" />
  <img src="https://img.shields.io/badge/.NET%20Aspire-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" />
  <img src="https://img.shields.io/badge/EF%20Core-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" />
  <img src="https://img.shields.io/badge/Helm-0F1689?style=for-the-badge&logo=helm&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenTelemetry-000000?style=for-the-badge&logo=opentelemetry&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" />
</p>

## Public projects

<table>
<tr>
<td width="50%" valign="top">

<a href="https://github.com/w1ck3ds0d4/GrainWallet"><strong>GrainWallet</strong></a>

Per-player wallet microservice on Microsoft Orleans, with each revision committed side by side and compared under an NBomber load dashboard. v2 hardens v1 with a `FOR UPDATE SKIP LOCKED` outbox, real LRU idempotency, HTTP 503 back-pressure, and pre-grain validation. Engineering journal, tests, and load harness per version.

`.NET` `Orleans` `PostgreSQL` `NBomber` `Microservices`

</td>
<td width="50%" valign="top">

<a href="https://github.com/w1ck3ds0d4/ThreatLens"><strong>ThreatLens</strong></a>

Log aggregation and correlation engine built on .NET Aspire. Ingest API for single and batch events, a background correlator that runs regex rules against messages to tag matches and elevate severity, a paginated query plus 24h stats API, and a Blazor dashboard. One `dotnet run` orchestrates Postgres, Redis, pgAdmin, and every service, with OpenTelemetry traces, metrics, and logs throughout.

`.NET Aspire` `C#` `Blazor` `PostgreSQL` `Redis`

</td>
</tr>
<tr>
<td width="50%" valign="top">

<a href="https://github.com/w1ck3ds0d4/SecureCheck"><strong>SecureCheck</strong></a>

Reusable multi-scanner security workflow for CI: secrets (gitleaks), SAST (Semgrep), dependency/container/license scanning (Trivy), per-language linters, complexity and duplication metrics - posted as one severity-coloured verdict per run, with an optional AI review step and Discord digest. Consumed as a single `workflow_call` across every repo here, and it scans itself.

`GitHub Actions` `gitleaks` `Semgrep` `Trivy` `Node.js`

</td>
<td width="50%" valign="top">

<a href="https://github.com/w1ck3ds0d4/GlassVault"><strong>GlassVault</strong></a>

Intentionally vulnerable multi-tenant document API used as evaluation infrastructure for AI cybersecurity (incident investigation, pen-testing, secure remediation, log forensics). 12 catalogued vulnerabilities, Express 5 + Apollo GraphQL, HMAC-SHA256 chained audit log, React admin UI.

`Express` `GraphQL` `Apollo` `SQLite` `React`

</td>
</tr>
<tr>
<td width="50%" valign="top">

<a href="https://github.com/w1ck3ds0d4/BlueFlame"><strong>BlueFlame</strong></a>

Privacy-first browser shell built on a local MITM filter proxy. Strips trackers, analytics, and fingerprinting at the network layer. Embedded Tor via arti, private tabs, bookmark folders, downloads, resource metrics, and a themed right-click menu.

`Tauri` `Rust` `React` `hudsucker` `arti`

</td>
<td width="50%" valign="top">

<a href="https://github.com/w1ck3ds0d4/NanoFarm"><strong>NanoFarm</strong></a>

Pixel-art isometric idle city builder shipping as both a Vite web app and a VS Code extension. 150x150 procgen biome map, farm + mine buildings with terrain bonuses, road connectivity via BFS, materials HUD. Claude Code hook drains tool calls from `~/.nanofarm/tokens.jsonl` into in-game resources.

`Vite` `React` `PixiJS` `VS Code` `Claude Code`

</td>
</tr>
</table>

<p>
Also public: <a href="https://github.com/w1ck3ds0d4/Purrmadeath"><strong>Purrmadeath</strong></a> - a 2D top-down co-op roguelike for up to 4 players (Electron + PixiJS): 3 classes with 10-tier skill trees, 8 multi-phase bosses, an embedded server for offline solo and hosted invite-code sessions online, signed auto-updater.
</p>

---

## Statistics

<div align="center">

<img src="assets/stats.202607200256.svg" alt="stats" />

<img src="assets/languages.202607200256.svg" alt="languages" />

<img src="assets/streak.202607200256.svg" alt="streak" />

<img src="assets/trophies.202607200256.svg" alt="trophies" />

</div>
