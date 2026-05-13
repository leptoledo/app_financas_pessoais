// constants.js
export const COLORS_DARK = {
  primary: '#4f46e5',
  primaryLight: '#818cf8',
  purple: '#7c3aed',
  bg: '#0f172a',
  card: '#1e293b',
  cardAlt: '#334155',
  border: '#475569',
  textPrimary: '#f8fafc',
  textSecondary: '#e2e8f0',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  green: '#22c55e',
  greenLight: '#4ade80',
  red: '#ef4444',
};

export const COLORS_LIGHT = {
  primary: '#4f46e5',
  primaryLight: '#6366f1',
  purple: '#8b5cf6',
  bg: '#f8fafc',
  card: '#ffffff',
  cardAlt: '#f1f5f9',
  border: '#e2e8f0',
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  textDim: '#94a3b8',
  green: '#16a34a',
  greenLight: '#22c55e',
  red: '#dc2626',
};

// Mantemos o COLORS apontando para o Dark por padrão para não quebrar o código enquanto migramos
export const COLORS = COLORS_DARK;

export const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export const CATEGORIES = {
  income: [
    { id: 'salary', label: 'Salário', emoji: '💰', color: '#22c55e' },
    { id: 'investment', label: 'Investimentos', emoji: '📈', color: '#3b82f6' },
    { id: 'other_income', label: 'Outros', emoji: '💵', color: '#94a3b8' },
  ],
  expense: [
    { id: 'food', label: 'Alimentação', emoji: '🍔', color: '#f59e0b' },
    { id: 'transport', label: 'Transporte', emoji: '🚗', color: '#3b82f6' },
    { id: 'leisure', label: 'Lazer', emoji: '🎮', color: '#ec4899' },
    { id: 'shopping', label: 'Compras', emoji: '🛍️', color: '#7c3aed' },
    { id: 'bills', label: 'Contas', emoji: '📄', color: '#ef4444' },
    { id: 'health', label: 'Saúde', emoji: '🏥', color: '#10b981' },
  ]
};

export function getCat(type, id) {
  const list = CATEGORIES[type] || [];
  return list.find(c => c.id === id) || { label: 'Outro', emoji: '❓', color: '#94a3b8' };
}

export function fmt(value) {
  if (isNaN(value)) return 'R$ 0,00';
  return 'R$ ' + Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtShort(value) {
  if (isNaN(value)) return '0,00';
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const INITIAL_TRANSACTIONS = [];
