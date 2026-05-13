// src/screens/DashboardScreen.js
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import MonthSelector from '../components/MonthSelector';
import { COLORS, fmt, fmtShort, getCat } from '../constants';

function BalanceCard() {
  const { balance, totalIncome, totalExpense } = useTransactions();
  const isPositive = balance >= 0;

  return (
    <LinearGradient
      colors={['#4f46e5', '#7c3aed']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.balanceCard}
    >
      {/* Decorative circles */}
      <View style={styles.deco1} />
      <View style={styles.deco2} />

      <Text style={styles.balanceLabel}>Saldo do mês</Text>
      <Text style={styles.balanceValue}>{fmt(balance)}</Text>

      <View style={styles.balanceRow}>
        <View style={styles.balanceStat}>
          <View style={styles.balanceStatIcon}>
            <Ionicons name="arrow-up-circle" size={16} color={COLORS.green} />
          </View>
          <View>
            <Text style={styles.balanceStatLabel}>Entradas</Text>
            <Text style={[styles.balanceStatValue, { color: COLORS.greenLight }]}>
              {fmt(totalIncome)}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.balanceStat}>
          <View style={styles.balanceStatIcon}>
            <Ionicons name="arrow-down-circle" size={16} color={COLORS.red} />
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
  const { monthlyData } = useTransactions();
  const maxVal = Math.max(...monthlyData.flatMap((d) => [d.income, d.expense]), 1);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Histórico 6 meses</Text>

      <View style={styles.chartContainer}>
        {monthlyData.map((d, i) => {
          const isLast = i === monthlyData.length - 1;
          const incH = Math.max((d.income / maxVal) * 100, d.income > 0 ? 4 : 0);
          const expH = Math.max((d.expense / maxVal) * 100, d.expense > 0 ? 4 : 0);
          return (
            <View key={d.month} style={styles.barGroup}>
              <View style={styles.bars}>
                <LinearGradient
                  colors={['#4ade80', '#22c55e']}
                  style={[styles.bar, { height: incH }]}
                />
                <LinearGradient
                  colors={['#f87171', '#ef4444']}
                  style={[styles.bar, { height: expH }]}
                />
              </View>
              <Text style={[styles.barLabel, isLast && { color: COLORS.primary }]}>
                {d.month}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.green }]} />
          <Text style={styles.legendText}>Entrada</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.red }]} />
          <Text style={styles.legendText}>Saída</Text>
        </View>
      </View>
    </View>
  );
}

function CategoryBreakdown() {
  const { expenseByCategory, totalExpense } = useTransactions();

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Gastos por categoria</Text>
      {expenseByCategory.length === 0 ? (
        <Text style={styles.empty}>Nenhum gasto neste mês</Text>
      ) : (
        expenseByCategory.map(([catId, amount]) => {
          const cat = getCat('expense', catId);
          const pct = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
          return (
            <View key={catId} style={styles.catRow}>
              <View style={styles.catHeader}>
                <View style={styles.catLeft}>
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                </View>
                <View style={styles.catRight}>
                  <Text style={styles.catAmount}>{fmt(amount)}</Text>
                  <Text style={styles.catPct}>{pct.toFixed(0)}%</Text>
                </View>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pct}%`, backgroundColor: cat.color },
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

export default function DashboardScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Minhas Finanças</Text>
          <Text style={styles.headerTitle}>Olá, João 👋</Text>
        </View>
        <LinearGradient
          colors={[COLORS.primary, COLORS.purple]}
          style={styles.avatar}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>J</Text>
        </LinearGradient>
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
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerSub: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { padding: 16, gap: 14, paddingBottom: 24 },

  // Balance card
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  deco1: {
    position: 'absolute', top: -24, right: -24,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  deco2: {
    position: 'absolute', bottom: -32, right: 32,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500', marginBottom: 4 },
  balanceValue: { color: '#fff', fontSize: 38, fontWeight: '800', marginBottom: 20 },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  balanceStatIcon: { opacity: 0.9 },
  balanceStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  balanceStatValue: { fontSize: 17, fontWeight: '700', marginTop: 1 },
  divider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 16 },

  // Generic card
  card: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 20,
    padding: 20,
  },
  cardTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 16 },
  empty: { color: COLORS.textDim, textAlign: 'center', paddingVertical: 24 },

  // Bar chart
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 6 },
  barGroup: { flex: 1, alignItems: 'center', gap: 6 },
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 2, width: '100%' },
  bar: { flex: 1, borderRadius: 4, minHeight: 0 },
  barLabel: { color: COLORS.textDim, fontSize: 10, fontWeight: '600' },
  legend: { flexDirection: 'row', gap: 20, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { color: COLORS.textDim, fontSize: 11 },

  // Category
  catRow: { marginBottom: 14 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catEmoji: { fontSize: 18 },
  catLabel: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  catRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catAmount: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  catPct: { color: COLORS.textDim, fontSize: 11, width: 30, textAlign: 'right' },
  progressBg: { height: 6, backgroundColor: '#2d2d3d', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
});
