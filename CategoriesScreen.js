// CategoriesScreen.js
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Alert, LayoutAnimation, Keyboard, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from './TransactionContext';
import { useTheme } from './ThemeContext';
import { supabase } from './supabase';
import MonthSelector from './MonthSelector';

const COLORS_PICKER = ['#4f46e5', '#7c3aed', '#ec4899', '#ef4444', '#f59e0b', '#22c55e', '#10b981', '#3b82f6'];
const EMOJI_OPTIONS = ['📁', '🍔', '🍕', '🚗', '🚌', '✈️', '🎮', '🏠', '🏥', '💰', '📈', '🛍️', '📄', '💊', '🎁', '🎓', '🏋️', '💅', '💈', '🎬', '🎧', '💡', '🛠️', '🛒', '🧼'];

function CategoryCard({ cat, amount, type, colors, fmt }) {
  const isEmpty = amount === 0;
  return (
    <View style={[styles.card, { backgroundColor: colors.cardAlt, borderLeftColor: cat.color }]}>
      <Text style={styles.cardEmoji}>{cat.emoji}</Text>
      <Text style={[styles.cardLabel, { color: colors.textMuted }]} numberOfLines={1}>{cat.label}</Text>
      <Text style={[
        styles.cardAmount,
        { color: isEmpty ? colors.textDim : type === 'income' ? colors.green : colors.red },
      ]}>
        {fmt(amount)}
      </Text>
    </View>
  );
}

