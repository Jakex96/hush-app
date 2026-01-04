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
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHushStore } from '../store/hushStore';
import { useSettingsStore, bankDeepLinks, bankOptions } from '../store/settingsStore';
import { getTranslation } from '../constants/translations';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const { width } = Dimensions.get('window');

const getEssentialApps = (t: (key: any) => string) => [
  { 
    name: t('phone'), 
    icon: 'call', 
    color: '#4CAF50',
    androidPackage: 'com.android.dialer',
    iosUrl: 'tel://',
    route: null,
  },
  { 
    name: t('messages'), 
    icon: 'chatbubbles', 
    color: '#2196F3',
    androidPackage: 'com.android.mms',
    iosUrl: 'sms://',
    route: null,
  },
  {
    name: t('email'),
    icon: 'mail',
    color: '#FF5722',
    androidPackage: 'com.google.android.gm',
    iosUrl: 'mailto://',
    route: null,
  },
  { 
    name: t('maps'), 
    icon: 'map', 
    color: '#FF9800',
    androidPackage: 'com.google.android.apps.maps',
    iosUrl: 'maps://',
    route: null,
  },
  {
    name: t('notes'),
    icon: 'document-text',
    color: '#9C27B0',
    androidPackage: null,
    iosUrl: null,
    route: '/notes',
  },
  { 
    name: t('music'), 
    icon: 'musical-notes', 
    color: '#E91E63',
    androidPackage: 'com.google.android.music',
    iosUrl: 'music://',
    route: null,
  },
  {
    name: t('camera'),
    icon: 'camera',
    color: '#00BCD4',
    androidPackage: 'com.android.camera2',
    iosUrl: null,
    route: null,
  },
  { 
    name: t('calculator'), 
    icon: 'calculator', 
    color: '#607D8B',
    androidPackage: 'com.android.calculator2',
    iosUrl: null,
    route: null,
  },
];

