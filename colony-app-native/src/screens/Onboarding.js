/**
 * Onboarding — create or import a wallet
 *
 * Flow:
 *   Landing → "Create new wallet" → Show seed phrase → Confirm → Dashboard
 *           → "Import existing"  → Enter phrase      →          Dashboard
 */
import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, SafeAreaView,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { useWallet } from '../context/WalletContext'
import { C, font, shortAddr } from '../theme'

export default function Onboarding() {
  const { createWallet, importWallet } = useWallet()

  const [mode,        setMode]        = useState('landing')   // landing | create_show | import
  const [seedPhrase,  setSeedPhrase]  = useState('')
  const [confirmed,   setConfirmed]   = useState(false)
  const [importInput, setImportInput] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  async function handleCreate() {
    setLoading(true); setError(null)
    try {
      await createWallet((phrase) => {
        setSeedPhrase(phrase)
        setMode('create_show')
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleImport() {
    setLoading(true); setError(null)
    try {
      await importWallet(importInput)
      // WalletContext sets isSetup → App.js navigates to Dashboard
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopyPhrase() {
    await Clipboard.setStringAsync(seedPhrase)
    Alert.alert('Copied', 'Seed phrase copied to clipboard. Store it somewhere safe — this is the only way to recover your wallet.')
  }

  if (mode === 'landing') {
    return (
      <SafeAreaView style={S.safe}>
        <ScrollView contentContainerStyle={S.center}>
          <Text style={S.logo}>SPICE</Text>
          <Text style={S.tagline}>Colony Wallet</Text>
          <Text style={S.sub}>Base Sepolia · {'\n'}Earth colony economy</Text>

          <View style={S.gap} />

          <TouchableOpacity style={S.btnGold} onPress={handleCreate} disabled={loading}>
            {loading ? <ActivityIndicator color={C.bg} /> : <Text style={S.btnGoldText}>Create new wallet</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={S.btnOutline} onPress={() => setMode('import')}>
            <Text style={S.btnOutlineText}>Import seed phrase</Text>
          </TouchableOpacity>

          {error && <Text style={S.error}>{error}</Text>}
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (mode === 'create_show') {
    const words = seedPhrase.split(' ')
    return (
      <SafeAreaView style={S.safe}>
        <ScrollView contentContainerStyle={S.scroll}>
          <Text style={S.heading}>Your seed phrase</Text>
          <Text style={S.body}>
            Write down these 12 words in order. This is the only way to recover your wallet. Never share it with anyone.
          </Text>

          <View style={S.phraseGrid}>
            {words.map((word, i) => (
              <View key={i} style={S.wordCell}>
                <Text style={S.wordNum}>{i + 1}</Text>
                <Text style={S.word}>{word}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={S.copyBtn} onPress={handleCopyPhrase}>
            <Text style={S.copyBtnText}>Copy to clipboard</Text>
          </TouchableOpacity>

          <View style={S.confirmRow}>
            <TouchableOpacity onPress={() => setConfirmed(v => !v)} style={S.checkbox}>
              <Text style={{ color: confirmed ? C.gold : C.faint, fontSize: 14 }}>
                {confirmed ? '✓' : '○'}
              </Text>
            </TouchableOpacity>
            <Text style={S.confirmText}>I have written down my seed phrase</Text>
          </View>

          <TouchableOpacity
            style={[S.btnGold, !confirmed && S.btnDisabled]}
            disabled={!confirmed || loading}
            onPress={() => {
              // Wallet already created in handleCreate — just proceed
              // WalletContext.isSetup is already true
            }}
          >
            {loading
              ? <ActivityIndicator color={C.bg} />
              : <Text style={S.btnGoldText}>Continue to dashboard →</Text>
            }
          </TouchableOpacity>

          <Text style={S.warn}>⚠ If you lose this phrase and lose access to this device, your wallet cannot be recovered.</Text>
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (mode === 'import') {
    return (
      <SafeAreaView style={S.safe}>
        <ScrollView contentContainerStyle={S.scroll}>
          <TouchableOpacity onPress={() => setMode('landing')} style={S.back}>
            <Text style={S.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={S.heading}>Import wallet</Text>
          <Text style={S.body}>Enter your 12 or 24-word BIP-39 seed phrase, separated by spaces.</Text>

          <TextInput
            style={S.phraseInput}
            multiline
            numberOfLines={4}
            placeholder="word1 word2 word3 …"
            placeholderTextColor={C.faint}
            value={importInput}
            onChangeText={setImportInput}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={false}
          />

          {error && <Text style={S.error}>{error}</Text>}

          <TouchableOpacity
            style={[S.btnGold, (!importInput.trim() || loading) && S.btnDisabled]}
            disabled={!importInput.trim() || loading}
            onPress={handleImport}
          >
            {loading
              ? <ActivityIndicator color={C.bg} />
              : <Text style={S.btnGoldText}>Import wallet</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return null
}

const S = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.bg },
  center:        { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  scroll:        { padding: 24, paddingBottom: 48 },
  logo:          { fontSize: 32, fontWeight: '700', color: C.gold, fontFamily: font, letterSpacing: 4 },
  tagline:       { fontSize: 14, color: C.sub, fontFamily: font, marginTop: 4 },
  sub:           { fontSize: 11, color: C.faint, fontFamily: font, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  gap:           { height: 40 },
  heading:       { fontSize: 18, fontWeight: '600', color: C.text, fontFamily: font, marginBottom: 12 },
  body:          { fontSize: 12, color: C.sub, fontFamily: font, lineHeight: 18, marginBottom: 20 },
  warn:          { fontSize: 10, color: C.faint, fontFamily: font, lineHeight: 15, marginTop: 16, textAlign: 'center' },

  btnGold:       { width: '100%', backgroundColor: C.gold, borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 12 },
  btnGoldText:   { color: C.bg, fontSize: 13, fontWeight: '600', fontFamily: font },
  btnOutline:    { width: '100%', borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 12 },
  btnOutlineText:{ color: C.sub, fontSize: 13, fontFamily: font },
  btnDisabled:   { opacity: 0.4 },

  phraseGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  wordCell:      { width: '28%', backgroundColor: C.card, borderRadius: 6, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  wordNum:       { fontSize: 9, color: C.faint, fontFamily: font, width: 14 },
  word:          { fontSize: 12, color: C.text, fontFamily: font, fontWeight: '500' },

  copyBtn:       { borderWidth: 1, borderColor: C.border, borderRadius: 6, padding: 10, alignItems: 'center', marginBottom: 16 },
  copyBtnText:   { fontSize: 11, color: C.sub, fontFamily: font },

  confirmRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  checkbox:      { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  confirmText:   { fontSize: 12, color: C.sub, fontFamily: font, flex: 1 },

  phraseInput:   { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12, fontSize: 13, fontFamily: font, color: C.text, minHeight: 90, textAlignVertical: 'top', marginBottom: 16 },

  back:          { marginBottom: 20 },
  backText:      { fontSize: 12, color: C.sub, fontFamily: font },

  error:         { fontSize: 11, color: C.red, fontFamily: font, marginBottom: 12 },
})
