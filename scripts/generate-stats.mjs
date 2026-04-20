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
      allPRs: pullRequests { totalCount }
      mergedPRs: pullRequests(states: MERGED) { totalCount }
      issues { totalCount }
      repositories(ownerAffiliations: OWNER, first: 100) {
        totalCount
        nodes { stargazerCount }
      }
    }
    issuesFixed: search(query: "author:${USER} is:pr is:merged linked:issue", type: ISSUE) {
      issueCount
    }
  }`);

  const u = meta.user;
  const stars = u.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0);
  const followers = u.followers.totalCount;
  const totalPRs = u.allPRs.totalCount;
  const mergedPRs = u.mergedPRs.totalCount;
  const issues = u.issues.totalCount;
  const issuesFixed = meta.issuesFixed.issueCount;
  const repos = u.repositories.totalCount;

  const createdAt = new Date(u.createdAt);
  const now = new Date();
  const startYear = createdAt.getUTCFullYear();
  const endYear = now.getUTCFullYear();

  const dayMap = new Map();
  let totalContributions = 0;
  let totalCommits = 0;
  let totalReviews = 0;

  for (let year = startYear; year <= endYear; year++) {
    const from = year === startYear ? createdAt.toISOString() : `${year}-01-01T00:00:00Z`;
    const to = year === endYear ? now.toISOString() : `${year}-12-31T23:59:59Z`;
    const data = await gql(`{
      user(login: "${USER}") {
        contributionsCollection(from: "${from}", to: "${to}") {
          totalCommitContributions
          totalPullRequestReviewContributions
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
    totalReviews += c.totalPullRequestReviewContributions;
    for (const w of c.contributionCalendar.weeks) {
      for (const d of w.contributionDays) {
        if (!dayMap.has(d.date)) dayMap.set(d.date, d.contributionCount);
      }
    }
  }

  const days = [...dayMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { days, totalContributions, totalCommits, totalReviews, stars, followers, totalPRs, mergedPRs, issues, issuesFixed, repos, createdAt };
}

async function fetchLanguages() {
  const data = await gql(`{
    user(login: "${USER}") {
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
        nodes {
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges { size node { name color } }
          }
        }
      }
    }
  }`);

  const totals = new Map();
  for (const repo of data.user.repositories.nodes) {
    if (!repo || !repo.languages) continue;
    for (const edge of repo.languages.edges) {
      const key = edge.node.name;
      const prev = totals.get(key) || { size: 0, color: edge.node.color };
      prev.size += edge.size;
      if (!prev.color && edge.node.color) prev.color = edge.node.color;
      totals.set(key, prev);
    }
  }
  const totalSize = [...totals.values()].reduce((a, b) => a + b.size, 0) || 1;
  const langs = [...totals.entries()]
    .map(([name, d]) => ({ name, size: d.size, color: d.color || '#8892b0', pct: d.size / totalSize * 100 }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
  return { langs, totalSize };
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

function bannerSVG() {
  const w = 968, h = 180;
  const pool = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
  const rand = () => pool[Math.floor(Math.random() * pool.length)];

  const layers = [
    { count: 22, charH: 22, fontSize: 12, charsPerCol: 9,  minDur: 6,   maxDur: 11, layerOpacity: 0.4, headColor: '#5ecdb4' },
    { count: 36, charH: 20, fontSize: 15, charsPerCol: 12, minDur: 3,   maxDur: 7,  layerOpacity: 0.75, headColor: '#aaffee' },
    { count: 22, charH: 24, fontSize: 18, charsPerCol: 13, minDur: 1.5, maxDur: 4,  layerOpacity: 1,    headColor: '#ffffff' },
  ];

  const renderLayer = (layer) => {
    const cols = [];
    for (let c = 0; c < layer.count; c++) {
      const x = Math.floor(Math.random() * (w - 20)) + 10;
      const dur = (layer.minDur + Math.random() * (layer.maxDur - layer.minDur)).toFixed(2);
      const delay = (-Math.random() * Number(dur)).toFixed(2);
      const totalColH = layer.charsPerCol * layer.charH;
      const tspans = [];
      for (let i = 0; i < layer.charsPerCol; i++) {
        const isHead = i === layer.charsPerCol - 1;
        const fade = isHead ? 1 : ((i + 1) / layer.charsPerCol) * 0.85;
        const fill = isHead ? layer.headColor : '#64ffda';
        const opacity = (fade * layer.layerOpacity).toFixed(2);
        tspans.push(`<tspan x="${x}" y="${(i + 1) * layer.charH}" fill="${fill}" fill-opacity="${opacity}">${rand()}</tspan>`);
      }
      cols.push(`<g><text font-size="${layer.fontSize}" font-family="Fira Code,Courier New,monospace" font-weight="600" filter="url(#char-glow)">${tspans.join('')}</text><animateTransform attributeName="transform" type="translate" from="0 ${-totalColH}" to="0 ${h + totalColH}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/></g>`);
    }
    return cols.join('');
  };

  const allRain = layers.map(renderLayer).join('');

  const cx = w / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="w1ck3ds0d4">
  <defs>
    <clipPath id="banner-clip"><rect width="${w}" height="${h}" rx="8"/></clipPath>
    <linearGradient id="banner-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050b17"/>
      <stop offset="50%" stop-color="#0a192f"/>
      <stop offset="100%" stop-color="#050b17"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="60%">
      <stop offset="50%" stop-color="#0a192f" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.6"/>
    </radialGradient>
    <filter id="char-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="0.8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="title-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="scanlines" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="#64ffda" fill-opacity="0.05"/>
    </pattern>
  </defs>
  <g clip-path="url(#banner-clip)">
    <rect width="${w}" height="${h}" fill="url(#banner-bg)"/>
    ${allRain}
    <rect width="${w}" height="${h}" fill="url(#scanlines)"/>
    <rect width="${w}" height="${h}" fill="url(#vignette)"/>
    <rect x="${cx - 185}" y="${h / 2 - 40}" width="370" height="80" rx="6" fill="#0a192f" fill-opacity="0.55"/>
    <g filter="url(#title-glow)">
      <text x="${cx}" y="${h / 2 + 22}" text-anchor="middle" font-family="Segoe UI,Helvetica,sans-serif" font-weight="800" font-size="64" letter-spacing="2" fill="#64ffda" stroke="#0a192f" stroke-width="3" paint-order="stroke fill">w1ck3ds0d4<animate attributeName="fill" values="#64ffda;#64ffda;#64ffda;#ffffff;#64ffda;#64ffda;#64ffda;#64ffda;#64ffda;#64ffda" dur="6s" repeatCount="indefinite"/></text>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 0;0 0;3 0;-3 0;2 0;0 0;0 0;0 0;0 0;0 0;0 0;0 0;0 0;0 0;0 0;0 0;0 0;0 0" dur="6s" repeatCount="indefinite"/>
    </g>
  </g>
</svg>`;
}

function statsSVG(stats) {
  const w = 968, h = 210;
  const pad = 30;
  const startY = 70;
  const rowH = 32;
  const mergeRate = stats.totalPRs ? Math.round((stats.mergedPRs / stats.totalPRs) * 100) : 0;

  const left = [
    { label: 'Total Stars Earned', value: stats.stars },
    { label: 'Total Commits',       value: stats.totalCommits },
    { label: 'Total PRs',           value: stats.totalPRs },
    { label: 'Total PRs Merged',    value: stats.mergedPRs },
  ];
  const right = [
    { label: 'Merge Rate',          value: mergeRate + '%' },
    { label: 'Issues Fixed',        value: stats.issuesFixed },
    { label: 'Followers',           value: stats.followers },
    { label: 'Repositories',        value: stats.repos },
  ];

  const fmt = v => typeof v === 'number' ? v.toLocaleString() : v;
  const col1LabelX = pad;
  const col1ValueX = w / 2 - pad;
  const col2LabelX = w / 2 + pad;
  const col2ValueX = w - pad;

  const rows = left.map((l, i) => {
    const r = right[i];
    const y = startY + i * rowH;
    return `
    <text x="${col1LabelX}" y="${y}" class="label">${l.label}</text>
    <text x="${col1ValueX}" y="${y}" class="value" text-anchor="end">${fmt(l.value)}</text>
    <text x="${col2LabelX}" y="${y}" class="label">${r.label}</text>
    <text x="${col2ValueX}" y="${y}" class="value" text-anchor="end">${fmt(r.value)}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img">
  <rect width="${w}" height="${h}" fill="${THEME.bg}" rx="6"/>
  <style>
    .title { font: 700 15px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.accent}; letter-spacing: 0.5px; }
    .label { font: 600 14px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.text}; }
    .value { font: 700 14px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.accent}; }
  </style>
  <text x="${pad}" y="30" class="title">GitHub Stats</text>
  <line x1="${w / 2}" y1="55" x2="${w / 2}" y2="${h - 20}" stroke="${THEME.muted}" stroke-opacity="0.2"/>
  ${rows}
</svg>`;
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlice(cx, cy, outerR, innerR, startAngle, endAngle, color) {
  const safeEnd = endAngle - startAngle >= 360 ? startAngle + 359.99 : endAngle;
  const largeArc = safeEnd - startAngle > 180 ? 1 : 0;
  const o1 = polarToCartesian(cx, cy, outerR, startAngle);
  const o2 = polarToCartesian(cx, cy, outerR, safeEnd);
  const i1 = polarToCartesian(cx, cy, innerR, safeEnd);
  const i2 = polarToCartesian(cx, cy, innerR, startAngle);
  const d = `M ${o1.x} ${o1.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${i2.x} ${i2.y} Z`;
  return `<path d="${d}" fill="${color}"/>`;
}

function languagesSVG({ langs }) {
  const w = 968, h = 250;
  const donutCx = 130;
  const donutCy = 145;
  const outerR = 78;
  const innerR = 50;

  let angle = 0;
  const slices = langs.map(l => {
    const sweep = (l.pct / 100) * 360;
    const svg = donutSlice(donutCx, donutCy, outerR, innerR, angle, angle + sweep, l.color);
    angle += sweep;
    return svg;
  });

  const legendStartX = 290;
  const legendEndX = w - 30;
  const colGap = 30;
  const legendColW = (legendEndX - legendStartX - colGap) / 2;
  const legendLeftX = legendStartX;
  const legendRightX = legendStartX + legendColW + colGap;
  const itemH = 30;
  const legendTopY = 80;

  const legendItems = langs.map((l, i) => {
    const col = i < 5 ? 0 : 1;
    const row = col === 0 ? i : i - 5;
    const x = col === 0 ? legendLeftX : legendRightX;
    const y = legendTopY + row * itemH;
    const pctX = x + legendColW;
    return `
    <rect x="${x}" y="${y - 11}" width="12" height="12" rx="3" fill="${l.color}"/>
    <text x="${x + 22}" y="${y}" class="lang-name">${l.name}</text>
    <text x="${pctX}" y="${y}" class="lang-pct" text-anchor="end">${l.pct.toFixed(2)}%</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img">
  <rect width="${w}" height="${h}" fill="${THEME.bg}" rx="6"/>
  <style>
    .title { font: 700 15px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.accent}; letter-spacing: 0.5px; }
    .lang-name { font: 600 13px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.text}; }
    .lang-pct { font: 400 13px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.muted}; }
  </style>
  <text x="30" y="30" class="title">Most Used Languages</text>
  ${slices.join('')}
  ${legendItems}
</svg>`;
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

function streakSVG({ totalContributions, streaks, firstYear, activeDays, totalDays, bestDay }) {
  const { current, longest, currentStart, currentEnd, longestStart, longestEnd } = streaks;
  const w = 968, h = 170, cols = 5, col = w / cols;
  const ringCx = col + col / 2;
  const ringCy = 78;
  const ringR = 38;
  const activeRate = totalDays ? Math.round((activeDays / totalDays) * 100) : 0;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img">
  <rect width="${w}" height="${h}" fill="${THEME.bg}" rx="6"/>
  <style>
    .value { font: 700 26px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.text}; }
    .value-accent { font: 700 26px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.accent}; }
    .label { font: 600 13px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.text}; }
    .label-accent { font: 700 13px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.accent}; letter-spacing: 0.3px; }
    .range { font: 400 11px "Segoe UI", Helvetica, sans-serif; fill: ${THEME.muted}; }
    .divider { stroke: ${THEME.muted}; stroke-opacity: 0.15; }
  </style>

  <line x1="${col}" y1="35" x2="${col}" y2="135" class="divider"/>
  <line x1="${2 * col}" y1="35" x2="${2 * col}" y2="135" class="divider"/>
  <line x1="${3 * col}" y1="35" x2="${3 * col}" y2="135" class="divider"/>
  <line x1="${4 * col}" y1="35" x2="${4 * col}" y2="135" class="divider"/>

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

  <g transform="translate(${3 * col + col / 2},0)">
    <text x="0" y="72" class="value" text-anchor="middle">${activeDays.toLocaleString()}</text>
    <text x="0" y="98" class="label" text-anchor="middle">Active Days</text>
    <text x="0" y="130" class="range" text-anchor="middle">${activeRate}% of ${totalDays.toLocaleString()} days</text>
  </g>

  <g transform="translate(${4 * col + col / 2},0)">
    <text x="0" y="72" class="value" text-anchor="middle">${bestDay.count.toLocaleString()}</text>
    <text x="0" y="98" class="label" text-anchor="middle">Best Day</text>
    <text x="0" y="130" class="range" text-anchor="middle">${bestDay.date ? formatShort(bestDay.date) : '-'}</text>
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
  const languages = await fetchLanguages();
  const streaks = computeStreaks(raw.days);
  const firstYear = raw.createdAt.getUTCFullYear();

  const totalDays = raw.days.length;
  const activeDays = raw.days.filter(d => d.count > 0).length;
  const bestDay = raw.days.reduce((best, d) => d.count > best.count ? d : best, { date: null, count: 0 });

  const stats = {
    totalContributions: raw.totalContributions,
    totalCommits: raw.totalCommits,
    totalReviews: raw.totalReviews,
    stars: raw.stars,
    followers: raw.followers,
    totalPRs: raw.totalPRs,
    mergedPRs: raw.mergedPRs,
    issues: raw.issues,
    issuesFixed: raw.issuesFixed,
    repos: raw.repos,
    streaks,
  };

  console.log('Streak:', streaks);
  console.log('Totals:', { commits: stats.totalCommits, contribs: stats.totalContributions, stars: stats.stars, followers: stats.followers, prs: stats.totalPRs, merged: stats.mergedPRs, reviews: stats.totalReviews, issues: stats.issues, issuesFixed: stats.issuesFixed, repos: stats.repos });
  console.log('Activity:', { activeDays, totalDays, bestDay });
  console.log('Languages:', languages.langs.map(l => `${l.name}:${l.pct.toFixed(1)}%`).join(', '));

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, 'banner.svg'), bannerSVG());
  await fs.writeFile(path.join(OUT_DIR, 'stats.svg'), statsSVG(stats));
  await fs.writeFile(path.join(OUT_DIR, 'languages.svg'), languagesSVG(languages));
  await fs.writeFile(path.join(OUT_DIR, 'streak.svg'), streakSVG({
    totalContributions: raw.totalContributions,
    streaks,
    firstYear,
    activeDays,
    totalDays,
    bestDay,
  }));
  await fs.writeFile(path.join(OUT_DIR, 'trophies.svg'), trophiesSVG(stats));
  console.log('Wrote stats.svg, languages.svg, streak.svg, trophies.svg');
}

main().catch(err => { console.error(err); process.exit(1); });
