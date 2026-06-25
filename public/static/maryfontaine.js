// maryfontaine.js — SINGLE SOURCE OF TRUTH for the MaryFontaine economic model.
//
// Loaded by the Profitability, Unemployment and Fisc pages (before their own JS).
// Everything is exposed on the `MF` namespace so it never collides with the
// globals in renderers.js. Each page does e.g.  const { countyByYear } = MF;
//
// ─────────────────────────────────────────────────────────────────────────
// PROVENANCE — where every number comes from
// ─────────────────────────────────────────────────────────────────────────
// • 180,000 ADULTS is the load-bearing anchor: all per-adult MAC/UBI maths use
//   it. Demographics use a realistic US age structure (under-18 ≈ 22%, 65+ ≈
//   22% of adults) → 50,000 children + 140,000 working-age + 40,000 retired =
//   230,000 total. (Corrected 14 Jun 2026 from an earlier 120k-children figure
//   that implied an impossible 40% child share.)
// • MAC FORMULA: MAC_i = profit_i × min(50%, k × 22% × (profit_i/E_i)/$200k).
//   k = charge MULTIPLIER (a constant, usually 1.0). 22% base charge at the
//   $200k/employee reference; 50% cap. (Steve's spec, 14 Jun 2026 — the
//   original k×Π/E was inverted; corrected to the rate rising with profit-per-
//   employee.)
// • BUSINESS MIX (MARYFONTAINE): illustrative county composition, tuned so Year-0
//   total profit = $2.6B (~$14,400/adult, in line with US corporate profit per
//   capita) and the profit-weighted average MAC rate ≈ 22% at k=1. Sector
//   counts / profits / employees / margins are estimates; the attributed
//   national & global firms (Amazon, retail, manufacturing, tech) carry most of
//   the profit. NOT yet sourced from real MaryFontaine data — placeholder mix.
// • DEFLATION DRIVERS + BASKET: mirror the Cost Deflation page, whose AUTHORITATIVE
//   source is forecasts.py (BASKET_WEIGHTS + per-category trajectories, baked to
//   forecasts.json). The curves here MUST be kept in sync with forecasts.py.
//   Basket today ≈ $1,600/mo per person (incl. basic housing, excl. land);
//   trajectory 100 → 62.9 → 39.1 → 23.0 → 15.7 (2026→2045).
// • UNEMPLOYMENT RAMP 4.2% → 75% over 20 years: Grok V9.13 MaryFontaine
//   projection (docs/Grok2.md §2) — the colony planning case.
// • RESERVE / BOND YIELD (used by the Fisc page): ~4.1% = 10-year US Treasury,
//   early 2026 (same r0 as the macro simulation).
// ─────────────────────────────────────────────────────────────────────────

