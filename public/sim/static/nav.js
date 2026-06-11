// Site-wide navigation strip. Loaded on every page; injects a consistent
// nav row into <header> immediately after the <h1>.
(function() {
  const groups = [
    { label: 'Simulation', items: [
      { path: '/',            label: 'Snapshot' },
      { path: '/trajectory',  label: 'Trajectory' },
    ]},
    { label: 'Forecasts', items: [
      { path: '/forecasts',      label: 'Overview' },
      { path: '/cost-deflation', label: 'Cost deflation' },
      { path: '/unemployment',   label: 'Unemployment' },
      { path: '/profitability',  label: 'Profitability' },
      { path: '/references',     label: 'References' },
    ]},
    { label: 'Transition', items: [
      { path: '/sectors',        label: 'Sectors' },
      { path: '/aggregate',      label: 'Aggregate' },
    ]},
    { label: 'Toy colony', items: [
      { path: '/ledger',         label: 'Support phase' },
      { path: '/abundance',      label: 'Abundance' },
      { path: '/abm',            label: 'Mesa ABM' },
    ]},
    { label: 'Pre-AXION baseline', items: [
      { path: '/colony-v0',      label: 'Colony v0' },
    ]},
    { label: 'Grok V8.3', items: [
      { path: '/grok-projection', label: 'Reference projection' },
    ]},
  ];

  const current = window.location.pathname.replace(/\/$/, '') || '/';

  const navStyle = `
    .site-nav {
      display: flex; flex-wrap: wrap; gap: 18px; align-items: center;
      padding: 10px 24px;
      background: var(--panel2);
      border-bottom: 1px solid var(--line-hot);
      font-size: 11px;
      letter-spacing: 0.08em;
    }
    .site-nav .brand {
      display: inline-flex; align-items: center; gap: 8px;
      margin-right: 8px;
    }
    .site-nav .brand img {
      height: 44px; width: auto; display: block;
    }
    .site-nav .brand .tag {
      color: var(--dim);
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    .site-nav .group-label {
      color: var(--dim);
      text-transform: uppercase;
      letter-spacing: 0.2em;
      margin-right: 4px;
    }
    .site-nav .group-items {
      display: flex; gap: 12px;
    }
    .site-nav a {
      color: var(--txt2);
      text-decoration: none;
      padding: 2px 0;
      border-bottom: 1px solid transparent;
    }
    .site-nav a:hover {
      color: var(--headline);
      border-bottom-color: var(--line-hot);
    }
    .site-nav a.current {
      color: var(--headline);
      border-bottom-color: var(--ok);
    }
    .site-nav .separator {
      color: var(--line-hot);
      margin: 0 6px;
    }
  `;

  // Inject style once
  const styleEl = document.createElement('style');
  styleEl.textContent = navStyle;
  document.head.appendChild(styleEl);

  // Build nav HTML — brand on the left, then nav groups
  const brandHtml = `
    <a class="brand" href="/sim/">
      <img src="/sim/static/brand/axion-wordmark-light.png" alt="AXION">
      <span class="tag">/ economy model</span>
    </a>
    <span class="separator">|</span>
  `;
  const navHtml = brandHtml + groups.map((g, i) => `
    <div class="group">
      <span class="group-label">${g.label}</span>
      <span class="group-items">
        ${g.items.map(item => {
          // Static publish lives under /sim/ — prefix every in-site link.
          const path = item.path === '/' ? '/sim' : '/sim' + item.path;
          const isCurrent = path === current;
          return `<a href="${path}" class="${isCurrent ? 'current' : ''}">${item.label}</a>`;
        }).join('')}
      </span>
    </div>
    ${i < groups.length - 1 ? '<span class="separator">|</span>' : ''}
  `).join('');

  // Find <header> and inject the nav after it
  function inject() {
    const header = document.querySelector('header');
    if (!header) return;
    const nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.innerHTML = navHtml;
    header.parentNode.insertBefore(nav, header.nextSibling);

    // Static-snapshot banner — this is a frozen publish, controls are inert.
    const banner = document.createElement('div');
    banner.style.cssText =
      'padding:8px 24px;background:#1a1407;border-bottom:1px solid #3a2f0a;' +
      'color:#d9b25a;font-size:11px;letter-spacing:0.04em;line-height:1.5;';
    banner.textContent =
      'Static snapshot — parameters are frozen at default values and the ' +
      'interactive parameter controls are disabled. This is a published copy ' +
      'of a local simulation tool, baked for external review.';
    nav.parentNode.insertBefore(banner, nav.nextSibling);

    // Disable the inert parameter controls (nav links and view tabs stay live).
    document.querySelectorAll('main input, main select, main textarea')
      .forEach(el => { el.disabled = true; el.style.cursor = 'not-allowed'; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
