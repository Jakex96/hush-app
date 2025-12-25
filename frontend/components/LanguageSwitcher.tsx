import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useHushStore } from '../store/hushStore';
import { COLORS, SPACING } from '../constants/theme';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useHushStore();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'cs' : 'en';
    setLanguage(newLang);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleLanguage}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{language === 'en' ? 'EN' : 'CZ'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  text: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
