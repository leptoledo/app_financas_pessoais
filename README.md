# 💰 Finanças App — React Native + Expo

App de finanças pessoais para iOS e Android com Expo.

---

## 📱 Funcionalidades

- **Dashboard** — Saldo do mês, gráfico de barras 6 meses, gastos por categoria
- **Transações** — Lista filtrada por Todos / Entradas / Saídas, excluir com confirmação
- **Categorias** — Cards com total por categoria no mês selecionado
- **Nova transação** — Modal com tipo, valor, descrição, categoria e data
- **Seletor de mês** — Navegação por mês em todas as telas
- **Persistência** — Dados salvos com AsyncStorage (sobrevive ao fechar o app)

---

## 🚀 Como rodar

### Pré-requisitos

- Node.js 18+ instalado → https://nodejs.org
- Expo CLI: `npm install -g expo-cli`
- App **Expo Go** no celular (iOS App Store / Google Play)

### 1. Instalar dependências

```bash
cd FinancasApp
npm install
```

### 2. Iniciar o projeto

```bash
npx expo start
```

### 3. Abrir no celular

- Abra o app **Expo Go** no celular
- Escaneie o **QR Code** que aparecer no terminal
- O app abre instantaneamente ✅

---

## 🏗️ Estrutura do projeto

```
FinancasApp/
├── App.js                          # Entrada principal
├── app.json                        # Config do Expo
├── package.json                    # Dependências
├── babel.config.js
└── src/
    ├── constants/
    │   └── index.js                # Cores, categorias, dados mock, formatadores
    ├── context/
    │   └── TransactionContext.js   # Estado global + AsyncStorage
    ├── navigation/
    │   └── AppNavigator.js         # Bottom tabs + Stack modal
    └── screens/
        ├── DashboardScreen.js      # Dashboard com gráficos
        ├── TransactionsScreen.js   # Lista de transações
        ├── CategoriesScreen.js     # Grid de categorias
        └── AddTransactionScreen.js # Formulário de nova transação
```

---

## 🎨 Design

- Tema escuro com paleta **Indigo + Violet**
- Bottom navigation com FAB flutuante central
- Gradientes com `expo-linear-gradient`
- Ícones com `@expo/vector-icons` (Ionicons)
- Animações nativas do React Native

---

## 📦 Publicar (opcional)

### Build para iOS/Android com EAS Build

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android   # APK/AAB
eas build --platform ios       # IPA (requer conta Apple Developer)
```

---

## 🔧 Personalização rápida

| O que mudar | Arquivo |
|---|---|
| Cores e tema | `src/constants/index.js` → `COLORS` |
| Categorias | `src/constants/index.js` → `CATEGORIES` |
| Dados iniciais | `src/constants/index.js` → `INITIAL_TRANSACTIONS` |
| Seu nome no header | `src/screens/DashboardScreen.js` linha "Olá, João" |
