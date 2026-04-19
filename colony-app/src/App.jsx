import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { ethers } from 'ethers'
import CONTRACTS from './data/contracts.json'
import { logInfo, logError } from './utils/logger'
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
import Assets           from './pages/Assets'

export const WalletCtx = createContext(null)
export const useWallet = () => useContext(WalletCtx)

const BASE_CHAIN_ID = 84532  // Base Sepolia testnet

// Minimal ABIs for token reads and colony interaction
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]
const ERC721_ABI = [
  "function tokenOf(address) view returns (uint256)",
]
const COLONY_ABI = [
  "function isCitizen(address) view returns (bool)",
  "function citizenName(address) view returns (string)",
  "function colonyName() view returns (string)",
  "function founder() view returns (address)",
  "function citizenCount() view returns (uint256)",
  "function citizens(uint256) view returns (address)",
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
  const connectingRef = useRef(false)  // guard against concurrent connect() calls

  // Connect MetaMask
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert('MetaMask not found. Please install it.')
      return
    }
    if (connectingRef.current) return  // prevent concurrent calls
    connectingRef.current = true
    try {
      let prov = new ethers.BrowserProvider(window.ethereum)
      const network = await prov.getNetwork()

      if (Number(network.chainId) !== BASE_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x14A34' }],  // Base Sepolia hex
          })
        } catch (switchErr) {
          // Error 4902 = chain not added to MetaMask yet — add it
          if (switchErr?.code === 4902 || switchErr?.data?.originalError?.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x14A34',
                  chainName: 'Base Sepolia',
                  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                  rpcUrls: ['https://sepolia.base.org'],
                  blockExplorerUrls: ['https://sepolia.basescan.org'],
                }],
              })
            } catch {
              alert('Could not add Base Sepolia network. Please add it manually in MetaMask.')
              return
            }
          } else {
            alert('Please switch MetaMask to the Base Sepolia network.')
            return
          }
        }
        // Re-create provider after chain switch — old instance has stale chain state
        prov = new ethers.BrowserProvider(window.ethereum)
      }

      setChainId(BASE_CHAIN_ID)

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (!accounts || accounts.length === 0) return
      const addr = accounts[0]

      // Set address immediately so the UI shows "connected" without waiting for on-chain reads
      setAddress(addr)
      logInfo('wallet.connected', { address: addr, meta: { chainId: BASE_CHAIN_ID } })

      try {
        const sign = await prov.getSigner()
        setSigner(sign)
      } catch (e) {
        console.warn('[connect] getSigner failed — transactions will not work:', e)
        logError('wallet.signer_failed', { address: addr, message: e?.message })
      }
      setProvider(prov)

      try {
        await loadOnChainData(addr, prov)
      } catch (e) {
        console.warn('[connect] loadOnChainData failed:', e)
      }
    } catch (e) {
      // User rejected or unexpected error — log but don't clear address if already set
      console.error('[connect] failed:', e)
      logError('wallet.connect_failed', { message: e?.message })
    } finally {
      connectingRef.current = false
    }
  }, [])

  const disconnect = useCallback(async () => {
    // Revoke MetaMask permissions so the next "Connect Wallet" shows the account picker
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        })
      } catch { /* older wallets may not support this — ignore */ }
    }
    setAddress(null)
    setProvider(null)
    setSigner(null)
    setOnChain({})
  }, [])

  // Read S, V, G balances + citizen status for all known colonies
  const loadOnChainData = useCallback(async (addr, prov) => {
    if (!addr) return
    setOnChainLoading(true)
    // Use a direct JSON-RPC provider for reads — MetaMask's BrowserProvider
    // can silently drop batch calls, causing the per-colony Promise.all to fail.
    const readProv = new ethers.JsonRpcProvider('https://sepolia.base.org')
    const result = {}

    // Known colonies from contracts.json
    for (const [colonyId, cfg] of Object.entries(CONTRACTS.colonies)) {
      try {
        const sToken  = new ethers.Contract(cfg.sToken,  ERC20_ABI,  readProv)
        const vToken  = new ethers.Contract(cfg.vToken,  ERC20_ABI,  readProv)
        const gToken  = new ethers.Contract(cfg.gToken,  ERC721_ABI, readProv)
        const colony  = new ethers.Contract(cfg.colony,  COLONY_ABI, readProv)

        const [sRaw, vRaw, gId, citizen, founderAddr, sSym, vSym] = await Promise.all([
          sToken.balanceOf(addr),
          vToken.balanceOf(addr),
          gToken.tokenOf(addr),
          colony.isCitizen(addr),
          colony.founder(),
          sToken.symbol(),
          vToken.symbol(),
        ])

        const name = citizen ? await colony.citizenName(addr) : ''

        result[colonyId] = {
          sBalance:    Math.floor(Number(ethers.formatEther(sRaw))),
          vBalance:    Math.floor(Number(ethers.formatEther(vRaw))),
          gTokenId:    Number(gId),
          isCitizen:   citizen,
          citizenName: name,
          isFounder:   founderAddr.toLowerCase() === addr.toLowerCase(),
          founderAddr,
          sSymbol:     sSym,
          vSymbol:     vSym,
        }
      } catch (e) {
        console.error('[loadOnChainData] failed for', colonyId, ':', e?.message || e)
      }
    }

    setOnChain(result)
    setOnChainLoading(false)
  }, [])

  // Refresh on-chain data — small delay lets the RPC node index the new block
  const refresh = useCallback((delayMs = 1500) => {
    if (!address) return
    setTimeout(() => loadOnChainData(address, null), delayMs)
  }, [address, loadOnChainData])

  // Auto-connect if MetaMask already has this site authorised
  useEffect(() => {
    if (!window.ethereum) return
    window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
      if (accounts.length > 0) connect()
    }).catch(() => {})
  }, [connect])

  // Listen for account changes — reconnect on switch, disconnect on lock
  useEffect(() => {
    if (!window.ethereum) return
    const handler = (accounts) => {
      if (accounts.length > 0) connect()
      else disconnect()
    }
    window.ethereum.on('accountsChanged', handler)
    return () => window.ethereum.removeListener('accountsChanged', handler)
  }, [connect, disconnect])

  // Listen for network changes — clear local state and reconnect on new chain
  // NOTE: do NOT call disconnect() here — that revokes MetaMask permissions,
  // which silently breaks a connect() call that is already in flight.
  useEffect(() => {
    if (!window.ethereum) return
    const handler = () => {
      setAddress(null)
      setProvider(null)
      setSigner(null)
      setOnChain({})
      connect()
    }
    window.ethereum.on('chainChanged', handler)
    return () => window.ethereum.removeListener('chainChanged', handler)
  }, [connect])

  const isCitizenOf = (id) => {
    // Colony data comes from contracts.json (known colonies) — on-chain status from onChain state
    if (CONTRACTS.colonies[id]) return onChain[id]?.isCitizen === true
    return false
  }

  // contracts.json is the token-address lookup for known colonies.
  // Colony discovery is handled by the ColonyRegistry (Directory.jsx reads it directly).
  // TODO: replace contracts.json with registry-derived token addresses once multi-colony is needed.
  const augmentedContracts = useMemo(() => CONTRACTS, [])  // stable reference

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
    isMccOf:      (id) => {
      if (onChain[id] !== undefined) return onChain[id]?.isFounder === true
      return false
    },
    citizenColonies: address
      ? Object.entries(onChain).filter(([,v]) => v.isCitizen).map(([k]) => k)
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
          <Route path="/colony/:slug/assets"             element={<Assets />}          />
          <Route path="/create"                          element={<CreateColony />}    />
        </Routes>
      </BrowserRouter>
    </WalletCtx.Provider>
  )
}
