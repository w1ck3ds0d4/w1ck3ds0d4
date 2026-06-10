<div align="center">

<img src="assets/banner.202606100058.svg" alt="banner" />

<a href="https://github.com/w1ck3ds0d4">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=22&duration=3500&pause=1000&color=64FFDA&center=true&vCenter=true&width=700&height=50&lines=%3E+Security+%26+Platform+Engineer;%3E+EU+RegTech%3A+CRA+%2F+DORA+%2F+NIS2;%3E+Compliance-as-code;%3E+Evidence-grade+systems" alt="typing" />
</a>

<br>

<a href="https://github.com/w1ck3ds0d4"><img src="https://img.shields.io/badge/-w1ck3ds0d4-181717?style=for-the-badge&logo=github&logoColor=white" alt="github" /></a>
<img src="https://komarev.com/ghpvc/?username=w1ck3ds0d4&style=for-the-badge&color=64ffda&labelColor=0a192f&label=profile+views" alt="views" />

</div>

---

## EU Cyber Resilience Act compliance, as code

The CRA's first reporting obligations land **11 Sep 2026**, full obligations **11 Dec 2027**, with fines up to **EUR 15M / 2.5% of turnover**. I build the tooling that turns that from a deadline scramble into a CI artifact: an open-core ladder of free scanners feeding a paid dossier engine, so a regulated team stays continuously audit-ready instead of assembling evidence under pressure.

| Rung | What it does | State |
| --- | --- | --- |
| **CRA-Check** | Free GitHub Action: SBOM + vulnerability scan + repo evidence into 14 CRA Annex I gap checks | launching |
| **ProofLog** | Tamper-evident, identity-bound audit-log SDK (.NET): hash chain + HMAC/ECDSA signing + CRA/DORA/NIS2/AI-Act evidence export | launching |
| **[SecureCheck](https://github.com/w1ck3ds0d4/SecureCheck)** | Reusable security-scan workflow: gitleaks + Semgrep + Trivy + linters, one Discord verdict | public |
| **CRADesk** | The flagship: Annex VII technical documentation, Article 14 incident drafts, continuous CVE watch | commercial |

> Building the CRADesk product line under the **Wicked Kittens** studio. The free tools are how the value proves itself; the dossier engine is the product.

---

## What I work on

- **EU RegTech / compliance-as-code** - CRA / DORA / NIS2 evidence pipelines, SBOM + vulnerability handling, tamper-evident audit logs
- **Security & platform engineering** - Kubernetes security and SLA-readiness, DevSecOps, supply-chain scanning, observability
- **Backends & desktop** - .NET / C#, Python, Rust (Tauri), Node / Fastify, GraphQL, Postgres / SQLite

## Stack

<p align="center">
  <img src="https://img.shields.io/badge/C%23-512BD4?style=for-the-badge&logo=csharp&logoColor=white" />
  <img src="https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
</p>
<p align="center">
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/.NET%20Aspire-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" />
</p>

---

## Selected public work

<table>
<tr>
<td width="50%" valign="top">

<a href="https://github.com/w1ck3ds0d4/SecureCheck"><strong>SecureCheck</strong></a>

Reusable security-scan workflow consumer repos call from their own CI: gitleaks, Semgrep, Trivy, per-language linters, and an optional Claude PR review, summarized as one severity-coloured Discord verdict. The embed logic is unit-tested.

`GitHub Actions` `Node.js` `gitleaks` `Semgrep` `Trivy`

</td>
<td width="50%" valign="top">

<a href="https://github.com/w1ck3ds0d4/ThreatLens"><strong>ThreatLens</strong></a>

Log aggregation and correlation engine on .NET Aspire. Ingest API, a background correlator running regex rules to tag matches and elevate severity, a paginated query + 24h stats API, and a Blazor dashboard. One `dotnet run` orchestrates Postgres, Redis, and every service with OpenTelemetry throughout.

`.NET Aspire` `C#` `Blazor` `PostgreSQL` `OpenTelemetry`

</td>
</tr>
<tr>
<td width="50%" valign="top">

<a href="https://github.com/w1ck3ds0d4/GlassVault"><strong>GlassVault</strong></a>

Intentionally vulnerable multi-tenant document API used as evaluation infrastructure for AI cybersecurity (incident investigation, pen-testing, secure remediation, log forensics). 12 catalogued vulnerabilities, Express 5 + Apollo GraphQL, HMAC-SHA256 chained audit log.

`Express` `GraphQL` `Apollo` `SQLite` `React`

</td>
<td width="50%" valign="top">

<a href="https://github.com/w1ck3ds0d4/BlueFlame"><strong>BlueFlame</strong></a>

Privacy-first browser shell built on a local MITM filter proxy. Strips trackers, analytics, and fingerprinting at the network layer. Embedded Tor via arti, private tabs, resource metrics.

`Tauri` `Rust` `React` `hudsucker` `arti`

</td>
</tr>
</table>

---

<div align="center">

<img src="assets/stats.202606100058.svg" alt="stats" />

<img src="assets/languages.202606100058.svg" alt="languages" />

<img src="assets/streak.202606100058.svg" alt="streak" />

</div>
