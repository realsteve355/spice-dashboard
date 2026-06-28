// Site-wide navigation strip for the static model pages. Injects a header that
// mirrors the main site nav (zpc.finance) so these pages read as part of the
// site, not a separate "sim" section. No group labels, no banner.
(function() {
  const items = [
    { path: '/',             label: 'Home' },
    { path: '/unemployment', label: 'Employment' },
    { path: '/basket',       label: 'Basket' },
    { path: '/ubi',          label: 'UBI' },
    { path: '/companies',    label: 'Companies' },
    { path: '/mac',          label: 'MAC' },
    { path: '/mac-y20',      label: 'MAC Y20' },
    { path: '/mac-national', label: 'National' },
    { path: '/trajectory',   label: 'Trajectory' },
    { path: '/forecasts',    label: 'Overview' },
    { path: '/references',   label: 'References' },
    { path: '/fisc',         label: 'Income & balance' },
    { path: '/time-dividend',label: 'Time dividend' },
    { path: '/sectors',      label: 'Sectors' },
    { path: '/aggregate',    label: 'Aggregate' },
  ];

  const current = window.location.pathname.replace(/\/$/, '') || '/';

  const navStyle = `
    .site-nav {
      display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px;
      padding: 13px 26px;
      background: var(--panel);
      border-bottom: 1px solid var(--line-hot);
      font-size: 11px;
      position: sticky; top: 0; z-index: 100;
    }
    .site-nav .brand {
      display: inline-flex; align-items: center; gap: 10px;
      text-decoration: none; margin-right: 6px;
    }
    .site-nav .brand img { height: 44px; width: auto; display: block; }
    .site-nav .links {
      display: flex; flex-wrap: wrap; gap: 8px 16px;
      flex: 1 1 auto; align-items: center;
    }
    .site-nav a.navlink {
      color: var(--dim); text-decoration: none;
      text-transform: uppercase; letter-spacing: 0.18em; font-size: 11px;
      transition: color 0.2s;
    }
    .site-nav a.navlink:hover { color: var(--headline); }
    .site-nav a.navlink.current { color: var(--headline); }
    .site-nav a.cta {
      border: 1px solid var(--ok); background: var(--ok); color: #06070a;
      font-weight: 600; padding: 9px 22px; font-size: 11.5px;
      letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none;
      box-shadow: 0 0 0 3px rgba(93,211,158,0.06);
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = navStyle;
  document.head.appendChild(styleEl);

  const links = items.map(item => {
    const isCurrent = item.path === current;
    return `<a href="${item.path}" class="navlink ${isCurrent ? 'current' : ''}">${item.label}</a>`;
  }).join('');

  const navHtml = `
    <a class="brand" href="/"><img src="/static/brand/axion-wordmark-light.png" alt="AXION"></a>
    <span class="links">${links}</span>
    <a class="cta" href="/invest">Invest</a>
  `;

  function inject() {
    const header = document.querySelector('header');
    if (!header) return;
    const nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.innerHTML = navHtml;
    header.parentNode.insertBefore(nav, header);

    // Static-snapshot pages run with frozen parameters; disable the inert
    // parameter controls so they don't look broken (nav + view tabs stay live).
    // Pages flagged data-live-sim run entirely in the browser — leave enabled.
    if (!document.body.hasAttribute('data-live-sim')) {
      document.querySelectorAll('main input, main select, main textarea')
        .forEach(el => { el.disabled = true; el.style.cursor = 'not-allowed'; });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
