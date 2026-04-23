/**
 * WalletContext — global wallet state
 *
 * Provides:
 *   address     — stored wallet address (available without biometrics; null if no wallet)
 *   isSetup     — whether a wallet exists on this device
 *   colonyState — { sBalance, vBalance, isCitizen, citizenName } (loaded from chain)
 *   stateLoading — true while chain fetch is in progress
 *   wallet      — loaded ethers.Wallet (null until authenticate() is called)
 *
 *   createWallet(onShowPhrase) — generate new wallet; calls onShowPhrase(phrase)
 *   importWallet(phrase)       — import from mnemonic
 *   authenticate()             — load wallet (biometric prompt); returns Wallet
 *   refreshState()             — re-fetch balances from chain
 *   reset()                    — clear wallet from device (irreversible without seed phrase)
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  hasWallet, getAddress,
  createWallet as _create,
  importWallet as _import,
  loadWallet   as _load,
  clearWallet  as _clear,
} from '../utils/wallet'
import { fetchColonyState } from '../utils/contracts'

const Ctx = createContext(null)
export const useWallet = () => useContext(Ctx)

export function WalletProvider({ children }) {
  const [address,      setAddress]      = useState(null)
  const [isSetup,      setIsSetup]      = useState(false)
  const [wallet,       setWallet]       = useState(null)  // loaded only after biometric auth
  const [colonyState,  setColonyState]  = useState(null)
  const [stateLoading, setStateLoading] = useState(false)
  const [initialising, setInitialising] = useState(true)  // true while checking SecureStore on boot

  // On mount: check if wallet exists (no auth) and load address
  useEffect(() => {
    ;(async () => {
      try {
        const setup = await hasWallet()
        setIsSetup(setup)
        if (setup) {
          const addr = await getAddress()
          setAddress(addr)
        }
      } catch (e) {
        console.warn('[WalletContext] init error:', e.message)
      } finally {
        setInitialising(false)
      }
    })()
  }, [])

  // Whenever address changes, fetch colony state from chain
  useEffect(() => {
    if (!address) return
    setStateLoading(true)
    fetchColonyState(address)
      .then(s => setColonyState(s))
      .catch(e => console.warn('[WalletContext] fetchColonyState error:', e.message))
      .finally(() => setStateLoading(false))
  }, [address])

  const refreshState = useCallback(async () => {
    if (!address) return
    setStateLoading(true)
    try {
      const s = await fetchColonyState(address)
      setColonyState(s)
    } catch (e) {
      console.warn('[WalletContext] refresh error:', e.message)
    } finally {
      setStateLoading(false)
    }
  }, [address])

  const createWallet = useCallback(async (onShowPhrase) => {
    const w = await _create()
    const phrase = w.mnemonic?.phrase || ''
    if (onShowPhrase) onShowPhrase(phrase)
    setAddress(w.address)
    setIsSetup(true)
    setWallet(w)
    return w
  }, [])

  const importWallet = useCallback(async (phrase) => {
    const w = await _import(phrase)
    setAddress(w.address)
    setIsSetup(true)
    setWallet(w)
    return w
  }, [])

  // Trigger biometric prompt to load the wallet for signing
  const authenticate = useCallback(async () => {
    const w = await _load()
    setWallet(w)
    return w
  }, [])

  const reset = useCallback(async () => {
    await _clear()
    setAddress(null)
    setIsSetup(false)
    setWallet(null)
    setColonyState(null)
  }, [])

  const ctx = {
    address,
    isSetup,
    wallet,
    colonyState,
    stateLoading,
    initialising,
    createWallet,
    importWallet,
    authenticate,
    refreshState,
    reset,
  }

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>
}
