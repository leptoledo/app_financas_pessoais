// src/screens/TransactionsScreen.js
import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import MonthSelector from '../components/MonthSelector';
import { COLORS, MONTHS, fmt, getCat } from '../constants';

function TransactionItem({ item, onDelete }) {
  const cat = getCat(item.type, item.category);
  const d = new Date(item.date);
  const isIncome = item.type === 'income';

  const confirmDelete = () => {
    Alert.alert(
      'Excluir transação',
      `Deseja excluir "${item.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => onDelete(item.id) },
      ]
    );
  };

  return (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: cat.color + '22' }]}>
        <Text style={styles.txEmoji}>{cat.emoji}</Text>
      </View>

      <View style={styles.txInfo}>
        <Text style={styles.txDescription} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.txMeta}>
          {cat.label} · {d.getDate()} {MONTHS[d.getMonth()]}
        </Text>
      </View>

      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: isIncome ? COLORS.green : COLORS.red }]}>
          {isIncome ? '+' : '-'}{fmt(item.amount)}
        </Text>
        <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={14} color={COLORS.textDim} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'income', label: 'Entradas' },
  { key: 'expense', label: 'Saídas' },
];

export default function TransactionsScreen() {
  const { monthTransactions, deleteTransaction, totalIncome, totalExpense, balance } = useTransactions();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    const list = filter === 'all'
      ? monthTransactions
      : monthTransactions.filter((t) => t.type === filter);
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [monthTransactions, filter]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>Registro</Text>
        <Text style={styles.headerTitle}>Transações</Text>
      </View>

      <MonthSelector />

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Entradas</Text>
          <Text style={[styles.summaryValue, { color: COLORS.green }]}>{fmt(totalIncome)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Saídas</Text>
          <Text style={[styles.summaryValue, { color: COLORS.red }]}>{fmt(totalExpense)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Saldo</Text>
          <Text style={[styles.summaryValue, { color: balance >= 0 ? COLORS.primaryLight : COLORS.red }]}>
            {fmt(balance)}
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.75}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💸</Text>
          <Text style={styles.emptyText}>Nenhuma transação</Text>
          <Text style={styles.emptyHint}>Toque em + para adicionar</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem item={item} onDelete={deleteTransaction} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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

  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardAlt,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600', marginBottom: 3 },
  summaryValue: { fontSize: 14, fontWeight: '700' },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 12,
    backgroundColor: COLORS.cardAlt, alignItems: 'center',
  },
  filterBtnActive: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#fff' },

  list: { paddingHorizontal: 16, paddingBottom: 100 },
  separator: { height: 1, backgroundColor: COLORS.border, marginVertical: 2 },

  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  txIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txEmoji: { fontSize: 22 },
  txInfo: { flex: 1 },
  txDescription: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 3 },
  txMeta: { color: COLORS.textDim, fontSize: 12 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  deleteBtn: {
    padding: 4,
    borderRadius: 6,
  },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: COLORS.textDim, fontSize: 16, fontWeight: '600' },
  emptyHint: { color: COLORS.textDim, fontSize: 13 },
});
