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
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHushStore } from '../store/hushStore';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const { width } = Dimensions.get('window');

const ESSENTIAL_APPS = [
  { 
    name: 'Phone', 
    icon: 'call', 
    color: '#4CAF50',
    androidPackage: 'com.android.dialer',
    iosUrl: 'tel://',
  },
  { 
    name: 'Messages', 
    icon: 'chatbubbles', 
    color: '#2196F3',
    androidPackage: 'com.android.mms',
    iosUrl: 'sms://',
  },
  { 
    name: 'Maps', 
    icon: 'map', 
    color: '#FF9800',
    androidPackage: 'com.google.android.apps.maps',
    iosUrl: 'maps://',
  },
  { 
    name: 'Pay', 
    icon: 'card', 
    color: '#9C27B0',
    androidPackage: 'com.google.android.apps.walletnfcrel',
    iosUrl: null,
  },
  { 
    name: 'Music', 
    icon: 'musical-notes', 
    color: '#E91E63',
    androidPackage: 'com.google.android.music',
    iosUrl: 'music://',
  },
  { 
    name: 'Calculator', 
    icon: 'calculator', 
    color: '#607D8B',
    androidPackage: 'com.android.calculator2',
    iosUrl: null,
  },
];

export default function HushMode() {
  const router = useRouter();
  const { isHushActive, endTime, deactivateHush, duration } = useHushStore();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [softTimeText, setSoftTimeText] = useState('');
  const [progress, setProgress] = useState(0);
  const [showExactTime, setShowExactTime] = useState(false);

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

      // Set soft time text (non-stressful)
      let softText = '';
      if (duration === 'endOfDay') {
        softText = 'Ends today';
      } else if (hours > 0) {
        softText = hours === 1 ? 'Ends in about an hour' : `Ends in a few hours`;
      } else if (minutes > 30) {
        softText = 'Ends soon';
      } else {
        softText = 'Almost done';
      }
      setSoftTimeText(softText);

      // Calculate progress (for visual effect)
      const totalDuration = endTime - (endTime - remaining);
      const progressPercent = 1 - remaining / totalDuration;
      setProgress(progressPercent);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isHushActive, endTime]);

  // Function to launch essential apps
  const launchApp = async (app: typeof ESSENTIAL_APPS[0]) => {
    try {
      if (Platform.OS === 'android') {
        // Try to open Android app via package name
        const url = `intent://#Intent;package=${app.androidPackage};end`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          // Fallback: Show which app to open
          Alert.alert(
            app.name,
            `Please open ${app.name} from your app drawer.`,
            [{ text: 'OK' }]
          );
        }
      } else if (Platform.OS === 'ios' && app.iosUrl) {
        // iOS URL scheme
        const canOpen = await Linking.canOpenURL(app.iosUrl);
        if (canOpen) {
          await Linking.openURL(app.iosUrl);
        } else {
          Alert.alert(
            app.name,
            `Please open ${app.name} from your home screen.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        // Web or unsupported platform
        Alert.alert(
          app.name,
          `${app.name} will open automatically on a real device.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error(`Error launching ${app.name}:`, error);
      Alert.alert(
        app.name,
        `Please open ${app.name} manually from your device.`,
        [{ text: 'OK' }]
      );
    }
  };

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
        <TouchableOpacity 
          style={styles.statusContainer}
          onPress={() => setShowExactTime(!showExactTime)}
          activeOpacity={0.8}
        >
          <Ionicons name="moon" size={56} color={COLORS.accent} />
          <Text style={styles.hushLabel}>HUSH is active</Text>
          <Text style={styles.hushSubtext}>Stay present, stay calm</Text>
          
          {/* Subtle progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
          
          {/* Show either soft text or exact time based on tap */}
          {showExactTime ? (
            <Text style={styles.exactTimeText}>{timeRemaining} remaining</Text>
          ) : (
            <Text style={styles.softTimeText}>{softTimeText}</Text>
          )}
          
          <Text style={styles.tapHint}>Tap to {showExactTime ? 'hide' : 'show'} exact time</Text>
        </TouchableOpacity>

        {/* Essential Apps Section */}
        <View style={styles.appsSection}>
          <Text style={styles.appsTitle}>Essential Apps</Text>
          <View style={styles.appsGrid}>
            {ESSENTIAL_APPS.map((app) => (
              <TouchableOpacity
                key={app.name}
                style={styles.appCard}
                activeOpacity={0.7}
                onPress={() => launchApp(app)}
              >
                <View style={[styles.appIcon, { backgroundColor: app.color }]}>
                  <Ionicons name={app.icon as any} size={28} color="#FFFFFF" />
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
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
    marginBottom: SPACING.md,
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
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  hushLabel: {
    fontSize: 28,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    fontWeight: '300',
    letterSpacing: 2,
  },
  hushSubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
    fontSize: 15,
  },
  progressBarContainer: {
    width: width - SPACING.xl * 4,
    height: 3,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  softTimeText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  exactTimeText: {
    ...TYPOGRAPHY.body,
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tapHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontSize: 10,
    marginTop: SPACING.xs,
    opacity: 0.5,
  },
  appsSection: {
    marginTop: SPACING.sm,
  },
  appsTitle: {
    fontSize: 20,
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  appCard: {
    width: (width - SPACING.xl * 2 - SPACING.sm * 2) / 3,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: 12,
  },
  appIcon: {
    width: 48,
    height: 48,
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