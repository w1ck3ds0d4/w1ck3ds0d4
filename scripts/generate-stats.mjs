import fs from 'node:fs/promises';
import path from 'node:path';

const TOKEN = process.env.GH_PAT;
const USER = process.env.GH_USER || 'w1ck3ds0d4';
const OUT_DIR = path.resolve('assets');

const THEME = {
  bg: '#0a192f',
  panel: '#112240',
  accent: '#64ffda',
  text: '#ccd6f6',
  muted: '#8892b0',
  danger: '#ff6b6b',
};

if (!TOKEN) {
  console.error('Missing GH_PAT env var. Set the PROFILE_STATS_PAT secret on the repo.');
  process.exit(1);
}

async function gql(query) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': `${USER}-profile-stats`,
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  return json.data;
}

async function fetchStats() {
  const meta = await gql(`{
    user(login: "${USER}") {
      createdAt
      followers { totalCount }
      pullRequests(states: MERGED) { totalCount }
      repositories(ownerAffiliations: OWNER, first: 100) {
        totalCount
        nodes { stargazerCount }
      }
    }
  }`);

  const u = meta.user;
  const stars = u.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0);
  const followers = u.followers.totalCount;
  const mergedPRs = u.pullRequests.totalCount;
  const repos = u.repositories.totalCount;

  const createdAt = new Date(u.createdAt);
  const now = new Date();
  const startYear = createdAt.getUTCFullYear();
  const endYear = now.getUTCFullYear();

  const dayMap = new Map();
  let totalContributions = 0;
  let totalCommits = 0;

  for (let year = startYear; year <= endYear; year++) {
    const from = year === startYear ? createdAt.toISOString() : `${year}-01-01T00:00:00Z`;
    const to = year === endYear ? now.toISOString() : `${year}-12-31T23:59:59Z`;
    const data = await gql(`{
      user(login: "${USER}") {
        contributionsCollection(from: "${from}", to: "${to}") {
          totalCommitContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays { date contributionCount }
            }
          }
        }
      }
    }`);
    const c = data.user.contributionsCollection;
    totalContributions += c.contributionCalendar.totalContributions;
    totalCommits += c.totalCommitContributions;
    for (const w of c.contributionCalendar.weeks) {
      for (const d of w.contributionDays) {
        if (!dayMap.has(d.date)) dayMap.set(d.date, d.contributionCount);
      }
    }
  }

  const days = [...dayMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { days, totalContributions, totalCommits, stars, followers, mergedPRs, repos, createdAt };
}

function computeStreaks(days) {
  const today = new Date().toISOString().slice(0, 10);

  let longest = 0, longestStart = null, longestEnd = null;
  let runStart = null, runLen = 0;
  for (const d of days) {
    if (d.date > today) break;
    if (d.count > 0) {
      if (runLen === 0) runStart = d.date;
      runLen += 1;
      if (runLen > longest) {
        longest = runLen;
        longestStart = runStart;
        longestEnd = d.date;
      }
    } else {
      runLen = 0;
      runStart = null;
    }
  }

  const past = [...days].filter(d => d.date <= today).reverse();
  let current = 0, currentStart = null, currentEnd = null, i = 0;
  if (past[0] && past[0].count === 0) i = 1;
  for (; i < past.length; i++) {
    if (past[i].count > 0) {
      if (current === 0) currentEnd = past[i].date;
      current += 1;
      currentStart = past[i].date;
    } else break;
  }

  return { current, longest, currentStart, currentEnd, longestStart, longestEnd };
}

function formatShort(iso) {
  if (!iso) return '-';
  const d = new Date(iso + 'T00:00:00Z');
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${m[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

function flameIcon(cx, cy, size, fill, stroke) {
  const scale = size / 24;
  const tx = cx - 12 * scale;
  const ty = cy - 12 * scale;
  return `<g transform="translate(${tx},${ty}) scale(${scale})">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
          fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
  </g>`;
}

function streakSVG({ totalContributions, streaks, firstYear }) {
  const { current, longest, currentStart, currentEnd, longestStart, longestEnd } = streaks;
  const w = 968, h = 170, col = w / 3;
  const ringCx = col + col / 2;
  const ringCy = 78;
  const ringR = 38;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img">
  <rect width="${w}" height="${h}" fill="${THEME.bg}" rx="6"/>
  <style>
    .value { font: 700 26px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.text}; }
    .value-accent { font: 700 26px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.accent}; }
    .label { font: 600 13px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.text}; }
    .label-accent { font: 700 13px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.accent}; letter-spacing: 0.3px; }
    .range { font: 400 11px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.muted}; }
  </style>

  <g transform="translate(${col / 2},0)">
    <text x="0" y="72" class="value" text-anchor="middle">${totalContributions.toLocaleString()}</text>
    <text x="0" y="98" class="label" text-anchor="middle">Total Contributions</text>
    <text x="0" y="130" class="range" text-anchor="middle">${firstYear} - Present</text>
  </g>

  <g transform="translate(${ringCx},0)">
    <circle cx="0" cy="${ringCy}" r="${ringR}" fill="none" stroke="${THEME.accent}" stroke-width="4"/>
    ${flameIcon(0, ringCy - ringR - 4, 22, THEME.bg, THEME.accent)}
    <text x="0" y="${ringCy + 9}" class="value-accent" text-anchor="middle">${current}</text>
    <text x="0" y="132" class="label-accent" text-anchor="middle">Current Streak</text>
    <text x="0" y="150" class="range" text-anchor="middle">${formatShort(currentStart)} - ${formatShort(currentEnd)}</text>
  </g>

  <g transform="translate(${2 * col + col / 2},0)">
    <text x="0" y="72" class="value" text-anchor="middle">${longest}</text>
    <text x="0" y="98" class="label" text-anchor="middle">Longest Streak</text>
    <text x="0" y="130" class="range" text-anchor="middle">${formatShort(longestStart)} - ${formatShort(longestEnd)}</text>
  </g>
