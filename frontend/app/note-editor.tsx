import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNotesStore, type NoteTag } from '../store/notesStore';
import { useHushStore } from '../store/hushStore';
import { getTranslation } from '../constants/translations';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function NoteEditor() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { addNote, updateNote, getNote } = useNotesStore();
  const { language } = useHushStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<NoteTag[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Refs to prevent duplicate saves
  const isSavingRef = useRef(false);
  const hasInitialLoadedRef = useRef(false);
  const lastSavedContentRef = useRef('');

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const isEditMode = !!params.id;

  // Load existing note (edit mode)
  useEffect(() => {
    if (isEditMode && params.id && !hasInitialLoadedRef.current) {
      const note = getNote(params.id);
      if (note) {
        console.log('[NoteEditor] Loading existing note:', params.id);
        setTitle(note.title || '');
        setBody(note.body);
        setPhotoUri(note.photoUri);
        setSelectedTags(note.tags || []);
        lastSavedContentRef.current = note.body;
        hasInitialLoadedRef.current = true;
      }
    }
  }, [params.id, isEditMode]);

  // Auto-save logic (debounced)
  useEffect(() => {
    // Skip if:
    // - No body content
    // - Currently saving
    // - Content hasn't changed from last save
    // - Initial load not complete (prevents double save in StrictMode)
    if (
      !body.trim() ||
      isSavingRef.current ||
      body === lastSavedContentRef.current ||
      (!isEditMode && !hasInitialLoadedRef.current)
    ) {
      return;
    }

    // Mark that we have unsaved changes
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }

    // Debounce save by 1.5 seconds
    const timer = setTimeout(() => {
      if (body.trim() && body !== lastSavedContentRef.current) {
        console.log('[NoteEditor] Auto-saving after inactivity');
        handleSave();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, body, photoUri, selectedTags]);

  const handleSave = async () => {
    // Guard against duplicate saves
    if (isSavingRef.current) {
      console.log('[NoteEditor] Save already in progress, skipping');
      return;
    }

    if (!body.trim()) {
      console.log('[NoteEditor] No content to save');
      return;
    }

    // Check if content actually changed
    if (body === lastSavedContentRef.current && isEditMode) {
      console.log('[NoteEditor] Content unchanged, skipping save');
      return;
    }

    isSavingRef.current = true;
    console.log('[NoteEditor] Saving note...', { isEditMode, id: params.id });

    try {
      if (isEditMode && params.id) {
        await updateNote(params.id, {
          title: title.trim() || undefined,
          body: body.trim(),
          photoUri,
          tags: selectedTags,
        });
        console.log('[NoteEditor] Note updated successfully');
      } else {
        await addNote({
          title: title.trim() || undefined,
          body: body.trim(),
          photoUri,
          tags: selectedTags,
        });
        console.log('[NoteEditor] New note created successfully');
      }
      
      lastSavedContentRef.current = body;
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('[NoteEditor] Error saving note:', error);
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleClose = async () => {
    console.log('[NoteEditor] Closing editor');
    
    // Only save if there's content and unsaved changes
    if (body.trim() && hasUnsavedChanges) {
      console.log('[NoteEditor] Saving before close');
      await handleSave();
    }
    
    router.back();
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          t('cameraPermission'),
          t('cameraPermissionMessage'),
          [{ text: t('ok') }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64 = result.assets[0].base64;
        if (base64) {
          setPhotoUri(`data:image/jpeg;base64,${base64}`);
          setHasUnsavedChanges(true);
        }
      }
    } catch (error) {
      console.error('[NoteEditor] Error taking photo:', error);
    }
  };

  const toggleTag = (tag: NoteTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setHasUnsavedChanges(true);
  };

  const tags: { id: NoteTag; label: string; icon: string; color: string }[] = [
    { id: 'quick', label: t('tagQuick'), icon: 'flash', color: '#4CAF50' },
    { id: 'idea', label: t('tagIdea'), icon: 'bulb', color: '#FF9800' },
    { id: 'urgent', label: t('tagUrgent'), icon: 'alert-circle', color: '#F44336' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? t('editNote') : t('newNote')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Input */}
        <TextInput
          style={styles.titleInput}
          placeholder={t('noteTitlePlaceholder')}
          placeholderTextColor={COLORS.textTertiary}
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            setHasUnsavedChanges(true);
          }}
          maxLength={100}
        />

        {/* Body Input */}
        <TextInput
          style={styles.bodyInput}
          placeholder={t('noteBodyPlaceholder')}
          placeholderTextColor={COLORS.textTertiary}
          value={body}
          onChangeText={(text) => {
            setBody(text);
            setHasUnsavedChanges(true);
            
            // Mark as loaded after first user input (prevents StrictMode duplicate)
            if (!hasInitialLoadedRef.current) {
              hasInitialLoadedRef.current = true;
            }
          }}
          multiline
          textAlignVertical="top"
        />

        {/* Photo */}
        {photoUri && (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUri }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removePhoto}
              onPress={() => {
                setPhotoUri(undefined);
                setHasUnsavedChanges(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        )}

        {/* Tags */}
        <View style={styles.tagsSection}>
          <Text style={styles.tagsLabel}>{t('tags')}</Text>
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tagButton,
                  selectedTags.includes(tag.id) && {
                    backgroundColor: tag.color,
                  },
                ]}
                onPress={() => toggleTag(tag.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tag.icon as any}
                  size={16}
                  color={selectedTags.includes(tag.id) ? COLORS.text : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.tagButtonText,
                    selectedTags.includes(tag.id) && styles.tagButtonTextActive,
                  ]}
                >
                  {tag.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Camera Button */}
        {!photoUri && (
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleTakePhoto}
            activeOpacity={0.7}
          >
            <Ionicons name="camera" size={20} color={COLORS.text} />
            <Text style={styles.cameraButtonText}>{t('attachPhoto')}</Text>
          </TouchableOpacity>
        )}

        {/* Auto-save indicator */}
        {body.trim() && !hasUnsavedChanges && (
          <Text style={styles.autoSaveText}>{t('autoSaved')}</Text>
        )}
      </ScrollView>
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
  headerButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  titleInput: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  bodyInput: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    lineHeight: 24,
    minHeight: 200,
    marginBottom: SPACING.lg,
  },
  photoContainer: {
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  tagsSection: {
    marginBottom: SPACING.lg,
  },
  tagsLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  tagButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tagButtonTextActive: {
    color: COLORS.text,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    borderStyle: 'dashed',
    marginBottom: SPACING.lg,
  },
  cameraButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  autoSaveText: {
    fontSize: 12,
    color: COLORS.success,
    textAlign: 'center',
  },
});
