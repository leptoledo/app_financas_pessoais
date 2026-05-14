// FeedbackScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from './ThemeContext';
import { useTransactions } from './TransactionContext';
import { supabase } from './supabase';

const SUBJECTS = [
  { id: 'bug', label: '🐛 Reportar Bug' },
  { id: 'suggestion', label: '💡 Sugestão' },
  { id: 'feature', label: '✨ Nova Funcionalidade' },
  { id: 'other', label: '💬 Outro' },
];

export default function FeedbackScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useTransactions();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para enviar screenshots.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setScreenshot(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!subject) {
      Alert.alert('Assunto obrigatório', 'Por favor selecione um assunto.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      Alert.alert('Mensagem muito curta', 'Por favor descreva melhor o seu feedback (mínimo 10 caracteres).');
      return;
    }

    setLoading(true);
    try {
      let screenshotUrl = null;

      // Upload screenshot se existir
      if (screenshot?.base64) {
        const fileName = `feedback_${user?.id}_${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('feedbacks')
          .upload(fileName, decode(screenshot.base64), {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('feedbacks').getPublicUrl(fileName);
          screenshotUrl = urlData?.publicUrl;
        }
      }

      // Salva feedback no banco
      const { error } = await supabase.from('feedbacks').insert({
        user_id: user?.id,
        user_email: user?.email,
        subject,
        message: message.trim(),
        screenshot_url: screenshotUrl,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert(
        'Obrigado! 🙏',
        'Seu feedback foi enviado com sucesso. Vamos analisar e melhorar o app para você!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível enviar o feedback. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Helper para decodificar base64
  function decode(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: Math.max(insets.top, 50) }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.cardAlt }]}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Feedback</Text>
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>Ajude-nos a melhorar</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Assunto */}
          <Text style={[styles.label, { color: colors.textMuted }]}>ASSUNTO</Text>
          <View style={styles.subjectsGrid}>
            {SUBJECTS.map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSubject(s.id)}
                style={[
                  styles.subjectChip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  subject === s.id && { backgroundColor: colors.primary + '22', borderColor: colors.primary },
                ]}
              >
                <Text style={[
                  styles.subjectChipText,
                  { color: colors.textMuted },
                  subject === s.id && { color: colors.primaryLight, fontWeight: '700' },
                ]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Mensagem */}
          <Text style={[styles.label, { color: colors.textMuted }]}>MENSAGEM</Text>
          <TextInput
            style={[styles.messageInput, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Descreva seu feedback em detalhes..."
            placeholderTextColor={colors.textDim}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={[styles.charCount, { color: colors.textDim }]}>{message.length}/1000</Text>

          {/* Screenshot */}
          <Text style={[styles.label, { color: colors.textMuted }]}>SCREENSHOT (OPCIONAL)</Text>
          <TouchableOpacity
            onPress={pickImage}
            style={[styles.uploadArea, {
              backgroundColor: colors.card,
              borderColor: screenshot ? colors.primary : colors.border,
              borderStyle: screenshot ? 'solid' : 'dashed',
            }]}
            activeOpacity={0.75}
          >
            {screenshot ? (
              <View style={styles.screenshotPreview}>
                <Image source={{ uri: screenshot.uri }} style={styles.previewImage} resizeMode="cover" />
                <TouchableOpacity
                  style={[styles.removeBtn, { backgroundColor: colors.red }]}
                  onPress={() => setScreenshot(null)}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={[styles.uploadIcon, { backgroundColor: colors.cardAlt }]}>
                  <Ionicons name="image-outline" size={28} color={colors.textDim} />
                </View>
                <Text style={[styles.uploadText, { color: colors.textMuted }]}>Toque para selecionar uma imagem</Text>
                <Text style={[styles.uploadHint, { color: colors.textDim }]}>JPG, PNG • Máx. 5MB</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Botão Enviar */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Enviar Feedback</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerSub: { fontSize: 12, marginTop: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 10, marginTop: 24 },
  subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  subjectChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
  subjectChipText: { fontSize: 13, fontWeight: '600' },
  messageInput: {
    borderRadius: 16, borderWidth: 1, padding: 16,
    fontSize: 15, minHeight: 140, lineHeight: 22,
  },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: 6 },
  uploadArea: {
    borderRadius: 16, borderWidth: 2, overflow: 'hidden',
    minHeight: 140, justifyContent: 'center', alignItems: 'center',
  },
  uploadPlaceholder: { alignItems: 'center', gap: 10, padding: 28 },
  uploadIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  uploadText: { fontSize: 14, fontWeight: '600' },
  uploadHint: { fontSize: 12 },
  screenshotPreview: { width: '100%', position: 'relative' },
  previewImage: { width: '100%', height: 200 },
  removeBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, borderRadius: 16, marginTop: 32,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
