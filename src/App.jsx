import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Collision from "./pages/Collision";
import Dashboard from "./pages/Dashboard";

function Nav() {
  const loc = useLocation();
  return (
    <header style={S.header}>
      <div style={S.headerLeft}>
        <NavLink to="/" style={{ textDecoration: "none" }}>
          <div style={S.logo}>
            <span style={S.logoMark}>◈</span>
            <span style={S.logoText}>SPICE</span>
            <span style={S.logoBracket}>[ZPC]</span>
          </div>
        </NavLink>
        <span style={S.tagline}>CRISIS HEDGE PROTOCOL</span>
      </div>
      <nav style={S.nav}>
        <NavLink to="/" end style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          Home
        </NavLink>
        <NavLink to="/collision" style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          The Collision
        </NavLink>
        <NavLink to="/dashboard" style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          Dashboard
        </NavLink>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={S.root}>
        <div style={S.grain} />
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collision" element={<Collision />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const S = {
  root: {
    minHeight: "100vh",
    background: "#080809",
    color: "#E8E4DC",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    position: "relative",
  },
  grain: {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 40px", borderBottom: "1px solid #1A1A1E",
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(8,8,9,0.95)", backdropFilter: "blur(10px)",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 24 },
  logo: { display: "flex", alignItems: "baseline", gap: 8 },
  logoMark: { fontSize: 18, color: "#C9A84C" },
  logoText: { fontSize: 16, fontWeight: 700, letterSpacing: "0.2em", color: "#E8E4DC" },
  logoBracket: {
    fontSize: 10, color: "#C9A84C", border: "1px solid rgba(201,168,76,0.4)",
    padding: "2px 6px", letterSpacing: "0.1em",
  },
  tagline: { fontSize: 9, color: "#333", letterSpacing: "0.12em" },
  nav: { display: "flex", gap: 32, alignItems: "center" },
  navLink: {
    fontSize: 11, letterSpacing: "0.1em", color: "#555",
    textDecoration: "none", textTransform: "uppercase",
    paddingBottom: 2, borderBottom: "1px solid transparent",
    transition: "color 0.2s, border-color 0.2s",
  },
  navActive: { color: "#C9A84C", borderBottom: "1px solid #C9A84C" },
};
