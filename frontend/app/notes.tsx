import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotesStore } from '../store/notesStore';
import { useHushStore } from '../store/hushStore';
import { getTranslation } from '../constants/translations';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function NotesScreen() {
  const router = useRouter();
  const { notes, loadNotes, deleteNote } = useNotesStore();
  const { language } = useHushStore();

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  useEffect(() => {
    loadNotes();
  }, []);

  const handleDeleteNote = (id: string) => {
    if (__DEV__) {
      console.log('[Notes] trash tapped', id);
    }

    // Cross-platform confirmation
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Delete this note? This cannot be undone.');
      if (confirmed) {
        performDelete(id);
      }
    } else {
      Alert.alert(
        t('deleteNote'),
        t('deleteNoteConfirm'),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('delete'),
            style: 'destructive',
            onPress: () => performDelete(id),
          },
        ]
      );
    }
  };

  const performDelete = async (id: string) => {
    if (__DEV__) {
      console.log('[Notes] confirmed delete', id);
    }
    try {
      await deleteNote(id);
      const remainingNotes = notes.filter(n => n.id !== id);
      if (__DEV__) {
        console.log('[Notes] deleted; new count:', remainingNotes.length);
      }
    } catch (error) {
      console.error('[Notes] Delete failed:', error);
      if (Platform.OS === 'web') {
        alert('Failed to delete note');
      } else {
        Alert.alert('Error', 'Failed to delete note');
      }
    }
  };

  // Long-press fallback for delete
  const handleLongPress = (id: string) => {
    if (__DEV__) {
      console.log('[Notes] long press detected on note', id);
    }
    handleDeleteNote(id);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return `${diffMins}${t('minsAgo')}`;
    if (diffHours < 24) return `${diffHours}${t('hoursAgo')}`;
    if (diffDays < 7) return `${diffDays}${t('daysAgo')}`;
    
    return date.toLocaleDateString();
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'quick': return '#4CAF50';
      case 'idea': return '#FF9800';
      case 'urgent': return '#F44336';
      default: return COLORS.textSecondary;
    }
  };

  const getTagLabel = (tag: string) => {
    switch (tag) {
      case 'quick': return t('tagQuick');
      case 'idea': return t('tagIdea');
      case 'urgent': return t('tagUrgent');
      default: return tag;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notes')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Notes List */}
      {notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.textTertiary} />
          <Text style={styles.emptyText}>{t('noNotes')}</Text>
          <Text style={styles.emptySubtext}>{t('noNotesSubtext')}</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.noteCardContainer} pointerEvents="box-none">
              <Pressable
                style={styles.noteCard}
                onPress={() => router.push(`/note-editor?id=${item.id}`)}
                onLongPress={() => handleLongPress(item.id)}
                delayLongPress={800}
              >
                <View style={styles.noteContent} pointerEvents="none">
                  {item.title && <Text style={styles.noteTitle}>{item.title}</Text>}
                  <Text style={styles.noteBody} numberOfLines={3}>
                    {item.body}
                  </Text>
                  
                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {item.tags.map((tag) => (
                        <View
                          key={tag}
                          style={[styles.tag, { backgroundColor: getTagColor(tag) }]}
                        >
                          <Text style={styles.tagText}>{getTagLabel(tag)}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.noteFooter}>
                    <Text style={styles.noteTime}>{formatTime(item.timestamp)}</Text>
                    {item.photoUri && (
                      <Ionicons name="image" size={16} color={COLORS.textSecondary} />
                    )}
                  </View>
                </View>

                {item.photoUri && (
                  <Image 
                    source={{ uri: item.photoUri }} 
                    style={styles.noteImage}
                    pointerEvents="none"
                  />
                )}
              </Pressable>

              {/* Delete button - Absolutely positioned, elevated, clickable */}
              <Pressable
                style={styles.deleteButton}
                onPress={(e) => {
                  // Stop propagation on web
                  if (Platform.OS === 'web' && e?.nativeEvent) {
                    e.nativeEvent.stopPropagation?.();
                  }
                  if (__DEV__) {
                    console.log('[Notes] 🔥 TRASH PRESSED - ID:', item.id);
                  }
                  handleDeleteNote(item.id);
                }}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                android_ripple={{ color: 'rgba(255,255,255,0.2)', radius: 20 }}
              >
                {({ pressed }) => (
                  <View style={[
                    styles.deleteButtonInner,
                    pressed && styles.deleteButtonPressed
                  ]}>
                    <Ionicons 
                      name="trash-outline" 
                      size={22} 
                      color={pressed ? '#FF6B6B' : COLORS.textSecondary} 
                    />
                  </View>
                )}
              </Pressable>
            </View>
          )}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/note-editor')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color={COLORS.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  noteCardContainer: {
    marginBottom: SPACING.md,
    position: 'relative',
  },
  noteCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    paddingRight: 60, // Space for delete button
    flexDirection: 'row',
    gap: SPACING.md,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  noteBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '600',
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  noteTime: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  noteImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1000,
    elevation: 10,
  },
  deleteButtonInner: {
    padding: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  deleteButtonPressed: {
    backgroundColor: 'rgba(255,107,107,0.2)',
    transform: [{ scale: 0.95 }],
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
