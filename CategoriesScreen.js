// src/screens/CategoriesScreen.js
import React from 'react';
import {
  View, Text, FlatList, StyleSheet, ScrollView,
} from 'react-native';
import { useTransactions } from '../context/TransactionContext';
import MonthSelector from '../components/MonthSelector';
import { COLORS, CATEGORIES, fmt, getCat } from '../constants';

function CategoryCard({ cat, amount, type }) {
  const isEmpty = amount === 0;
  return (
    <View style={[styles.card, { borderLeftColor: cat.color }]}>
      <Text style={styles.cardEmoji}>{cat.emoji}</Text>
      <Text style={styles.cardLabel} numberOfLines={1}>{cat.label}</Text>
      <Text style={[
        styles.cardAmount,
        { color: isEmpty ? COLORS.textDim : type === 'income' ? COLORS.green : COLORS.red },
      ]}>
        {fmt(amount)}
      </Text>
    </View>
  );
}

export default function CategoriesScreen() {
  const { monthTransactions } = useTransactions();

  function totalFor(type, catId) {
    return monthTransactions
      .filter((t) => t.type === type && t.category === catId)
      .reduce((s, t) => s + t.amount, 0);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>Organização</Text>
        <Text style={styles.headerTitle}>Categorias</Text>
      </View>

      <MonthSelector />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Income categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: COLORS.green }]} />
            <Text style={[styles.sectionTitle, { color: COLORS.green }]}>Entradas</Text>
          </View>
          <View style={styles.grid}>
            {CATEGORIES.income.map((cat) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                amount={totalFor('income', cat.id)}
                type="income"
              />
            ))}
          </View>
        </View>

        {/* Expense categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: COLORS.red }]} />
            <Text style={[styles.sectionTitle, { color: COLORS.red }]}>Saídas</Text>
          </View>
          <View style={styles.grid}>
            {CATEGORIES.expense.map((cat) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                amount={totalFor('expense', cat.id)}
                type="expense"
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerSub: {
    color: COLORS.primary, fontSize: 11, fontWeight: '700',
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 100 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  sectionDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47.5%',
    backgroundColor: COLORS.cardAlt,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
  },
  cardEmoji: { fontSize: 26, marginBottom: 10 },
  cardLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500', marginBottom: 6 },
  cardAmount: { fontSize: 16, fontWeight: '700' },
});
