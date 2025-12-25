# HUSH - Quick APK Build Guide

## Option 1: Cloud Build with EAS (Recommended - 5 minutes)

### Prerequisites
- Node.js installed on your computer
- A free Expo account (create at expo.dev)

### Step-by-Step

1. **Download this project** from Emergent
   - Use the download/export feature
   - Or copy the `frontend/` folder to your computer

2. **Install dependencies**
   ```bash
   cd frontend
   npm install -g eas-cli
   npm install
   # or use: yarn install
   ```

3. **Login to Expo**
   ```bash
   eas login
   ```
   - Enter your Expo email and password
   - Or create account at expo.dev first

4. **Configure project** (first time only)
   ```bash
   eas build:configure
   ```
   - This will ask a few questions
   - Choose "All" when asked about platforms
   - Let it generate credentials automatically

5. **Build the APK**
   ```bash
   eas build --platform android --profile preview
   ```
   
   **What happens:**
   - ✅ Code uploaded to Expo servers
   - ✅ APK built in the cloud (~15 minutes)
   - ✅ Download link provided
   - ✅ Link valid for 30 days

6. **Download & Install**
   - Click the link provided
   - Download APK to your phone
   - Install (enable "Unknown sources" if needed)
   - Test!

## Option 2: Local Build (Advanced - Requires Android Studio)

### Prerequisites
- Android Studio installed
- Android SDK configured
- Java JDK 17+

### Steps

1. **Prebuild for native Android**
   ```bash
   cd frontend
   npx expo prebuild --platform android
   ```

2. **Build APK with Gradle**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

3. **Find APK**
   ```bash
   # APK location:
   android/app/build/outputs/apk/release/app-release.apk
   ```

## Option 3: Expo Go Testing (Fastest - No Build Needed)

### For Quick Testing Only

1. **Install Expo Go** on your Android phone
   - Download from Play Store: "Expo Go"

2. **Start development server**
   ```bash
   cd frontend
   npx expo start
   ```

3. **Scan QR code** with Expo Go app
   - App runs immediately
   - ⚠️ Limited: Won't test native features like app blocking

## Recommended: Option 1 (EAS Build)

**Why?**
- ✅ Easiest and fastest
- ✅ No local Android SDK needed
- ✅ Production-ready APK
- ✅ Automatically signed
- ✅ Works on any Android device
- ✅ Free for personal projects

**Expected Timeline:**
- Setup: 2 minutes
- Build: 10-15 minutes
- Total: ~15-20 minutes

## Troubleshooting

### "eas: command not found"
```bash
npm install -g eas-cli
# or
yarn global add eas-cli
```

### "Not authorized"
```bash
eas logout
eas login
```

### "Build failed"
```bash
# Try with cache cleared
eas build --platform android --profile preview --clear-cache
```

### "Invalid project ID"
1. Go to expo.dev
2. Create a new project
3. Copy the project ID
4. Update `app.json`:
   ```json
   "extra": {
     "eas": {
       "projectId": "your-project-id-here"
     }
   }
   ```

## Build Profiles Explained

- **development**: For Expo Go testing (fast, development build)
- **preview**: For APK testing (what you want)
- **production**: For Play Store release (optimized)

## After Building

### Install APK on Android
1. Download APK from EAS link
2. Transfer to phone (email, USB, cloud)
3. Open Settings → Security
4. Enable "Install from unknown sources"
5. Tap APK file to install
6. Open HUSH app

### Test Checklist
- [ ] App opens successfully
- [ ] Enter HUSH Mode works
- [ ] Timer counts down
- [ ] All 8 apps visible
- [ ] Language switch works (EN ↔ CZ)
- [ ] Back button works
- [ ] Settings modal works
- [ ] Essential apps launch correctly
- [ ] HUSH persists through restart

## Next Steps

1. Test on your phone
2. Gather feedback
3. Fix any bugs
4. Polish the experience
5. Prepare for Play Store (when ready)

## Need Help?

- Expo docs: https://docs.expo.dev/build/setup/
- EAS Build guide: https://docs.expo.dev/build/introduction/
- Expo forums: https://forums.expo.dev/

---

**Estimated time to APK: 15-20 minutes** ⏱️

Good luck! 🚀
