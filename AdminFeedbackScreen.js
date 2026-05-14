// AdminFeedbackScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Image, Modal, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { supabase } from './supabase';

const { width } = Dimensions.get('window');

export default function AdminFeedbackScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setFeedbacks(data || []);
    setLoading(false);
  };

  const getSubjectLabel = (id) => {
    const labels = {
      bug: '🐛 Bug',
      suggestion: '💡 Sugestão',
      feature: '✨ Funcionalidade',
      other: '💬 Outro'
    };
    return labels[id] || id;
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: colors.primary + '22' }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{getSubjectLabel(item.subject)}</Text>
        </View>
        <Text style={[styles.date, { color: colors.textDim }]}>
          {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </Text>
      </View>

      <Text style={[styles.email, { color: colors.textMuted }]}>De: {item.user_email}</Text>
      <Text style={[styles.message, { color: colors.textPrimary }]}>{item.message}</Text>

      {item.screenshot_url && (
        <TouchableOpacity 
          onPress={() => setSelectedImage(item.screenshot_url)}
          style={styles.imageContainer}
        >
          <Image source={{ uri: item.screenshot_url }} style={styles.thumbnail} />
          <View style={styles.imageOverlay}>
            <Ionicons name="expand" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: Math.max(insets.top, 50) }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.cardAlt }]}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Painel de Feedbacks</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={feedbacks}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbox-ellipses-outline" size={60} color={colors.textDim} />
              <Text style={[styles.emptyText, { color: colors.textDim }]}>Nenhum feedback ainda.</Text>
            </View>
          }
        />
      )}

      {/* Image Modal */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.modalBg}>
          <TouchableOpacity 
            style={styles.closeModal} 
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.fullImage} 
              resizeMode="contain" 
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  list: { padding: 20, paddingBottom: 60 },
  card: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  date: { fontSize: 12 },
  email: { fontSize: 13, marginBottom: 8, fontWeight: '500' },
  message: { fontSize: 15, lineHeight: 22 },
  imageContainer: { marginTop: 12, height: 120, borderRadius: 12, overflow: 'hidden' },
  thumbnail: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: width, height: '80%' },
  closeModal: { position: 'absolute', top: 50, right: 20, padding: 10, zIndex: 10 },
});
