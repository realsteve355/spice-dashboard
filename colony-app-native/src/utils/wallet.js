/**
 * Wallet utility — key generation, secure storage, biometric auth
 *
 * Storage model:
 *   spice_address       — wallet address (no auth required; address is public data)
 *   spice_account_index — BIP-44 account index (used to re-derive the same wallet)
 *   spice_mnemonic      — BIP-39 mnemonic (requireAuthentication: true)
 *
 * Multiple MetaMask "accounts" share one seed phrase. Account 1 is at path
 * m/44'/60'/0'/0/0, Account 2 at m/44'/60'/0'/0/1, etc. ethers.Wallet.fromPhrase
 * always picks index 0 — so to import any other MetaMask account, the user
 * must specify its index.
 */
import * as SecureStore from 'expo-secure-store'
import * as Crypto from 'expo-crypto'
import { ethers } from 'ethers'

const MNEMONIC_KEY      = 'spice_mnemonic'
const ADDRESS_KEY       = 'spice_address'
const ACCOUNT_INDEX_KEY = 'spice_account_index'

function _walletAtPath(phrase, accountIndex) {
  const path = `m/44'/60'/0'/0/${accountIndex}`
  return ethers.HDNodeWallet.fromPhrase(phrase, '', path)
}

// ── Query ───────────────────────────────────────────────────────────────────────

/** Returns true if a wallet has been set up on this device. No auth required. */
export async function hasWallet() {
  const addr = await SecureStore.getItemAsync(ADDRESS_KEY)
  return !!addr
}

/** Returns the stored wallet address without authentication. */
export async function getAddress() {
  return await SecureStore.getItemAsync(ADDRESS_KEY)
}

// ── Create / Import ─────────────────────────────────────────────────────────────

/**
 * Generate a new 12-word wallet from cryptographically secure random entropy.
 * Stores the mnemonic behind biometric authentication.
 * Returns the ethers Wallet instance.
 */
export async function createWallet() {
  // Use expo-crypto for secure random bytes (avoids Hermes crypto.getRandomValues quirks)
  const entropyBytes = await Crypto.getRandomBytesAsync(16)  // 128 bits → 12 words
  const phrase = ethers.Mnemonic.entropyToPhrase(entropyBytes)
  const wallet  = _walletAtPath(phrase, 0)
  await _saveWallet(phrase, wallet.address, 0)
  return wallet
}

/**
 * Import a wallet from an existing BIP-39 mnemonic phrase.
 * Validates the phrase before storing. accountIndex defaults to 0 (the
 * first MetaMask account on a given seed); use a higher index to import
 * MetaMask Account 2, 3, etc.
 */
export async function importWallet(phrase, accountIndex = 0) {
  const clean = phrase.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!ethers.Mnemonic.isValidMnemonic(clean)) {
    throw new Error('Invalid mnemonic phrase')
  }
  const idx = Number(accountIndex)
  if (!Number.isInteger(idx) || idx < 0 || idx > 1000) {
    throw new Error('Account index must be a non-negative integer')
  }
  const wallet = _walletAtPath(clean, idx)
  await _saveWallet(clean, wallet.address, idx)
  return wallet
}

// ── Load ────────────────────────────────────────────────────────────────────────

/**
 * Load the wallet. Triggers biometric auth (FaceID / TouchID / PIN).
 * Throws if auth fails or no wallet stored.
 */
export async function loadWallet() {
  const phrase = await SecureStore.getItemAsync(MNEMONIC_KEY, {
    requireAuthentication: true,
    authenticationPrompt: 'Authenticate to access your SPICE wallet',
  })
  if (!phrase) throw new Error('No wallet found')
  const idxStr = await SecureStore.getItemAsync(ACCOUNT_INDEX_KEY)
  const accountIndex = idxStr ? (parseInt(idxStr, 10) || 0) : 0
  return _walletAtPath(phrase, accountIndex)
}

/**
 * Load the mnemonic for seed phrase display. Requires biometric auth.
 * Only ever called from Settings screen.
 */
export async function loadMnemonic() {
  const phrase = await SecureStore.getItemAsync(MNEMONIC_KEY, {
    requireAuthentication: true,
    authenticationPrompt: 'Authenticate to reveal your seed phrase',
  })
  if (!phrase) throw new Error('No wallet found')
  return phrase
}

// ── Reset ───────────────────────────────────────────────────────────────────────

/** Permanently delete the wallet from this device. Cannot be undone without the seed phrase. */
export async function clearWallet() {
  await SecureStore.deleteItemAsync(MNEMONIC_KEY)
  await SecureStore.deleteItemAsync(ADDRESS_KEY)
  await SecureStore.deleteItemAsync(ACCOUNT_INDEX_KEY)
}

// ── Internal ────────────────────────────────────────────────────────────────────

async function _saveWallet(phrase, address, accountIndex) {
  // Address + account index stored without auth — both public-ish, needed for display
  await SecureStore.setItemAsync(ADDRESS_KEY, address)
  await SecureStore.setItemAsync(ACCOUNT_INDEX_KEY, String(accountIndex))
  // Mnemonic stored with biometric requirement
  await SecureStore.setItemAsync(MNEMONIC_KEY, phrase, {
    requireAuthentication: true,
    authenticationPrompt: 'Authenticate to save your SPICE wallet',
  })
}