export default function HushMode() {
  const router = useRouter();
  const { isHushActive, endTime, deactivateHush, duration, language, setLanguage } = useHushStore();
  const { allowExternalApps, selectedBank, loadSettings } = useSettingsStore();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [softTimeText, setSoftTimeText] = useState('');
  const [progress, setProgress] = useState(0);
  const [showExactTime, setShowExactTime] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const ESSENTIAL_APPS = getEssentialApps(t);

  useEffect(() => {
    // Block back button
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        Alert.alert(
          t('hushModeActiveAlert'),
          t('cannotExitMessage'),
          [{ text: t('ok') }]
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
          t('hushModeComplete'),
          t('greatJobFocused'),
          [
            {
              text: t('done'),
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
        softText = t('endsToday');
      } else if (hours > 0) {
        softText = hours === 1 ? t('endsInAboutAnHour') : t('endsInFewHours');
      } else if (minutes > 30) {
        softText = t('endsSoon');
      } else {
        softText = t('almostDone');
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

  useEffect(() => {
    // Load settings on mount
    loadSettings();
  }, []);

  // Handle opening settings
  const handleOpenSettings = () => {
    router.push('/settings');
  };

  // Handle bank button press
  const handleBankPress = () => {
    console.log('[HushMode] Bank button pressed');
    console.log('[HushMode] Selected bank:', selectedBank);
    
    if (selectedBank === 'none') {
      Alert.alert(
        'Choose your bank app',
        'Please select your bank app in Settings first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => router.push('/settings') }
        ]
      );
      return;
    }
    
    setShowBankModal(true);
  };

  // Handle confirmed bank opening with platform-specific behavior
  const handleOpenBank = async () => {
    setShowBankModal(false);
    
    const bankName = selectedBank !== 'none' 
      ? bankOptions.find(b => b.value === selectedBank)?.label || 'bank'
      : 'bank';
    
    console.log('[HushMode] Opening bank app - Platform:', Platform.OS);
    console.log('[HushMode] Selected bank:', selectedBank, '/', bankName);
    
    try {
      if (Platform.OS === 'web') {
        // WEB PREVIEW: Show alert with copy link option
        console.log('[HushMode] Web platform detected - showing info alert');
        
        const searchTerm = encodeURIComponent(bankName);
        const storeUrl = `https://play.google.com/store/search?q=${searchTerm}&c=apps`;
        
        Alert.alert(
          'Preview Mode',
          'Store links are blocked in this preview. On a real phone, this opens your bank app or the store.',
          [
            { text: 'OK', style: 'cancel' },
            {
              text: 'Copy link',
              onPress: () => {
                // For web, we can use navigator.clipboard API
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(storeUrl).then(() => {
                    console.log('[HushMode] Store URL copied to clipboard:', storeUrl);
                    Alert.alert('Copied', 'Store link copied to clipboard!');
                  }).catch((err) => {
                    console.error('[HushMode] Failed to copy:', err);
                    Alert.alert('Link', storeUrl);
                  });
                } else {
                  // Fallback: show the URL in an alert
                  console.log('[HushMode] Clipboard not available, showing URL');
                  Alert.alert('Store Link', storeUrl);
                }
              }
            }
          ]
        );
        
      } else {
        // NATIVE (Android/iOS): Try deep link first, then store fallback
        const deepLink = selectedBank !== 'none' ? bankDeepLinks[selectedBank] : '';
        
        if (deepLink) {
          console.log('[HushMode] Trying deep link:', deepLink);
          
          try {
            const canOpen = await Linking.canOpenURL(deepLink);
            console.log('[HushMode] Can open deep link:', canOpen);
            
            if (canOpen) {
              await Linking.openURL(deepLink);
              console.log('[HushMode] ✓ Bank app opened via deep link');
              return;
            } else {
              console.log('[HushMode] Deep link not supported, falling back to store');
            }
          } catch (deepLinkError) {
            console.log('[HushMode] Deep link failed:', deepLinkError);
          }
        } else {
          console.log('[HushMode] No deep link available, using store search');
        }
        
        // Fallback to store search
        const searchTerm = encodeURIComponent(bankName);
        const storeUrl = Platform.OS === 'ios'
          ? `https://apps.apple.com/search?term=${searchTerm}`
          : `https://play.google.com/store/search?q=${searchTerm}&c=apps`;
        
        console.log('[HushMode] Opening store URL:', storeUrl);
        
        const canOpenStore = await Linking.canOpenURL(storeUrl);
        if (canOpenStore) {
          await Linking.openURL(storeUrl);
          console.log('[HushMode] ✓ Store opened');
        } else {
          throw new Error('Cannot open store URL');
        }
      }
      
    } catch (error) {
      console.error('[HushMode] ✗ Error opening bank:', error);
      Alert.alert(
        'Unable to open',
        `Could not open ${bankName} app or store. Please install your bank app manually.`,
        [{ text: 'OK' }]
      );
    }
  };

  // Function to launch essential apps
  const launchApp = async (app: typeof ESSENTIAL_APPS[0]) => {
    try {
      // If app has an in-app route, navigate there
      if (app.route) {
        router.push(app.route);
        return;
      }

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
      
      {/* Header with Back and Settings */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/')}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleOpenSettings}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSettings(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Language / Jazyk</Text>
            
            <View style={styles.languageOptions}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'en' && styles.languageButtonActive
                ]}
                onPress={() => {
                  setLanguage('en');
                  setShowSettings(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.languageButtonText,
                  language === 'en' && styles.languageButtonTextActive
                ]}>English</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'cs' && styles.languageButtonActive
                ]}
                onPress={() => {
                  setLanguage('cs');
                  setShowSettings(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.languageButtonText,
                  language === 'cs' && styles.languageButtonTextActive
                ]}>Čeština</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSettings(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Close / Zavřít</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <View style={styles.content}>
        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{t('hushModeActive')}</Text>
        </View>

        {/* Calm Status Display */}
        <TouchableOpacity 
          style={styles.statusContainer}
          onPress={() => setShowExactTime(!showExactTime)}
          activeOpacity={0.8}
        >
          <Ionicons name="moon" size={48} color={COLORS.accent} />
          <Text style={styles.hushLabel}>{t('hushIsActive')}</Text>
          <Text style={styles.hushSubtext}>{t('stayPresentCalm')}</Text>
          
          {/* Subtle progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
          
          {/* Show either soft text or exact time based on tap */}
          {showExactTime ? (
            <Text style={styles.exactTimeText}>{timeRemaining} {t('remaining')}</Text>
          ) : (
            <Text style={styles.softTimeText}>{softTimeText}</Text>
          )}
          
          <Text style={styles.tapHint}>{showExactTime ? t('tapToHide') : t('tapToShow')}</Text>
        </TouchableOpacity>

        {/* Essential Apps Section */}
        <View style={styles.appsSection}>
          <Text style={styles.appsTitle}>{t('essentialApps')}</Text>
          <View style={styles.appsGrid}>
            {ESSENTIAL_APPS.map((app) => (
              <TouchableOpacity
                key={app.name}
                style={styles.appCard}
                activeOpacity={0.7}
                onPress={() => launchApp(app)}
              >
                <View style={[styles.appIcon, { backgroundColor: app.color }]}>
                  <Ionicons name={app.icon as any} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.appName}>{app.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* External Apps Section */}
        {allowExternalApps && (
          <View style={styles.externalAppsSection}>
            <Text style={styles.sectionSubtitle}>External Apps</Text>
            <TouchableOpacity
              style={styles.externalBankButton}
              onPress={handleBankPress}
              activeOpacity={0.7}
            >
              <Ionicons name="card-outline" size={32} color={COLORS.accent} />
              <Text style={styles.externalBankButtonText}>Bank</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Ionicons name="lock-closed" size={16} color={COLORS.textTertiary} />
          <Text style={styles.infoText}>
            {t('allOtherAppsBlocked')}
          </Text>
        </View>
      </View>

      {/* Bank Confirmation Modal */}
      <Modal
        visible={showBankModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBankModal(false)}
      >
        <Pressable 
          style={styles.bankModalOverlay}
          onPress={() => setShowBankModal(false)}
        >
          <Pressable 
            style={styles.bankModalContent} 
            onPress={(e) => e.stopPropagation()}
          >
            <Ionicons name="card-outline" size={48} color={COLORS.accent} style={{ marginBottom: SPACING.md }} />
            <Text style={styles.bankModalTitle}>Open bank app?</Text>
            <Text style={styles.bankModalBody}>
              This will open an app outside HUSH. Continue?
            </Text>
            <View style={styles.bankModalButtons}>
              <TouchableOpacity
                style={[styles.bankModalButton, styles.bankModalButtonCancel]}
                onPress={() => setShowBankModal(false)}
              >
                <Text style={styles.bankModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bankModalButton, styles.bankModalButtonOpen]}
                onPress={handleOpenBank}
              >
                <Text style={[styles.bankModalButtonText, styles.bankModalButtonOpenText]}>
                  Open
                </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xxl + SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  headerButton: {
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    width: width - SPACING.xl * 4,
    alignItems: 'center',
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  languageOptions: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  languageButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: COLORS.accent,
  },
  languageButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  languageButtonTextActive: {
    color: COLORS.text,
  },
  closeButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  closeButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    alignSelf: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
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
    marginBottom: 0,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  hushLabel: {
    fontSize: 24,
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    fontWeight: '300',
    letterSpacing: 2,
  },
  hushSubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
    fontSize: 13,
  },
  progressBarContainer: {
    width: width - SPACING.xl * 4,
    height: 3,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
    marginTop: SPACING.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  softTimeText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 0,
    marginBottom: 0,
  },
  exactTimeText: {
    ...TYPOGRAPHY.body,
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 0,
    marginBottom: 0,
  },
  tapHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontSize: 10,
    marginTop: SPACING.xs,
    opacity: 0.5,
  },
  appsSection: {
    marginTop: 0,
  },
  appsTitle: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    justifyContent: 'space-between',
  },
  appCard: {
    width: (width - SPACING.lg * 2 - SPACING.xs * 3) / 4,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.xs,
    borderRadius: 10,
  },
  appIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  appName: {
    fontSize: 11,
    color: COLORS.text,
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  infoText: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  externalAppsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  externalBankButton: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
  },
  externalBankButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  bankModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankModalContent: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  bankModalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  bankModalBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  bankModalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  bankModalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  bankModalButtonCancel: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bankModalButtonOpen: {
    backgroundColor: COLORS.accent,
  },
  bankModalButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  bankModalButtonOpenText: {
    color: '#FFFFFF',
  },
});