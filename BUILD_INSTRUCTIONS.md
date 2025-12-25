# Building HUSH Android APK

## Prerequisites

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```
   (Create a free Expo account at expo.dev if you don't have one)

3. **Configure the project**
   ```bash
   cd frontend
   eas build:configure
   ```

## Building the APK

### Option 1: Cloud Build (Recommended)
Build the APK using Expo's cloud service:

```bash
cd frontend
eas build --platform android --profile preview
```

This will:
- Upload your code to Expo's servers
- Build the APK in the cloud
- Provide a download link when complete (usually 10-20 minutes)
- APK will be ready to install on any Android device

### Option 2: Local Build
Build the APK locally (requires Android SDK):

```bash
cd frontend
eas build --platform android --profile preview --local
```

### Option 3: Development Build
For faster iteration during development:

```bash
cd frontend
eas build --platform android --profile development
```

## Installing the APK

1. **Download the APK** from the link provided by EAS Build
2. **Transfer to your Android phone** via:
   - Email attachment
   - Cloud storage (Google Drive, Dropbox)
   - USB cable
   - Direct download on phone

3. **Install on Android:**
   - Open the APK file on your phone
   - Allow "Install from unknown sources" if prompted
   - Tap "Install"
   - Open HUSH app

## Build Profiles

- **development**: For testing with Expo Go features
- **preview**: For internal testing (APK)
- **production**: For Play Store release

## Important Notes

### Current Limitations (Free Version)
- 2 duration options: 1 hour, Until end of day
- 8 essential apps
- 2 languages: English, Czech
- Hybrid app blocking (not native blocking yet)

### Future Premium Features (€6.99)
- Custom time durations
- Advanced app blocking (native)
- Usage statistics
- Custom app whitelist
- More themes
- Scheduled HUSH modes

## Troubleshooting

### Build fails
```bash
# Clear cache and retry
cd frontend
rm -rf node_modules
yarn install
eas build --platform android --profile preview --clear-cache
```

### App crashes on device
- Check Android version (requires Android 6.0+)
- Check logs: `adb logcat | grep -i hush`

### "Install blocked" error
- Go to Settings → Security
- Enable "Install from unknown sources"
- Or enable for specific app (Chrome, Files, etc.)

## App Signing

EAS Build automatically handles app signing:
- First build: Creates new keystore
- Subsequent builds: Reuses same keystore
- Keystore is securely stored in Expo's servers

## Version Management

Update version before each build:

**app.json:**
```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    }
  }
}
```

Increment:
- `version`: User-facing (1.0.0 → 1.0.1)
- `versionCode`: Internal counter (1 → 2)

## Play Store Preparation (Future)

When ready for Play Store:

1. **Update build profile to production**
   ```bash
   eas build --platform android --profile production
   ```

2. **Prepare store listing:**
   - App name: HUSH
   - Category: Productivity
   - Target audience: 13+
   - Privacy policy (required)

3. **Add payment integration** (for €6.99 unlock):
   - Google Play Billing
   - One-time product: "hush_premium_unlock"
   - Price: €6.99 (or equivalent)

4. **Submit for review**

## Contact

For build issues:
- Expo documentation: https://docs.expo.dev/build/setup/
- Expo forums: https://forums.expo.dev/

---

**Ready to build!** Run `eas build --platform android --profile preview` to create your first APK.
