# Guia de Atualização do Expo (SDK 51 -> 54)

O erro de incompatibilidade ocorre porque o seu iPhone atualizou o aplicativo **Expo Go**, mas o seu projeto ainda usa uma versão antiga. Siga estes passos no terminal para corrigir:

## 1. Atualizar o Expo para a versão 54
Este comando vai atualizar o núcleo do projeto:
```bash
npx expo install expo@^54.0.0
```

## 2. Corrigir dependências automaticamente
O Expo vai ajustar as outras bibliotecas (react, react-native, etc) para as versões compatíveis:
```bash
npx expo install --fix
```

## 3. Corrigir erro de "Babel Preset" (se aparecer tela vermelha)
Se você vir um erro dizendo "Cannot find module 'babel-preset-expo'", rode:
```bash
npm install babel-preset-expo --save-dev
```

## 4. Iniciar com limpeza de cache
Isso garante que nada da versão antiga cause erros no novo servidor:
```bash
npx expo start -c
```

---
**⚠️ AVISO CRÍTICO:**
NUNCA rode `npm audit fix --force`. Isso quebra a compatibilidade do Expo. Se você já rodou, recomece do Passo 1.

**Dica Adicional:**
Se o comando pedir para instalar o `ngrok` e falhar, rode este antes:
```bash
npm install -g @expo/ngrok
```
