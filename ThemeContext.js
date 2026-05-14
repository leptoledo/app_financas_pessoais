// ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS_DARK, COLORS_LIGHT } from './constants';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('dark'); // Default to 'dark' now

  useEffect(() => {
    AsyncStorage.getItem('@app_theme').then(val => {
      if (val) setThemeMode(val);
    });
  }, []);

  const toggleTheme = async (mode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('@app_theme', mode);
  };

  const isDark = themeMode === 'system' ? systemTheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? COLORS_DARK : COLORS_LIGHT;

  return (
    <ThemeContext.Provider value={{ colors, themeMode, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
