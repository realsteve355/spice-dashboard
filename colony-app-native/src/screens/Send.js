/**
 * Send screen — send S-tokens to a citizen or address
 *
 * Flow:
 *   1. Enter recipient address (or pick from citizen list)
 *   2. Enter amount
 *   3. Enter optional note
 *   4. Tap Send → biometric auth → tx broadcast → success
 *
 * NFC tap-to-pay will pre-fill recipient + amount from URL params (Phase 2).
 */
import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, SafeAreaView, FlatList,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useWallet } from '../context/WalletContext'
import { txSend, fetchCitizens, COLONY } from '../utils/contracts'
import { C, font, shortAddr, card, label } from '../theme'

export default function Send() {
  const navigation = useNavigation()
  const route      = useRoute()
  const { address, colonyState, authenticate, wallet, refreshState } = useWallet()

  // Pre-fill from NFC/QR params if passed
  const [to,       setTo]       = useState(route.params?.to      || '')
  const [amount,   setAmount]   = useState(route.params?.amount  || '')
  const [note,     setNote]     = useState(route.params?.note    || '')
  const [loading,  setLoading]  = useState(false)
  const [citizens, setCitizens] = useState([])
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    fetchCitizens()
      .then(list => setCitizens(list.filter(c => c.address.toLowerCase() !== address?.toLowerCase())))
      .catch(() => {})
  }, [address])

  async function handleSend() {
    const amt = parseFloat(amount)
    if (!to || !amt || amt <= 0) {
      Alert.alert('Missing fields', 'Please enter a recipient and amount.')
      return
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(to)) {
      Alert.alert('Invalid address', 'Recipient must be a valid 0x Ethereum address.')
      return
    }
    if (colonyState && amt > colonyState.sBalance) {
      Alert.alert('Insufficient balance', `You only have ${colonyState.sBalance} S.`)
      return
    }

    // Trigger biometric auth if wallet not yet loaded
    let w = wallet
    if (!w) {
      try { w = await authenticate() }
      catch (e) { Alert.alert('Authentication failed', e.message); return }
    }

    setLoading(true)
    try {
      await txSend(w, to, amt, note.trim())
      await refreshState()
      Alert.alert('Sent', `${amt} S sent.`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ])
    } catch (e) {
      Alert.alert('Send failed', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={S.safe}>
      <ScrollView contentContainerStyle={S.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={S.back}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={S.balance}>
            {colonyState ? `${colonyState.sBalance} S available` : ''}
          </Text>
        </View>

        <Text style={S.heading}>Send S-tokens</Text>

        {/* Recipient */}
        <View style={card}>
          <Text style={[label, { marginBottom: 8 }]}>RECIPIENT</Text>

          <View style={S.addrRow}>
            <TextInput
              style={[S.input, { flex: 1 }]}
              placeholder="0x address"
              placeholderTextColor={C.faint}
              value={to}
              onChangeText={setTo}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={S.pickerBtn} onPress={() => setShowPicker(v => !v)}>
              <Text style={S.pickerBtnText}>Citizens</Text>
            </TouchableOpacity>
          </View>

          {showPicker && citizens.length > 0 && (
            <View style={S.citizenList}>
              {citizens.map(c => (
                <TouchableOpacity
                  key={c.address}
                  style={S.citizenRow}
                  onPress={() => { setTo(c.address); setShowPicker(false) }}
                >
                  <Text style={S.citizenName}>{c.name}</Text>
                  <Text style={S.citizenAddr}>{shortAddr(c.address)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Amount */}
        <View style={card}>
          <Text style={[label, { marginBottom: 8 }]}>AMOUNT (S)</Text>
          <TextInput
            style={S.input}
            placeholder="0"
            placeholderTextColor={C.faint}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        {/* Note */}
        <View style={card}>
          <Text style={[label, { marginBottom: 8 }]}>NOTE (optional)</Text>
          <TextInput
            style={S.input}
            placeholder="What's this payment for?"
            placeholderTextColor={C.faint}
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Preview */}
        {to && amount && parseFloat(amount) > 0 && (
          <View style={[card, { borderColor: C.gold }]}>
            <Text style={[label, { marginBottom: 8 }]}>PREVIEW</Text>
            <Text style={S.preview}>
              Send <Text style={{ color: C.gold, fontWeight: '600' }}>{amount} S</Text>
              {' '}to <Text style={{ color: C.text }}>{shortAddr(to)}</Text>
              {note ? `\n"${note}"` : ''}
            </Text>
          </View>
        )}

        {/* Send button */}
        <TouchableOpacity
          style={[S.btnGold, loading && S.btnDisabled]}
          onPress={handleSend}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={C.bg} />
            : <Text style={S.btnGoldText}>Send → confirm with Face ID</Text>
          }
        </TouchableOpacity>

        <Text style={S.hint}>Transactions are recorded on Base Sepolia and cannot be reversed.</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const S = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  content:      { padding: 16, paddingBottom: 48 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  back:         { fontSize: 13, color: C.sub, fontFamily: font },
  balance:      { fontSize: 11, color: C.faint, fontFamily: font },
  heading:      { fontSize: 18, fontWeight: '600', color: C.text, fontFamily: font, marginBottom: 16 },

  addrRow:      { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input:        { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: C.border, borderRadius: 6, padding: 10, fontSize: 13, fontFamily: font, color: C.text },
  pickerBtn:    { borderWidth: 1, borderColor: C.border, borderRadius: 6, padding: 10 },
  pickerBtnText:{ fontSize: 11, color: C.sub, fontFamily: font },

  citizenList:  { marginTop: 8, borderWidth: 1, borderColor: C.border, borderRadius: 6, overflow: 'hidden' },
  citizenRow:   { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  citizenName:  { fontSize: 12, color: C.text, fontFamily: font },
  citizenAddr:  { fontSize: 11, color: C.faint, fontFamily: font },

  preview:      { fontSize: 12, color: C.sub, fontFamily: font, lineHeight: 20 },

  btnGold:      { backgroundColor: C.gold, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 4 },
  btnGoldText:  { color: C.bg, fontSize: 13, fontWeight: '600', fontFamily: font },
  btnDisabled:  { opacity: 0.5 },

  hint:         { fontSize: 10, color: C.faint, fontFamily: font, textAlign: 'center', marginTop: 12 },
})
