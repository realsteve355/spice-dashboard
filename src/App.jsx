import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { C, F } from "./tokens";
import TopBar from "./components/spice/TopBar";
import Footer from "./components/spice/Footer";
import Home from "./pages/Home";
import CollisionLayout from "./pages/CollisionLayout.jsx";
import Simulation from "./pages/chart3-simulation";
import Impact from "./pages/Impact";
import CrisisScenarios from "./pages/CrisisScenarios";
import ApocalypseIndicator from "./pages/ApocalypseIndicator";
import Portfolio from "./pages/Portfolio";
import Invest from "./pages/Invest";

const NAV_ITEMS = [
  { label: "Home",             to: "/", end: true },
  { label: "Employment",       to: "/unemployment",  external: true },
  { label: "Basket",           to: "/basket",        external: true },
  { label: "UBI",              to: "/ubi",           external: true },
  { label: "Companies",        to: "/companies",     external: true },
  { label: "MAC",              to: "/mac",           external: true },
  { label: "MAC Y20",          to: "/mac-y20",       external: true },
  { label: "MAC",              to: "/mac",           external: true },
  { label: "Calibration",      to: "/calibration",   external: true },
  { label: "Tax",              to: "/tax",           external: true },
  { label: "Trajectory",       to: "/trajectory",    external: true },
  { label: "Overview",         to: "/forecasts",     external: true },
  { label: "References",       to: "/references",    external: true },
  { label: "Income & balance", to: "/fisc",          external: true },
  { label: "Time dividend",    to: "/time-dividend", external: true },
  { label: "Sectors",          to: "/sectors",       external: true },
  { label: "Aggregate",        to: "/aggregate",     external: true },
];

export default function App() {
  return (
    <BrowserRouter>
      <div style={S.root}>
        <TopBar navItems={NAV_ITEMS} cta={{ label: "Invest", to: "/invest" }} />
        <Routes>
          <Route path="/" element={<Home />} />

          {/* ── Collision family (sub-nav) ── */}
          <Route path="/collision" element={<CollisionLayout />}>
            <Route index element={<Simulation />} />
            <Route path="impact"     element={<Impact />} />
            <Route path="crisis"     element={<CrisisScenarios />} />
            <Route path="indicators" element={<ApocalypseIndicator />} />
            <Route path="portfolio"  element={<Portfolio />} />
          </Route>

          {/* ── Legacy collision URL aliases ── */}
          <Route path="/simulation"  element={<Navigate to="/collision" replace />} />
          <Route path="/impact"      element={<Navigate to="/collision/impact" replace />} />
          <Route path="/crisis"      element={<Navigate to="/collision/crisis" replace />} />
          <Route path="/indicators"  element={<Navigate to="/collision/indicators" replace />} />
          <Route path="/apocalypse"  element={<Navigate to="/collision/indicators" replace />} />
          <Route path="/portfolio"   element={<Navigate to="/collision/portfolio" replace />} />

          <Route path="/invest" element={<Invest />} />

          {/* ── Archived pages (Mars/Earth/colony/etc.) → home ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
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
    display: "flex",
    flexDirection: "column",
  },
};
