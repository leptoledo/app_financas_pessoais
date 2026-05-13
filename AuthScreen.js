// AuthScreen.js
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from './supabase';
import { COLORS } from './constants';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) Alert.alert('Erro no cadastro', error.message);
      else Alert.alert('Sucesso', 'Verifique seu e-mail para confirmar o cadastro!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) Alert.alert('Erro no login', error.message);
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.screen}
    >
      <LinearGradient colors={[COLORS.bg, COLORS.card]} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>💎</Text>
          </View>
          <Text style={styles.title}>Finanças Pro</Text>
          <Text style={styles.subtitle}>Seu controle financeiro inteligente</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>E-MAIL</Text>
          <TextInput 
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor={COLORS.textDim}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>SENHA</Text>
          <TextInput 
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textDim}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={handleAuth} 
            disabled={loading}
            style={styles.mainBtn}
          >
            <LinearGradient 
              colors={[COLORS.primary, COLORS.purple]} 
              style={styles.mainBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.mainBtnText}>
                  {isSignUp ? 'Criar Conta' : 'Entrar'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsSignUp(!isSignUp)}
            style={styles.switchBtn}
          >
            <Text style={styles.switchText}>
              {isSignUp ? 'Já tem uma conta? Entre agora' : 'Não tem conta? Cadastre-se'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 30 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { 
    width: 80, height: 80, borderRadius: 30, 
    backgroundColor: COLORS.cardAlt, alignItems: 'center', 
    justifyContent: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.border
  },
  logoEmoji: { fontSize: 40 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: COLORS.textDim, fontSize: 14, textAlign: 'center' },
  form: { gap: 16 },
  label: { color: COLORS.textDim, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  input: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 16,
    padding: 18,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  mainBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 10 },
  mainBtnGrad: { paddingVertical: 18, alignItems: 'center' },
  mainBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchBtn: { padding: 10, alignItems: 'center' },
  switchText: { color: COLORS.primaryLight, fontSize: 13, fontWeight: '600' }
});
