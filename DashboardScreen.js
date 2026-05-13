// DashboardScreen.js
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from './TransactionContext';
import { useTheme } from './ThemeContext';
import MonthSelector from './MonthSelector';

function BalanceCard() {
  const { balance, totalIncome, totalExpense, fmt } = useTransactions();
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={['#4f46e5', '#7c3aed']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.balanceCard}
    >
      <View style={styles.deco1} />
      <View style={styles.deco2} />

      <Text style={styles.balanceLabel}>Saldo do mês</Text>
      <Text style={styles.balanceValue}>{fmt(balance)}</Text>

      <View style={styles.balanceRow}>
        <View style={styles.balanceStat}>
          <View style={styles.balanceStatIcon}>
            <Ionicons name="arrow-up-circle" size={16} color={colors.green} />
          </View>
          <View>
            <Text style={styles.balanceStatLabel}>Entradas</Text>
            <Text style={[styles.balanceStatValue, { color: colors.greenLight }]}>
              {fmt(totalIncome)}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.balanceStat}>
          <View style={styles.balanceStatIcon}>
            <Ionicons name="arrow-down-circle" size={16} color={colors.red} />
          </View>
          <View>
            <Text style={styles.balanceStatLabel}>Saídas</Text>
            <Text style={[styles.balanceStatValue, { color: '#fca5a5' }]}>
              {fmt(totalExpense)}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

function BarChart() {
  const { monthlyData = [] } = useTransactions();
  const { colors } = useTheme();
  const maxVal = Math.max(...(monthlyData || []).flatMap((d) => [d.income, d.expense]), 1);

  return (
    <View style={[styles.card, { backgroundColor: colors.cardAlt }]}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Histórico 6 meses</Text>

      <View style={styles.chartContainer}>
        {(monthlyData || []).map((d, i) => {
          const isLast = i === (monthlyData || []).length - 1;
          const incH = Math.max((d.income / maxVal) * 100, d.income > 0 ? 4 : 0);
          const expH = Math.max((d.expense / maxVal) * 100, d.expense > 0 ? 4 : 0);
          return (
            <View key={d.month} style={styles.barGroup}>
              <View style={styles.bars}>
                <LinearGradient
                  colors={[colors.greenLight, colors.green]}
                  style={[styles.bar, { height: incH }]}
                />
                <LinearGradient
                  colors={['#f87171', colors.red]}
                  style={[styles.bar, { height: expH }]}
                />
              </View>
              <Text style={[styles.barLabel, { color: colors.textDim }, isLast && { color: colors.primary }]}>
                {d.month}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
          <Text style={[styles.legendText, { color: colors.textDim }]}>Entrada</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
          <Text style={[styles.legendText, { color: colors.textDim }]}>Saída</Text>
        </View>
      </View>
    </View>
  );
}

function CategoryBreakdown() {
  const { expenseByCategory = [], totalExpense, fmt } = useTransactions();
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.cardAlt }]}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Gastos por categoria</Text>
      {(expenseByCategory || []).length === 0 ? (
        <Text style={[styles.empty, { color: colors.textDim }]}>Nenhum gasto neste mês</Text>
      ) : (
        (expenseByCategory || []).map(([catName, amount]) => {
          const pct = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
          return (
            <View key={catName} style={styles.catRow}>
              <View style={styles.catHeader}>
                <View style={styles.catLeft}>
                  <Text style={[styles.catLabel, { color: colors.textSecondary }]}>{catName}</Text>
                </View>
                <View style={styles.catRight}>
                  <Text style={[styles.catAmount, { color: colors.textPrimary }]}>{fmt(amount)}</Text>
                  <Text style={[styles.catPct, { color: colors.textDim }]}>{pct.toFixed(0)}%</Text>
                </View>
              </View>
              <View style={[styles.progressBg, { backgroundColor: colors.border + '33' }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pct}%`, backgroundColor: colors.primary },
                  ]}
                />
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useTransactions();
  const { colors } = useTheme();
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: Math.max(insets.top, 60) }]}>
      <View style={[styles.header, { marginBottom: 8 }]}>
        <View>
          <Text style={[styles.headerSub, { color: colors.primary }]}>Minhas Finanças</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Olá, {userName} 👋</Text>
        </View>
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => navigation.navigate('Settings')}
          style={styles.avatar}
        >
          <LinearGradient
            colors={[colors.primary, colors.purple]}
            style={styles.avatarGrad}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>{userInitial}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <MonthSelector />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <BalanceCard />
        <BarChart />
        <CategoryBreakdown />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerSub: { fontSize: 10, fontWeight: '800', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 8, opacity: 0.6 },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  avatar: { width: 44, height: 44, borderRadius: 14, overflow: 'hidden' },
  avatarGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, gap: 14, paddingBottom: 24 },
  balanceCard: { borderRadius: 24, padding: 24, overflow: 'hidden' },
  deco1: { position: 'absolute', top: -24, right: -24, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' },
  deco2: { position: 'absolute', bottom: -32, right: 32, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500', marginBottom: 4 },
  balanceValue: { color: '#fff', fontSize: 38, fontWeight: '800', marginBottom: 20 },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  balanceStatIcon: { opacity: 0.9 },
  balanceStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  balanceStatValue: { fontSize: 17, fontWeight: '700', marginTop: 1 },
  divider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 16 },
  card: { borderRadius: 20, padding: 20 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 16 },
  empty: { textAlign: 'center', paddingVertical: 24 },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 6 },
  barGroup: { flex: 1, alignItems: 'center', gap: 6 },
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 2, width: '100%' },
  bar: { flex: 1, borderRadius: 4, minHeight: 0 },
  barLabel: { fontSize: 10, fontWeight: '600' },
  legend: { flexDirection: 'row', gap: 20, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 11 },
  catRow: { marginBottom: 14 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catLabel: { fontSize: 14, fontWeight: '500' },
  catRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catAmount: { fontSize: 14, fontWeight: '700' },
  catPct: { fontSize: 11, width: 30, textAlign: 'right' },
  progressBg: { height: 6, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
});
