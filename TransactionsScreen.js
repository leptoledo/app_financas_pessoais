// src/screens/TransactionsScreen.js
import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Platform, LayoutAnimation, Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTransactions } from './TransactionContext';
import { useTheme } from './ThemeContext';
import MonthSelector from './MonthSelector';
import { MONTHS } from './constants';

function TransactionItem({ item, onDelete, colors, fmt }) {
  const cat = item.categories || { label: 'Outro', emoji: '❓', color: '#94a3b8' };
  const d = new Date(item.date);
  const isIncome = item.type === 'income';

  const confirmDelete = () => {
    Alert.alert('Excluir transação', `Deseja excluir "${item.description}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  };

  return (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: cat.color + '22' }]}>
        <Text style={styles.txEmoji}>{cat.emoji}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={[styles.txDescription, { color: colors.textSecondary }]} numberOfLines={1}>{item.description}</Text>
        <Text style={[styles.txMeta, { color: colors.textDim }]}>
          {cat.label} · {d.getUTCDate()} {MONTHS[d.getUTCMonth()]}
        </Text>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: isIncome ? colors.green : colors.red }]}>
          {isIncome ? '+' : '-'}{fmt(item.amount)}
        </Text>
        <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={14} color={colors.textDim} />
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
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { monthTransactions = [], deleteTransaction, fmt, categories = { income: [], expense: [] } } = useTransactions();
  
  const [filter, setFilter] = useState('all');
  const [selectedCatId, setSelectedCatId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCatFilter, setShowCatFilter] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const availableCategories = useMemo(() => {
    if (filter === 'income') return categories?.income || [];
    if (filter === 'expense') return categories?.expense || [];
    return [...(categories?.income || []), ...(categories?.expense || [])];
  }, [filter, categories]);

  const selectedCat = availableCategories.find(c => c.id === selectedCatId);

  const filtered = useMemo(() => {
    let list = monthTransactions;
    if (filter !== 'all') list = list.filter(t => t.type === filter);
    if (selectedCatId !== 'all') list = list.filter(t => t.category_id === selectedCatId);
    
    if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = selectedDate.getMonth();
      const d = selectedDate.getDate();
      list = list.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getUTCFullYear() === y && tDate.getUTCMonth() === m && tDate.getUTCDate() === d;
      });
    }
    
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [monthTransactions, filter, selectedCatId, selectedDate]);

  const { filteredIncome, filteredExpense } = useMemo(() => {
    return filtered.reduce((acc, t) => {
      if (t.type === 'income') acc.filteredIncome += Number(t.amount);
      else acc.filteredExpense += Number(t.amount);
      return acc;
    }, { filteredIncome: 0, filteredExpense: 0 });
  }, [filtered]);

  const filteredBalance = filteredIncome - filteredExpense;

  const toggleCatDropdown = () => {
    Keyboard.dismiss();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowDatePicker(false);
    setShowCatFilter(!showCatFilter);
  };

  const toggleDateDropdown = () => {
    Keyboard.dismiss();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCatFilter(false);
    setShowDatePicker(!showDatePicker);
  };

  const onDateChange = (event, date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const clearFilters = () => {
    setFilter('all');
    setSelectedCatId('all');
    setSelectedDate(null);
  };

  const formattedDateFilter = useMemo(() => {
    if (!selectedDate) return 'Data';
    const d = selectedDate.getDate().toString().padStart(2, '0');
    const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const y = selectedDate.getFullYear();
    return `${d}/${m}/${y}`;
  }, [selectedDate]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: Math.max(insets.top, 60) }]}>
      <View style={[styles.header, { marginBottom: 8 }]}>
        <View>
          <Text style={[styles.headerSub, { color: colors.primary }]}>Registro</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Transações</Text>
        </View>
        {(filter !== 'all' || selectedCatId !== 'all' || selectedDate) && (
          <TouchableOpacity onPress={clearFilters} style={[styles.clearAllBtn, { backgroundColor: colors.red + '11' }]}>
            <Text style={{ color: colors.red, fontSize: 12, fontWeight: '700' }}>Limpar Filtros</Text>
          </TouchableOpacity>
        )}
      </View>

      <MonthSelector />

      <View style={[styles.summaryStrip, { backgroundColor: colors.cardAlt }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Entradas</Text>
          <Text style={[styles.summaryValue, { color: colors.green }]}>{fmt(filteredIncome)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Saídas</Text>
          <Text style={[styles.summaryValue, { color: colors.red }]}>{fmt(filteredExpense)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Saldo</Text>
          <Text style={[styles.summaryValue, { color: filteredBalance >= 0 ? colors.primaryLight : colors.red }]}>
            {fmt(filteredBalance)}
          </Text>
        </View>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => { setFilter(f.key); setSelectedCatId('all'); }}
              style={[styles.filterBtn, { backgroundColor: colors.cardAlt }, filter === f.key && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.filterText, { color: colors.textMuted }, filter === f.key && { color: '#fff' }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.secondaryFilterRow}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={toggleCatDropdown}
            style={[
              styles.catFilterHeader, 
              { backgroundColor: colors.cardAlt, flex: 1.5 },
              selectedCatId !== 'all' && { backgroundColor: colors.primary + '22' }
            ]}
          >
            <View style={styles.dropdownInfo}>
              <Ionicons 
                name="pricetag-outline" 
                size={14} 
                color={selectedCatId === 'all' ? colors.textDim : colors.primary} 
              />
              <Text 
                style={[
                  styles.dropdownLabel, 
                  { color: selectedCatId === 'all' ? colors.textDim : colors.textPrimary }
                ]} 
                numberOfLines={1}
              >
                {selectedCat ? `${selectedCat.emoji} ${selectedCat.label}` : 'Categoria'}
              </Text>
            </View>
            {selectedCatId !== 'all' ? (
              <TouchableOpacity onPress={() => setSelectedCatId('all')} style={{ paddingLeft: 4 }}>
                <Ionicons name="close-circle" size={14} color={colors.textDim} />
              </TouchableOpacity>
            ) : (
              <Ionicons name={showCatFilter ? "chevron-up" : "chevron-down"} size={16} color={colors.textDim} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={toggleDateDropdown}
            style={[
              styles.catFilterHeader, 
              { backgroundColor: colors.cardAlt, flex: 1 }, 
              selectedDate && { backgroundColor: colors.purple + '22' }
            ]}
          >
            <View style={styles.dropdownInfo}>
              <Ionicons name="calendar-outline" size={14} color={selectedDate ? colors.purple : colors.textDim} />
              <Text style={[styles.dropdownLabel, { color: selectedDate ? colors.textPrimary : colors.textDim }]}>
                {formattedDateFilter}
              </Text>
            </View>
            {selectedDate ? (
              <TouchableOpacity onPress={() => setSelectedDate(null)} style={{ paddingLeft: 4 }}>
                <Ionicons name="close-circle" size={14} color={colors.textDim} />
              </TouchableOpacity>
            ) : (
              <Ionicons name={showDatePicker ? "chevron-up" : "chevron-down"} size={16} color={colors.textDim} />
            )}
          </TouchableOpacity>
        </View>

        {showCatFilter && (
          <View style={[styles.dropdownList, { backgroundColor: colors.cardAlt, borderColor: colors.border + '22' }]}>
            <TouchableOpacity 
              onPress={() => { setSelectedCatId('all'); toggleCatDropdown(); }}
              style={[styles.dropdownItem, selectedCatId === 'all' && { backgroundColor: colors.primary + '22' }]}
            >
              <Text style={[styles.dropdownItemText, { color: colors.textPrimary }]}>Todas as categorias</Text>
            </TouchableOpacity>
            {availableCategories.map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                onPress={() => { setSelectedCatId(cat.id); toggleCatDropdown(); }}
                style={[styles.dropdownItem, selectedCatId === cat.id && { backgroundColor: colors.primary + '22' }]}
              >
                <Text style={[styles.dropdownItemText, { color: colors.textPrimary }]}>{cat.emoji} {cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showDatePicker && (
          <View style={[styles.dropdownList, { backgroundColor: colors.cardAlt, borderColor: colors.border + '22', padding: 4, alignSelf: 'flex-end', width: '85%', marginTop: 4 }]}>
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onDateChange}
              themeVariant={isDark ? 'dark' : 'light'}
              style={{ height: 320 }}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity 
                onPress={() => setShowDatePicker(false)}
                style={{ alignSelf: 'flex-end', padding: 10 }}
              >
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Confirmar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {(filtered || []).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💸</Text>
          <Text style={[styles.emptyText, { color: colors.textDim }]}>Nenhuma transação encontrada</Text>
          {(filter !== 'all' || selectedCatId !== 'all' || selectedDate) && (
            <TouchableOpacity onPress={clearFilters}>
              <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 8 }}>Ver todas do mês</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem item={item} onDelete={deleteTransaction} colors={colors} fmt={fmt} />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border + '22' }]} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerSub: { fontSize: 10, fontWeight: '800', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 4, opacity: 0.6 },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  clearAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  summaryStrip: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 14 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, fontWeight: '600', marginBottom: 3 },
  summaryValue: { fontSize: 14, fontWeight: '700' },
  filterSection: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  filterText: { fontSize: 13, fontWeight: '600' },
  secondaryFilterRow: { flexDirection: 'row', gap: 8 },
  catFilterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12 },
  dropdownInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  dropdownLabel: { fontSize: 12, fontWeight: '600' },
  dropdownList: { marginTop: -2, borderRadius: 12, overflow: 'hidden', borderBottomWidth: 0, marginHorizontal: 0 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  dropdownItemText: { fontSize: 13, fontWeight: '500' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  separator: { height: 1, marginVertical: 2 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  txIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txEmoji: { fontSize: 22 },
  txInfo: { flex: 1 },
  txDescription: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  txMeta: { fontSize: 12 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  deleteBtn: { padding: 4 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, fontWeight: '600' },
});
