import React from 'react';
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
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const { width } = Dimensions.get('window');

const durations = [
  {
    id: 'hour',
    title: '1 Hour',
    subtitle: 'Quick focus session',
    icon: 'time-outline',
    color: COLORS.accent,
  },
  {
    id: 'endOfDay',
    title: 'Until End of Day',
    subtitle: 'Deep work mode',
    icon: 'moon-outline',
    color: COLORS.accent,
  },
];

export default function Duration() {
  const router = useRouter();
  const { setHushMode } = useHushStore();

  const handleSelectDuration = (duration: 'hour' | 'endOfDay') => {
    setHushMode(duration);
    router.replace('/hush-mode');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Duration</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>How long do you{"\n"}want to focus?</Text>
        
        <View style={styles.durationsContainer}>
          {durations.map((duration) => (
            <TouchableOpacity
              key={duration.id}
              style={styles.durationCard}
              onPress={() => handleSelectDuration(duration.id as 'hour' | 'endOfDay')}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name={duration.icon as any}
                  size={48}
                  color={duration.color}
                />
              </View>
              <View style={styles.durationInfo}>
                <Text style={styles.durationTitle}>{duration.title}</Text>
                <Text style={styles.durationSubtitle}>{duration.subtitle}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>
            You won't be able to exit HUSH mode until the time is up
          </Text>
        </View>
      </View>
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
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xxl,
    textAlign: 'center',
    lineHeight: 44,
  },
  durationsContainer: {
    gap: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
    gap: SPACING.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationInfo: {
    flex: 1,
  },
  durationTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  durationSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});