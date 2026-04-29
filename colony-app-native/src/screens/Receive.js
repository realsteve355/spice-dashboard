/**
 * Receive — merchant payment flow with product cart.
 *
 * Three steps:
 *   1. enter — show product grid (when acting as company); tap to add to cart
 *      Manual entry below for ad-hoc amounts not in the catalogue
 *   2. wait  — show QR encoding total + line-item summary, poll chain
 *   3. paid  — animated tick + amount + sender, with optional ka-ching sound
 *
 * NFC tag write is iPhone-only — hidden where isNfcSupported() returns false.
 */
import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, SafeAreaView, Animated, Image,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import QRCode from 'react-native-qrcode-svg'
import { useWallet } from '../context/WalletContext'
import { buildPayUrl } from '../utils/payurl'
import { isNfcSupported, writeNdefPayUrl } from '../utils/nfc'
import {
  findPayment, currentBlock, fetchCompanyProducts, productImageUrl, COLONY,
} from '../utils/contracts'
import { C, font, shortAddr, card, label } from '../theme'
import { playKaChing } from '../utils/sound'

const POLL_MS = 3000

export default function Receive() {
  const navigation = useNavigation()
  const { address, colonyState, actingAs, refreshState } = useWallet()
  const receiveTo   = actingAs?.addr || address
  const receiveName = actingAs?.kind === 'company'
    ? actingAs.name
    : (colonyState?.citizenName || '')

  // step: 'enter' | 'wait' | 'paid'
  const [step,    setStep]    = useState('enter')
  const [cart,    setCart]    = useState({})            // { [productId]: quantity }
  const [products,setProducts]= useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [manualAmount, setManualAmount] = useState('')
  const [manualNote,   setManualNote]   = useState('')
  const [payment, setPayment] = useState(null)
  const [nfcAvail, setNfcAvail] = useState(false)
  const [writingTag, setWritingTag] = useState(false)

  const pollTimer = useRef(null)
  const fromBlock = useRef(null)
  const tickScale = useRef(new Animated.Value(0)).current

  useEffect(() => {
    isNfcSupported().then(setNfcAvail).catch(() => setNfcAvail(false))
    return () => stopPolling()
  }, [])

  // Fetch products when acting as a company
  useEffect(() => {
    if (actingAs?.kind !== 'company') { setProducts([]); return }
    setLoadingProducts(true)
    fetchCompanyProducts(actingAs.addr)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false))
  }, [actingAs?.kind, actingAs?.addr])

  // Animate the PAID tick on entry
  useEffect(() => {
    if (step !== 'paid') return
    tickScale.setValue(0)
    Animated.spring(tickScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start()
    playKaChing().catch(() => {})
  }, [step])

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const cartItems = products
    .filter(p => cart[p.id] > 0)
    .map(p => ({ ...p, qty: cart[p.id], lineTotal: p.price * cart[p.id] }))
  const cartTotal = cartItems.reduce((s, i) => s + i.lineTotal, 0)
  const cartNote  = cartItems.length === 0
    ? ''
    : cartItems
        .map(i => `${i.qty}× ${i.name}`)
        .join(', ')
        .slice(0, 60)   // keep within NTAG215 + readable URL bounds

  function addToCart(id) {
    setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }))
  }
  function removeFromCart(id) {
    setCart(c => {
      const next = { ...c }
      if (!next[id]) return c
      next[id] = next[id] - 1
      if (next[id] <= 0) delete next[id]
      return next
    })
  }
  function clearCart() { setCart({}); setManualAmount(''); setManualNote('') }

  // Final amount/note: cart wins if anything's in it, else manual entry
  const useCart = cartItems.length > 0
  const amount  = useCart ? cartTotal      : (parseInt(manualAmount, 10) || 0)
  const note    = useCart ? cartNote       : manualNote.trim()
  const canShowQr = amount > 0 && !!receiveTo

  const url = (step === 'wait' && canShowQr)
    ? buildPayUrl({ to: receiveTo, amount, note, merchantName: receiveName })
    : ''

  function stopPolling() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current)
      pollTimer.current = null
    }
  }

  async function startWaiting() {
    if (!canShowQr) {
      Alert.alert('Empty sale', 'Add products to the cart or enter an amount.')
      return
    }
    try {
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
          amount,
          fromBlock: fromBlock.current,
          toBlock:   head,
        })
        if (evt) {
          stopPolling()
          setPayment(evt)
          setStep('paid')
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
    clearCart()
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
      if (!/cancel/i.test(e.message || '')) {
        Alert.alert('Write failed', e.message || 'Could not write tag.')
      }
    } finally {
      setWritingTag(false)
    }
  }

  // ── Step 1: Enter (cart + manual) ─────────────────────────────────────────
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

          {/* Product grid (company mode only) */}
          {actingAs?.kind === 'company' && (
            <View style={card}>
              <Text style={[label, { marginBottom: 8 }]}>PRODUCTS</Text>
              {loadingProducts ? (
                <ActivityIndicator size="small" color={C.gold} style={{ marginVertical: 16 }} />
              ) : products.length === 0 ? (
                <Text style={S.emptyHint}>
                  No products listed yet. Add them via the company page on app.zpc.finance, or use manual entry below.
                </Text>
              ) : (
                <View style={S.productGrid}>
                  {products.map(p => {
                    const qty = cart[p.id] || 0
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[S.productCell, qty > 0 && S.productCellOn]}
                        onPress={() => addToCart(p.id)}
                        onLongPress={() => removeFromCart(p.id)}
                        delayLongPress={300}
                      >
                        <ProductThumb productId={p.id} name={p.name} />
                        <Text style={S.productName} numberOfLines={2}>{p.name}</Text>
                        <Text style={S.productPrice}>{p.price} S</Text>
                        {qty > 0 && (
                          <View style={S.qtyBadge}>
                            <Text style={S.qtyBadgeText}>{qty}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    )
                  })}
                </View>
              )}
              {products.length > 0 && (
                <Text style={S.gridHint}>Tap to add · long-press to remove</Text>
              )}
            </View>
          )}

          {/* Cart summary */}
          {useCart && (
            <View style={[card, { borderColor: C.gold }]}>
              <Text style={[label, { marginBottom: 8 }]}>CART</Text>
              {cartItems.map(i => (
                <View key={i.id} style={S.cartRow}>
                  <Text style={S.cartLine}>{i.qty}× {i.name}</Text>
                  <Text style={S.cartLineTotal}>{i.lineTotal} S</Text>
                </View>
              ))}
              <View style={S.cartTotalRow}>
                <Text style={S.cartTotalLabel}>TOTAL</Text>
                <Text style={S.cartTotalValue}>{cartTotal} S</Text>
              </View>
              <TouchableOpacity onPress={clearCart} style={S.clearCartBtn}>
                <Text style={S.clearCartText}>Clear cart</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Manual entry — collapsed when cart is in use */}
          {!useCart && (
            <>
              <View style={card}>
                <Text style={[label, { marginBottom: 8 }]}>AMOUNT (S)</Text>
                <TextInput
                  style={S.amountInput}
                  placeholder="0"
                  placeholderTextColor={C.faint}
                  value={manualAmount}
                  onChangeText={setManualAmount}
                  keyboardType="number-pad"
                />
              </View>
              <View style={card}>
                <Text style={[label, { marginBottom: 8 }]}>NOTE (optional)</Text>
                <TextInput
                  style={S.noteInput}
                  placeholder="What is this sale for?"
                  placeholderTextColor={C.faint}
                  value={manualNote}
                  onChangeText={setManualNote}
                  maxLength={60}
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={[S.btnGold, !canShowQr && S.btnDisabled]}
            onPress={startWaiting}
            disabled={!canShowQr}
          >
            <Text style={S.btnGoldText}>
              {amount > 0 ? `Show QR · ${amount} S →` : 'Show payment QR →'}
            </Text>
          </TouchableOpacity>

          <Text style={S.hint}>
            Customer scans the QR with their SPICE app{nfcAvail ? ' or taps the till NFC sticker' : ''}.
          </Text>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ── Step 2: QR + poll ─────────────────────────────────────────────────────
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
          <Text style={S.bigAmount}>{amount} S</Text>
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

  // ── Step 3: PAID ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={S.safe}>
      <View style={S.paidWrap}>
        <Animated.View style={[
          S.paidIconWrap,
          { transform: [{ scale: tickScale }] },
        ]}>
          <Text style={S.paidIcon}>✓</Text>
        </Animated.View>

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

/**
 * ProductThumb — square photo for a product card, with a graceful fallback
 * to the product's initials when the image is missing or fails to load.
 */
function ProductThumb({ productId, name }) {
  const [errored, setErrored] = useState(false)
  const url = productImageUrl(productId)
  const initials = (name || '??').slice(0, 2).toUpperCase()

  if (!url || errored) {
    return (
      <View style={S.thumbPlaceholder}>
        <Text style={S.thumbInitials}>{initials}</Text>
      </View>
    )
  }
  return (
    <Image
      source={{ uri: url }}
      style={S.thumbImage}
      onError={() => setErrored(true)}
      resizeMode="cover"
    />
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

  // Product grid
  productGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  productCell:  {
    width:           '31%',
    backgroundColor: C.card,
    borderWidth:     1,
    borderColor:     C.border,
    borderRadius:    8,
    padding:         8,
    justifyContent:  'flex-start',
    position:        'relative',
  },
  productCellOn:{ borderColor: C.gold, backgroundColor: 'rgba(217,165,61,0.10)' },
  productName:  { fontSize: 11, color: C.text, fontFamily: font, marginTop: 6, marginBottom: 4, minHeight: 28 },
  productPrice: { fontSize: 12, color: C.gold, fontFamily: font, fontWeight: '600' },

  thumbImage:       { width: '100%', aspectRatio: 1, borderRadius: 4, backgroundColor: C.bg },
  thumbPlaceholder: { width: '100%', aspectRatio: 1, borderRadius: 4, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  thumbInitials:    { fontSize: 18, color: C.faint, fontFamily: font, fontWeight: '600' },
  qtyBadge:     {
    position:        'absolute',
    top:             -6,
    right:           -6,
    width:           22,
    height:          22,
    borderRadius:    11,
    backgroundColor: C.gold,
    alignItems:      'center',
    justifyContent:  'center',
  },
  qtyBadgeText: { fontSize: 11, fontWeight: '700', color: '#0a0a0a', fontFamily: font },
  gridHint:     { fontSize: 10, color: C.faint, fontFamily: font, marginTop: 10, textAlign: 'center' },
  emptyHint:    { fontSize: 11, color: C.faint, fontFamily: font, lineHeight: 17, textAlign: 'center', paddingVertical: 12 },

  // Cart
  cartRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  cartLine:       { fontSize: 12, color: C.text, fontFamily: font },
  cartLineTotal:  { fontSize: 12, color: C.text, fontFamily: font, fontWeight: '600' },
  cartTotalRow:   { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, marginTop: 8 },
  cartTotalLabel: { fontSize: 11, color: C.faint, fontFamily: font, letterSpacing: 1 },
  cartTotalValue: { fontSize: 18, color: C.gold, fontFamily: font, fontWeight: '700' },
  clearCartBtn:   { alignSelf: 'flex-start', marginTop: 8 },
  clearCartText:  { fontSize: 11, color: C.sub, fontFamily: font, textDecorationLine: 'underline' },

  // Manual amount/note
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
  paidIconWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  paidIcon:     { fontSize: 48, color: '#0a0a0a', fontWeight: '700' },
  paidTitle:    { fontSize: 22, fontWeight: '600', color: C.text, fontFamily: font, marginBottom: 8 },
  paidAmount:   { fontSize: 52, fontWeight: '700', color: C.gold, fontFamily: font },
  paidFrom:     { fontSize: 13, color: C.sub, fontFamily: font, marginTop: 6, marginBottom: 4 },
  paidNote:     { fontSize: 12, color: C.faint, fontFamily: font, fontStyle: 'italic', marginTop: 4, marginBottom: 8 },
  txHash:       { fontSize: 10, color: C.faint, fontFamily: font, marginBottom: 28 },
})
