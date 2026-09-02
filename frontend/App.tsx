import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { FarmerProvider, useFarmerContext } from './contexts/FarmerContext';
import { LanguageProvider } from './contexts/LanguageContext';

/** Inner component that has access to FarmerContext */
function AppContent() {
  const { loading } = useFarmerContext();

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}

/**
 * Root component — handles font loading before rendering the provider tree.
 *
 * The Noto Nastaliq Urdu font is loaded via `expo-font` so it's available
 * before any screen renders.  While fonts are loading we show a lightweight
 * splash so users don't see a flash of unstyled text.
 */
export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      NotoNastaliqUrdu: require('./assets/fonts/NotoNastaliqUrdu-Variable.ttf'),
    })
      .then(() => setFontsLoaded(true))
      .catch((err) => {
        console.warn('[App] Font loading failed:', err);
        // Continue anyway — Urdu text will fall back to system font.
        setFontsLoaded(true);
      });
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <LanguageProvider>
        <FarmerProvider>
          <AppContent />
        </FarmerProvider>
      </LanguageProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
