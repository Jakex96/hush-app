import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore, bankOptions, type BankOption } from '../store/settingsStore';
import { useHushStore } from '../store/hushStore';
import { getTranslation } from '../constants/translations';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { allowExternalApps, selectedBank, setAllowExternalApps, setSelectedBank, loadSettings } = useSettingsStore();
  const { language } = useHushStore();

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggleExternalApps = async (value: boolean) => {
    await setAllowExternalApps(value);
  };

  const handleBankSelect = async (bank: BankOption) => {
    await setSelectedBank(bank);
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* External Apps Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>External Apps</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Allow External Apps</Text>
              <Text style={styles.settingDescription}>
                Enables opening bank apps outside HUSH mode.
              </Text>
            </View>
            <Switch
              value={allowExternalApps}
              onValueChange={handleToggleExternalApps}
              trackColor={{ false: COLORS.textTertiary, true: COLORS.accent }}
              thumbColor={COLORS.surface}
              ios_backgroundColor={COLORS.textTertiary}
            />
          </View>

          {/* Bank Selection */}
          {allowExternalApps && (
            <View style={styles.bankSection}>
              <Text style={styles.bankSectionTitle}>Select Your Bank App</Text>
              {bankOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.bankOption,
                    selectedBank === option.value && styles.bankOptionSelected
                  ]}
                  onPress={() => handleBankSelect(option.value as BankOption)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.bankOptionText,
                    selectedBank === option.value && styles.bankOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {selectedBank === option.value && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  bankSection: {
    marginTop: SPACING.lg,
  },
  bankSectionTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  bankOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bankOptionSelected: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  bankOptionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  bankOptionTextSelected: {
    color: COLORS.accent,
    fontWeight: '600',
  },
});
