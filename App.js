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
import { Platform } from 'react-native';

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
          overflow: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }
      `;
      document.head.append(style);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider publishableKey="pk_test_YOUR_KEY">
        <SafeAreaProvider>
          <ThemeProvider>
            <TransactionProvider>
              <StatusBar style="auto" />
              {session ? <AppNavigator /> : (showLanding ? <LandingScreen onLogin={() => setShowLanding(false)} /> : <AuthScreen />)}
            </TransactionProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </StripeProvider>
    </GestureHandlerRootView>
  );
}
