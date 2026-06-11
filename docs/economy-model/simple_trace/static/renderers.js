// Shared render functions used by /forecasts (overview), /cost-deflation,
// /unemployment, /profitability. Each page loads this file then its own
// page-specific JS that calls a subset of these.

const colorVar = name => `var(--${name})`;
const fmtUSD = n => '$' + Math.round(n).toLocaleString();
const fmtPct = n => n.toFixed(1) + '%';

function renderHeadline(headline) {
  return `
  <div class="card" style="padding:20px; margin-bottom:14px;">
    <div style="font-size: 16px; color: var(--headline); line-height: 1.5; letter-spacing: 0.02em;">
      ${headline}
    </div>
  </div>`;
}

function renderQuotes(quotes) {
  return `
  <div class="quote-grid">
    ${quotes.map(q => `
      <div class="quote">
        <div class="body">"${q.quote}"</div>
        <div class="attrib">
          ${q.author} · ${q.role} · ${q.year}<br>
          <a href="${q.source_url}" target="_blank">${q.source}</a>
        </div>
      </div>
    `).join('')}
  </div>`;
}

function renderBasketStat(traj) {
  if (!traj || traj.length === 0) return '';
  const todayBasket = 980;
  const stat = pt => `
    <div class="stat">
      <div class="label">${pt.year}</div>
      <div class="value">${pt.cost_index.toFixed(0)}%</div>
      <div class="sub">$${Math.round(todayBasket * pt.cost_index / 100).toLocaleString()}/mo</div>
    </div>
  `;
  return `
  <div class="card" style="margin-bottom:14px;">
    <h3>Aggregate basket — typical year's purchases (excl. land)</h3>
    <div class="stats" style="grid-template-columns: repeat(${traj.length}, 1fr);">
      ${traj.map(stat).join('')}
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Weighted aggregate of 10 categories. Today's basket ~$980/mo collapses to ~$${Math.round(todayBasket * traj[traj.length-1].cost_index / 100)}/mo by ${traj[traj.length-1].year} —
      <strong>${(100 - traj[traj.length-1].cost_index).toFixed(0)}% deflation in ${traj[traj.length-1].year - traj[0].year} years</strong>.
    </div>
  </div>`;
}

