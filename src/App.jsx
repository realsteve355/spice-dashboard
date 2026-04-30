import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { C, F } from "./tokens";
import Home from "./pages/Home";
import Collision from "./pages/Collision";
import Dashboard from "./pages/Dashboard";
import Simulation from "./pages/chart3-simulation";
import Impact from "./pages/Impact";
import CrisisScenarios from "./pages/CrisisScenarios";
import ApocalypseIndicator from "./pages/ApocalypseIndicator";
import Portfolio from "./pages/Portfolio";
import Config from "./pages/Config";
import Earth from "./pages/Earth";
import Mars from "./pages/Mars.jsx";
import MarsLayout    from './pages/mars/MarsLayout.jsx'
import MarsOverview  from './pages/mars/MarsOverview.jsx'
import MarsTimeline  from './pages/mars/MarsTimeline.jsx'
import MarsCompanies from './pages/mars/MarsCompanies.jsx'
import MarsCitizens  from './pages/mars/MarsCitizens.jsx'
import MarsMCC       from './pages/mars/MarsMCC.jsx'
import MarsHealth    from './pages/mars/MarsHealth.jsx'
import CollisionLayout from './pages/CollisionLayout.jsx'
import SpiceSystem from './pages/SpiceSystem.jsx'
import CreateColony from './pages/CreateColony.jsx'
import FairbrookSim from './pages/FairbrookSim.jsx'
import PathwayToUBI from './pages/PathwayToUBI.jsx'
import Abundance from './pages/Abundance.jsx'
import ColonyEconomy from './pages/ColonyEconomy.jsx'
import BalanceOfPayments from './pages/BalanceOfPayments.jsx'
import Components from './pages/Components.jsx'

function Nav() {
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
        <span style={S.tagline}>CAPITALIST UBI PROTOCOL</span>
      </div>
      <nav style={S.nav}>
        <NavLink to="/" end style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          Home
        </NavLink>
        <NavLink to="/collision" style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          Collision
        </NavLink>
        <NavLink to="/mars" style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          Mars
        </NavLink>
        <NavLink to="/earth" style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          Earth
        </NavLink>
        <NavLink to="/fairbrook" style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          Fairbrook
        </NavLink>
        <NavLink to="/abundance" style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          Abundance
        </NavLink>
        <NavLink to="/pathway" style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          Pathway
        </NavLink>
        <NavLink to="/spice-system" style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          System
        </NavLink>
        <NavLink to="/coin" style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
          Coin
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
          {/* ── Top-level ── */}
          <Route path="/" element={<Home />} />
          <Route path="/coin" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mars" element={<Mars />} />
          <Route path="/earth" element={<Earth />} />
          <Route path="/spice-system" element={<SpiceSystem />} />
          <Route path="/create-colony" element={<CreateColony />} />
          <Route path="/fairbrook" element={<FairbrookSim />} />
          <Route path="/pathway" element={<PathwayToUBI />} />
          <Route path="/abundance" element={<Abundance />} />
          <Route path="/colony-economy" element={<ColonyEconomy />} />
          <Route path="/balance-of-payments" element={<BalanceOfPayments />} />
          <Route path="/_components" element={<Components />} />
          <Route path="/config" element={<Config />} />

          {/* ── Collision family (sub-nav) ── */}
          <Route path="/collision" element={<CollisionLayout />}>
            <Route index element={<Simulation />} />
            <Route path="impact"     element={<Impact />} />
            <Route path="crisis"     element={<CrisisScenarios />} />
            <Route path="indicators" element={<ApocalypseIndicator />} />
            <Route path="portfolio"  element={<Portfolio />} />
          </Route>

          {/* ── Legacy URL aliases ── */}
          <Route path="/simulation"  element={<Navigate to="/collision" replace />} />
          <Route path="/impact"      element={<Navigate to="/collision/impact" replace />} />
          <Route path="/crisis"      element={<Navigate to="/collision/crisis" replace />} />
          <Route path="/indicators"  element={<Navigate to="/collision/indicators" replace />} />
          <Route path="/apocalypse"  element={<Navigate to="/collision/indicators" replace />} />
          <Route path="/portfolio"   element={<Navigate to="/collision/portfolio" replace />} />

          {/* ── Old Collision detail (not in nav) ── */}
          <Route path="/collision-detail" element={<Collision />} />

          {/* ── Mars colony dashboard ── */}
          <Route path="/mars" element={<MarsLayout />}>
            <Route path="dashboard"  element={<MarsOverview />} />
            <Route path="timeline"   element={<MarsTimeline />} />
            <Route path="companies"  element={<MarsCompanies />} />
            <Route path="citizens"   element={<MarsCitizens />} />
            <Route path="mcc"        element={<MarsMCC />} />
            <Route path="health"     element={<MarsHealth />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const S = {
  root: {
    minHeight: "100vh",
    background: C.bg,
    color: C.txt,
    fontFamily: F.mono,
    position: "relative",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    height: 57,
    borderBottom: `1px solid ${C.line}`,
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: C.panel,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 24 },
  logo: { display: "flex", alignItems: "baseline", gap: 8 },
  logoMark: { fontSize: 18, color: C.txt },
  logoText: { fontSize: 16, fontWeight: 600, letterSpacing: "0.24em", color: C.txt },
  logoBracket: {
    fontSize: 10,
    color: C.dim,
    border: `1px solid ${C.line}`,
    padding: "2px 6px",
    letterSpacing: "0.1em",
  },
  tagline: { fontSize: 9, color: C.faint, letterSpacing: "0.12em" },
  nav: { display: "flex", gap: 32, alignItems: "center" },
  navLink: {
    fontSize: 11,
    letterSpacing: "0.18em",
    color: C.dim,
    textDecoration: "none",
    textTransform: "uppercase",
    paddingBottom: 2,
    borderBottom: "2px solid transparent",
    transition: "color 0.2s, border-color 0.2s",
  },
  navActive: { color: C.txt, borderBottom: `2px solid ${C.txt}` },
};