const MF = (function () {
  // ── MAC charge parameters ──
  const REF_PPE = 200000;     // profit-per-employee reference (maps to the base rate)
  const BASE_RATE = 0.22;     // charge rate at the reference when k = 1
  const RATE_CAP = 0.50;      // max share of profit any firm pays
  const HORIZON = 20;         // years, 2026–2046

  // ── Demographics (anchor: 180,000 adults) ──
  const ADULTS = 180000;
  const WORKING_AGE = 140000; // 18–64  (~78% of adults)
  const RETIRED = 40000;      // 65+    (~22% of adults)
  const CHILDREN = 50000;     // under 18 (~22% of population)
  const TOTAL_POP = WORKING_AGE + RETIRED + CHILDREN; // 230,000

  // ── Basket (per person / month, 2026) ──
  const BASKET_TODAY = 1600;
  const BOND_YIELD = 0.041;   // 10yr Treasury, early 2026

  // ── Cost-deflation category drivers (cost_index, 2026 = 100) ──
  // goods + transport are SOURCED from forecasts.json (Manufactured goods /
  // Transport categories) by load() below — the values here are a fallback
  // mirror. craftLabour + hospLand are local modelling assumptions (labour does
  // not deflate; hospitality labour + rising land), not forecast categories.
  const DEFLATION = {
    goods:       [{ y: 2026, v: 100 }, { y: 2030, v: 60 }, { y: 2035, v: 30 }, { y: 2040, v: 15 }, { y: 2045, v: 10 }],
    transport:   [{ y: 2026, v: 100 }, { y: 2030, v: 30 }, { y: 2035, v: 15 }, { y: 2040, v: 10 }, { y: 2045, v: 8 }],
    craftLabour: [{ y: 2026, v: 100 }, { y: 2045, v: 90 }],   // craft labour: minimal deflation
    hospLand:    [{ y: 2026, v: 100 }, { y: 2045, v: 105 }],  // hospitality labour + rising land
  };

  // ── Research aggregate basket trajectory ──
  // SOURCED from forecasts.json (basket_trajectory) by load() below; the values
  // here are a fallback mirror used until that resolves / if the fetch fails.
  let BASKET_TRAJ = [{ y: 2026, v: 100 }, { y: 2030, v: 62.9 }, { y: 2035, v: 39.1 }, { y: 2040, v: 23.0 }, { y: 2045, v: 15.7 }];

  // ── Colony planning unemployment ramp (% of working-age) — Grok V9.13 ──
  const UNEMP_RAMP = [{ t: 0, v: 4.2 }, { t: 5, v: 18 }, { t: 10, v: 35 }, { t: 15, v: 55 }, { t: 20, v: 75 }];

  // ── Business population (Year 0). [count, profit/firm, emp/firm, driver, margin0] ──
  const MARYFONTAINE = [
    { sector: 'Cafés & restaurants', count: 340, profitPerFirm: 45e3, empPerFirm: 14, driver: 'hospLand', margin0: 0.35 },
    { sector: 'Retail & local services', count: 440, profitPerFirm: 70e3, empPerFirm: 9, driver: 'goods', margin0: 0.35 },
    { sector: 'Trades & construction', count: 500, profitPerFirm: 90e3, empPerFirm: 7, driver: 'craftLabour', margin0: 0.40 },
    { sector: 'Professional & financial', count: 230, profitPerFirm: 250e3, empPerFirm: 11, driver: 'goods', margin0: 0.35 },
    { sector: 'Healthcare & clinics', count: 165, profitPerFirm: 350e3, empPerFirm: 16, driver: 'craftLabour', margin0: 0.40 },
    { sector: 'Education & childcare', count: 110, profitPerFirm: 60e3, empPerFirm: 22, driver: 'craftLabour', margin0: 0.40 },
    { sector: 'Local manufacturing & workshops', count: 75, profitPerFirm: 600e3, empPerFirm: 28, driver: 'goods', margin0: 0.30 },
    { sector: 'Regional automated logistics', count: 14, profitPerFirm: 18e6, empPerFirm: 90, driver: 'transport', margin0: 0.25 },
    { sector: 'Attributed national retail share', count: 1, profitPerFirm: 800e6, empPerFirm: 3850, driver: 'goods', margin0: 0.30 },
    { sector: 'Attributed manufacturing & energy', count: 1, profitPerFirm: 600e6, empPerFirm: 2680, driver: 'goods', margin0: 0.25 },
    { sector: 'Attributed tech & platforms', count: 1, profitPerFirm: 690e6, empPerFirm: 2950, driver: 'goods', margin0: 0.28 },
  ];

  // ── Interpolators ──
  function interpYear(a, year) {
    if (year <= a[0].y) return a[0].v;
    if (year >= a[a.length - 1].y) return a[a.length - 1].v;
    for (let i = 0; i < a.length - 1; i++) if (year >= a[i].y && year <= a[i + 1].y) {
      return a[i].v + (a[i + 1].v - a[i].v) * (year - a[i].y) / (a[i + 1].y - a[i].y);
    }
    return a[a.length - 1].v;
  }
  function interpT(a, t) {
    if (t <= a[0].t) return a[0].v;
    if (t >= a[a.length - 1].t) return a[a.length - 1].v;
    for (let i = 0; i < a.length - 1; i++) if (t >= a[i].t && t <= a[i + 1].t) {
      return a[i].v + (a[i + 1].v - a[i].v) * (t - a[i].t) / (a[i + 1].t - a[i].t);
    }
    return a[a.length - 1].v;
  }

  // ── MAC charge ──
  // k is a multiplier (usually 1.0); base charge is BASE_RATE at the reference.
  function macRate(profit, emp, k) { return Math.min(RATE_CAP, k * BASE_RATE * (profit / emp) / REF_PPE); }
  // Real-profit multiplier (1.0 at 2026) from margin expansion as the input cost falls.
  function marginMult(driver, margin0, t) {
    const cost = interpYear(DEFLATION[driver], 2026 + t) / 100;
    return (1 - (1 - margin0) * cost) / margin0;
  }

  // ── Bottom-up county totals at multiplier k (Year-0 snapshot, t=0) ──
  function compositionStats(k) {
    let totalProfit = 0, totalEmp = 0, totalMAC = 0, totalRevenue = 0;
    const rows = MARYFONTAINE.map(s => {
      const profit = s.count * s.profitPerFirm;
      const revenue = profit / s.margin0;
      const emp = s.count * s.empPerFirm;
      const ppe = profit / emp;
      const rate = macRate(profit, emp, k);
      const mac = profit * rate;
      totalProfit += profit; totalEmp += emp; totalMAC += mac; totalRevenue += revenue;
      return { sector: s.sector, count: s.count, revenue, profit, emp, ppe, rate, mac };
    });
    return { rows, totalProfit, totalEmp, totalMAC, totalRevenue, effRate: totalMAC / totalProfit };
  }

  // ── County profit + MAC income per year (each sector's profit evolves by its margin) ──
  function countyByYear(k) {
    const out = [];
    for (let t = 0; t <= HORIZON; t++) {
      let profit = 0, mac = 0;
      for (const s of MARYFONTAINE) {
        const p = s.count * s.profitPerFirm * marginMult(s.driver, s.margin0, t);
        mac += p * macRate(p, s.count * s.empPerFirm, k);
        profit += p;
      }
      out.push({ year: 2026 + t, profit, mac, effRate: mac / profit });
    }
    return out;
  }

  // ── Derived per-year series ──
  function unempRateAt(t) { return interpT(UNEMP_RAMP, t); }                       // %
  function unemployedAt(t) { return WORKING_AGE * interpT(UNEMP_RAMP, t) / 100; }   // people
  function basketIndexAt(t) { return interpYear(BASKET_TRAJ, 2026 + t); }           // 2026 = 100
  function basketPerPersonYr(t) { return BASKET_TODAY * basketIndexAt(t) / 100 * 12; } // $/person/yr

  // ── Formatters ──
  function fmtBn(v) { return (v < 0 ? '-$' : '$') + (Math.abs(v) / 1e9).toFixed(2) + 'B'; }
  function fmtMoney(v) {
    const s = v < 0 ? '-' : '', a = Math.abs(v);
    if (a >= 1e9) return s + '$' + (a / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return s + '$' + (a / 1e6).toFixed(a >= 1e8 ? 0 : 2) + 'M';
    if (a >= 1e5) return s + '$' + Math.round(a / 1e3) + 'k';
    return s + '$' + Math.round(a).toLocaleString();
  }
  function mfUSD(v) { return '$' + Math.round(v).toLocaleString(); }

  // ── Generic SVG line chart (supports area fill + a 0 gridline) ──
  function lineChart(opts) {
    const W = opts.width || 1280, H = opts.height || 320;
    const PAD = { l: opts.padL || 80, r: opts.padR || 210, t: 26, b: 42 };
    const plotW = W - PAD.l - PAD.r, plotH = H - PAD.t - PAD.b;
    const [x0, x1] = opts.xDomain, [y0, y1] = opts.yDomain;
    const xPx = x => PAD.l + plotW * (x - x0) / (x1 - x0);
    const yPx = y => PAD.t + plotH * (1 - (y - y0) / (y1 - y0));
    const grid = (opts.yTicks || []).map(t => `
      <line x1="${PAD.l}" y1="${yPx(t)}" x2="${PAD.l + plotW}" y2="${yPx(t)}" stroke="${t === 0 ? 'var(--line-hot)' : 'var(--line)'}" stroke-width="${t === 0 ? 1 : 0.5}" stroke-dasharray="${t === 0 ? '' : '2 3'}"/>
      <text x="${PAD.l - 8}" y="${yPx(t) + 4}" fill="var(--dim)" font-size="10" text-anchor="end" font-family="var(--mono)">${opts.yFmt ? opts.yFmt(t) : t}</text>`).join('');
    const xLabels = (opts.xTicks || []).map(x => `<text x="${xPx(x)}" y="${H - PAD.b + 16}" fill="var(--dim)" font-size="10" text-anchor="middle" font-family="var(--mono)">${x}</text>`).join('');
    const areas = opts.series.filter(s => s.area).map(s => {
      const top = s.pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xPx(p.x).toFixed(1)} ${yPx(p.y).toFixed(1)}`).join(' ');
      const base = `L ${xPx(s.pts[s.pts.length - 1].x).toFixed(1)} ${yPx(Math.max(y0, 0)).toFixed(1)} L ${xPx(s.pts[0].x).toFixed(1)} ${yPx(Math.max(y0, 0)).toFixed(1)} Z`;
      return `<path d="${top} ${base}" fill="${s.color}" fill-opacity="${s.areaOpacity || 0.08}" stroke="none"/>`;
    }).join('');
    const labels = [];
    const paths = opts.series.map(s => {
      const d = s.pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xPx(p.x).toFixed(1)} ${yPx(p.y).toFixed(1)}`).join(' ');
      const last = s.pts[s.pts.length - 1];
      if (s.label) labels.push({ label: s.label, color: s.color, desiredY: yPx(last.y), endX: xPx(last.x) });
      return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2.5}" ${s.dashed ? 'stroke-dasharray="6 4"' : ''}/>`;
    }).join('');
    labels.sort((a, b) => a.desiredY - b.desiredY);
    if (labels.length) { labels[0].placedY = labels[0].desiredY; for (let i = 1; i < labels.length; i++) labels[i].placedY = Math.max(labels[i].desiredY, labels[i - 1].placedY + 15); }
    const labelEls = labels.map(L => `
      <line x1="${L.endX + 4}" y1="${L.desiredY}" x2="${PAD.l + plotW + 12}" y2="${L.placedY}" stroke="${L.color}" stroke-width="0.5" opacity="0.5"/>
      <text x="${PAD.l + plotW + 14}" y="${L.placedY + 4}" fill="${L.color}" font-size="10" font-family="var(--mono)">${L.label}</text>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; background:var(--panel2);">${grid}${xLabels}${areas}${paths}${labelEls}</svg>`;
  }

  // ── Pull basket + goods/transport deflation from forecasts.json ──
  // forecasts.py (baked to forecasts.json, served at /data/ on the publish
  // and /api/forecasts on the dev tool) is the AUTHORITATIVE source. Pages call
  // MF.load().then(render) — they render with the fallback first, then re-render
  // with the sourced values once this resolves.
  let _loaded = false;
  function load() {
    if (_loaded || typeof fetch === 'undefined') return Promise.resolve();
    const url = (typeof location !== 'undefined' && location.pathname.indexOf('/') === 0)
      ? '/data/forecasts.json' : '/api/forecasts';
    return fetch(url).then(r => r.json()).then(d => {
      if (d && Array.isArray(d.basket_trajectory)) {
        BASKET_TRAJ = d.basket_trajectory.map(p => ({ y: p.year, v: p.cost_index }));
      }
      if (d && Array.isArray(d.categories)) {
        const by = {};
        d.categories.forEach(c => { by[c.name] = c; });
        const curve = c => c ? [{ y: 2026, v: c.today_index }].concat(c.checkpoints.map(cp => ({ y: cp.year, v: cp.cost_index }))) : null;
        const g = curve(by['Manufactured goods']); if (g) DEFLATION.goods = g;
        const t = curve(by['Transport']); if (t) DEFLATION.transport = t;
      }
      _loaded = true;
    }).catch(() => { _loaded = true; });
  }

  return {
    REF_PPE, BASE_RATE, RATE_CAP, HORIZON,
    ADULTS, WORKING_AGE, RETIRED, CHILDREN, TOTAL_POP, BASKET_TODAY, BOND_YIELD,
    DEFLATION, UNEMP_RAMP, MARYFONTAINE,
    interpYear, interpT, macRate, marginMult, compositionStats, countyByYear,
    unempRateAt, unemployedAt, basketIndexAt, basketPerPersonYr,
    fmtBn, fmtMoney, mfUSD, lineChart, load,
  };
})();
