// AuthScreen.js
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from './supabase';
import { COLORS } from './constants';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  async function handleAuth() {
    setAuthError('');
    if (!email || !password || (isSignUp && (!fullName || !phone))) {
      setAuthError('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        console.log('Iniciando cadastro:', email);
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              subscription: 'free'
            }
          }
        });
        
        if (error) {
          console.error('Erro no cadastro:', error.message);
          setAuthError(error.message);
          if (Platform.OS === 'web') alert('Erro no cadastro: ' + error.message);
        } else {
          console.log('Cadastro sucesso:', data);
          if (data?.user) {
            const successMsg = 'Conta criada com sucesso! Você já pode fazer login agora.';
            if (Platform.OS === 'web') alert(successMsg);
            else Alert.alert('Sucesso', successMsg);
            
            setIsSignUp(false);
            setPassword('');
            setFullName('');
            setPhone('');
          } else {
            setAuthError('Verifique se já possui uma conta ou confirme seu e-mail.');
          }
        }
      } else {
        console.log('Iniciando login:', email);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error('Erro no login:', error.message);
          setAuthError('E-mail ou senha incorretos.');
        }
      }
    } catch (err) {
      console.error('Erro crítico:', err);
      setAuthError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : null} 
      style={styles.screen}
    >
      <LinearGradient colors={[COLORS.bg, COLORS.card]} style={styles.container}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>💎</Text>
            </View>
            <Text style={styles.title}>Finanças Pro</Text>
            <Text style={styles.subtitle}>Seu controle financeiro inteligente</Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <>
                <Text style={styles.label}>NOME COMPLETO</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="Seu nome"
                  placeholderTextColor={COLORS.textDim}
                  value={fullName}
                  onChangeText={setFullName}
                />

                <Text style={styles.label}>TELEFONE</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={COLORS.textDim}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </>
            )}

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

            {authError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={COLORS.red} />
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            ) : null}

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
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1 },
  scroll: { padding: 30, paddingVertical: 60, justifyContent: 'center' },
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
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  mainBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 10 },
  mainBtnGrad: { paddingVertical: 18, alignItems: 'center' },
  mainBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchBtn: { padding: 10, alignItems: 'center' },
  switchText: { color: COLORS.primaryLight, fontSize: 13, fontWeight: '600' },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.red + '15', padding: 12, borderRadius: 12, marginTop: 4 },
  errorText: { color: COLORS.red, fontSize: 13, fontWeight: '600' }
});