</svg>`;
}

function tierOf(value, thresholds) {
  let t = 0;
  for (const v of thresholds) if (value >= v) t += 1;
  return { tier: t, max: thresholds.length };
}

function trophiesSVG(stats) {
  const tiles = [
    { label: 'Commits',    value: stats.totalCommits,        ...tierOf(stats.totalCommits,        [100, 500, 1000, 2000, 5000]) },
    { label: 'Contribs',   value: stats.totalContributions,  ...tierOf(stats.totalContributions,  [100, 1000, 5000, 10000, 25000]) },
    { label: 'Streak',     value: stats.streaks.longest,     ...tierOf(stats.streaks.longest,     [7, 30, 100, 365, 730]) },
    { label: 'PRs',        value: stats.mergedPRs,           ...tierOf(stats.mergedPRs,           [1, 10, 50, 100, 500]) },
    { label: 'Stars',      value: stats.stars,               ...tierOf(stats.stars,               [1, 10, 50, 100, 500]) },
    { label: 'Followers',  value: stats.followers,           ...tierOf(stats.followers,           [1, 10, 50, 100, 500]) },
    { label: 'Repos',      value: stats.repos,               ...tierOf(stats.repos,               [5, 10, 25, 50, 100]) },
  ];

  const tileW = 124, tileH = 112, gap = 12;
  const outerPad = 14;
  const count = tiles.length;
  const w = count * tileW + (count - 1) * gap + outerPad * 2;
  const h = tileH + outerPad * 2;

  const renderTile = (t, i) => {
    const x = outerPad + i * (tileW + gap);
    const active = t.tier > 0;
    const dotSize = 4;
    const dotGap = 10;
    const dotsTotalW = t.max * dotSize * 2 + (t.max - 1) * (dotGap - dotSize * 2);
    const dotStartX = tileW / 2 - dotsTotalW / 2 + dotSize;
    const dots = Array.from({ length: t.max }, (_, j) => {
      const filled = j < t.tier;
      const cx = dotStartX + j * dotGap;
      return `<circle cx="${cx}" cy="${tileH - 18}" r="${dotSize}" fill="${filled ? THEME.accent : THEME.muted}" opacity="${filled ? '1' : '0.35'}"/>`;
    }).join('');
    return `<g transform="translate(${x},${outerPad})">
      <rect width="${tileW}" height="${tileH}" rx="10" fill="${THEME.panel}" stroke="${active ? THEME.accent : THEME.muted}" stroke-width="1" stroke-opacity="${active ? '0.45' : '0.15'}"/>
      <text x="${tileW / 2}" y="30" class="label" text-anchor="middle">${t.label}</text>
      <text x="${tileW / 2}" y="66" class="value" text-anchor="middle" fill="${active ? THEME.text : THEME.muted}">${t.value.toLocaleString()}</text>
      ${dots}
    </g>`;
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img">
  <rect width="${w}" height="${h}" fill="${THEME.bg}" rx="6"/>
  <style>
    .label { font: 600 11px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.muted}; letter-spacing: 0.8px; text-transform: uppercase; }
    .value { font: 700 24px "Segoe UI", Helvetica, sans-serif; }
  </style>
  ${tiles.map(renderTile).join('\n  ')}
</svg>`;
}

async function main() {
  console.log(`Fetching stats for ${USER}...`);
  const raw = await fetchStats();
  const streaks = computeStreaks(raw.days);
  const firstYear = raw.createdAt.getUTCFullYear();

  const stats = {
    totalContributions: raw.totalContributions,
    totalCommits: raw.totalCommits,
    stars: raw.stars,
    followers: raw.followers,
    mergedPRs: raw.mergedPRs,
    repos: raw.repos,
    streaks,
  };

  console.log('Streak:', streaks);
  console.log('Totals:', { commits: stats.totalCommits, contribs: stats.totalContributions, stars: stats.stars, followers: stats.followers, prs: stats.mergedPRs, repos: stats.repos });

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, 'streak.svg'), streakSVG({ totalContributions: raw.totalContributions, streaks, firstYear }));
  await fs.writeFile(path.join(OUT_DIR, 'trophies.svg'), trophiesSVG(stats));
  console.log('Wrote assets/streak.svg and assets/trophies.svg');
}

main().catch(err => { console.error(err); process.exit(1); });
