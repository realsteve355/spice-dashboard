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

  // Build nav HTML
  const navHtml = groups.map((g, i) => `
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
