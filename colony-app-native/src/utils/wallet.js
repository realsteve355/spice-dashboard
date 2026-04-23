/**
 * Wallet utility — key generation, secure storage, biometric auth
 *
 * Storage model:
 *   spice_address  — wallet address (no auth required; address is public data)
 *   spice_mnemonic — BIP-39 mnemonic (requireAuthentication: true — FaceID/TouchID/PIN)
 *
 * On iOS, requireAuthentication uses the Secure Enclave via LocalAuthentication.
 * On Android, it uses the Android Keystore.
 */
import * as SecureStore from 'expo-secure-store'
import * as Crypto from 'expo-crypto'
import { ethers } from 'ethers'

const MNEMONIC_KEY = 'spice_mnemonic'
const ADDRESS_KEY  = 'spice_address'

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
  const wallet  = ethers.Wallet.fromPhrase(phrase)
  await _saveWallet(phrase, wallet.address)
  return wallet
}

/**
 * Import a wallet from an existing BIP-39 mnemonic phrase.
 * Validates the phrase before storing.
 */
export async function importWallet(phrase) {
  const clean = phrase.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!ethers.Mnemonic.isValidMnemonic(clean)) {
    throw new Error('Invalid mnemonic phrase')
  }
  const wallet = ethers.Wallet.fromPhrase(clean)
  await _saveWallet(clean, wallet.address)
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
  return ethers.Wallet.fromPhrase(phrase)
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
}

// ── Internal ────────────────────────────────────────────────────────────────────

async function _saveWallet(phrase, address) {
  // Address stored without auth — it's public, and we need it for balance display
  await SecureStore.setItemAsync(ADDRESS_KEY, address)
  // Mnemonic stored with biometric requirement
  await SecureStore.setItemAsync(MNEMONIC_KEY, phrase, {
    requireAuthentication: true,
    authenticationPrompt: 'Authenticate to save your SPICE wallet',
  })
}
