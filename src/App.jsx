import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { C, F } from "./tokens";
import TopBar from "./components/spice/TopBar";
import Footer from "./components/spice/Footer";
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

const NAV_ITEMS = [
  { label: "Home",        to: "/",                       end: true },
  { label: "Collision",   to: "/collision" },
  { label: "Mars",        to: "/mars" },
  { label: "Earth",       to: "/earth" },
  { label: "Pathway",     to: "/pathway" },
  { label: "Abundance",   to: "/abundance" },
  { label: "System",      to: "/spice-system" },
  { label: "Coin",        to: "/coin" },
  { label: "Methodology", to: "/spice-methodology.html", external: true },
];

export default function App() {
  return (
    <BrowserRouter>
      <div style={S.root}>
        <TopBar navItems={NAV_ITEMS} status="Sys Online" />
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
