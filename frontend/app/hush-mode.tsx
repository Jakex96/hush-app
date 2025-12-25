import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  AppState,
  BackHandler,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHushStore } from '../store/hushStore';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const { width } = Dimensions.get('window');

const ESSENTIAL_APPS = [
  { name: 'Phone', icon: 'call', color: '#4CAF50' },
  { name: 'Messages', icon: 'chatbubbles', color: '#2196F3' },
  { name: 'Maps', icon: 'map', color: '#FF9800' },
  { name: 'Pay', icon: 'card', color: '#9C27B0' },
  { name: 'Music', icon: 'musical-notes', color: '#E91E63' },
  { name: 'Calculator', icon: 'calculator', color: '#607D8B' },
];

export default function HushMode() {
  const router = useRouter();
  const { isHushActive, endTime, deactivateHush } = useHushStore();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Block back button
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        Alert.alert(
          'HUSH Mode Active',
          'You cannot exit HUSH mode until the timer ends.',
          [{ text: 'OK' }]
        );
        return true; // Prevent default behavior
      }
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    // Monitor app state to detect when user leaves the app
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && isHushActive) {
        // User returned to the app - ensure they're on HUSH screen
        router.replace('/hush-mode');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isHushActive]);

  useEffect(() => {
    if (!isHushActive || !endTime) {
      router.replace('/');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        // Timer finished
        deactivateHush();
        Alert.alert(
          'HUSH Mode Complete! 🎉',
          'Great job staying focused!',
          [
            {
              text: 'Done',
              onPress: () => router.replace('/'),
            },
          ]
        );
        return;
      }

      // Calculate time remaining
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      let timeStr = '';
      if (hours > 0) {
        timeStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      setTimeRemaining(timeStr);

      // Calculate progress (for visual effect)
      const totalDuration = endTime - (endTime - remaining);
      const progressPercent = 1 - remaining / totalDuration;
      setProgress(progressPercent);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isHushActive, endTime]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <View style={styles.content}>
        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>HUSH MODE ACTIVE</Text>
        </View>

        {/* Calm Status Display */}
        <View style={styles.statusContainer}>
          <Ionicons name="moon" size={80} color={COLORS.accent} />
          <Text style={styles.hushLabel}>HUSH active</Text>
          <Text style={styles.hushSubtext}>Stay present, stay calm</Text>
          
          {/* Subtle progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
          
          {/* Small time remaining text */}
          <Text style={styles.timeRemainingSmall}>{timeRemaining} remaining</Text>
        </View>

        {/* Essential Apps Section */}
        <View style={styles.appsSection}>
          <Text style={styles.appsTitle}>Essential Apps</Text>
          <View style={styles.appsGrid}>
            {ESSENTIAL_APPS.map((app) => (
              <TouchableOpacity
                key={app.name}
                style={styles.appCard}
                activeOpacity={0.7}
                onPress={() => {
                  Alert.alert(
                    app.name,
                    'In the full version, this would open ' + app.name + '.',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <View style={[styles.appIcon, { backgroundColor: app.color }]}>
                  <Ionicons name={app.icon as any} size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.appName}>{app.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Ionicons name="lock-closed" size={16} color={COLORS.textTertiary} />
          <Text style={styles.infoText}>
            All other apps are blocked until timer ends
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    alignSelf: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
    letterSpacing: 1,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl * 1.5,
    paddingVertical: SPACING.xl,
  },
  hushLabel: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    fontWeight: '300',
    letterSpacing: 2,
  },
  hushSubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  progressBarContainer: {
    width: width - SPACING.xl * 4,
    height: 4,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  timeRemainingSmall: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontSize: 12,
  },
  appsSection: {
    flex: 1,
  },
  appsTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  appCard: {
    width: (width - SPACING.xl * 2 - SPACING.md * 2) / 3,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  appName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
});