/**
 * Dashboard — main citizen screen
 *
 * Shows: S balance, V balance, UBI claim button, Save V button,
 * recent transaction history. Send navigates to Send screen.
 */
import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  StyleSheet, ActivityIndicator, SafeAreaView, Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useWallet } from '../context/WalletContext'
import { fetchTxHistory, txClaimUbi, txSaveToV, COLONY } from '../utils/contracts'
import { isNfcSupported, scanPayTag } from '../utils/nfc'
import { C, font, shortAddr, card, label, value } from '../theme'

const EVENT_LABELS = {
  sent:     { color: C.red,    sign: '−', label: 'Sent' },
  received: { color: C.green,  sign: '+', label: 'Received' },
  ubi:      { color: C.gold,   sign: '+', label: 'UBI' },
  saved:    { color: C.purple, sign: '→', label: 'Saved to V' },
  redeemed: { color: C.blue,   sign: '←', label: 'Redeemed' },
}

export default function Dashboard() {
  const navigation = useNavigation()
  const { address, colonyState, stateLoading, refreshState, authenticate, wallet } = useWallet()

  const [history,      setHistory]      = useState([])
  const [histLoading,  setHistLoading]  = useState(false)
  const [refreshing,   setRefreshing]   = useState(false)
  const [actionLoading,setActionLoading]= useState(null)  // 'ubi' | 'save' | 'nfc' | null
  const [nfcAvail,     setNfcAvail]     = useState(null)  // null=checking, true/false

  useEffect(() => {
    isNfcSupported().then(setNfcAvail).catch(() => setNfcAvail(false))
  }, [])

  const loadHistory = useCallback(async () => {
    if (!address) return
    setHistLoading(true)
    try {
      const evts = await fetchTxHistory(address)
      setHistory(evts)
    } catch {}
    setHistLoading(false)
  }, [address])

  useEffect(() => { loadHistory() }, [loadHistory])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refreshState(), loadHistory()])
    setRefreshing(false)
  }, [refreshState, loadHistory])

  async function handleNfcPay() {
    setActionLoading('nfc')
    try {
      const params = await scanPayTag()
      navigation.navigate('Pay', params)
    } catch (e) {
      if (e.message && !e.message.includes('cancelled')) {
        Alert.alert('NFC error', e.message)
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function requireWallet() {
    if (wallet) return wallet
    try {
      return await authenticate()
    } catch (e) {
      Alert.alert('Authentication failed', e.message)
      return null
    }
  }

  async function handleClaimUbi() {
    const w = await requireWallet()
    if (!w) return
    setActionLoading('ubi')
    try {
      await txClaimUbi(w)
      await onRefresh()
      Alert.alert('UBI claimed', 'Your monthly UBI has been added to your S balance.')
    } catch (e) {
      Alert.alert('Claim failed', e.message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleSaveToV() {
    if (!colonyState?.sBalance) return
    Alert.prompt(
      'Save to V',
      `Convert S → V (permanent savings). Max 200 S this epoch.\nBalance: ${colonyState.sBalance} S`,
      async (input) => {
        const amount = parseInt(input)
        if (!amount || amount <= 0) return
        const w = await requireWallet()
        if (!w) return
        setActionLoading('save')
        try {
          await txSaveToV(w, amount)
          await onRefresh()
          Alert.alert('Saved', `${amount} S converted to V.`)
        } catch (e) {
          Alert.alert('Save failed', e.message)
        } finally {
          setActionLoading(null)
        }
      },
      'plain-text',
    )
  }

  const s = colonyState

  return (
    <SafeAreaView style={S.safe}>
      <ScrollView
        style={S.scroll}
        contentContainerStyle={S.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />}
      >
        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.colonyName}>{COLONY.name.toUpperCase()}</Text>
            <Text style={S.address}>{shortAddr(address)}</Text>
          </View>
          <View style={[S.badge, { borderColor: C.gold }]}>
            <Text style={[S.badgeText, { color: C.gold }]}>EARTH</Text>
          </View>
        </View>

        {stateLoading && !s ? (
          <ActivityIndicator color={C.gold} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Citizen status */}
            {s && (
              <View style={[S.citizenBadge, { borderColor: s.isCitizen ? C.green : C.faint }]}>
                <Text style={[S.citizenText, { color: s.isCitizen ? C.green : C.faint }]}>
                  {s.isCitizen ? `CITIZEN · ${s.citizenName}` : 'NOT A CITIZEN OF THIS COLONY'}
                </Text>
              </View>
            )}

            {/* Balance cards */}
            <View style={S.balanceRow}>
              <View style={[card, S.balCard]}>
                <Text style={label}>S BALANCE</Text>
                <Text style={value}>{s?.sBalance ?? '—'}</Text>
                <Text style={S.tokenSub}>spending · monthly</Text>
              </View>
              <View style={[card, S.balCard]}>
                <Text style={label}>V BALANCE</Text>
                <Text style={[value, { color: C.purple }]}>{s?.vBalance ?? '—'}</Text>
                <Text style={S.tokenSub}>savings · permanent</Text>
              </View>
            </View>

            {/* Action buttons — row 1 */}
            <View style={S.actions}>
              <TouchableOpacity
                style={[S.actionBtn, S.actionBtnGold]}
                onPress={() => navigation.navigate('Send')}
              >
                <Text style={S.actionBtnTextGold}>Send S →</Text>
              </TouchableOpacity>

              {nfcAvail && (
                <TouchableOpacity
                  style={[S.actionBtn, S.actionBtnNfc]}
                  onPress={handleNfcPay}
                  disabled={actionLoading === 'nfc'}
                >
                  {actionLoading === 'nfc'
                    ? <ActivityIndicator size="small" color={C.bg} />
                    : <Text style={S.actionBtnTextNfc}>⬡ Tap to Pay</Text>
                  }
                </TouchableOpacity>
              )}
            </View>

            {/* Action buttons — row 2 */}
            <View style={S.actions}>
              <TouchableOpacity
                style={[S.actionBtn, S.actionBtnOutline]}
                onPress={handleClaimUbi}
                disabled={actionLoading === 'ubi'}
              >
                {actionLoading === 'ubi'
                  ? <ActivityIndicator size="small" color={C.gold} />
                  : <Text style={S.actionBtnTextOutline}>Claim UBI</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={[S.actionBtn, S.actionBtnOutline]}
                onPress={handleSaveToV}
                disabled={actionLoading === 'save'}
              >
                {actionLoading === 'save'
                  ? <ActivityIndicator size="small" color={C.purple} />
                  : <Text style={S.actionBtnTextOutline}>Save → V</Text>
                }
              </TouchableOpacity>
            </View>

            {/* Tx history */}
            <View style={card}>
              <Text style={[label, { marginBottom: 12 }]}>TRANSACTION HISTORY</Text>
              {histLoading && history.length === 0 ? (
                <ActivityIndicator size="small" color={C.faint} />
              ) : history.length === 0 ? (
                <Text style={S.empty}>No transactions yet.</Text>
              ) : (
                history.map((evt, i) => {
                  const meta = EVENT_LABELS[evt.type] || {}
                  return (
                    <View key={i} style={[S.txRow, i < history.length - 1 && S.txBorder]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[S.txLabel, { color: meta.color }]}>{meta.label}</Text>
                        {evt.note ? <Text style={S.txNote} numberOfLines={1}>{evt.note}</Text> : null}
                        {evt.counterparty ? (
                          <Text style={S.txAddr}>{shortAddr(evt.counterparty)}</Text>
                        ) : null}
                      </View>
                      <Text style={[S.txAmount, { color: meta.color }]}>
                        {meta.sign}{evt.amount} S
                      </Text>
                    </View>
                  )
                })
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const S = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.bg },
  scroll:         { flex: 1 },
  content:        { padding: 16, paddingBottom: 48 },

  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  colonyName:     { fontSize: 11, color: C.faint, fontFamily: font, letterSpacing: 1.5 },
  address:        { fontSize: 13, color: C.text, fontFamily: font, marginTop: 2 },
  badge:          { borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:      { fontSize: 9, fontWeight: '600', fontFamily: font, letterSpacing: 1 },

  citizenBadge:   { borderWidth: 1, borderRadius: 6, padding: 8, marginBottom: 12, alignItems: 'center' },
  citizenText:    { fontSize: 10, fontFamily: font, letterSpacing: 0.8 },

  balanceRow:     { flexDirection: 'row', gap: 10, marginBottom: 0 },
  balCard:        { flex: 1 },
  tokenSub:       { fontSize: 9, color: C.faint, fontFamily: font, marginTop: 2 },

  actions:        { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionBtn:      { flex: 1, borderRadius: 8, padding: 12, alignItems: 'center' },
  actionBtnGold:    { backgroundColor: C.gold },
  actionBtnNfc:     { backgroundColor: '#1a1a1a' },
  actionBtnOutline: { borderWidth: 1, borderColor: C.border },
  actionBtnTextGold:    { color: C.bg,   fontSize: 12, fontWeight: '600', fontFamily: font },
  actionBtnTextNfc:     { color: C.bg,   fontSize: 12, fontWeight: '600', fontFamily: font },
  actionBtnTextOutline: { color: C.sub,  fontSize: 11, fontFamily: font },

  empty:          { fontSize: 11, color: C.faint, fontFamily: font },
  txRow:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  txBorder:       { borderBottomWidth: 1, borderBottomColor: C.border },
  txLabel:        { fontSize: 11, fontWeight: '600', fontFamily: font, marginBottom: 2 },
  txNote:         { fontSize: 10, color: C.faint, fontFamily: font },
  txAddr:         { fontSize: 9, color: C.faint, fontFamily: font, marginTop: 1 },
  txAmount:       { fontSize: 13, fontWeight: '600', fontFamily: font },
})
