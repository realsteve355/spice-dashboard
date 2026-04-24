/**
 * Pay — NFC tap-to-pay confirmation screen.
 *
 * Receives params via:
 *   - Navigation (from in-app NFC scan in Dashboard)
 *   - Deep link  (OS opens app via spice://pay?to=...&amount=...&note=...)
 *
 * Shows payment summary → FaceID confirm → txSend → success.
 */
import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Alert, ActivityIndicator, SafeAreaView,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useWallet } from '../context/WalletContext'
import { txSend } from '../utils/contracts'
import { C, font, shortAddr, card, label } from '../theme'

export default function Pay() {
  const navigation = useNavigation()
  const route = useRoute()
  const { colonyState, authenticate, wallet, refreshState } = useWallet()

  const { to = '', amount = '', note = '', merchantName = '' } = route.params || {}

  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)
  const [txHash,   setTxHash]   = useState(null)

  const parsedAmount = parseInt(amount, 10) || 0
  const displayName  = merchantName || shortAddr(to)
  const isValid      = /^0x[0-9a-fA-F]{40}$/.test(to) && parsedAmount > 0

  async function handlePay() {
    if (!isValid) {
      Alert.alert('Invalid payment', 'Missing or invalid recipient / amount.')
      return
    }
    if (colonyState && parsedAmount > colonyState.sBalance) {
      Alert.alert('Insufficient balance', `You only have ${colonyState.sBalance} S.`)
      return
    }

    setLoading(true)
    try {
      let w = wallet
      if (!w) {
        w = await authenticate()
      }
      const receipt = await txSend(w, to, parsedAmount, note || '')
      setTxHash(receipt.hash)
      await refreshState()
      setDone(true)
    } catch (e) {
      Alert.alert('Payment failed', e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ───────────────────────────────────────────────────────────
  if (done) {
    return (
      <SafeAreaView style={S.safe}>
        <View style={S.successWrap}>
          <View style={S.successIconWrap}>
            <Text style={S.successIcon}>✓</Text>
          </View>
          <Text style={S.successTitle}>Payment sent</Text>
          <Text style={S.successAmount}>{parsedAmount} S</Text>
          <Text style={S.successTo}>to {displayName}</Text>
          {txHash ? (
            <Text style={S.txHash} numberOfLines={1}>
              tx {txHash.slice(0, 10)}…{txHash.slice(-6)}
            </Text>
          ) : null}
          <TouchableOpacity
            style={S.doneBtn}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={S.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ── Confirm screen ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={S.safe}>
      <ScrollView contentContainerStyle={S.content}>

        {/* Back */}
        <TouchableOpacity style={S.backRow} onPress={() => navigation.goBack()}>
          <Text style={S.backText}>← Cancel</Text>
        </TouchableOpacity>

        <Text style={S.heading}>Confirm Payment</Text>

        {/* Merchant */}
        <View style={card}>
          <Text style={[label, { marginBottom: 6 }]}>MERCHANT</Text>
          <Text style={S.merchantName}>{displayName}</Text>
          {merchantName ? (
            <Text style={S.toAddr}>{shortAddr(to)}</Text>
          ) : null}
        </View>

        {/* Amount */}
        <View style={[card, S.amountCard]}>
          <Text style={S.amountValue}>{parsedAmount}</Text>
          <Text style={S.amountToken}> S</Text>
        </View>

        {/* Note */}
        {note ? (
          <View style={card}>
            <Text style={[label, { marginBottom: 6 }]}>NOTE</Text>
            <Text style={S.noteText}>{note}</Text>
          </View>
        ) : null}

        {/* Balance hint */}
        {colonyState ? (
          <Text style={S.balHint}>
            Balance: {colonyState.sBalance} S
            {parsedAmount > colonyState.sBalance ? '  ⚠ insufficient' : ''}
          </Text>
        ) : null}

        {/* Pay button */}
        <TouchableOpacity
          style={[
            S.payBtn,
            (!isValid || loading || (colonyState && parsedAmount > colonyState.sBalance))
              && S.payBtnDisabled,
          ]}
          onPress={handlePay}
          disabled={loading || !isValid || (colonyState && parsedAmount > colonyState.sBalance)}
        >
          {loading
            ? <ActivityIndicator color={C.bg} />
            : <Text style={S.payBtnText}>Confirm with Face ID</Text>
          }
        </TouchableOpacity>

        {!isValid && (
          <Text style={S.errorHint}>
            {!to ? 'No recipient address found in tag.' : 'No payment amount found in tag.'}
          </Text>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const S = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: C.bg },
  content:         { padding: 16, paddingBottom: 48 },

  backRow:         { marginBottom: 16 },
  backText:        { fontSize: 13, color: C.sub, fontFamily: font },

  heading:         { fontSize: 18, fontWeight: '600', color: C.text, fontFamily: font, marginBottom: 20 },

  merchantName:    { fontSize: 16, fontWeight: '600', color: C.text, fontFamily: font },
  toAddr:          { fontSize: 10, color: C.faint, fontFamily: font, marginTop: 3 },

  amountCard:      { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', paddingVertical: 24 },
  amountValue:     { fontSize: 48, fontWeight: '700', color: C.gold, fontFamily: font },
  amountToken:     { fontSize: 20, color: C.gold, fontFamily: font },

  noteText:        { fontSize: 13, color: C.sub, fontFamily: font },

  balHint:         { fontSize: 11, color: C.faint, fontFamily: font, textAlign: 'center', marginBottom: 12 },

  payBtn:          { backgroundColor: C.gold, borderRadius: 10, padding: 18, alignItems: 'center' },
  payBtnDisabled:  { opacity: 0.4 },
  payBtnText:      { color: C.bg, fontSize: 15, fontWeight: '600', fontFamily: font },

  errorHint:       { fontSize: 11, color: C.red, fontFamily: font, textAlign: 'center', marginTop: 10 },

  // Success
  successWrap:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successIcon:     { fontSize: 36, color: C.bg },
  successTitle:    { fontSize: 20, fontWeight: '600', color: C.text, fontFamily: font, marginBottom: 8 },
  successAmount:   { fontSize: 36, fontWeight: '700', color: C.gold, fontFamily: font },
  successTo:       { fontSize: 13, color: C.sub, fontFamily: font, marginTop: 6, marginBottom: 4 },
  txHash:          { fontSize: 10, color: C.faint, fontFamily: font, marginBottom: 24 },
  doneBtn:         { backgroundColor: C.gold, borderRadius: 10, paddingHorizontal: 40, paddingVertical: 14, marginTop: 8 },
  doneBtnText:     { color: C.bg, fontSize: 14, fontWeight: '600', fontFamily: font },
})
