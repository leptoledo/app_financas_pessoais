// AddTransactionScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, LayoutAnimation, Keyboard
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from './TransactionContext';
import { useTheme } from './ThemeContext';

const TODAY = new Date();

function TypeToggle({ value, onChange, colors }) {
  return (
    <View style={[styles.toggleContainer, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChange('income')}
        style={[styles.toggleBtn, value === 'income' && { backgroundColor: colors.green }]}
      >
        <Ionicons name="arrow-up" size={16} color={value === 'income' ? '#fff' : colors.textMuted} />
        <Text style={[styles.toggleText, { color: colors.textMuted }, value === 'income' && { color: '#fff' }]}>Entrada</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChange('expense')}
        style={[styles.toggleBtn, value === 'expense' && { backgroundColor: colors.red }]}
      >
        <Ionicons name="arrow-down" size={16} color={value === 'expense' ? '#fff' : colors.textMuted} />
        <Text style={[styles.toggleText, { color: colors.textMuted }, value === 'expense' && { color: '#fff' }]}>Saída</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AddTransactionScreen({ navigation }) {
  const { addTransaction, categories, currency, canAddTransaction } = useTransactions();
  const { colors, isDark } = useTheme();
  
  const currencySymbol = 
    currency === 'USD' ? '$' : 
    currency === 'EUR' ? '€' : 
    currency === 'GBP' ? '£' : 'R$';

  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(TODAY);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const cats = categories[type] || [];
  const selectedCat = cats.find(c => c.id === category);

  React.useEffect(() => {
    if ((cats || []).length > 0) setCategory(cats[0].id);
    else setCategory(null);
  }, [type, categories]);

  const toggleDropdown = () => {
    Keyboard.dismiss();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCatDropdown(!showCatDropdown);
  };

  const openDatePicker = () => {
    Keyboard.dismiss();
    if (!canAddTransaction) {
      Alert.alert(
        'Limite Atingido 🚀',
        'Você atingiu o limite de transações do seu plano. Faça upgrade para o Plano Pro (100 transações) ou Gold (ilimitado)!',
        [
          { text: 'Agora não', style: 'cancel' },
          { text: 'Ver Planos', onPress: () => navigation.navigate('Subscription') }
        ]
      );
      return;
    }
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  function handleSave() {
    if (!category) { 
      Alert.alert('Erro', 'Selecione uma categoria.'); 
      return; 
    }
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!parsed || parsed <= 0) { 
      Alert.alert('Valor inválido', 'Insira um valor maior que zero.'); 
      return; 
    }
    if (!description.trim()) { 
      Alert.alert('Descrição vazia', 'Adicione uma descrição.'); 
      return; 
    }

    addTransaction({ 
      type, 
      category_id: category, 
      amount: parsed, 
      description: description.trim(), 
      date: date.toISOString() 
    });
    navigation.goBack();
  }

  const formattedDate = date.toLocaleDateString('pt-BR');

  return (
    <KeyboardAvoidingView style={[styles.screen, { backgroundColor: colors.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.closeBtn, { backgroundColor: colors.cardAlt }]}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Nova Transação</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <LinearGradient colors={[colors.primary, colors.purple]} style={styles.saveBtnGrad}>
            <Text style={styles.saveBtnText}>Salvar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="handled"
      >
        <TypeToggle value={type} onChange={setType} colors={colors} />

        <View style={[styles.amountContainer, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
          <Text style={[styles.currencySymbol, { color: colors.textMuted }]}>{currencySymbol}</Text>
          <TextInput
            style={[styles.amountInput, { color: colors.textPrimary }]}
            placeholder="0,00"
            placeholderTextColor={colors.textDim}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>DESCRIÇÃO</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.cardAlt, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Ex: Supermercado"
            placeholderTextColor={colors.textDim}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>CATEGORIA</Text>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={toggleDropdown}
            style={[styles.dropdownHeader, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
          >
            {selectedCat ? (
              <View style={styles.dropdownInfo}>
                <Text style={styles.dropdownEmoji}>{selectedCat.emoji}</Text>
                <Text style={[styles.dropdownLabel, { color: colors.textPrimary }]}>{selectedCat.label}</Text>
              </View>
            ) : (
              <Text style={[styles.dropdownLabel, { color: colors.textDim }]}>Selecione uma categoria</Text>
            )}
            <Ionicons name={showCatDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.textDim} />
          </TouchableOpacity>

          {showCatDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
              {(cats || []).map((cat) => (
                <TouchableOpacity 
                  key={cat.id} 
                  onPress={() => { setCategory(cat.id); toggleDropdown(); }}
                  style={[styles.dropdownItem, category === cat.id && { backgroundColor: colors.primary + '22' }]}
                >
                  <View style={styles.dropdownInfo}>
                    <Text style={styles.dropdownEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.dropdownItemText, { color: colors.textPrimary }, category === cat.id && { color: cat.color, fontWeight: '700' }]}>
                      {cat.label}
                    </Text>
                  </View>
                  {category === cat.id && <Ionicons name="checkmark" size={18} color={cat.color} />}
                </TouchableOpacity>
              ))}
              {(cats || []).length === 0 && (
                <Text style={[styles.emptyText, { color: colors.textDim }]}>Nenhuma categoria disponível</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>DATA</Text>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={openDatePicker}
            style={[styles.textInput, { backgroundColor: colors.cardAlt, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 15 }}>{formattedDate}</Text>
            <Ionicons name="calendar-outline" size={20} color={colors.textDim} />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onDateChange}
              themeVariant={isDark ? 'dark' : 'light'}
            />
          )}
          {showDatePicker && Platform.OS === 'ios' && (
            <TouchableOpacity 
              onPress={() => setShowDatePicker(false)}
              style={{ alignSelf: 'flex-end', marginTop: 10, padding: 8 }}
            >
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Confirmar</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  closeBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  saveBtn: { borderRadius: 12, overflow: 'hidden' },
  saveBtnGrad: { paddingHorizontal: 18, paddingVertical: 10 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  scroll: { padding: 20, gap: 20, paddingBottom: 60 },
  toggleContainer: { flexDirection: 'row', borderRadius: 16, padding: 4, gap: 4 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  toggleText: { fontWeight: '700', fontSize: 15 },
  amountContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 20, borderWidth: 2, gap: 8 },
  currencySymbol: { fontSize: 24, fontWeight: '700' },
  amountInput: { flex: 1, fontSize: 36, fontWeight: '800', outlineStyle: 'none' },
  field: { gap: 8 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  textInput: { borderRadius: 14, padding: 16, fontSize: 15, borderWidth: 2, outlineStyle: 'none' },
  dropdownHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 14, borderWidth: 2 },
  dropdownInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dropdownEmoji: { fontSize: 18 },
  dropdownLabel: { fontSize: 15, fontWeight: '600' },
  dropdownList: { marginTop: 4, borderRadius: 14, overflow: 'hidden', borderWidth: 2 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  dropdownItemText: { fontSize: 14, fontWeight: '500' },
  emptyText: { textAlign: 'center', padding: 20, fontSize: 14 }
});
