/**
 * ScanPay — open the camera, decode a SPICE payment QR, navigate to Pay.
 *
 * The expo-camera CameraView fires onBarcodeScanned for every detected code.
 * We accept only QR codes containing a valid spice://pay?... URL.
 */
import React, { useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { parsePayUrl } from '../utils/payurl'
import { C, font } from '../theme'

export default function ScanPay() {
  const navigation = useNavigation()
  const [permission, requestPermission] = useCameraPermissions()
  const [error, setError] = useState(null)
  const handled = useRef(false)

  function onScan({ data }) {
    if (handled.current) return
    const parsed = parsePayUrl(data)
    if (!parsed) {
      setError('That QR is not a SPICE payment code.')
      return
    }
    handled.current = true
    navigation.replace('Pay', parsed)
  }

  // ── Permission states ─────────────────────────────────────────────────────
  if (!permission) {
    return (
      <SafeAreaView style={S.safe}>
        <View style={S.center}><ActivityIndicator color={C.gold} /></View>
      </SafeAreaView>
    )
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={S.safe}>
        <View style={S.center}>
          <Text style={S.heading}>Camera permission</Text>
          <Text style={S.body}>
            SPICE needs camera access to scan payment QR codes at merchants.
            We don't take photos or store images.
          </Text>
          <TouchableOpacity style={S.btnGold} onPress={requestPermission}>
            <Text style={S.btnGoldText}>Allow camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            <Text style={S.back}>← Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ── Camera ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={S.safe}>
      <View style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={onScan}
        />

        {/* Reticle overlay */}
        <View pointerEvents="none" style={S.overlay}>
          <View style={S.reticle} />
          <Text style={S.reticleHint}>
            Point at the SPICE payment QR
          </Text>
          {error ? <Text style={S.error}>{error}</Text> : null}
        </View>

        <SafeAreaView style={S.bottomBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={S.back}>← Cancel</Text>
          </TouchableOpacity>
          {error ? (
            <TouchableOpacity onPress={() => { setError(null); handled.current = false }}>
              <Text style={S.retry}>Try again</Text>
            </TouchableOpacity>
          ) : null}
        </SafeAreaView>
      </View>
    </SafeAreaView>
  )
}

const S = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#000' },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  heading:     { fontSize: 18, fontWeight: '600', color: C.text, fontFamily: font, marginBottom: 12, textAlign: 'center' },
  body:        { fontSize: 13, color: C.sub, fontFamily: font, lineHeight: 20, textAlign: 'center', marginBottom: 24 },
  btnGold:     { backgroundColor: C.gold, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
  btnGoldText: { color: '#0a0a0a', fontSize: 13, fontWeight: '600', fontFamily: font },
  back:        { fontSize: 13, color: '#fff', fontFamily: font },
  retry:       { fontSize: 13, color: C.gold, fontFamily: font },

  overlay:     { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  reticle:     { width: 240, height: 240, borderWidth: 2, borderColor: C.gold, borderRadius: 12 },
  reticleHint: { color: '#fff', fontFamily: font, fontSize: 12, marginTop: 16, opacity: 0.85 },
  error:       { color: C.red, fontFamily: font, fontSize: 12, marginTop: 12, textAlign: 'center', paddingHorizontal: 32 },

  bottomBar:   { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#000' },
})
