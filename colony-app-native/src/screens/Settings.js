/**
 * Settings — wallet identity + seed phrase + reset
 */
import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Alert, ActivityIndicator, SafeAreaView,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { useWallet } from '../context/WalletContext'
import { loadMnemonic } from '../utils/wallet'
import { COLONY } from '../utils/contracts'
import { C, font, shortAddr, card, label } from '../theme'

export default function Settings() {
  const { address, colonyState, reset, merchantMode, setMerchantMode } = useWallet()
  const [phrase,   setPhrase]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [revealed, setRevealed] = useState(false)

  async function handleRevealPhrase() {
    setLoading(true)
    try {
      const p = await loadMnemonic()
      setPhrase(p)
      setRevealed(true)
    } catch (e) {
      Alert.alert('Authentication failed', e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopyAddress() {
    if (!address) return
    await Clipboard.setStringAsync(address)
    Alert.alert('Copied', 'Wallet address copied to clipboard.')
  }

  async function handleCopyPhrase() {
    if (!phrase) return
    await Clipboard.setStringAsync(phrase)
    Alert.alert('Copied', 'Seed phrase copied. Store it securely and delete from clipboard.')
  }

  function handleReset() {
    Alert.alert(
      'Reset wallet',
      'This will permanently delete your wallet from this device. You can only recover it with your seed phrase. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete wallet', style: 'destructive',
          onPress: () => Alert.alert(
            'Final confirmation',
            'I understand my wallet will be deleted and I have my seed phrase backed up.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: reset },
            ]
          ),
        },
      ]
    )
  }

  const words = phrase ? phrase.split(' ') : []

  return (
    <SafeAreaView style={S.safe}>
      <ScrollView contentContainerStyle={S.content}>
        <Text style={S.heading}>Wallet</Text>

        {/* Address */}
        <View style={card}>
          <Text style={[label, { marginBottom: 8 }]}>WALLET ADDRESS</Text>
          <Text style={S.addressFull} selectable>{address || '—'}</Text>
          <TouchableOpacity style={S.copyBtn} onPress={handleCopyAddress}>
            <Text style={S.copyBtnText}>Copy address</Text>
          </TouchableOpacity>
        </View>

        {/* Colony */}
        <View style={card}>
          <Text style={[label, { marginBottom: 8 }]}>COLONY</Text>
          <Text style={S.colonyName}>{COLONY.name}</Text>
          <Text style={S.colonyAddr}>{shortAddr(COLONY.colony)}</Text>
          {colonyState?.isCitizen && (
            <View style={[S.citizenBadge, { borderColor: C.green }]}>
              <Text style={[S.citizenText, { color: C.green }]}>
                CITIZEN · {colonyState.citizenName}
              </Text>
            </View>
          )}
        </View>

        {/* Seed phrase */}
        <View style={card}>
          <Text style={[label, { marginBottom: 8 }]}>SEED PHRASE</Text>
          <Text style={S.seedWarning}>
            Your seed phrase is the master key to your wallet. Never share it. Never photograph it. Store it offline.
          </Text>

          {!revealed ? (
            <TouchableOpacity style={S.revealBtn} onPress={handleRevealPhrase} disabled={loading}>
              {loading
                ? <ActivityIndicator size="small" color={C.gold} />
                : <Text style={S.revealBtnText}>Reveal with Face ID</Text>
              }
            </TouchableOpacity>
          ) : (
            <>
              <View style={S.phraseGrid}>
                {words.map((word, i) => (
                  <View key={i} style={S.wordCell}>
                    <Text style={S.wordNum}>{i + 1}</Text>
                    <Text style={S.word}>{word}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={S.copyBtn} onPress={handleCopyPhrase}>
                <Text style={S.copyBtnText}>Copy seed phrase</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setRevealed(false); setPhrase(null) }}>
                <Text style={S.hideText}>Hide</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Merchant mode */}
        <View style={card}>
          <Text style={[label, { marginBottom: 8 }]}>MERCHANT MODE</Text>
          <Text style={S.merchantBlurb}>
            Adds a "Receive →" button on the dashboard to take payments from
            customers via QR code (any device) or by writing a SPICE payment
            URL to a till NFC sticker (iPhone only).
          </Text>
          <TouchableOpacity
            style={[S.toggleBtn, merchantMode && S.toggleBtnOn]}
            onPress={() => setMerchantMode(!merchantMode)}
          >
            <Text style={[S.toggleBtnText, merchantMode && S.toggleBtnTextOn]}>
              {merchantMode ? '✓ Merchant mode ON' : 'Enable merchant mode'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Network */}
        <View style={card}>
          <Text style={[label, { marginBottom: 8 }]}>NETWORK</Text>
          <Text style={S.netInfo}>Base Sepolia testnet · Chain ID 84532</Text>
          <Text style={S.netInfo}>RPC: sepolia.base.org</Text>
        </View>

        {/* Reset */}
        <TouchableOpacity style={S.resetBtn} onPress={handleReset}>
          <Text style={S.resetText}>Delete wallet from this device</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const S = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  content:      { padding: 16, paddingBottom: 48 },
  heading:      { fontSize: 18, fontWeight: '600', color: C.text, fontFamily: font, marginBottom: 16 },

  addressFull:  { fontSize: 11, color: C.text, fontFamily: font, lineHeight: 18, marginBottom: 10 },

  copyBtn:      { borderWidth: 1, borderColor: C.border, borderRadius: 6, padding: 8, alignItems: 'center', marginTop: 4 },
  copyBtnText:  { fontSize: 11, color: C.sub, fontFamily: font },

  colonyName:   { fontSize: 13, color: C.text, fontFamily: font, fontWeight: '500' },
  colonyAddr:   { fontSize: 10, color: C.faint, fontFamily: font, marginTop: 2, marginBottom: 8 },
  citizenBadge: { borderWidth: 1, borderRadius: 4, padding: 6, alignItems: 'center', marginTop: 6 },
  citizenText:  { fontSize: 9, fontFamily: font, letterSpacing: 0.8 },

  seedWarning:  { fontSize: 10, color: C.faint, fontFamily: font, lineHeight: 15, marginBottom: 12 },
  revealBtn:    { borderWidth: 1, borderColor: C.gold, borderRadius: 6, padding: 10, alignItems: 'center' },
  revealBtnText:{ fontSize: 12, color: C.gold, fontFamily: font },

  phraseGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  wordCell:     { width: '28%', backgroundColor: C.card, borderRadius: 4, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  wordNum:      { fontSize: 8, color: C.faint, fontFamily: font, width: 12 },
  word:         { fontSize: 11, color: C.text, fontFamily: font, fontWeight: '500' },

  hideText:     { fontSize: 11, color: C.faint, fontFamily: font, textAlign: 'center', marginTop: 8 },

  netInfo:      { fontSize: 11, color: C.faint, fontFamily: font, lineHeight: 18 },

  resetBtn:     { borderWidth: 1, borderColor: C.red, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  resetText:    { fontSize: 13, color: C.red, fontFamily: font },

  merchantBlurb:{ fontSize: 11, color: C.sub, fontFamily: font, lineHeight: 17, marginBottom: 10 },
  toggleBtn:    { borderWidth: 1, borderColor: C.border, borderRadius: 6, padding: 10, alignItems: 'center' },
  toggleBtnOn:  { borderColor: C.gold, backgroundColor: 'rgba(217,165,61,0.10)' },
  toggleBtnText:{ fontSize: 12, color: C.sub, fontFamily: font },
  toggleBtnTextOn: { color: C.gold },
})
