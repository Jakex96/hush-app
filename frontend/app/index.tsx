import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHushStore } from '../store/hushStore';
import { getTranslation } from '../constants/translations';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const { isHushActive, loadState, language } = useHushStore();

  useEffect(() => {
    // Load saved state on mount
    loadState();
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

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Language Switcher */}
      <View style={styles.languageContainer}>
        <LanguageSwitcher />
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  languageContainer: {
    position: 'absolute',
    top: SPACING.xxl + SPACING.md,
    right: SPACING.lg,
    zIndex: 10,
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
});
