// SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, TextInput, Alert, LayoutAnimation, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';
import { useTransactions } from './TransactionContext';
import { useTheme } from './ThemeContext';

function SettingItem({ icon, label, value, type = 'chevron', onPress, color, colors }) {
  const itemColor = color || colors.primary;
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.item, { backgroundColor: colors.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: itemColor + '22' }]}>
        <Ionicons name={icon} size={20} color={itemColor} />
      </View>
      <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>{label}</Text>
      {type === 'chevron' && <Ionicons name="chevron-forward" size={18} color={colors.textDim} />}
      {type === 'switch' && <Switch value={value} onValueChange={onPress} trackColor={{ true: colors.primary }} />}
      {value && type === 'text' && <Text style={[styles.itemValue, { color: colors.textDim }]}>{value}</Text>}
    </TouchableOpacity>
  );
}

const CURRENCY_OPTIONS = [
  { id: 'BRL', label: 'Real Brasileiro', symbol: 'R$' },
  { id: 'USD', label: 'Dólar Americano', symbol: '$' },
  { id: 'EUR', label: 'Euro', symbol: '€' },
  { id: 'GBP', label: 'Libra Esterlina', symbol: '£' }
];

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, currency, changeCurrency, subscription, isAdmin } = useTransactions();
  const { colors, themeMode, toggleTheme } = useTheme();
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = React.useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const userInitial = userName.charAt(0).toUpperCase();
  const currentCurrency = CURRENCY_OPTIONS.find(c => c.id === currency);

  React.useEffect(() => {
    if (user) setNewName(userName);
  }, [user]);

  async function handleUpdateName() {
    if (!newName.trim()) return;
    const { error } = await supabase.auth.updateUser({ data: { full_name: newName.trim() } });
    if (error) Alert.alert('Erro', error.message);
    else {
      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado!');
    }
  }

  const toggleDropdown = () => {
    Keyboard.dismiss();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCurrencyDropdown(!showCurrencyDropdown);
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 50), backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.cardAlt }]}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Configurações</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.profileSection, { borderBottomColor: colors.border + '44' }]}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          
          {isEditing ? (
            <View style={styles.editRow}>
              <TextInput
                style={[styles.nameInput, { backgroundColor: colors.cardAlt, color: colors.textPrimary }]}
                value={newName}
                onChangeText={setNewName}
                autoFocus
                placeholderTextColor={colors.textDim}
              />
              <TouchableOpacity onPress={handleUpdateName} style={styles.saveSmallBtn}>
                <Ionicons name="checkmark-circle" size={32} color={colors.green} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={[styles.profileName, { color: colors.textPrimary }]}>{userName}</Text>
              <Text style={[styles.profileEmail, { color: colors.textDim }]}>{user?.email}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={[styles.editProfileBtn, { backgroundColor: colors.cardAlt }]}>
                <Text style={[styles.editProfileText, { color: colors.textPrimary }]}>Editar Perfil</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryLight }]}>Aparência</Text>
          <View style={[styles.themeSelector, { backgroundColor: colors.card }]}>
            {['light', 'dark', 'system'].map((m) => (
              <TouchableOpacity 
                key={m} 
                onPress={() => toggleTheme(m)}
                style={[
                  styles.themeBtn, 
                  themeMode === m && { backgroundColor: colors.primary }
                ]}
              >
                <Text style={[
                  styles.themeText, 
                  { color: themeMode === m ? '#fff' : colors.textDim }
                ]}>
                  {m === 'light' ? 'Claro' : m === 'dark' ? 'Escuro' : 'Sistema'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryLight }]}>Moeda Principal</Text>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={toggleDropdown}
            style={[styles.dropdownHeader, { backgroundColor: colors.card }]}
          >
            <View style={styles.dropdownInfo}>
              <View style={[styles.currencySymbolCircle, { backgroundColor: colors.primary + '22' }]}>
                <Text style={{ color: colors.primary, fontWeight: '800' }}>{currentCurrency.symbol}</Text>
              </View>
              <Text style={[styles.dropdownLabel, { color: colors.textPrimary }]}>{currentCurrency.label}</Text>
            </View>
            <Ionicons name={showCurrencyDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.textDim} />
          </TouchableOpacity>

          {showCurrencyDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: colors.card, borderTopColor: colors.border + '22' }]}>
              {CURRENCY_OPTIONS.map((c) => (
                <TouchableOpacity 
                  key={c.id} 
                  onPress={() => { changeCurrency(c.id); toggleDropdown(); }}
                  style={[styles.dropdownItem, currency === c.id && { backgroundColor: colors.primary + '11' }]}
                >
                  <Text style={[styles.dropdownItemText, { color: colors.textPrimary }, currency === c.id && { color: colors.primary, fontWeight: '700' }]}>
                    {c.label} ({c.symbol})
                  </Text>
                  {currency === c.id && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryLight }]}>Plano</Text>
          <SettingItem 
            icon="diamond-outline" 
            label="Assinatura" 
            value={subscription === 'gold' ? 'Plano Gold ✨' : subscription === 'pro' ? 'Plano Pro 🚀' : 'Plano Grátis'} 
            onPress={() => navigation.navigate('Subscription')} 
            colors={colors}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryLight }]}>Suporte</Text>
          <SettingItem
            icon="chatbubble-ellipses-outline"
            label="Enviar Feedback"
            color={colors.purple}
            onPress={() => navigation.navigate('Feedback')}
            colors={colors}
          />
          {isAdmin && (
            <SettingItem
              icon="shield-checkmark-outline"
              label="Painel de Feedbacks (Admin)"
              color={colors.green}
              onPress={() => navigation.navigate('AdminFeedback')}
              colors={colors}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryLight }]}>Conta</Text>
          <SettingItem 
            icon="log-out-outline" 
            label="Sair da Conta" 
            color={colors.red} 
            onPress={async () => { await supabase.auth.signOut(); }}
            colors={colors}
          />
        </View>
        
        <Text style={[styles.version, { color: colors.textDim }]}>Versão 1.0.0</Text>
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
  profileSection: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, marginHorizontal: 20 },
  avatarLarge: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  profileName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  profileEmail: { fontSize: 14, marginBottom: 16 },
  editProfileBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  editProfileText: { fontSize: 13, fontWeight: '600' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  nameInput: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, fontWeight: '600', minWidth: 200, textAlign: 'center' },
  saveSmallBtn: { padding: 4 },
  section: { marginTop: 32, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 8, gap: 12 },
  iconContainer: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  themeSelector: { flexDirection: 'row', borderRadius: 16, padding: 4, gap: 4 },
  themeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  themeText: { fontSize: 13, fontWeight: '700' },
  dropdownHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 16 },
  dropdownInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  currencySymbolCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dropdownLabel: { fontSize: 15, fontWeight: '600' },
  dropdownList: { marginTop: 4, borderRadius: 16, overflow: 'hidden', borderTopWidth: 1 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  dropdownItemText: { fontSize: 14, fontWeight: '500' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 40 }
});
