import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createContext, useContext, useState } from 'react'
import { MOCK_WALLET, MOCK_CITIZEN_COLONIES, MOCK_MCC_COLONIES } from './data/mock'
import Directory       from './pages/Directory'
import ColonyPage      from './pages/ColonyPage'
import CreateColony    from './pages/CreateColony'
import Dashboard       from './pages/Dashboard'
import Admin           from './pages/Admin'
import Company         from './pages/Company'
import RegisterCompany from './pages/RegisterCompany'
import Votes           from './pages/Votes'
import Profile         from './pages/Profile'
import Guardian        from './pages/Guardian'

export const WalletCtx = createContext(null)
export const useWallet = () => useContext(WalletCtx)

export default function App() {
  const [address, setAddress] = useState(null)

  const ctx = {
    address,
    isConnected: !!address,
    connect:      () => setAddress(MOCK_WALLET),
    disconnect:   () => setAddress(null),
    isCitizenOf:  (id) => !!address && MOCK_CITIZEN_COLONIES.includes(id),
    isMccOf:      (id) => !!address && MOCK_MCC_COLONIES.includes(id),
    citizenColonies: address ? MOCK_CITIZEN_COLONIES : [],
  }

  return (
    <WalletCtx.Provider value={ctx}>
      <BrowserRouter>
        <Routes>
          <Route path="/"                        element={<Directory />}    />
          <Route path="/colony/:slug"            element={<ColonyPage />}   />
          <Route path="/colony/:slug/dashboard"  element={<Dashboard />}    />
          <Route path="/colony/:slug/admin"               element={<Admin />}           />
          <Route path="/colony/:slug/company/new"        element={<RegisterCompany />} />
          <Route path="/colony/:slug/company/:companyId" element={<Company />}         />
          <Route path="/colony/:slug/votes"               element={<Votes />}           />
          <Route path="/colony/:slug/profile"            element={<Profile />}         />
          <Route path="/colony/:slug/guardian"           element={<Guardian />}        />
          <Route path="/create"                          element={<CreateColony />}    />
        </Routes>
      </BrowserRouter>
    </WalletCtx.Provider>
  )
}
