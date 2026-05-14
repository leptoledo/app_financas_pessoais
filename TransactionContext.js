// TransactionContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { supabase } from './supabase';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [currency, setCurrency] = useState('BRL');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // Status da Assinatura: 'free' ou 'gold'
  const [subscription, setSubscription] = useState('free');
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchInitialData = useCallback(async (userObj) => {
    if (!userObj) return;
    setLoading(true);
    
    // Pegar status da assinatura do metadata
    let subStatus = userObj.user_metadata?.subscription || 'free';
    
    // Concede VIP/Admin para o criador
    const vipEmails = [
      'leptoledo@hotmail.com',
      'leandrotoledo@hotmail.com.br',
      'puccihaven@gmail.com',
    ];
    if (vipEmails.includes(userObj.email)) {
      subStatus = 'gold';
    }
    
    setSubscription(subStatus);
    setIsAdmin(userObj.email === 'leptoledo@hotmail.com');

    // 1. Carregar Categorias
    const { data: cats, error: catErr } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userObj.id);

    if (!catErr && cats) {
      if ((cats || []).length === 0 && !userObj.user_metadata?.has_seeded_categories) {
        // Seeding inicial (mesma lógica anterior)
        const defaults = [
          { label: 'Salário', emoji: '💰', color: '#22c55e', type: 'income', user_id: userObj.id },
          { label: 'Aluguel', emoji: '🏠', color: '#ef4444', type: 'expense', user_id: userObj.id },
          { label: 'Alimentação', emoji: '🍔', color: '#f59e0b', type: 'expense', user_id: userObj.id },
          { label: 'Transporte', emoji: '🚗', color: '#3b82f6', type: 'expense', user_id: userObj.id },
          { label: 'Lazer', emoji: '🎬', color: '#7c3aed', type: 'expense', user_id: userObj.id },
        ];
        const { data: seededCats } = await supabase.from('categories').insert(defaults).select();
        await supabase.auth.updateUser({ data: { has_seeded_categories: true } });
        
        const organized = (seededCats || []).reduce((acc, c) => {
          acc[c.type].push(c);
          return acc;
        }, { income: [], expense: [] });
        setCategories(organized);
      } else {
        const organized = cats.reduce((acc, c) => {
          acc[c.type].push(c);
          return acc;
        }, { income: [], expense: [] });
        setCategories(organized);
      }
    }

    // 2. Carregar Transações (Para usuários Free, aplicaremos o filtro de 3 meses depois no UI ou aqui)
    const { data: txs, error: txErr } = await supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', userObj.id)
      .order('date', { ascending: false });

    if (!txErr) setTransactions(txs || []);
    
    // 3. Carregar Moeda
    if (userObj.user_metadata?.currency) {
      setCurrency(userObj.user_metadata.currency);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchInitialData(session.user);
      }
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchInitialData(session.user);
      } else {
        setUser(null);
        setTransactions([]);
      }
    });

    return () => authSub.unsubscribe();
  }, [fetchInitialData]);

  const refresh = () => user && fetchInitialData(user);

  const changeCurrency = async (newCurr) => {
    setCurrency(newCurr);
    await supabase.auth.updateUser({ data: { currency: newCurr } });
  };

  const updateSubscription = async (status) => {
    setSubscription(status);
    await supabase.auth.updateUser({ data: { subscription: status } });
    refresh();
  };

  const deleteTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) refresh();
  };

  const addTransaction = async (tx) => {
    if (!user) return;
    const { error } = await supabase.from('transactions').insert([{ ...tx, user_id: user.id }]);
    if (!error) refresh();
    else Alert.alert('Erro ao salvar', error.message);
  };

  // Lógica de Filtro por Mês e por Plano
  const monthTransactions = useMemo(() => {
    let filtered = transactions;

    // Regra do Plano Free: Apenas últimos 3 meses de histórico
    if (subscription === 'free') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      filtered = filtered.filter(t => new Date(t.date) >= threeMonthsAgo);
    }

    // Filtro do Mês selecionado no UI
    return filtered.filter(t => {
      const d = new Date(t.date);
      return d.getUTCMonth() === month && d.getUTCFullYear() === year;
    });
  }, [transactions, month, year, subscription]);

  // Totais (Baseados no filtro do mês)
  const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  // Dados para o Gráfico (Últimos 6 meses)
  const monthlyData = useMemo(() => {
    const data = [];
    const now = new Date();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();

      const filtered = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getUTCMonth() === m && txDate.getUTCFullYear() === y;
      });

      const inc = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
      const exp = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

      data.push({
        month: months[m],
        income: inc,
        expense: exp,
      });
    }
    return data;
  }, [transactions]);

  // Gastos por Categoria (Para o Dashboard)
  const expenseByCategory = useMemo(() => {
    const counts = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const catName = t.categories?.label || 'Sem Categoria';
        acc[catName] = (acc[catName] || 0) + Number(t.amount);
        return acc;
      }, {});
    
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [monthTransactions]);

  // Limites por plano
  const LIMITS = {
    free: { transactions: 50, categories: 5 },
    pro:  { transactions: 100, categories: 10 },
    gold: { transactions: Infinity, categories: Infinity },
  };
  const currentLimits = LIMITS[subscription] || LIMITS.free;

  // Verificadores de Limite (Para UX)
  const canAddTransaction = (transactions || []).length < currentLimits.transactions;
  const canAddCategory = ((categories?.income || []).length + (categories?.expense || []).length) < currentLimits.categories;

  const fmt = (val) => {
    const symbols = { BRL: 'R$', USD: '$', EUR: '€', GBP: '£' };
    return `${symbols[currency]} ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  return (
    <TransactionContext.Provider value={{
      user, transactions, monthTransactions, categories, 
      loading, currency, month, year, subscription,
      totalIncome, totalExpense, balance, monthlyData, expenseByCategory,
      setMonth, setYear, refresh, changeCurrency, deleteTransaction, addTransaction,
      updateSubscription, canAddTransaction, canAddCategory, fmt, isAdmin
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);
