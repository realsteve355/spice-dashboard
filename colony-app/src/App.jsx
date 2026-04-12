import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import CONTRACTS from './data/contracts.json'
import { MOCK_CITIZEN_COLONIES, MOCK_MCC_COLONIES } from './data/mock'
import Directory       from './pages/Directory'
import ColonyPage      from './pages/ColonyPage'
import CreateColony    from './pages/CreateColony'
import Dashboard       from './pages/Dashboard'
import Admin           from './pages/Admin'
import Company         from './pages/Company'
import RegisterCompany  from './pages/RegisterCompany'
import Votes            from './pages/Votes'
import Profile          from './pages/Profile'
import Guardian         from './pages/Guardian'
import RequestPayment   from './pages/RequestPayment'
import PaymentConfirm   from './pages/PaymentConfirm'

export const WalletCtx = createContext(null)
export const useWallet = () => useContext(WalletCtx)

const BASE_CHAIN_ID = 84532  // Base Sepolia testnet

// Minimal ABIs for token reads and colony interaction
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
]
const ERC721_ABI = [
  "function tokenOf(address) view returns (uint256)",
]
const COLONY_ABI = [
  "function isCitizen(address) view returns (bool)",
  "function citizenName(address) view returns (string)",
  "function colonyName() view returns (string)",
  "function sToken() view returns (address)",
  "function vToken() view returns (address)",
  "function gToken() view returns (address)",
  "function join(string) external",
  "function claimUbi() external",
  "function saveToV(uint256) external",
  "function redeemV(uint256) external",
  "function send(address, uint256, string) external",
]

