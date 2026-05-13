// src/constants/index.js

export const COLORS = {
  bg: '#0f0f14',
  card: '#1a1a24',
  cardAlt: '#1e1e2a',
  border: '#2d2d3d',
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  purple: '#8b5cf6',
  green: '#22c55e',
  greenLight: '#4ade80',
  red: '#ef4444',
  redLight: '#f87171',
  yellow: '#f59e0b',
  cyan: '#06b6d4',
  textPrimary: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#64748b',
  textDim: '#475569',
};

export const MONTHS = [
  'Jan','Fev','Mar','Abr','Mai','Jun',
  'Jul','Ago','Set','Out','Nov','Dez',
];

export const CATEGORIES = {
  income: [
    { id: 'salary',     label: 'Salário',      icon: 'briefcase',       color: '#22c55e', emoji: '💼' },
    { id: 'freelance',  label: 'Freelance',    icon: 'laptop-outline',  color: '#10b981', emoji: '💻' },
    { id: 'investment', label: 'Investimento', icon: 'trending-up',     color: '#06b6d4', emoji: '📈' },
    { id: 'other_in',   label: 'Outros',       icon: 'add-circle',      color: '#84cc16', emoji: '➕' },
  ],
  expense: [
    { id: 'food',       label: 'Alimentação',  icon: 'fast-food',       color: '#f97316', emoji: '🍔' },
    { id: 'transport',  label: 'Transporte',   icon: 'car',             color: '#f59e0b', emoji: '🚗' },
    { id: 'housing',    label: 'Moradia',      icon: 'home',            color: '#ef4444', emoji: '🏠' },
    { id: 'health',     label: 'Saúde',        icon: 'medkit',          color: '#ec4899', emoji: '💊' },
    { id: 'education',  label: 'Educação',     icon: 'book',            color: '#8b5cf6', emoji: '📚' },
    { id: 'leisure',    label: 'Lazer',        icon: 'game-controller', color: '#6366f1', emoji: '🎮' },
    { id: 'shopping',   label: 'Compras',      icon: 'bag',             color: '#a78bfa', emoji: '🛍️' },
    { id: 'other_out',  label: 'Outros',       icon: 'remove-circle',   color: '#94a3b8', emoji: '➖' },
  ],
};

export const ALL_CATEGORIES = [...CATEGORIES.income, ...CATEGORIES.expense];

export function getCat(type, id) {
  return (
    CATEGORIES[type]?.find((c) => c.id === id) || {
      label: id,
      emoji: '💰',
      color: '#94a3b8',
      icon: 'cash',
    }
  );
}

export function fmt(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value ?? 0);
}

export function fmtShort(value) {
  if (value >= 1000) return `R$${(value / 1000).toFixed(1)}k`;
  return `R$${value.toFixed(0)}`;
}

export const INITIAL_TRANSACTIONS = [
  { id: '1', type: 'income',  category: 'salary',    amount: 5500, description: 'Salário Março',   date: '2026-03-05' },
  { id: '2', type: 'expense', category: 'housing',   amount: 1200, description: 'Aluguel',          date: '2026-03-10' },
  { id: '3', type: 'expense', category: 'food',      amount: 320,  description: 'Supermercado',     date: '2026-03-12' },
  { id: '4', type: 'expense', category: 'transport', amount: 180,  description: 'Combustível',      date: '2026-03-14' },
  { id: '5', type: 'income',  category: 'freelance', amount: 1200, description: 'Projeto web',      date: '2026-04-02' },
  { id: '6', type: 'expense', category: 'leisure',   amount: 89,   description: 'Netflix + Spotify',date: '2026-04-05' },
  { id: '7', type: 'expense', category: 'health',    amount: 250,  description: 'Plano de saúde',   date: '2026-04-08' },
  { id: '8', type: 'income',  category: 'salary',    amount: 5500, description: 'Salário Abril',    date: '2026-04-05' },
  { id: '9', type: 'expense', category: 'shopping',  amount: 430,  description: 'Roupas',           date: '2026-04-15' },
  { id:'10', type: 'expense', category: 'food',      amount: 290,  description: 'Restaurantes',     date: '2026-04-18' },
  { id:'11', type: 'income',  category: 'salary',    amount: 5500, description: 'Salário Maio',     date: '2026-05-05' },
  { id:'12', type: 'expense', category: 'housing',   amount: 1200, description: 'Aluguel Maio',     date: '2026-05-10' },
  { id:'13', type: 'expense', category: 'food',      amount: 410,  description: 'Supermercado',     date: '2026-05-11' },
  { id:'14', type: 'income',  category: 'investment',amount: 320,  description: 'Dividendos',       date: '2026-05-12' },
];
