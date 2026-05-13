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

export default function App() {
  const [session, setSession] = React.useState(null);
  const [showLanding, setShowLanding] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
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
