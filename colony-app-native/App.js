/**
 * SPICE Colony — Native App
 *
 * Navigation structure:
 *   Onboarding  — shown when no wallet is set up on this device
 *   Main stack  — Dashboard (home) → Send → Settings
 *
 * WalletContext provides global wallet state (address, balances, isSetup).
 * SafeAreaProvider wraps all screens.
 */
import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

import { WalletProvider, useWallet } from './src/context/WalletContext'
import Onboarding  from './src/screens/Onboarding'
import Dashboard   from './src/screens/Dashboard'
import Send        from './src/screens/Send'
import Settings    from './src/screens/Settings'
import Pay         from './src/screens/Pay'
import { C, font } from './src/theme'

/**
 * Deep-link config — handles spice://pay?to=0x...&amount=N&note=TEXT
 * opened by iOS/Android when the user taps an NFC tag outside the app.
 */
const linking = {
  prefixes: ['spice://'],
  config: {
    screens: {
      Pay: {
        path: 'pay',
        parse: {
          to:           (v) => v,
          amount:       (v) => v,
          note:         (v) => v,
          merchantName: (v) => v,
        },
      },
    },
  },
}

const Stack = createNativeStackNavigator()

// Header settings button — must be inside NavigationContainer to use useNavigation
function HeaderSettingsBtn() {
  const navigation = useNavigation()
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Settings')} hitSlop={8}>
      <Text style={{ fontFamily: font, fontSize: 11, color: C.gold, letterSpacing: 1 }}>
        ⚙
      </Text>
    </TouchableOpacity>
  )
}

function Navigator() {
  const { isSetup, initialising } = useWallet()

  if (initialising) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator color={C.gold} />
      </View>
    )
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerStyle:         { backgroundColor: C.bg },
          headerTitleStyle:    { fontFamily: font, fontSize: 13, color: C.text },
          headerTintColor:     C.gold,
          headerShadowVisible: false,
        }}
      >
        {!isSetup ? (
          <Stack.Screen
            name="Onboarding"
            component={Onboarding}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={Dashboard}
              options={{
                title:       'SPICE',
                headerRight: () => <HeaderSettingsBtn />,
              }}
            />
            <Stack.Screen
              name="Send"
              component={Send}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={Settings}
              options={{ title: 'SETTINGS' }}
            />
            <Stack.Screen
              name="Pay"
              component={Pay}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <WalletProvider>
        <Navigator />
        <StatusBar style="dark" />
      </WalletProvider>
    </SafeAreaProvider>
  )
}
