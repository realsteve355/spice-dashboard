/**
 * Receive — merchant payment flow.
 *
 * Three-step:
 *   1. Enter amount + optional note
 *   2. Show QR (always) + offer "Write to NFC sticker" on iPhone
 *      — poll chain for matching Sent event in the background
 *   3. PAID ✓ — show sender, amount, tx hash, then return to step 1
 *
 * NFC tag write is iPhone-only — iPad has no app-accessible NFC writer,
 * so the button is hidden when isNfcSupported() returns false.
 */
import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, SafeAreaView, Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import QRCode from 'react-native-qrcode-svg'
import { useWallet } from '../context/WalletContext'
import { buildPayUrl } from '../utils/payurl'
import { isNfcSupported, writeNdefPayUrl } from '../utils/nfc'
import { findPayment, currentBlock, COLONY } from '../utils/contracts'
import { C, font, shortAddr, card, label } from '../theme'

const POLL_MS = 3000

export default function Receive() {
  const navigation = useNavigation()
  const { address, colonyState, actingAs, refreshState } = useWallet()
  // Recipient is whoever the user is currently acting as — citizen address
  // for personal payments, or the company contract address when acting as company.
  const receiveTo   = actingAs?.addr || address
  const receiveName = actingAs?.kind === 'company'
    ? actingAs.name
    : (colonyState?.citizenName || '')

  // step: 'enter' | 'wait' | 'paid'
  const [step,    setStep]    = useState('enter')
  const [amount,  setAmount]  = useState('')
  const [note,    setNote]    = useState('')
  const [payment, setPayment] = useState(null)        // { from, amount, note, txHash } when paid
  const [nfcAvail, setNfcAvail] = useState(false)
  const [writingTag, setWritingTag] = useState(false)

  const pollTimer = useRef(null)
  const fromBlock = useRef(null)

  useEffect(() => {
    isNfcSupported().then(setNfcAvail).catch(() => setNfcAvail(false))
    return () => stopPolling()
  }, [])

  const url = (step === 'wait' && receiveTo && amount)
    ? buildPayUrl({ to: receiveTo, amount, note: note.trim(), merchantName: receiveName })
    : ''

  function stopPolling() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current)
      pollTimer.current = null
    }
  }

  async function startWaiting() {
    const amt = parseInt(amount, 10)
    if (!amt || amt <= 0) {
      Alert.alert('Missing amount', 'Please enter an amount in S.')
      return
    }
    if (!receiveTo) {
      Alert.alert('No wallet', 'Set up a wallet first.')
      return
    }
    try {
      // Look back a couple of blocks in case a fast customer paid in the same
      // ~6s window between us calling currentBlock() and the poll starting.
      const head = await currentBlock()
      fromBlock.current = Math.max(0, head - 2)
    } catch (e) {
      Alert.alert('Network', `Could not reach chain: ${e.message}`)
      return
    }
    setStep('wait')

    pollTimer.current = setInterval(async () => {
      try {
        const head = await currentBlock()
        const evt = await findPayment({
          to:        receiveTo,
          amount:    amt,
          fromBlock: fromBlock.current,
          toBlock:   head,
        })
        if (evt) {
          stopPolling()
          setPayment(evt)
          setStep('paid')
          // Refresh balance so Dashboard shows the new total when user goes back
          refreshState().catch(() => {})
        } else {
          fromBlock.current = head + 1
        }
      } catch {
        // Network blip — keep polling
      }
    }, POLL_MS)
  }

  function cancelWaiting() {
    stopPolling()
    setStep('enter')
    setPayment(null)
  }

  function newSale() {
    setStep('enter')
    setAmount('')
    setNote('')
    setPayment(null)
    fromBlock.current = null
  }

  async function handleWriteTag() {
    if (!url) return
    setWritingTag(true)
    try {
      await writeNdefPayUrl(url)
      Alert.alert('Tag written', 'The till sticker now holds this payment URL. Customer can tap it.')
    } catch (e) {
      // User-cancelled NFC sheet is not an error worth alerting
      if (!/cancel/i.test(e.message || '')) {
        Alert.alert('Write failed', e.message || 'Could not write tag.')
      }
    } finally {
      setWritingTag(false)
    }
  }

  // ── Step 1: Enter amount ──────────────────────────────────────────────────
  if (step === 'enter') {
    return (
      <SafeAreaView style={S.safe}>
        <ScrollView contentContainerStyle={S.content} keyboardShouldPersistTaps="handled">
          <View style={S.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={S.back}>← Dashboard</Text>
            </TouchableOpacity>
            <Text style={S.balance}>{shortAddr(receiveTo)}</Text>
          </View>

          <Text style={S.heading}>New sale</Text>
          <Text style={S.subheading}>
            {receiveName ? `${receiveName.toUpperCase()} · ` : ''}{COLONY.name}
          </Text>

          <View style={card}>
            <Text style={[label, { marginBottom: 8 }]}>AMOUNT (S)</Text>
            <TextInput
              style={S.amountInput}
              placeholder="0"
              placeholderTextColor={C.faint}
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              autoFocus
            />
          </View>

          <View style={card}>
            <Text style={[label, { marginBottom: 8 }]}>NOTE (optional)</Text>
            <TextInput
              style={S.noteInput}
              placeholder="What is this sale for?"
              placeholderTextColor={C.faint}
              value={note}
              onChangeText={setNote}
              maxLength={60}
            />
          </View>

          <TouchableOpacity
            style={[S.btnGold, !amount && S.btnDisabled]}
            onPress={startWaiting}
            disabled={!amount}
          >
            <Text style={S.btnGoldText}>Show payment QR →</Text>
          </TouchableOpacity>

          <Text style={S.hint}>
            Customer scans the QR with their SPICE app{nfcAvail ? ' or taps the till NFC sticker' : ''}.
          </Text>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ── Step 2: Show QR + poll ────────────────────────────────────────────────
  if (step === 'wait') {
    return (
      <SafeAreaView style={S.safe}>
        <ScrollView contentContainerStyle={S.content}>
          <View style={S.header}>
            <TouchableOpacity onPress={cancelWaiting}>
              <Text style={S.back}>← Cancel sale</Text>
            </TouchableOpacity>
          </View>

          <Text style={S.heading}>Awaiting payment</Text>
          <Text style={S.bigAmount}>{parseInt(amount, 10)} S</Text>
          {note ? <Text style={S.bigNote}>{note}</Text> : null}

          <View style={S.qrWrap}>
            <View style={S.qrFrame}>
              {url ? (
                <QRCode
                  value={url}
                  size={260}
                  backgroundColor="#ffffff"
                  color="#000000"
                />
              ) : null}
            </View>
            <Text style={S.qrCaption}>Scan with SPICE app</Text>
          </View>

          {nfcAvail && (
            <TouchableOpacity
              style={[S.btnOutline, writingTag && S.btnDisabled]}
              onPress={handleWriteTag}
              disabled={writingTag}
            >
              {writingTag
                ? <ActivityIndicator color={C.gold} />
                : <Text style={S.btnOutlineText}>⬡ Write to till sticker</Text>
              }
            </TouchableOpacity>
          )}

          <View style={S.waitingRow}>
            <ActivityIndicator size="small" color={C.gold} />
            <Text style={S.waitingText}>Waiting for chain confirmation…</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ── Step 3: Paid ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={S.safe}>
      <View style={S.paidWrap}>
        <View style={S.paidIconWrap}>
          <Text style={S.paidIcon}>✓</Text>
        </View>
        <Text style={S.paidTitle}>Paid</Text>
        <Text style={S.paidAmount}>{payment?.amount} S</Text>
        <Text style={S.paidFrom}>from {shortAddr(payment?.from)}</Text>
        {payment?.note ? <Text style={S.paidNote}>"{payment.note}"</Text> : null}
        {payment?.txHash ? (
          <Text style={S.txHash} numberOfLines={1}>
            tx {payment.txHash.slice(0, 10)}…{payment.txHash.slice(-6)}
          </Text>
        ) : null}

        <TouchableOpacity style={S.btnGold} onPress={newSale}>
          <Text style={S.btnGoldText}>New sale</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={{ marginTop: 12 }}>
          <Text style={S.back}>Back to dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const S = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  content:      { padding: 16, paddingBottom: 48 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  back:         { fontSize: 13, color: C.sub, fontFamily: font },
  balance:      { fontSize: 11, color: C.faint, fontFamily: font },

  heading:      { fontSize: 18, fontWeight: '600', color: C.text, fontFamily: font, marginBottom: 4 },
  subheading:   { fontSize: 11, color: C.faint, fontFamily: font, marginBottom: 16, letterSpacing: 1 },

  amountInput:  { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 6, padding: 16, fontSize: 28, fontWeight: '600', fontFamily: font, color: C.gold, textAlign: 'center' },
  noteInput:    { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 6, padding: 10, fontSize: 13, fontFamily: font, color: C.text },

  btnGold:      { backgroundColor: C.gold, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 4 },
  btnGoldText:  { color: '#0a0a0a', fontSize: 13, fontWeight: '600', fontFamily: font },
  btnOutline:   { borderWidth: 1, borderColor: C.gold, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  btnOutlineText: { color: C.gold, fontSize: 12, fontFamily: font },
  btnDisabled:  { opacity: 0.4 },

  hint:         { fontSize: 11, color: C.faint, fontFamily: font, textAlign: 'center', marginTop: 16, lineHeight: 18 },

  // Wait screen
  bigAmount:    { fontSize: 56, fontWeight: '700', color: C.gold, fontFamily: font, textAlign: 'center', marginVertical: 12 },
  bigNote:      { fontSize: 14, color: C.sub, fontFamily: font, textAlign: 'center', marginBottom: 16 },
  qrWrap:       { alignItems: 'center', marginVertical: 20 },
  qrFrame:      { backgroundColor: '#ffffff', padding: 16, borderRadius: 8 },
  qrCaption:    { fontSize: 11, color: C.faint, fontFamily: font, marginTop: 10, letterSpacing: 1 },
  waitingRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 },
  waitingText:  { fontSize: 12, color: C.sub, fontFamily: font },

  // Paid screen
  paidWrap:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  paidIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  paidIcon:     { fontSize: 40, color: '#0a0a0a', fontWeight: '700' },
  paidTitle:    { fontSize: 22, fontWeight: '600', color: C.text, fontFamily: font, marginBottom: 8 },
  paidAmount:   { fontSize: 48, fontWeight: '700', color: C.gold, fontFamily: font },
  paidFrom:     { fontSize: 13, color: C.sub, fontFamily: font, marginTop: 6, marginBottom: 4 },
  paidNote:     { fontSize: 12, color: C.faint, fontFamily: font, fontStyle: 'italic', marginTop: 4, marginBottom: 8 },
  txHash:       { fontSize: 10, color: C.faint, fontFamily: font, marginBottom: 28 },
})
