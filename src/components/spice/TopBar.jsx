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
  nav: { display: "flex", flexWrap: "wrap", gap: "8px 16px" },
  link: {
    color: C.dim, textDecoration: "none",
    textTransform: "uppercase", letterSpacing: "0.18em",
    fontSize: 11, fontFamily: F.mono,
    transition: "color 0.2s",
  },
  linkActive: { color: C.txt },
  ctaBtn: {
    border: `1px solid ${C.ok}`, color: C.bg, background: C.ok,
    padding: "9px 22px", fontFamily: F.mono, fontSize: 11.5, fontWeight: 600,
    letterSpacing: "0.2em", textTransform: "uppercase",
    cursor: "pointer", transition: "all 0.15s",
    textDecoration: "none", display: "inline-block",
    boxShadow: `0 0 0 3px ${C.okBg}`,
  },
};

export default function TopBar({ navItems = [], cta }) {
  return (
    <header style={S.bar}>
      <NavLink to="/" style={S.brand}>
        <img
          src="/brand/axion-wordmark-light.png"
          alt="AXION"
          style={{ height: 56, width: "auto", display: "block" }}
        />
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

