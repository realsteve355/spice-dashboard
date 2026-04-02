import { NavLink, Outlet } from 'react-router-dom'
import './MarsLayout.css'
import { useColonyData } from '../../hooks/useColonyData.js'
import { createContext, useContext } from 'react'

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

export default function MarsLayout() {
  const { data, loading, error } = useColonyData()

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
          <ColonyContext.Provider value={data}>
            <Outlet />
          </ColonyContext.Provider>
        )}
      </div>
    </div>
  )
}