export default function CategoriesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { monthTransactions = [], categories = { income: [], expense: [] }, fmt, refresh, canAddCategory, subscription } = useTransactions();
  
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' or 'manage'
  const [manageType, setManageType] = useState('expense');
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState(EMOJI_OPTIONS[0]);
  const [newColor, setNewColor] = useState(COLORS_PICKER[0]);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  function totalFor(type, catId) {
    return monthTransactions
      .filter((t) => t.type === type && t.category_id === catId)
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);
  }

  const handleAddCategory = async () => {
    const labelTrimmed = newLabel.trim();
    if (!labelTrimmed) { 
      Alert.alert('Erro', 'Por favor, insira um nome para a categoria.'); 
      return; 
    }

    if (!canAddCategory) {
      Alert.alert(
        'Limite de Categorias 📂',
        'Você atingiu o limite de categorias do seu plano. Faça upgrade para o Pro (10 categorias) ou Gold (ilimitado)!',
        [
          { text: 'Agora não', style: 'cancel' },
          { text: 'Ver Planos', onPress: () => setActiveTab('manage') }
        ]
      );
      // Se quiser navegar direto para a tela de planos:
      navigation.navigate('Subscription');
      return;
    }

    const exists = categories[manageType].some(c => c.label.toLowerCase() === labelTrimmed.toLowerCase());
    if (exists) {
      Alert.alert('Erro', 'Já existe uma categoria com este nome.');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('categories').insert([{ 
      user_id: user.id, 
      label: labelTrimmed, 
      emoji: newEmoji, 
      color: newColor, 
      type: manageType 
    }]);

    if (error) {
      Alert.alert('Erro ao salvar', error.message);
    } else {
      setNewLabel('');
      setShowEmojiPicker(false);
      refresh();
      Keyboard.dismiss();
      Alert.alert('Sucesso', 'Categoria adicionada!');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    Alert.alert('Excluir', 'Deseja excluir esta categoria? Transações vinculadas ficarão sem categoria.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) refresh();
      }}
    ]);
  };

  const handleCleanDuplicates = async () => {
    setLoading(true);
    try {
      const allCats = [...categories.income, ...categories.expense];
      const seen = new Set();
      const duplicates = [];

      allCats.forEach(c => {
        const key = `${c.type}-${c.label.toLowerCase()}`;
        if (seen.has(key)) duplicates.push(c.id);
        else seen.add(key);
      });

      if (duplicates.length > 0) {
        const { error } = await supabase.from('categories').delete().in('id', duplicates);
        if (!error) {
          Alert.alert('Limpeza Concluída', `${duplicates.length} duplicatas removidas.`);
          refresh();
        }
      } else {
        Alert.alert('Tudo certo', 'Nenhuma duplicata encontrada.');
      }
    } catch (e) {}
    setLoading(false);
  };

  const switchTab = (tab) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: Math.max(insets.top, 60) }]}>
      <View style={[styles.header, { marginBottom: 8 }]}>
        <View>
          <Text style={[styles.headerSub, { color: colors.primary }]}>Organização</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Categorias</Text>
        </View>
        {activeTab === 'manage' && (
          <TouchableOpacity onPress={handleCleanDuplicates} style={[styles.cleanBtn, { backgroundColor: colors.red + '22' }]}>
            <Ionicons name="sparkles-outline" size={20} color={colors.red} />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.cardAlt }]}>
        <TouchableOpacity 
          onPress={() => switchTab('analysis')}
          style={[styles.tabBtn, activeTab === 'analysis' && { backgroundColor: colors.card, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]}
        >
          <Ionicons name="pie-chart-outline" size={18} color={activeTab === 'analysis' ? colors.primary : colors.textDim} />
          <Text style={[styles.tabText, { color: activeTab === 'analysis' ? colors.textPrimary : colors.textDim }]}>Análise</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => switchTab('manage')}
          style={[styles.tabBtn, activeTab === 'manage' && { backgroundColor: colors.card, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]}
        >
          <Ionicons name="settings-outline" size={18} color={activeTab === 'manage' ? colors.primary : colors.textDim} />
          <Text style={[styles.tabText, { color: activeTab === 'manage' ? colors.textPrimary : colors.textDim }]}>Gerenciar</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'analysis' ? (
        <>
          <MonthSelector />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: colors.green }]} />
                <Text style={[styles.sectionTitle, { color: colors.green }]}>Entradas</Text>
              </View>
              <View style={styles.grid}>
                {(categories?.income || []).map((cat) => (
                  <CategoryCard key={cat.id} cat={cat} amount={totalFor('income', cat.id)} type="income" colors={colors} fmt={fmt} />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: colors.red }]} />
                <Text style={[styles.sectionTitle, { color: colors.red }]}>Saídas</Text>
              </View>
              <View style={styles.grid}>
                {(categories?.expense || []).map((cat) => (
                  <CategoryCard key={cat.id} cat={cat} amount={totalFor('expense', cat.id)} type="expense" colors={colors} fmt={fmt} />
                ))}
              </View>
            </View>
          </ScrollView>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.manageScroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.manageTypeSelector, { backgroundColor: colors.cardAlt }]}>
            <TouchableOpacity onPress={() => setManageType('income')} style={[styles.manageTypeBtn, manageType === 'income' && { backgroundColor: colors.green }]}>
              <Text style={[styles.manageTypeText, { color: manageType === 'income' ? '#fff' : colors.textDim }]}>Entradas</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setManageType('expense')} style={[styles.manageTypeBtn, manageType === 'expense' && { backgroundColor: colors.red }]}>
              <Text style={[styles.manageTypeText, { color: manageType === 'expense' ? '#fff' : colors.textDim }]}>Saídas</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.addCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.miniTitle, { color: colors.primaryLight }]}>Nova Categoria</Text>
            <View style={styles.inputRow}>
              <TouchableOpacity 
                onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                style={[styles.emojiBtn, { backgroundColor: colors.cardAlt }]}
              >
                <Text style={styles.emojiMainText}>{newEmoji}</Text>
                <View style={[styles.emojiEditBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="pencil" size={8} color="#fff" />
                </View>
              </TouchableOpacity>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.cardAlt, color: colors.textPrimary }]}
                placeholder="Nome..."
                placeholderTextColor={colors.textDim}
                value={newLabel}
                onChangeText={setNewLabel}
              />
              <TouchableOpacity 
                onPress={handleAddCategory}
                disabled={loading}
                style={[styles.addCircle, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {showEmojiPicker && (
              <View style={styles.emojiPicker}>
                {EMOJI_OPTIONS.map(e => (
                  <TouchableOpacity key={e} onPress={() => { setNewEmoji(e); setShowEmojiPicker(false); }} style={styles.emojiOption}>
                    <Text style={styles.emojiOptionText}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.colorRow}>
              {COLORS_PICKER.map(c => (
                <TouchableOpacity 
                  key={c} 
                  onPress={() => setNewColor(c)}
                  style={[styles.colorDot, { backgroundColor: c }, newColor === c && { borderColor: colors.textPrimary, borderWidth: 2 }]}
                />
              ))}
            </View>
          </View>

          <View style={styles.listSection}>
            <Text style={[styles.miniTitle, { color: colors.primaryLight, marginBottom: 12 }]}>Lista de {manageType === 'income' ? 'Entradas' : 'Saídas'}</Text>
            {(categories?.[manageType] || []).map((item) => (
              <View key={item.id} style={[styles.catRow, { backgroundColor: colors.card }]}>
                <View style={[styles.catIcon, { backgroundColor: item.color + '22' }]}>
                  <Text style={styles.catEmojiText}>{item.emoji}</Text>
                </View>
                <Text style={[styles.catLabelText, { color: colors.textPrimary }]}>{item.label}</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.rowDeleteBtn}>
                  <Ionicons name="trash-outline" size={18} color={colors.red} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerSub: { fontSize: 10, fontWeight: '800', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 4, opacity: 0.6 },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  cleanBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', marginHorizontal: 20, marginTop: 10, borderRadius: 12, padding: 4, gap: 4 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10 },
  tabText: { fontSize: 13, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 100 },
  manageScroll: { padding: 20, paddingBottom: 100 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47.5%', borderRadius: 16, padding: 16, borderLeftWidth: 3 },
  cardEmoji: { fontSize: 26, marginBottom: 10 },
  cardLabel: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  cardAmount: { fontSize: 16, fontWeight: '700' },
  manageTypeSelector: { flexDirection: 'row', borderRadius: 10, padding: 4, marginBottom: 20 },
  manageTypeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  manageTypeText: { fontSize: 12, fontWeight: '700' },
  addCard: { padding: 16, borderRadius: 20, marginBottom: 24 },
  miniTitle: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 12 },
  emojiBtn: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  emojiMainText: { fontSize: 22 },
  emojiEditBadge: { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  input: { flex: 1, height: 48, borderRadius: 12, paddingHorizontal: 12, fontSize: 14, fontWeight: '600' },
  addCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emojiPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 10, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 12, marginBottom: 16, justifyContent: 'center' },
  emojiOption: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  emojiOptionText: { fontSize: 20 },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  colorDot: { width: 24, height: 24, borderRadius: 12 },
  listSection: { marginTop: 10 },
  catRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, marginBottom: 8, gap: 12 },
  catIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catEmojiText: { fontSize: 18 },
  catLabelText: { flex: 1, fontSize: 14, fontWeight: '600' },
  rowDeleteBtn: { padding: 4 }
});
