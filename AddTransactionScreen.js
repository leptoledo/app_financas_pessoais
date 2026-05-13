// src/screens/AddTransactionScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import { COLORS, CATEGORIES, fmt } from '../constants';

const TODAY = new Date().toISOString().split('T')[0];

function TypeToggle({ value, onChange }) {
  return (
    <View style={styles.toggleContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChange('income')}
        style={[styles.toggleBtn, value === 'income' && styles.toggleIncome]}
      >
        <Ionicons name="arrow-up" size={16} color={value === 'income' ? '#fff' : COLORS.textMuted} />
        <Text style={[styles.toggleText, value === 'income' && { color: '#fff' }]}>Entrada</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChange('expense')}
        style={[styles.toggleBtn, value === 'expense' && styles.toggleExpense]}
      >
        <Ionicons name="arrow-down" size={16} color={value === 'expense' ? '#fff' : COLORS.textMuted} />
        <Text style={[styles.toggleText, value === 'expense' && { color: '#fff' }]}>Saída</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AddTransactionScreen({ navigation }) {
  const { addTransaction } = useTransactions();
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('food');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(TODAY);

  function handleTypeChange(newType) {
    setType(newType);
    setCategory(newType === 'income' ? 'salary' : 'food');
  }

  function handleSave() {
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!parsed || parsed <= 0) {
      Alert.alert('Valor inválido', 'Insira um valor maior que zero.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Descrição vazia', 'Adicione uma descrição.');
      return;
    }
    addTransaction({ type, category, amount: parsed, description: description.trim(), date });
    navigation.goBack();
  }

  const cats = CATEGORIES[type];

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Transação</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <LinearGradient colors={[COLORS.primary, COLORS.purple]} style={styles.saveBtnGrad}>
            <Text style={styles.saveBtnText}>Salvar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type */}
        <TypeToggle value={type} onChange={handleTypeChange} />

        {/* Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>R$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0,00"
            placeholderTextColor={COLORS.textDim}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>DESCRIÇÃO</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Supermercado"
            placeholderTextColor={COLORS.textDim}
            value={description}
            onChangeText={setDescription}
            returnKeyType="done"
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>CATEGORIA</Text>
          <View style={styles.catGrid}>
            {cats.map((cat) => {
              const active = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.75}
                  onPress={() => setCategory(cat.id)}
                  style={[
                    styles.catChip,
                    active && { borderColor: cat.color, backgroundColor: cat.color + '22' },
                  ]}
                >
                  <Text style={styles.catChipEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.catChipLabel, active && { color: cat.color }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>DATA</Text>
          <TextInput
            style={styles.textInput}
            value={date}
            onChangeText={setDate}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={COLORS.textDim}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        {/* Preview */}
        {amount.length > 0 && description.length > 0 && (
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Prévia</Text>
            <Text style={[
              styles.previewAmount,
              { color: type === 'income' ? COLORS.green : COLORS.red },
            ]}>
              {type === 'income' ? '+' : '-'}{fmt(parseFloat(amount.replace(',', '.')) || 0)}
            </Text>
            <Text style={styles.previewDesc}>{description}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.cardAlt, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  saveBtn: { borderRadius: 12, overflow: 'hidden' },
  saveBtnGrad: { paddingHorizontal: 18, paddingVertical: 10 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  scroll: { padding: 20, gap: 20, paddingBottom: 60 },

  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12,
  },
  toggleIncome: { backgroundColor: COLORS.green },
  toggleExpense: { backgroundColor: COLORS.red },
  toggleText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 15 },

  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardAlt,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 8,
  },
  currencySymbol: { color: COLORS.textMuted, fontSize: 24, fontWeight: '700' },
  amountInput: {
    flex: 1, color: COLORS.textPrimary, fontSize: 36, fontWeight: '800',
  },

  field: { gap: 8 },
  fieldLabel: {
    color: COLORS.textMuted, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 14,
    padding: 16,
    color: COLORS.textPrimary,
    fontSize: 15,
    borderWidth: 2,
    borderColor: COLORS.border,
  },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, backgroundColor: COLORS.cardAlt,
    borderWidth: 2, borderColor: 'transparent',
  },
  catChipEmoji: { fontSize: 16 },
  catChipLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },

  preview: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  previewLabel: { color: COLORS.textDim, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  previewAmount: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  previewDesc: { color: COLORS.textMuted, fontSize: 14 },
});
