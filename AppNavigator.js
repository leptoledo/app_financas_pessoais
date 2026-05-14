// AppNavigator.js
import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import DashboardScreen from './DashboardScreen';
import TransactionsScreen from './TransactionsScreen';
import CategoriesScreen from './CategoriesScreen';
import AddTransactionScreen from './AddTransactionScreen';
import SettingsScreen from './SettingsScreen';
import SubscriptionScreen from './SubscriptionScreen';
import FeedbackScreen from './FeedbackScreen';
import AdminFeedbackScreen from './AdminFeedbackScreen';
import { useTheme } from './ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function FAB({ onPress, colors }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.fabWrapper, { shadowColor: colors.primary }]}>
      <LinearGradient
        colors={[colors.primary, colors.purple]}
        style={styles.fab}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

function TabNavigator({ navigation }) {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [styles.tabBar, { borderTopColor: colors.border }],
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Transações: focused ? 'card' : 'card-outline',
            Categorias: focused ? 'pricetag' : 'pricetag-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen
        name="Adicionar"
        component={DashboardScreen}
        options={{
          tabBarButton: () => (
            <FAB onPress={() => navigation.navigate('AddTransaction')} colors={colors} />
          ),
        }}
      />
      <Tab.Screen name="Transações" component={TransactionsScreen} />
      <Tab.Screen name="Categorias" component={CategoriesScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors, isDark } = useTheme();
  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.bg,
          card: colors.card,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.primary,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Subscription"
          component={SubscriptionScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Feedback"
          component={FeedbackScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="AdminFeedback"
          component={AdminFeedbackScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: { position: 'absolute', height: 80, paddingBottom: 20, paddingTop: 8, borderTopWidth: 1, elevation: 0 },
  tabLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3, marginTop: 2 },
  fabWrapper: { top: -18, alignSelf: 'center', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10 },
  fab: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