function renderBasketComposition(categories, weights, trajectory) {
  if (!weights || !categories || !trajectory) return '';
  const todayBasketUSD = 980;
  const final = trajectory[trajectory.length - 1];
  const finalBasketUSD = todayBasketUSD * final.cost_index / 100;
  const finalYear = final.year;

  const cats = categories.filter(c => weights[c.name] !== undefined);
  const rows = cats.map(cat => {
    const weight = weights[cat.name];
    const dollarsToday = todayBasketUSD * weight / 100;
    const finalCheckpoint = cat.checkpoints.find(cp => cp.year === finalYear);
    const finalCostIndex = finalCheckpoint ? finalCheckpoint.cost_index : cat.today_index;
    const dollarsFinal = dollarsToday * finalCostIndex / 100;
    const finalShareOfBasket = (dollarsFinal / finalBasketUSD) * 100;
    return { name: cat.name, weight, dollarsToday, finalCostIndex, dollarsFinal, finalShareOfBasket, shareDelta: finalShareOfBasket - weight };
  });
  rows.sort((a, b) => b.dollarsToday - a.dollarsToday);

  const annualToday = todayBasketUSD * 12;
  const annualFinal = finalBasketUSD * 12;

  const row = r => {
    const deltaColor = r.shareDelta > 0 ? 'var(--warn)' : 'var(--ok)';
    return `<tr>
      <td class="cat">${r.name}</td>
      <td class="num">${fmtPct(r.weight)}</td>
      <td class="num">${fmtUSD(r.dollarsToday)}</td>
      <td class="num">${r.finalCostIndex}%</td>
      <td class="num">${fmtUSD(r.dollarsFinal)}</td>
      <td class="num">${fmtPct(r.finalShareOfBasket)}</td>
      <td class="num" style="color:${deltaColor};">${r.shareDelta >= 0 ? '+' : ''}${r.shareDelta.toFixed(1)} pp</td>
    </tr>`;
  };

  return `
  <div class="card" style="margin-bottom:14px;">
    <h3>What's in the basket — composition today vs ${finalYear}</h3>
    <table>
      <thead><tr>
        <th>Category</th><th class="num">Weight</th><th class="num">2026 $/mo</th>
        <th class="num">${finalYear} cost factor</th><th class="num">${finalYear} $/mo</th>
        <th class="num">${finalYear} share</th><th class="num">Share Δ</th>
      </tr></thead>
      <tbody>${rows.map(row).join('')}</tbody>
      <tfoot>
        <tr style="border-top: 1px solid var(--line-hot); color: var(--headline);">
          <td class="cat"><strong>Total basket</strong></td>
          <td class="num">100%</td>
          <td class="num">${fmtUSD(todayBasketUSD)}</td>
          <td class="num">${final.cost_index.toFixed(1)}%</td>
          <td class="num">${fmtUSD(finalBasketUSD)}</td>
          <td class="num">100%</td>
          <td class="num">—</td>
        </tr>
      </tfoot>
    </table>
    <div style="margin-top:12px; padding-top:12px; border-top: 1px solid var(--line); font-size:12px;">
      <strong style="color:var(--headline);">Household scale:</strong>
      Per person/yr today: <strong>${fmtUSD(annualToday)}</strong> → ${finalYear}: <strong>${fmtUSD(annualFinal)}</strong> ·
      Family of 4/yr today: <strong>${fmtUSD(annualToday * 4)}</strong> → ${finalYear}: <strong>${fmtUSD(annualFinal * 4)}</strong>
    </div>
  </div>`;
}

