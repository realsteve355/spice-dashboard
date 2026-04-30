import { NavLink, Link } from "react-router-dom";
import { C, F } from "../../tokens";

const S = {
  bar: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    gap: 24,
    padding: "13px 26px",
    borderBottom: `1px solid ${C.lineHot}`,
    background: C.panel,
    fontFamily: F.mono,
    fontSize: 11.5,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: { display: "flex", alignItems: "center", gap: 12, color: C.txt, textDecoration: "none" },
  brandName: { fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", fontSize: 12 },
  brandSep: { color: C.faint },
  brandTag: { color: C.dim, fontSize: 11, letterSpacing: "0.04em" },
  nav: { display: "flex", gap: 22 },
  link: {
    color: C.dim, textDecoration: "none",
    textTransform: "uppercase", letterSpacing: "0.18em",
    fontSize: 11, fontFamily: F.mono,
    transition: "color 0.2s",
  },
  linkActive: { color: C.txt },
  ctaBtn: {
    border: `1px solid ${C.txt}`, color: C.txt, background: "transparent",
    padding: "7px 14px", fontFamily: F.mono, fontSize: 11,
    letterSpacing: "0.18em", textTransform: "uppercase",
    cursor: "pointer", transition: "all 0.15s",
    textDecoration: "none", display: "inline-block",
  },
};

export default function TopBar({ navItems = [], cta }) {
  return (
    <header style={S.bar}>
      <NavLink to="/" style={S.brand}>
        <BrandGlyph />
        <span style={S.brandName}>SPICE</span>
        <span style={S.brandSep}>/</span>
        <span style={S.brandTag}>mission control</span>
      </NavLink>
      <nav style={S.nav}>
          {navItems.map((item) => (
            item.external ? (
              <a key={item.to} href={item.to} style={S.link}>{item.label}</a>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                style={({ isActive }) => ({
                  ...S.link,
                  ...(isActive ? S.linkActive : {}),
                })}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span style={{ color: C.txt }}>{"› "}</span>}
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          ))}
      </nav>
      {cta ? (
        cta.to   ? <Link to={cta.to} style={S.ctaBtn}>{cta.label}</Link>
      : cta.href ? <a href={cta.href} style={S.ctaBtn}>{cta.label}</a>
      :            <button style={S.ctaBtn} onClick={cta.onClick}>{cta.label}</button>
      ) : <span />}
    </header>
  );
}

function BrandGlyph({ size = 18, color = C.txt }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <line x1="2"  y1="2"  x2="9" y2="9"  stroke={color} strokeWidth="1" />
      <line x1="16" y1="2"  x2="9" y2="9"  stroke={color} strokeWidth="1" />
      <line x1="9"  y1="9"  x2="9" y2="16" stroke={color} strokeWidth="1" />
      <circle cx="9" cy="9" r="1.8" fill={color} />
    </svg>
  );
}

export { BrandGlyph };
