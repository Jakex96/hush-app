import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Linking,
  Alert,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHushStore } from '../store/hushStore';
import { useSettingsStore } from '../store/settingsStore';
import { getTranslation } from '../constants/translations';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const { isHushActive, loadState, language } = useHushStore();
  const { allowExternalApps, loadSettings } = useSettingsStore();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<{name: string, url: string} | null>(null);

  useEffect(() => {
    // Load saved state on mount
    loadState();
    loadSettings();
  }, []);

  useEffect(() => {
    // If HUSH mode is active, navigate to hush-mode screen
    if (isHushActive) {
      router.replace('/hush-mode');
    }
  }, [isHushActive]);

  const handleEnterHush = () => {
    router.push('/duration');
  };

  const handleOpenSettings = () => {
    router.push('/settings');
  };

  const handleExternalAppPress = (appName: string, deepLink: string) => {
    setSelectedApp({ name: appName, url: deepLink });
    setShowConfirmModal(true);
  };

  const handleConfirmOpenApp = async () => {
    setShowConfirmModal(false);
    if (!selectedApp) return;

    try {
      const canOpen = await Linking.canOpenURL(selectedApp.url);
      if (canOpen) {
        await Linking.openURL(selectedApp.url);
        console.log('[ExternalApps] Opened:', selectedApp.name);
      } else {
        // Fallback: open app store search
        const storeUrl = Platform.OS === 'ios' 
          ? `https://apps.apple.com/search?term=${encodeURIComponent(selectedApp.name)}`
          : `https://play.google.com/store/search?q=${encodeURIComponent(selectedApp.name)}&c=apps`;
        
        const canOpenStore = await Linking.canOpenURL(storeUrl);
        if (canOpenStore) {
          await Linking.openURL(storeUrl);
        } else {
          Alert.alert(
            'App not found',
            `Install your ${selectedApp.name} app from Google Play / App Store.`
          );
        }
      }
    } catch (error) {
      console.error('[ExternalApps] Error opening app:', error);
      Alert.alert(
        'App not found',
        `Install your ${selectedApp.name} app from Google Play / App Store.`
      );
    }
  };

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <LanguageSwitcher />
        <TouchableOpacity onPress={handleOpenSettings} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="moon" size={120} color={COLORS.accent} />
        </View>

        {/* App Name */}
        <Text style={styles.title}>{t('appName')}</Text>
        <Text style={styles.subtitle}>{t('tagline')}</Text>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{t('homeDescription')}</Text>
        </View>

        {/* Main CTA Button */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={handleEnterHush}
          activeOpacity={0.8}
        >
          <Text style={styles.mainButtonText}>{t('enterHushMode')}</Text>
          <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
        </TouchableOpacity>

        {/* Info Text */}
        <Text style={styles.infoText}>{t('essentialsAccessible')}</Text>

        {/* External Apps Section */}
        {allowExternalApps && (
          <View style={styles.externalAppsSection}>
            <Text style={styles.externalAppsTitle}>External Apps</Text>
            <View style={styles.externalAppsGrid}>
              <TouchableOpacity
                style={styles.externalAppCard}
                onPress={() => handleExternalAppPress('Bank', 'bank://')}
                activeOpacity={0.7}
              >
                <Ionicons name="card-outline" size={32} color={COLORS.accent} />
                <Text style={styles.externalAppLabel}>Bank</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.externalAppCard}
                onPress={() => handleExternalAppPress('Auth', 'authenticator://')}
                activeOpacity={0.7}
              >
                <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.accent} />
                <Text style={styles.externalAppLabel}>Auth</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowConfirmModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Open external app?</Text>
            <Text style={styles.modalBody}>
              This will open an app outside HUSH and pause your focus session. Continue?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleConfirmOpenApp}
              >
                <Text style={styles.modalButtonText}>Open</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    letterSpacing: 4,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxl,
  },
  descriptionContainer: {
    marginBottom: SPACING.xxl * 1.5,
  },
  description: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 36,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: 16,
    width: width - SPACING.xl * 2,
    gap: SPACING.md,
    elevation: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainButtonText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: '700',
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  settingsButton: {
    padding: SPACING.sm,
  },
  externalAppsSection: {
    marginTop: SPACING.xl,
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  externalAppsTitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  externalAppsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  externalAppCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    gap: SPACING.sm,
  },
  externalAppLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: 16,
    width: width - SPACING.xl * 4,
    maxWidth: 400,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: COLORS.background,
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.accent,
  },
  modalButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
});
