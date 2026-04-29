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
import * as SecureStore from 'expo-secure-store'
import {
  hasWallet, getAddress,
  createWallet as _create,
  importWallet as _import,
  loadWallet   as _load,
  clearWallet  as _clear,
} from '../utils/wallet'
import { fetchColonyState, fetchFiscState } from '../utils/contracts'

const MERCHANT_MODE_KEY = 'spice_merchant_mode'

const Ctx = createContext(null)
export const useWallet = () => useContext(Ctx)

export function WalletProvider({ children }) {
  const [address,      setAddress]      = useState(null)
  const [isSetup,      setIsSetup]      = useState(false)
  const [wallet,       setWallet]       = useState(null)  // loaded only after biometric auth
  const [colonyState,  setColonyState]  = useState(null)
  const [fiscState,    setFiscState]    = useState(null)
  const [stateLoading, setStateLoading] = useState(false)
  const [initialising, setInitialising] = useState(true)  // true while checking SecureStore on boot
  const [merchantMode, _setMerchantMode] = useState(false)

  // On mount: check if wallet exists (no auth) and load address + merchant mode
  useEffect(() => {
    ;(async () => {
      try {
        const setup = await hasWallet()
        setIsSetup(setup)
        if (setup) {
          const addr = await getAddress()
          setAddress(addr)
        }
        const mm = await SecureStore.getItemAsync(MERCHANT_MODE_KEY)
        _setMerchantMode(mm === '1')
      } catch (e) {
        console.warn('[WalletContext] init error:', e.message)
      } finally {
        setInitialising(false)
      }
    })()
  }, [])

  const setMerchantMode = useCallback(async (on) => {
    _setMerchantMode(!!on)
    try { await SecureStore.setItemAsync(MERCHANT_MODE_KEY, on ? '1' : '0') }
    catch (e) { console.warn('[WalletContext] persist merchantMode failed:', e.message) }
  }, [])

  // Whenever address changes, fetch colony + fisc state from chain
  useEffect(() => {
    if (!address) return
    setStateLoading(true)
    Promise.all([fetchColonyState(address), fetchFiscState()])
      .then(([colony, fisc]) => { setColonyState(colony); setFiscState(fisc) })
      .catch(e => console.warn('[WalletContext] fetch error:', e.message))
      .finally(() => setStateLoading(false))
  }, [address])

  const refreshState = useCallback(async () => {
    if (!address) return
    setStateLoading(true)
    try {
      const [colony, fisc] = await Promise.all([fetchColonyState(address), fetchFiscState()])
      setColonyState(colony)
      setFiscState(fisc)
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

  const importWallet = useCallback(async (phrase, accountIndex = 0) => {
    const w = await _import(phrase, accountIndex)
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
    fiscState,
    stateLoading,
    initialising,
    merchantMode,
    setMerchantMode,
    createWallet,
    importWallet,
    authenticate,
    refreshState,
    reset,
  }

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>
}