// Shared chart helper — log Y, multi-series, collision-resolved labels
function renderLogChart(opts) {
  // opts: {title, series, footer, height}
  const W = 1280, H = opts.height || 480;
  const PAD_L = 70, PAD_R = 260, PAD_T = 30, PAD_B = 50;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const xToPx = year => PAD_L + plotW * (year - 2026) / (2045 - 2026);
  const yMin = 1, yMax = 500;
  const yToPx = v => PAD_T + plotH * (1 - Math.log(v / yMin) / Math.log(yMax / yMin));

  const yTicks = [1, 5, 10, 25, 50, 100, 200, 500];
  const yGrid = yTicks.map(t => {
    const y = yToPx(t);
    const isReference = t === 100;
    return `<line x1="${PAD_L}" y1="${y}" x2="${PAD_L + plotW}" y2="${y}" stroke="${isReference ? 'var(--line-hot)' : 'var(--line)'}" stroke-width="${isReference ? 1 : 0.5}" stroke-dasharray="${isReference ? '' : '2 3'}"/>
            <text x="${PAD_L - 8}" y="${y + 4}" fill="var(--dim)" font-size="10" text-anchor="end" font-family="var(--mono)">${t}%</text>`;
  }).join('');

  const xLabels = [2026, 2030, 2035, 2040, 2045].map(yr => `
    <text x="${xToPx(yr)}" y="${H - PAD_B + 16}" fill="var(--dim)" font-size="10" text-anchor="middle" font-family="var(--mono)">${yr}</text>
    <line x1="${xToPx(yr)}" y1="${PAD_T}" x2="${xToPx(yr)}" y2="${H - PAD_B}" stroke="var(--line)" stroke-width="0.5" stroke-dasharray="2 3"/>
  `).join('');

  const lines = opts.series.map(s => {
    const path = s.points.map((p, j) => `${j === 0 ? 'M' : 'L'} ${xToPx(p.year).toFixed(1)} ${yToPx(p.cost_index).toFixed(1)}`).join(' ');
    const dots = s.points.map(p => `<circle cx="${xToPx(p.year)}" cy="${yToPx(p.cost_index)}" r="${s.emphasised ? 4 : 3}" fill="${s.color}"/>`).join('');
    const dasharray = s.dashed ? 'stroke-dasharray="6 3"' : '';
    return `<path d="${path}" fill="none" stroke="${s.color}" stroke-width="${s.strokeWidth || 1.6}" ${dasharray}/>${dots}`;
  }).join('');

  // Collision-resolved labels
  const labels = opts.series.map(s => {
    const last = s.points[s.points.length - 1];
    return { label: `${s.label} (${last.cost_index}%)`, color: s.color, lineEndX: xToPx(last.year), lineEndY: yToPx(last.cost_index), desiredY: yToPx(last.cost_index), emphasised: s.emphasised };
  });
  labels.sort((a, b) => a.desiredY - b.desiredY);
  labels[0].placedY = labels[0].desiredY;
  for (let i = 1; i < labels.length; i++) labels[i].placedY = Math.max(labels[i].desiredY, labels[i - 1].placedY + 14);
  const labelEls = labels.map(L => {
    const labelX = xToPx(2045) + 14;
    return `<line x1="${L.lineEndX + 4}" y1="${L.lineEndY}" x2="${labelX - 2}" y2="${L.placedY}" stroke="${L.color}" stroke-width="0.5" opacity="0.5"/>
            <text x="${labelX}" y="${L.placedY + 4}" fill="${L.color}" font-size="10" font-weight="${L.emphasised ? 'bold' : 'normal'}" font-family="var(--mono)">${L.label}</text>`;
  }).join('');

  return `
  <div class="card">
    <h3>${opts.title}</h3>
    <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; background:var(--panel2);">
      <rect x="${PAD_L}" y="${PAD_T}" width="${plotW}" height="${plotH}" fill="none" stroke="var(--line-hot)" stroke-width="0.5"/>
      ${yGrid}${xLabels}${lines}${labelEls}
    </svg>
    ${opts.footer ? `<div style="font-size:11px; color:var(--faint); margin-top:8px;">${opts.footer}</div>` : ''}
  </div>`;
}

function renderCategoryChart(categories, basketTrajectory, axionBasketTrajectory) {
  const series = categories.map(cat => ({
    label: cat.name,
    color: colorVar(cat.color_class),
    points: [{year: 2026, cost_index: cat.today_index}, ...cat.checkpoints],
    strokeWidth: cat.name === "LAND" ? 3 : 1.6,
    dashed: false,
  }));
  if (basketTrajectory) {
    series.push({ label: "BASKET (research aggregate)", color: "var(--headline)", points: basketTrajectory, strokeWidth: 3, dashed: true, emphasised: true });
  }
  return renderLogChart({
    title: "Cost trajectory by category · 2026 = 100%",
    series,
    height: 540,
    footer: `Y-axis logarithmic — each gridline ≈ 2× change.
             <strong style="color: var(--headline);">BASKET</strong> (dashed white) = research-anchored aggregate.
             <strong style="color: var(--crit);">LAND</strong> rises (Altman) and is excluded from the basket.`,
  });
}

