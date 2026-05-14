import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from './constants';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function LandingScreen({ onLogin }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosTutorial, setShowIosTutorial] = useState(false);

  useEffect(() => {
    if (isWeb) {
      const handleBeforeInstallPrompt = (e) => {
        // Previne que o mini-infobar apareça no mobile
        e.preventDefault();
        // Guarda o evento para ser disparado pelo botão
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Mostra o prompt de instalação
      deferredPrompt.prompt();
      // Aguarda a escolha do usuário
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('Usuário aceitou a instalação do A2HS');
      } else {
        console.log('Usuário rejeitou a instalação do A2HS');
      }
      // O prompt só pode ser usado uma vez, então limpa ele
      setDeferredPrompt(null);
    } else {
      // Fallback para Safari/iOS ou Desktop sem suporte
      setShowIosTutorial(true);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>💎</Text>
          <Text style={styles.logoText}>Finanças Pro</Text>
        </View>
        
        {isWeb && width > 768 && (
          <View style={styles.navLinks}>
            <Text style={styles.navLink}>Recursos</Text>
            <Text style={styles.navLink}>Analytics</Text>
            <Text style={styles.navLink}>Preços</Text>
          </View>
        )}

        <View style={styles.navActions}>
          <TouchableOpacity onPress={onLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={isWeb ? handleInstallClick : onLogin} style={styles.installBtn}>
            <Text style={styles.installBtnText}>{isWeb ? 'Instalar App' : 'Acessar App'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.headline}>Assuma o controle financeiro</Text>
        <Text style={styles.headlinePrimary}>Liberdade real a longo prazo</Text>
        
        <Text style={styles.subtitle}>
          O aplicativo definitivo para organizar seus gastos, criar metas de economia e alcançar a consistência com análises avançadas do seu histórico.
        </Text>

        <View style={styles.ctaGroup}>
          <TouchableOpacity activeOpacity={0.8} onPress={isWeb ? handleInstallClick : onLogin} style={styles.primaryBtn}>
            <LinearGradient 
              colors={[COLORS.primary, COLORS.purple]} 
              style={styles.primaryBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryBtnText}>Criar conta gratuita</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity activeOpacity={0.8} onPress={onLogin} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Ver Demonstração</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Compatível com suas principais contas</Text>
        <View style={styles.footerLogos}>
          {['Nubank', 'Itaú', 'Inter', 'XP', 'Bradesco'].map(bank => (
            <Text key={bank} style={styles.bankLogo}>{bank}</Text>
          ))}
        </View>
      </View>

      {/* iOS Install Tutorial Modal */}
      <Modal visible={showIosTutorial} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Instalar no iPhone</Text>
              <TouchableOpacity onPress={() => setShowIosTutorial(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDesc}>
              Para instalar este aplicativo no seu iPhone e acessar direto da tela inicial:
            </Text>
            
            <View style={styles.stepRow}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>Toque no ícone de Compartilhar <Ionicons name="share-outline" size={18} color={COLORS.primaryLight} /> no menu inferior do Safari.</Text>
            </View>
            
            <View style={styles.stepRow}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>Role para baixo e selecione <Text style={{fontWeight: 'bold', color: '#fff'}}>Adicionar à Tela de Início</Text> <Ionicons name="add-square-outline" size={18} color={COLORS.primaryLight} />.</Text>
            </View>

            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowIosTutorial(false)}>
              <Text style={styles.modalBtnText}>Entendi</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalBtn, { backgroundColor: 'transparent', marginTop: 10, borderWidth: 1, borderColor: COLORS.border }]} 
              onPress={() => {
                setShowIosTutorial(false);
                onLogin();
              }}
            >
              <Text style={[styles.modalBtnText, { color: COLORS.textDim, fontSize: 14 }]}>Continuar para o site</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    minHeight: '100%',
    paddingHorizontal: isWeb && width > 768 ? '10%' : 20,
    paddingTop: 30,
    paddingBottom: 60,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 80,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 24,
  },
  logoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 30,
  },
  navLink: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '500',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  loginText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 15,
  },
  installBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  installBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isWeb && width > 768 ? 60 : 20,
  },
  headline: {
    color: '#fff',
    fontSize: isWeb && width > 768 ? 64 : 40,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1.5,
    marginBottom: 5,
  },
  headlinePrimary: {
    color: COLORS.primaryLight,
    fontSize: isWeb && width > 768 ? 64 : 40,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1.5,
    marginBottom: 24,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: isWeb && width > 768 ? 20 : 16,
    textAlign: 'center',
    maxWidth: 700,
    lineHeight: 30,
    marginBottom: 40,
  },
  ctaGroup: {
    flexDirection: isWeb && width > 768 ? 'row' : 'column',
    gap: 16,
    width: isWeb && width > 768 ? 'auto' : '100%',
  },
  primaryBtn: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  primaryBtnGrad: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  secondaryBtnText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    marginTop: 100,
    alignItems: 'center',
  },
  footerTitle: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 30,
  },
  footerLogos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: isWeb && width > 768 ? 50 : 20,
  },
  bankLogo: {
    color: '#334155',
    fontSize: isWeb && width > 768 ? 24 : 18,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  modalDesc: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  stepNumber: {
    backgroundColor: COLORS.cardAlt,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
  },
  modalBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});
