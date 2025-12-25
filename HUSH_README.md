# 🌙 HUSH - ADHD-Friendly Focus App

**Find your calm. Block distractions. Stay focused.**

## Overview

HUSH is a minimal, calm Android app designed specifically for people with ADHD who need help blocking distractions. With one tap, you enter HUSH Mode - a distraction-free environment that blocks all non-essential apps for a set duration.

## ✨ Features

### Core Functionality
- **One-Tap Activation**: Simple "Enter HUSH Mode" button - no complicated setup
- **Duration Options** (Free Version):
  - 1 Hour - Quick focus session
  - Until End of Day - Deep work mode
- **App Blocking**: All non-essential apps are blocked during HUSH Mode
- **No Exit**: Cannot exit HUSH Mode until the timer ends (commitment device)
- **Essential Apps Whitelist**: 6 essential apps remain accessible:
  - 📞 Phone (emergency calls always allowed)
  - 💬 Messages (SMS)
  - 🗺️ Maps (navigation)
  - 💳 Pay / Bank (payments)
  - 🎵 Music (audio entertainment)
  - 🧮 Calculator (quick calculations)

### UI/UX Design
- **Default Dark Mode**: Black background (#000000) with deep gray surfaces
- **Soft Accent Color**: Calming purple/blue (#6C63FF)
- **Minimal Design**: One screen at a time, no scrolling needed
- **Large Touch Targets**: Easy to tap, ADHD-friendly
- **High Contrast**: Clear, readable text
- **Big Countdown Timer**: Always visible, shows remaining time

### Technical Features
- **State Persistence**: HUSH Mode survives app restarts via AsyncStorage
- **AppState Monitoring**: Detects when user leaves the app
- **Auto-Return**: Forces user back to HUSH screen if they try to leave
- **Back Button Blocking**: Hardware back button is disabled during HUSH Mode
- **Screen Wake Lock**: Keeps screen awake on mobile devices (not web)
- **Real-Time Countdown**: Updates every second

## 📱 User Flow

1. **Home Screen**
   - Beautiful moon icon
   - "HUSH" title with tagline "Find your calm"
   - Motivational text
   - Large "Enter HUSH Mode" button

2. **Duration Selection**
   - Two clear options with icons:
     - ⏰ 1 Hour - Quick focus session
     - 🌙 Until End of Day - Deep work mode
   - Warning: "You won't be able to exit HUSH mode until the time is up"
   - Back button to return

3. **HUSH Mode Active**
   - "HUSH MODE ACTIVE" badge with green indicator
   - Large countdown timer (MM:SS or HH:MM:SS format)
   - "Essential Apps" section with 6 app cards
   - Lock icon with reminder: "All other apps are blocked until timer ends"

## 🏗️ Technical Architecture

### Tech Stack
- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: expo-router (file-based routing)
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **Icons**: @expo/vector-icons (Ionicons)
- **Screen Management**: expo-keep-awake (mobile only)

### File Structure
```
frontend/
├── app/
│   ├── _layout.tsx          # Root layout with Stack navigator
│   ├── index.tsx            # Home screen
│   ├── duration.tsx         # Duration selection screen
│   └── hush-mode.tsx        # Active HUSH mode screen
├── store/
│   └── hushStore.ts         # Zustand state management
├── constants/
│   └── theme.ts             # Colors, spacing, typography
└── package.json
```

### State Management (Zustand)
```typescript
interface HushState {
  isHushActive: boolean;      // Is HUSH mode currently active?
  endTime: number | null;      // Timestamp when HUSH mode ends
  duration: 'hour' | 'endOfDay' | null;  // Selected duration
  setHushMode: (duration) => void;       // Activate HUSH mode
  deactivateHush: () => void;            // End HUSH mode
  loadState: () => Promise<void>;        // Load from AsyncStorage
}
```

### App Blocking Strategy (Hybrid Approach)

Since native Android app blocking requires custom native modules, this MVP uses a **hybrid approach**:

1. **AppState Monitoring**: Detects when user minimizes the app
2. **Auto-Navigation**: Forces user back to HUSH screen when they return
3. **Back Button Blocking**: Prevents hardware back button exit
4. **State Persistence**: Survives app restarts
5. **Alert Messages**: Educates user that they cannot exit

**Future Enhancement**: Add custom native module using Android's:
- `UsageStatsManager` to monitor app launches
- `Accessibility Service` to block app openings
- `Device Admin` for stronger blocking (Play Store compliant)

## 🎨 Design Philosophy

### Colors
- **Background**: Pure black (#000000) - saves battery on AMOLED
- **Surface**: Dark gray (#1a1a1a, #2a2a2a)
- **Accent**: Soft purple (#6C63FF) - calming, not aggressive
- **Text**: White (#FFFFFF) with gray variants for hierarchy
- **Success**: Green (#4CAF50) for active status

### Typography
- **Large Text**: 72px for countdown timer
- **Clear Hierarchy**: h1 (48px), h2 (36px), h3 (24px)
- **High Contrast**: White text on black background
- **Readable Fonts**: System fonts for consistency

### Spacing
- **8pt Grid**: 8px, 16px, 24px, 32px, 48px
- **Generous Padding**: Prevents cramped feeling
- **Breathing Room**: Calm, spacious layout

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and Yarn
- Expo CLI
- iOS Simulator / Android Emulator / Expo Go app

### Install Dependencies
```bash
cd frontend
yarn install
```

### Run Development Server
```bash
yarn start
```

### Run on Device
- iOS: `yarn ios`
- Android: `yarn android`
- Expo Go: Scan QR code with Expo Go app

## 🧪 Testing

### What Works
✅ All UI screens render correctly  
✅ Navigation flow (Home → Duration → HUSH Mode)  
✅ Duration selection (1 hour / end of day)  
✅ Countdown timer updates every second  
✅ State persistence (survives app restarts)  
✅ Back button blocking on Android  
✅ AppState monitoring  
✅ Auto-return to HUSH screen  
✅ Essential apps grid display  
✅ Dark mode theme  
✅ Responsive layout  

### Limitations (MVP)
⚠️ App blocking is simulated (not native Android blocking)  
⚠️ Essential apps show alert instead of opening actual apps  
⚠️ Screen wake lock only works on native mobile (not web preview)  

### Future Enhancements
🔮 Native Android app blocking with custom module  
🔮 Device Admin integration for stronger blocking  
🔮 Actual intent launching for essential apps  
🔮 Statistics & focus history  
🔮 Custom duration selection  
🔮 White noise / ambient sounds  
🔮 Break reminders  
🔮 Subscription tiers with more features  

## 🚀 Deployment

### Web Preview
The app is currently running as a web preview for demonstration. For production:

### Android APK
```bash
eas build --platform android
```

### Play Store
1. Create custom native module for app blocking
2. Request necessary permissions in AndroidManifest.xml:
   - `PACKAGE_USAGE_STATS`
   - `BIND_ACCESSIBILITY_SERVICE`
3. Provide clear permission explanations (Play Store requirement)
4. Submit for review

## 📋 Play Store Compliance

### Required Permissions
- **Usage Stats**: To detect when user opens blocked apps
- **Accessibility Service**: To block app launches (requires careful justification)

### Permission Explanations
Clear, user-facing explanations must be provided:
- "HUSH needs to monitor which apps you open to enforce focus mode"
- "Accessibility permission allows HUSH to redirect you when you try to open blocked apps"

### Privacy
- ✅ No user accounts required
- ✅ No ads
- ✅ No analytics
- ✅ No data collection
- ✅ All data stays on device

## 🎯 Target Audience

- People with ADHD who struggle with phone distractions
- Users who want a "commitment device" for focus
- Anyone seeking a calm, minimal productivity app
- Students during study sessions
- Professionals during deep work

## 🤝 Contributing

This is an MVP. Future contributions welcome:
- Native Android app blocking module
- iOS version
- More duration options
- Focus statistics
- Customizable app whitelist

## 📄 License

MIT License - Feel free to use and modify

## 💡 Inspiration

HUSH is inspired by:
- Digital wellbeing principles
- ADHD-friendly design patterns
- Commitment devices (Ulysses contracts)
- Calm, intentional technology

---

**Built with ❤️ for people who need a moment of calm in a noisy world.**