function renderUnemploymentChart(unemp) {
  if (!unemp) return '';
  // Linear scale for unemployment (0-100% range, very different from log basket scale)
  const W = 1280, H = 360;
  const PAD_L = 70, PAD_R = 280, PAD_T = 30, PAD_B = 50;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const xToPx = year => PAD_L + plotW * (year - 2026) / (2045 - 2026);
  const yToPx = v => PAD_T + plotH * (1 - v / 100);

  const yGrid = [0, 20, 40, 60, 80, 100].map(t => `
    <line x1="${PAD_L}" y1="${yToPx(t)}" x2="${PAD_L + plotW}" y2="${yToPx(t)}" stroke="var(--line)" stroke-width="0.5" stroke-dasharray="2 3"/>
    <text x="${PAD_L - 8}" y="${yToPx(t) + 4}" fill="var(--dim)" font-size="10" text-anchor="end" font-family="var(--mono)">${t}%</text>
  `).join('');
  const xLabels = [2026, 2030, 2035, 2040, 2045].map(yr => `<text x="${xToPx(yr)}" y="${H - PAD_B + 16}" fill="var(--dim)" font-size="10" text-anchor="middle" font-family="var(--mono)">${yr}</text>`).join('');

  const labels = [];
  const lines = unemp.scenarios.map(s => {
    const color = colorVar(s.color_class);
    const path = s.checkpoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xToPx(p.year).toFixed(1)} ${yToPx(p.unemployment_pct).toFixed(1)}`).join(' ');
    const dots = s.checkpoints.map(p => `<circle cx="${xToPx(p.year)}" cy="${yToPx(p.unemployment_pct)}" r="3" fill="${color}"/>`).join('');
    const last = s.checkpoints[s.checkpoints.length - 1];
    labels.push({ label: `${s.name.split(' (')[0]} (${last.unemployment_pct}%)`, color, desiredY: yToPx(last.unemployment_pct), endX: xToPx(last.year) });
    return `<path d="${path}" fill="none" stroke="${color}" stroke-width="2.5"/>${dots}`;
  }).join('');

  labels.sort((a, b) => a.desiredY - b.desiredY);
  labels[0].placedY = labels[0].desiredY;
  for (let i = 1; i < labels.length; i++) labels[i].placedY = Math.max(labels[i].desiredY, labels[i - 1].placedY + 14);
  const labelEls = labels.map(L => `
    <line x1="${L.endX + 4}" y1="${L.desiredY}" x2="${xToPx(2045) + 12}" y2="${L.placedY}" stroke="${L.color}" stroke-width="0.5" opacity="0.5"/>
    <text x="${xToPx(2045) + 14}" y="${L.placedY + 4}" fill="${L.color}" font-size="10" font-family="var(--mono)">${L.label}</text>
  `).join('');

  return `
  <div class="card">
    <h3>Unemployment forecasts — three scenarios</h3>
    <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; background:var(--panel2);">${yGrid}${xLabels}${lines}${labelEls}</svg>
  </div>`;
}

function renderWorkforceComposition(unemp) {
  const wc = unemp && unemp.workforce_composition;
  if (!wc) return '';
  const dispPct = wc.displacement_pct || 85;
  const retainedPct = 100 - dispPct;

  const totalLow = wc.categories.reduce((s, c) => s + c.share_pct_low, 0);
  const totalHigh = wc.categories.reduce((s, c) => s + c.share_pct_high, 0);
  const totalDisplaced = (totalLow + totalHigh) / 2 * dispPct / 100;
  const totalRetained = (totalLow + totalHigh) / 2 * retainedPct / 100;

  const cards = wc.categories.map(c => {
    const shareMid = (c.share_pct_low + c.share_pct_high) / 2;
    const displaced = (shareMid * dispPct / 100).toFixed(1);
    const retained = (shareMid * retainedPct / 100).toFixed(1);
    return `
    <div class="cat-card ${c.color_class}" style="overflow:hidden;">
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;">
        <div class="cat-name">${c.name}</div>
        <div style="font-size:11px; color:var(--dim);">${c.share_pct_low}-${c.share_pct_high}% of workforce</div>
      </div>
      <div style="font-size:11px; color:var(--dim); line-height:1.5; margin-bottom:8px;">
        <strong style="color:var(--txt2);">Examples:</strong> ${c.examples}
      </div>
      <table style="table-layout: fixed; width: 100%; font-size:11px;">
        <colgroup><col style="width:30%;"><col style="width:70%;"></colgroup>
        <tbody>
          <tr><td class="cat" style="vertical-align:top;">AI exposure now</td>
              <td style="white-space:normal; line-height:1.4; vertical-align:top;">${c.ai_exposure_now}</td></tr>
          <tr><td class="cat" style="vertical-align:top;">Robotics exposure</td>
              <td style="white-space:normal; line-height:1.4; vertical-align:top;">${c.robotics_exposure}</td></tr>
          <tr><td class="cat" style="vertical-align:top;">Displacement window</td>
              <td style="white-space:normal; line-height:1.4; vertical-align:top; color:var(--warn);">${c.displacement_window}</td></tr>
        </tbody>
      </table>
      <div style="margin-top:10px; padding-top:8px; border-top: 1px solid var(--line); display:flex; gap:6px;">
        <div style="flex:${dispPct}; background: var(--crit); padding:3px 6px; font-size:10px; color:var(--bg); text-align:center;">DISPLACED ${displaced}%</div>
        <div style="flex:${retainedPct}; background: var(--ok); padding:3px 6px; font-size:10px; color:var(--bg); text-align:center;">RETAINED ${retained}%</div>
      </div>
    </div>`;
  }).join('');

  return `
  <div class="card" style="margin-top:14px; border-left: 3px solid var(--crit);">
    <h3>${wc.title}</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.6; margin-bottom:14px;">${wc.intro}</div>
    <div class="cat-grid" style="grid-template-columns: repeat(2, 1fr);">${cards}</div>
    <div style="margin-top:14px; padding:12px 16px; background:var(--panel2); border:1px solid var(--line-hot);">
      <div style="display:flex; justify-content:space-between; gap:14px; font-size:13px;">
        <div>
          <div style="font-size:10px; color:var(--dim); letter-spacing:0.15em; text-transform:uppercase;">Total today's jobs</div>
          <div style="font-size:18px; color:var(--headline); font-variant-numeric:tabular-nums;">~${Math.round((totalLow+totalHigh)/2)}%</div>
        </div>
        <div>
          <div style="font-size:10px; color:var(--crit); letter-spacing:0.15em; text-transform:uppercase;">Displaced by 2035</div>
          <div style="font-size:18px; color:var(--crit); font-variant-numeric:tabular-nums;">~${totalDisplaced.toFixed(0)}%</div>
        </div>
        <div>
          <div style="font-size:10px; color:var(--ok); letter-spacing:0.15em; text-transform:uppercase;">Retained intact</div>
          <div style="font-size:18px; color:var(--ok); font-variant-numeric:tabular-nums;">~${totalRetained.toFixed(0)}%</div>
        </div>
      </div>
    </div>
    <div style="background: rgba(93, 211, 158, 0.08); border-left: 3px solid var(--ok); padding:14px 18px; margin-top:14px; font-size:13px; line-height:1.6; color:var(--txt);">
      <div style="font-size:10px; color:var(--ok); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:6px;">Critical caveat — the transition gap</div>
      ${wc.transition_gap}
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Sources: ${wc.sources.map(s => `<a href="${s.url}" target="_blank" style="color:var(--faint);">${s.label}</a>`).join(' · ')}
    </div>
  </div>`;
}

function renderUnemploymentScenarios(unemp) {
  if (!unemp) return '';
  const ev = unemp.displacement_evidence;
  const evidenceCard = !ev ? '' : `
  <div class="card" style="margin-top:14px; border-left: 3px solid var(--crit);">
    <h3>Labour displacement — 2026 cost ratios with sources</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.6; margin-bottom:14px;">${ev.intro}</div>
    ${ev.caveat ? `
    <div style="background: rgba(212, 160, 74, 0.08); border-left: 3px solid var(--warn); padding: 14px 18px; margin-bottom: 14px; font-size: 12px; line-height: 1.6; color: var(--txt);">
      <div style="font-size:10px; color:var(--warn); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:6px;">Caveat — read before the table</div>
      ${ev.caveat.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--headline);">$1</strong>')}
    </div>` : ''}
    <table style="table-layout: fixed; width: 100%;">
      <colgroup>
        <col style="width: 18%;">
        <col style="width: 9%;">
        <col style="width: 11%;">
        <col style="width: 7%;">
        <col style="width: 55%;">
      </colgroup>
      <thead><tr>
        <th>Role</th>
        <th class="num">AI / mo</th>
        <th class="num">Human / mo</th>
        <th class="num">Ratio</th>
        <th>Evidence + notes</th>
      </tr></thead>
      <tbody>
        ${ev.examples.map(e => {
          const sources = [];
          if (e.source_url) sources.push(`<a href="${e.source_url}" target="_blank" style="color:var(--ok);">primary source</a>`);
          if (e.secondary_url) sources.push(`<a href="${e.secondary_url}" target="_blank" style="color:var(--ok);">secondary</a>`);
          const sourceLine = sources.join(' · ');
          return `
          <tr>
            <td class="cat" style="white-space: normal; vertical-align: top;">${e.role}</td>
            <td class="num" style="vertical-align: top;">$${e.ai_cost_per_month.toLocaleString()}</td>
            <td class="num" style="vertical-align: top;">$${e.human_cost_per_month.toLocaleString()}</td>
            <td class="num" style="color: var(--crit); vertical-align: top;"><strong>${e.cost_ratio}×</strong></td>
            <td style="font-size:11px; color:var(--dim); white-space: normal; line-height: 1.5; vertical-align: top;">
              <strong style="color:var(--txt2);">Evidence:</strong> ${e.evidence}<br>
              <strong style="color:var(--txt2);">Notes:</strong> ${e.note}<br>
              <span style="color:var(--faint);">Baseline: ${e.human_baseline} · ${sourceLine}</span>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <div style="background:var(--panel2); border-left: 2px solid var(--warn); padding:14px 18px; margin-top:14px;">
      <div style="font-size:10px; color:var(--warn); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:6px;">Macro picture</div>
      <div style="font-size:13px; color:var(--txt); line-height:1.6;">${ev.macro_summary}</div>
    </div>
    <div style="background:var(--panel2); border-left: 2px solid var(--ok); padding:14px 18px; margin-top:10px;">
      <div style="font-size:10px; color:var(--ok); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:6px;">AXION implication</div>
      <div style="font-size:13px; color:var(--txt); line-height:1.6;">${ev.axion_implication}</div>
    </div>
  </div>`;

  return `
  <div class="card" style="margin-top:14px;">
    <h3>Unemployment scenarios — per-source predictions</h3>
    <div class="cat-grid">
      ${unemp.scenarios.map(s => `
        <div class="cat-card ${s.color_class}" style="overflow: hidden;">
          <div class="cat-name" style="margin-bottom:6px;">${s.name}</div>
          <div style="font-size:11px; color:var(--dim); margin-bottom:8px; line-height:1.5;">${s.interpretation}</div>
          <table style="table-layout: fixed; width: 100%;">
            <colgroup>
              <col style="width: 18%;">
              <col style="width: 18%;">
              <col style="width: 64%;">
            </colgroup>
            <thead><tr><th>Year</th><th class="num">Unemp %</th><th>Anchored to</th></tr></thead>
            <tbody>${s.checkpoints.map(cp => `
              <tr>
                <td class="cat" style="vertical-align: top;">${cp.year}</td>
                <td class="num" style="vertical-align: top;">${cp.unemployment_pct}%</td>
                <td style="font-size:10px; white-space: normal; line-height: 1.4; vertical-align: top;">${cp.anchor}</td>
              </tr>
            `).join('')}</tbody>
          </table>
        </div>
      `).join('')}
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">Sources: ${unemp.sources.map(s => `<a href="${s.url}" target="_blank" style="color:var(--faint);">${s.label}</a>`).join(' · ')}</div>
  </div>
  ${evidenceCard}`;
}

function renderProfitability(prof) {
  if (!prof) return '';
  const scenarios = prof.scenarios.map(s => `
    <div class="cat-card ${s.color_class}">
      <div class="cat-name" style="margin-bottom:6px;">${s.name}</div>
      <div style="font-size:11px; color:var(--dim); margin-bottom:8px;">${s.anchor}</div>
      <div style="display:flex; gap:8px; margin-bottom:10px;">
        <div style="flex:${s.capital_pct}; background: var(--warn); padding:4px 6px; font-size:10px; color:var(--bg); text-align:center;">CAPITAL ${s.capital_pct}%</div>
        <div style="flex:${s.consumer_pct}; background: var(--ok); padding:4px 6px; font-size:10px; color:var(--bg); text-align:center;">CONSUMER ${s.consumer_pct}%</div>
        <div style="flex:${s.labor_pct}; background: var(--blue); padding:4px 6px; font-size:10px; color:var(--bg); text-align:center;">LABOR ${s.labor_pct}%</div>
      </div>
      <div style="font-size:11px; color:var(--txt); line-height:1.5;"><strong style="color:var(--headline);">AXION implication:</strong> ${s.axion_implication}</div>
    </div>
  `).join('');

  // AXION insulation panel — the basket peg makes the external split less consequential internally
  const ins = prof.axion_insulation;
  const insulationCard = !ins ? '' : `
  <div class="card" style="margin-top:14px; border-left: 3px solid var(--blue);">
    <h3>${ins.title}</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.6; margin-bottom:14px;">${ins.summary}</div>
    <table style="table-layout: fixed; width: 100%;">
      <colgroup><col style="width: 22%;"><col style="width: 78%;"></colgroup>
      <thead><tr><th>Mechanism</th><th>How it works</th></tr></thead>
      <tbody>
        ${ins.mechanism.map(([label, desc]) => `
          <tr>
            <td class="cat" style="white-space: normal; vertical-align: top;">${label}</td>
            <td style="white-space: normal; line-height: 1.5; vertical-align: top;">${desc}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="background:var(--panel2); border-left: 2px solid var(--blue); padding:14px 18px; margin-top:14px;">
      <div style="font-size:10px; color:var(--blue); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:6px;">Implication for AXION</div>
      <div style="font-size:13px; color:var(--txt); line-height:1.6;">${ins.implication}</div>
    </div>
  </div>`;

  // Political-economy panel (Henry Ford insight)
  const pe = prof.political_economy;
  const peCard = !pe ? '' : `
  <div class="card" style="margin-top:14px; border-left: 3px solid var(--ok);">
    <h3>${pe.title}</h3>
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; margin-bottom:14px;">
      <div>
        <div style="font-size:10px; color:var(--warn); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:6px;">Surface tension</div>
        <div style="font-size:13px; color:var(--txt); line-height:1.6;">${pe.tension}</div>
      </div>
      <div>
        <div style="font-size:10px; color:var(--ok); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:6px;">Deeper alignment</div>
        <div style="font-size:13px; color:var(--txt); line-height:1.6;">${pe.alignment}</div>
      </div>
    </div>
    <div style="background:var(--panel2); border-left: 2px solid var(--ok); padding:14px 18px; margin: 14px 0;">
      <div style="font-size:14px; color:var(--headline); font-style:italic; line-height:1.5; margin-bottom:6px;">"${pe.key_quote.text}"</div>
      <div style="font-size:11px; color:var(--dim); letter-spacing:0.1em; text-transform:uppercase;">— ${pe.key_quote.author}</div>
    </div>
    <div style="font-size:13px; color:var(--txt); line-height:1.6; margin-bottom:10px;">
      <strong style="color:var(--headline);">Historical precedent:</strong> ${pe.precedent}
    </div>
    <div style="font-size:13px; color:var(--txt); line-height:1.6; margin-bottom:10px;">
      <strong style="color:var(--headline);">AXION design implication:</strong> ${pe.design_implication}
    </div>
    <div style="background:var(--panel2); border:1px solid var(--ok); padding:14px 18px; margin-top:14px;">
      <div style="font-size:10px; color:var(--ok); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:6px;">AXION principle</div>
      <div style="font-size:14px; color:var(--headline); line-height:1.5;">${pe.axion_principle}</div>
    </div>
  </div>`;

  return `
  <div class="card">
    <h3>Profitability — who captures the AI productivity gains?</h3>
    <div style="font-size:12px; color:var(--txt); margin-bottom:14px; line-height:1.5;">${prof.framework}</div>
    <div class="cat-grid">${scenarios}</div>
    <div style="font-size:11px; color:var(--faint); margin-top:14px;">Sources: ${prof.sources.map(s => `<a href="${s.url}" target="_blank" style="color:var(--faint);">${s.label}</a>`).join(' · ')}</div>
  </div>
  ${insulationCard}
  ${peCard}`;
}

function renderSkeptic(s) {
  return `
  <div class="card" style="border-left: 3px solid var(--warn); margin-top:14px;">
    <h3>Skeptic counterpoint</h3>
    <div style="font-size:13px; color: var(--txt); line-height:1.5;">
      <strong style="color: var(--headline);">${s.author}</strong> (${s.role}, ${s.year}) — <em>${s.estimate}</em>
    </div>
    <div style="font-size:12px; color: var(--dim); margin-top: 8px; line-height: 1.5;">${s.argument}</div>
    <div style="font-size:10px; color: var(--faint); margin-top: 8px; letter-spacing: 0.1em; text-transform: uppercase;">
      <a href="${s.source_url}" target="_blank" style="color: var(--faint);">${s.source}</a>
    </div>
  </div>`;
}

function renderCategories(categories) {
  return `
  <div class="card" style="margin-top:14px;">
    <h3>Category detail · per-source predictions</h3>
    <div class="cat-grid">
      ${categories.map(cat => `
        <div class="cat-card ${cat.color_class}">
          <div class="cat-head">
            <div class="cat-name">${cat.name}</div>
            <div style="font-size:10px; color:var(--dim);">2026 = 100%</div>
          </div>
          <div class="cat-mech">${cat.mechanism}</div>
          <table>
            <thead><tr><th>Year</th><th class="num">Cost %</th><th>Anchored to</th></tr></thead>
            <tbody>${cat.checkpoints.map(cp => `<tr><td class="cat">${cp.year}</td><td class="num">${cp.cost_index}%</td><td style="font-size:10px;">${cp.anchor}</td></tr>`).join('')}</tbody>
          </table>
          <div class="cat-anchors"><strong>Sources:</strong> ${cat.sources.join(' · ')}</div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

function renderSources(sources, footer) {
  return `
  <div class="card" style="margin-top:14px;">
    <h3>Sources</h3>
    <ul style="margin:0; padding-left: 18px; font-size: 11px; line-height: 1.7;">
      ${sources.map(s => `<li><a href="${s.url}" target="_blank" style="color: var(--txt2);">${s.label}</a></li>`).join('')}
    </ul>
    ${footer ? `<div style="font-size:11px; color:var(--faint); margin-top:8px;">${footer}</div>` : ''}
  </div>`;
}

// Generic fetch + page-render harness. Each page calls runPage(renderFn).
async function runPage(renderFn) {
  const results = document.getElementById('results');
  try {
    const r = await fetch('/api/forecasts');
    if (!r.ok) {
      results.innerHTML = `<div class="callout crit">Failed to load forecasts: ${r.status}</div>`;
      return;
    }
    const d = await r.json();
    results.innerHTML = renderFn(d);
  } catch (e) {
    results.innerHTML = `<div class="callout crit">Error: ${e}</div>`;
  }
}
