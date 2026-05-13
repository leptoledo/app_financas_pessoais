// src/context/TransactionContext.js
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_TRANSACTIONS, MONTHS } from '../constants';

const TransactionContext = createContext(null);

const STORAGE_KEY = '@financas_transactions';

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
  const [loading, setLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setTransactions(JSON.parse(stored));
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  // Persist on change
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)).catch(() => {});
    }
  }, [transactions, loading]);

  // Transactions for selected month
  const monthTransactions = useMemo(() =>
    transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === 2026;
    }),
    [transactions, selectedMonth]
  );

  const totalIncome = useMemo(
    () => monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [monthTransactions]
  );
  const totalExpense = useMemo(
    () => monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [monthTransactions]
  );
  const balance = totalIncome - totalExpense;

  // Last 6 months bar chart data
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const month = (selectedMonth - 5 + i + 12) % 12;
      const tx = transactions.filter((t) => new Date(t.date).getMonth() === month);
      return {
        month: MONTHS[month],
        income: tx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: tx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions, selectedMonth]);

  // Expenses grouped by category
  const expenseByCategory = useMemo(() => {
    const map = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthTransactions]);

  function addTransaction(tx) {
    const newTx = { ...tx, id: Date.now().toString() };
    setTransactions((prev) => [newTx, ...prev]);
  }

  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <TransactionContext.Provider value={{
      transactions,
      monthTransactions,
      totalIncome,
      totalExpense,
      balance,
      monthlyData,
      expenseByCategory,
      selectedMonth,
      setSelectedMonth,
      addTransaction,
      deleteTransaction,
      loading,
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be inside TransactionProvider');
  return ctx;
}
