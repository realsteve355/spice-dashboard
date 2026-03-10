import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Collision from "./pages/Collision";
import Dashboard from "./pages/Dashboard";
import Simulation from "./pages/chart3-simulation";
import ApocalypseIndicator from "./pages/ApocalypseIndicator";

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
        <NavLink to="/simulation" style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          The Collision
        </NavLink>
        <NavLink to="/dashboard" style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          Dashboard
        </NavLink>
        <NavLink to="/apocalypse" style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          Indicators
        </NavLink>
        <a href="/spice-methodology.html" style={S.navLink}>
          Methodology
        </a>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={S.root}>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collision" element={<Collision />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/apocalypse" element={<ApocalypseIndicator />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const S = {
  root: {
    minHeight: "100vh",
    background: "#FFFFFF",
    color: "#000000",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    position: "relative",
  },
  header: {
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between",
    padding: "16px 40px", 
    borderBottom: "2px solid #E0E0E0",
    position: "sticky", 
    top: 0, 
    zIndex: 100,
    background: "#FFFFFF",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 24 },
  logo: { display: "flex", alignItems: "baseline", gap: 8 },
  logoMark: { fontSize: 18, color: "#B8860B" },
  logoText: { fontSize: 16, fontWeight: 700, letterSpacing: "0.2em", color: "#000000" },
  logoBracket: {
    fontSize: 10, 
    color: "#B8860B", 
    border: "1px solid #B8860B",
    padding: "2px 6px", 
    letterSpacing: "0.1em",
  },
  tagline: { fontSize: 9, color: "#666666", letterSpacing: "0.12em" },
  nav: { display: "flex", gap: 32, alignItems: "center" },
  navLink: {
    fontSize: 11, 
    letterSpacing: "0.1em", 
    color: "#666666",
    textDecoration: "none", 
    textTransform: "uppercase",
    paddingBottom: 2, 
    borderBottom: "2px solid transparent",
    transition: "color 0.2s, border-color 0.2s",
  },
  navActive: { color: "#B8860B", borderBottom: "2px solid #B8860B" },
};
