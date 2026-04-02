import { NavLink, Outlet } from 'react-router-dom'
import './MarsLayout.css'
import { useColonyData } from '../../hooks/useColonyData.js'
import { createContext, useContext, useState } from 'react'

export const ColonyContext = createContext(null)
export const useColony = () => useContext(ColonyContext)

const NAV_ITEMS = [
  { to: '/mars/dashboard',  label: 'Overview'    },
  { to: '/mars/timeline',   label: 'Timeline'    },
  { to: '/mars/companies',  label: 'Companies'   },
  { to: '/mars/citizens',   label: 'Citizens'    },
  { to: '/mars/mcc',        label: 'MCC'         },
  { to: '/mars/health',     label: 'Health Check'},
]

function fmt(n) {
  if (n == null) return '—'
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'
  if (n >= 1000)    return (n/1000).toFixed(1) + 'K'
  return Math.round(n).toLocaleString()
}

export default function MarsLayout() {
  const { data, loading, error } = useColonyData()
  const [year, setYear] = useState(200)
  const maxYear = (data.annual_summaries?.length) || 200

  return (
    <div className="mars-dash">
      <nav className="mars-subnav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              'mars-subnav-link' + (isActive ? ' active' : '')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {!loading && !error && (
        <div className="mars-year-bar">
          <span className="mars-year-label">VIEWING YEAR</span>
          <span className="mars-year-num">{year}</span>
          <input
            type="range" min={1} max={maxYear}
            value={year}
            onChange={e => setYear(+e.target.value)}
          />
          <span className="mars-year-hint">drag to explore</span>
          <span className="mars-year-txns">{fmt(data.meta?.total_transactions)} TRANSACTIONS</span>
        </div>
      )}

      <div className="mars-dash-content">
        {loading && (
          <div className="mars-loading">
            LOADING SIMULATION DATA...
          </div>
        )}
        {error && (
          <div className="mars-error">
            <div>SIMULATION DATA NOT FOUND</div>
            <div className="mars-error-hint">
              Run simulate.py then export.py, copy mars-data/ to public/, commit and push.
            </div>
          </div>
        )}
        {!loading && !error && (
          <ColonyContext.Provider value={{ ...data, year, setYear }}>
            <Outlet />
          </ColonyContext.Provider>
        )}
      </div>
    </div>
  )
}
