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
      { path: '/ledger',         label: 'Ledger' },
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
    <a class="brand" href="/">
      <img src="/static/brand/axion-wordmark-light.png" alt="AXION">
      <span class="tag">/ economy model</span>
    </a>
    <span class="separator">|</span>
  `;
  const navHtml = brandHtml + groups.map((g, i) => `
    <div class="group">
      <span class="group-label">${g.label}</span>
      <span class="group-items">
        ${g.items.map(item => {
          const isCurrent = item.path === current;
          return `<a href="${item.path}" class="${isCurrent ? 'current' : ''}">${item.label}</a>`;
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
