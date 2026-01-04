import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
    console.log('[Notes] Delete initiated for ID:', id);

    const confirmDelete = () => {
      console.log('[Notes] User confirmed delete for ID:', id);
      performDelete(id);
    };

    if (Platform.OS === 'web') {
      const confirmed = confirm('Delete this note? This action cannot be undone.');
      if (confirmed) {
        confirmDelete();
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
            onPress: confirmDelete,
          },
        ]
      );
    }
  };

  const performDelete = async (id: string) => {
    try {
      console.log('[Notes] Performing delete for ID:', id);
      console.log('[Notes] Notes count before delete:', notes.length);
      
      await deleteNote(id);
      
      console.log('[Notes] Delete complete');
    } catch (error) {
      console.error('[Notes] Delete failed:', error);
      if (Platform.OS === 'web') {
        alert('Failed to delete note. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to delete note. Please try again.');
      }
    }
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
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
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
          extraData={notes.length}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.noteCardContainer}>
              <Pressable
                style={styles.noteCard}
                onPress={() => router.push(`/note-editor?id=${item.id}`)}
              >
                <View style={styles.noteContent}>
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
                  />
                )}
              </Pressable>

              {/* Delete button - Must be outside card Pressable, properly elevated */}
              <Pressable
                style={styles.deleteButton}
                onPress={() => {
                  console.log('[Notes] Trash icon pressed for ID:', item.id);
                  handleDeleteNote(item.id);
                }}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                android_ripple={{ color: 'rgba(255,255,255,0.1)', radius: 18 }}
              >
                {({ pressed }) => (
                  <View style={[
                    styles.deleteButtonInner,
                    pressed && styles.deleteButtonPressed
                  ]}>
                    <Ionicons 
                      name="trash-outline" 
                      size={20} 
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
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/note-editor')}
      >
        <Ionicons name="add" size={32} color={COLORS.text} />
      </Pressable>
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
    paddingRight: 56,
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
    flexWrap: 'wrap',
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
    top: 10,
    right: 10,
    zIndex: 100,
    elevation: 5,
  },
  deleteButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  deleteButtonPressed: {
    backgroundColor: 'rgba(255,107,107,0.15)',
    transform: [{ scale: 0.92 }],
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
