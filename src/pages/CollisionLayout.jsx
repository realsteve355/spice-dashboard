import { Outlet, NavLink } from "react-router-dom";

const F = "'IBM Plex Mono', monospace";

const NAV_ITEMS = [
  { to: "/collision",            label: "Simulation",  end: true },
  { to: "/collision/impact",     label: "Impact"              },
  { to: "/collision/crisis",     label: "Crisis Paths"        },
  { to: "/collision/indicators", label: "Indicators"          },
  { to: "/collision/portfolio",  label: "Portfolio"           },
];

export default function CollisionLayout() {
  return (
    <div style={{ background: "#0a0e1a", minHeight: "100vh" }}>
      {/* ── Sub-nav ── */}
      <div style={{
        display: "flex",
        gap: 0,
        borderBottom: "1px solid #1e2a42",
        background: "#0a0e1a",
        position: "sticky",
        top: 57,
        zIndex: 50,
        padding: "0 40px",
        overflowX: "auto",
      }}>
        {NAV_ITEMS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              fontFamily: F,
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: isActive ? "#c8a96e" : "#4a5878",
              textDecoration: "none",
              padding: "12px 20px",
              borderBottom: isActive ? "2px solid #c8a96e" : "2px solid transparent",
              transition: "color 0.15s, border-color 0.15s",
              whiteSpace: "nowrap",
            })}
          >
            {label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