export default function App() {
  const [address,   setAddress]   = useState(null)
  const [provider,  setProvider]  = useState(null)
  const [signer,    setSigner]    = useState(null)
  const [chainId,   setChainId]   = useState(null)
  const [onChain,   setOnChain]   = useState({})  // { [colonyId]: { sBalance, vBalance, gTokenId, isCitizen } }
  const [onChainLoading, setOnChainLoading] = useState(false)

  // Connect MetaMask
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert('MetaMask not found. Please install it.')
      return
    }
    const prov = new ethers.BrowserProvider(window.ethereum)
    const network = await prov.getNetwork()
    setChainId(Number(network.chainId))

    if (Number(network.chainId) !== BASE_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x14A34' }],  // Base Sepolia
        })
      } catch {
        alert('Please switch MetaMask to the Base network.')
        return
      }
    }

    const accounts = await prov.send('eth_requestAccounts', [])
    const addr = accounts[0]
    const sign = await prov.getSigner()
    setProvider(prov)
    setSigner(sign)
    setAddress(addr)
    await loadOnChainData(addr, prov)
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    setProvider(null)
    setSigner(null)
    setOnChain({})
  }, [])

  // Read S, V, G balances + citizen status for all known colonies
  const loadOnChainData = useCallback(async (addr, prov) => {
    if (!addr || !prov) return
    setOnChainLoading(true)
    const result = {}

    // Known colonies from contracts.json
    for (const [colonyId, cfg] of Object.entries(CONTRACTS.colonies)) {
      try {
        const sToken  = new ethers.Contract(cfg.sToken,  ERC20_ABI,  prov)
        const vToken  = new ethers.Contract(cfg.vToken,  ERC20_ABI,  prov)
        const gToken  = new ethers.Contract(cfg.gToken,  ERC721_ABI, prov)
        const colony  = new ethers.Contract(cfg.colony,  COLONY_ABI, prov)

        const [sRaw, vRaw, gId, citizen] = await Promise.all([
          sToken.balanceOf(addr),
          vToken.balanceOf(addr),
          gToken.tokenOf(addr),
          colony.isCitizen(addr),
        ])

        const name = citizen ? await colony.citizenName(addr) : ''

        result[colonyId] = {
          sBalance:    Math.floor(Number(ethers.formatEther(sRaw))),
          vBalance:    Math.floor(Number(ethers.formatEther(vRaw))),
          gTokenId:    Number(gId),
          isCitizen:   citizen,
          citizenName: name,
        }
      } catch (e) {
        console.warn('Failed to load on-chain data for', colonyId, e)
      }
    }

    // User-deployed colonies saved in localStorage
    const userColonies = JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')
    for (const [colonyId, info] of Object.entries(userColonies)) {
      if (CONTRACTS.colonies[colonyId]) continue  // already loaded above
      try {
        const colonyContract = new ethers.Contract(info.address, COLONY_ABI, prov)
        const [sAddr, vAddr, gAddr, citizen, colonyName] = await Promise.all([
          colonyContract.sToken(),
          colonyContract.vToken(),
          colonyContract.gToken(),
          colonyContract.isCitizen(addr),
          colonyContract.colonyName(),
        ])
        const sToken = new ethers.Contract(sAddr, ERC20_ABI,  prov)
        const vToken = new ethers.Contract(vAddr, ERC20_ABI,  prov)
        const gToken = new ethers.Contract(gAddr, ERC721_ABI, prov)
        const [sRaw, vRaw, gId] = await Promise.all([
          sToken.balanceOf(addr),
          vToken.balanceOf(addr),
          gToken.tokenOf(addr),
        ])
        const citizenName = citizen ? await colonyContract.citizenName(addr) : ''
        result[colonyId] = {
          sBalance:     Math.floor(Number(ethers.formatEther(sRaw))),
          vBalance:     Math.floor(Number(ethers.formatEther(vRaw))),
          gTokenId:     Number(gId),
          isCitizen:    citizen,
          citizenName,
          colonyName,
          colonyAddress: info.address,
        }
      } catch (e) {
        console.warn('Failed to load user colony data for', colonyId, e)
      }
    }

    setOnChain(result)
    setOnChainLoading(false)
  }, [])

  // Refresh on-chain data — small delay lets the RPC node index the new block
  const refresh = useCallback((delayMs = 1500) => {
    if (!address || !provider) return
    setTimeout(() => loadOnChainData(address, provider), delayMs)
  }, [address, provider, loadOnChainData])

  // Auto-connect if MetaMask already has this site authorised
  useEffect(() => {
    if (!window.ethereum) return
    window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
      if (accounts.length > 0) connect()
    }).catch(() => {})
  }, [connect])

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return
    const handler = () => disconnect()
    window.ethereum.on('accountsChanged', handler)
    return () => window.ethereum.removeListener('accountsChanged', handler)
  }, [disconnect])

  const isCitizenOf = (id) => {
    // If colony has a real contract (contracts.json or localStorage), always use on-chain data
    const userColonies = JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')
    if (CONTRACTS.colonies[id] || userColonies[id]) return onChain[id]?.isCitizen === true
    // No contract — fall back to mock
    return !!address && MOCK_CITIZEN_COLONIES.includes(id)
  }

  // Augment CONTRACTS with user-deployed colonies so pages can look up colony addresses
  const userColoniesStored = JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')
  const augmentedContracts = {
    ...CONTRACTS,
    colonies: {
      ...CONTRACTS.colonies,
      ...Object.fromEntries(
        Object.entries(userColoniesStored).map(([id, info]) => [id, { colony: info.address }])
      ),
    },
  }

  const ctx = {
    address,
    provider,
    signer,
    chainId,
    isConnected: !!address,
    onChainLoading,
    connect,
    disconnect,
    onChain,
    refresh,
    isCitizenOf,
    isMccOf:      (id) => !!address && MOCK_MCC_COLONIES.includes(id),
    citizenColonies: address
      ? [...new Set([
          ...Object.entries(onChain).filter(([,v]) => v.isCitizen).map(([k]) => k),
          ...MOCK_CITIZEN_COLONIES.filter(id => !CONTRACTS.colonies[id]),
        ])]
      : [],
    contracts: augmentedContracts,
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
          <Route path="/colony/:slug/request"            element={<RequestPayment />}  />
          <Route path="/colony/:slug/pay"                element={<PaymentConfirm />}  />
          <Route path="/create"                          element={<CreateColony />}    />
        </Routes>
      </BrowserRouter>
    </WalletCtx.Provider>
  )
}
