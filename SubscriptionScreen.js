// SubscriptionScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTransactions } from './TransactionContext';
import { useTheme } from './ThemeContext';
import { supabase } from './supabase';

function PlanFeature({ label, icon = "checkmark-circle", active = true, colors }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name={icon} size={20} color={active ? colors.green : colors.textDim} />
      <Text style={[styles.featureText, { color: active ? colors.textPrimary : colors.textDim }]}>{label}</Text>
    </View>
  );
}

export default function SubscriptionScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { subscription, updateSubscription } = useTransactions();

  const isGold = subscription === 'gold';

  const handleSubscribe = async (plan) => {
    if (plan === 'gold') {
      // Pega o ID do usuário atual para enviar pro Stripe
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Substitua pela SUA URL de Pagamento do Stripe (Payment Link)
      // O parâmetro client_reference_id ajuda o Stripe a avisar o banco de dados depois
      const stripePaymentLink = `https://buy.stripe.com/test_seu_link_aqui?client_reference_id=${user.id}`;
      
      Alert.alert(
        'Redirecionando...',
        'Você será levado para o ambiente seguro do Stripe para finalizar o pagamento.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => Linking.openURL(stripePaymentLink) }
        ]
      );
    } else {
      updateSubscription('free');
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: Math.max(insets.top, 50) }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.cardAlt }]}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Planos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <LinearGradient
            colors={[colors.primary, colors.purple]}
            style={styles.heroIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="diamond" size={40} color="#fff" />
          </LinearGradient>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>Escolha seu nível</Text>
          <Text style={[styles.heroSub, { color: colors.textDim }]}>Desbloqueie o poder total da sua gestão financeira</Text>
        </View>

        <View style={styles.plansContainer}>
          {/* Plano FREE */}
          <View style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border + '44' }]}>
            <View style={styles.planHeader}>
              <Text style={[styles.planName, { color: colors.textPrimary }]}>Plano Grátis</Text>
              <Text style={[styles.planPrice, { color: colors.textDim }]}>R$ 0,00</Text>
            </View>
            <View style={styles.divider} />
            <PlanFeature label="Histórico de até 3 meses" colors={colors} />
            <PlanFeature label="Até 5 categorias" colors={colors} />
            <PlanFeature label="Limite de 50 transações" colors={colors} />
            <PlanFeature label="Exportação de dados" icon="close-circle" active={false} colors={colors} />
            
            <TouchableOpacity 
              disabled={!isGold}
              onPress={() => handleSubscribe('free')}
              style={[styles.planBtn, { backgroundColor: isGold ? colors.cardAlt : colors.border + '44' }]}
            >
              <Text style={[styles.planBtnText, { color: isGold ? colors.textPrimary : colors.textDim }]}>
                {isGold ? 'Mudar para Grátis' : 'Plano Atual'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Plano GOLD */}
          <View style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 2 }]}>
            <LinearGradient
              colors={[colors.primary + '11', colors.purple + '11']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.planHeader}>
              <View>
                <Text style={[styles.planName, { color: colors.primary }]}>Plano Gold ✨</Text>
                <Text style={[styles.planPrice, { color: colors.textPrimary }]}>R$ 19,90<Text style={{ fontSize: 14, fontWeight: '400' }}>/mês</Text></Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>RECOMENDADO</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <PlanFeature label="Histórico ilimitado" colors={colors} />
            <PlanFeature label="Categorias ilimitadas" colors={colors} />
            <PlanFeature label="Transações ilimitadas" colors={colors} />
            <PlanFeature label="Suporte Prioritário" colors={colors} />
            <PlanFeature label="Sem anúncios" colors={colors} />

            <TouchableOpacity 
              disabled={isGold}
              onPress={() => handleSubscribe('gold')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.purple]}
                style={styles.goldBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.goldBtnText}>{isGold ? 'Plano Ativo' : 'Assinar Agora'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.footerText, { color: colors.textDim }]}>
          Cancele a qualquer momento. Pagamento processado com segurança via Stripe.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  scroll: { paddingBottom: 40 },
  hero: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 40 },
  heroIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  heroTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  heroSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  plansContainer: { paddingHorizontal: 20, gap: 20, marginTop: 10 },
  planCard: { borderRadius: 24, padding: 24, borderWidth: 1, overflow: 'hidden' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  planName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  planPrice: { fontSize: 24, fontWeight: '800' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  featureText: { fontSize: 14, fontWeight: '500' },
  planBtn: { height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  planBtnText: { fontSize: 16, fontWeight: '700' },
  goldBtn: { height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  goldBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerText: { textAlign: 'center', fontSize: 12, marginTop: 32, paddingHorizontal: 40, lineHeight: 18 }
});
