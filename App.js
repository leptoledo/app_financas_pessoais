// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StripeProvider from './StripeWrapper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './supabase';
import { TransactionProvider } from './TransactionContext';
import { ThemeProvider } from './ThemeContext';
import AppNavigator from './AppNavigator';
import AuthScreen from './AuthScreen';
import LandingScreen from './LandingScreen';
import { Platform, View, StyleSheet } from 'react-native';

const isWeb = Platform.OS === 'web';
const isStandalone = isWeb && typeof window !== 'undefined' && (
  (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || 
  window.navigator.standalone === true
);

export default function App() {
  const [session, setSession] = React.useState(null);
  const [showLanding, setShowLanding] = React.useState(!isStandalone);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // Fix global scrolling for Web PWA
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        html, body, #root {
          height: 100% !important;
          width: 100% !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
          background-color: #0f172a !important;
          display: flex !important;
          flex-direction: column !important;
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        
        /* Habilita o scroll em qualquer elemento que tenha overflow auto */
        div[style*="overflow: auto"], 
        div[style*="overflow-y: auto"],
        div[style*="overflow: scroll"] {
          -webkit-overflow-scrolling: touch !important;
          touch-action: pan-y !important;
          overscroll-behavior-y: contain !important;
        }

        /* Prevenir zoom automático no iOS */
        input, textarea, select {
          font-size: 16px !important;
        }
      `;
      document.head.append(style);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, height: '100%' }}>
      <StripeProvider publishableKey="pk_test_YOUR_KEY">
        <SafeAreaProvider style={{ flex: 1 }}>
          <ThemeProvider>
            <TransactionProvider>
              <StatusBar style="light" />
              <View style={{ flex: 1, height: '100%', width: '100%' }}>
                {session ? <AppNavigator /> : (showLanding ? <LandingScreen onLogin={() => setShowLanding(false)} /> : <AuthScreen />)}
              </View>
            </TransactionProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </StripeProvider>
    </GestureHandlerRootView>
  );
}
