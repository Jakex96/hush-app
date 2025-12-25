# HUSH Premium Features Structure

This document outlines the premium features structure for future implementation.

## Current Status: FREE VERSION ONLY

The app is currently **100% free** with no payment system implemented.

## Premium Model: One-Time Unlock

**Price**: €6.99 (one-time payment)
- EUR: €6.99
- USD: $7.99  
- CZK: 179 Kč

**No subscriptions** - Buy once, own forever.

## Free vs Premium Features

### ✅ FREE TIER (Current)

**Core Features:**
- HUSH Mode activation
- 2 duration options:
  - 1 hour
  - Until end of day
- 8 essential apps:
  - Phone, Messages, Email, Maps, Pay, Music, Camera, Calculator
- 2 languages: English, Czech
- Hybrid app blocking
- Dark mode
- State persistence
- Back navigation
- Language switching

**Limitations:**
- Fixed duration options only
- Cannot customize duration
- Fixed essential apps list
- No usage statistics
- Basic blocking only

### 🌟 PREMIUM TIER (Future)

**Additional Duration Options:**
- Custom duration (user sets exact time)
- 30 minutes
- 2 hours
- 3 hours
- Half day (12 hours)
- Custom schedules

**Advanced Features:**
- **Native App Blocking**: True Android-level blocking using Accessibility Service
- **Usage Statistics**: See your focus patterns, streaks, total time
- **Custom App Whitelist**: Choose which apps to allow (not fixed to 8)
- **Scheduled HUSH Modes**: Auto-activate at specific times
- **Additional Themes**: Dark blue, dark green, purple variants
- **Break Reminders**: Optional notifications during long sessions
- **Focus Insights**: Weekly/monthly reports

**Premium-Only Settings Screen:**
- App selection for whitelist
- Custom duration picker
- Statistics dashboard
- Theme selector
- Schedule manager

## Implementation Checklist (Future)

When adding premium features:

### 1. Payment Integration
```typescript
// Use Google Play Billing
// Product ID: "hush_premium_unlock"
// Type: One-time purchase (not subscription)
```

### 2. Premium State Management
```typescript
// Add to hushStore.ts
interface HushState {
  // ... existing state
  isPremium: boolean;
  purchaseDate: number | null;
  restorePurchase: () => Promise<void>;
}
```

### 3. UI Updates
- Add "Upgrade to Premium" button in home screen
- Premium badge in settings
- Lock icons on premium features
- Pricing modal with clear benefits
- Restore purchase option

### 4. Feature Gating
```typescript
// Example in duration screen
const durations = [
  { id: 'hour', title: '1 Hour', free: true },
  { id: 'endOfDay', title: 'Until End of Day', free: true },
  { id: 'custom', title: 'Custom', free: false }, // Premium
  { id: 'twoHours', title: '2 Hours', free: false }, // Premium
];
```

### 5. Code Files to Update
- `constants/premium.ts` - Update `isPremiumUser()` function
- `app/duration.tsx` - Add premium duration options
- `app/index.tsx` - Add "Upgrade" button
- Create `app/premium.tsx` - Premium upgrade screen
- Create `app/statistics.tsx` - Usage statistics (premium only)
- Update `store/hushStore.ts` - Add premium state

### 6. Play Store Configuration
- In-app billing permission in AndroidManifest.xml
- Create in-app product in Google Play Console
- Set up pricing for all countries
- Test with test accounts before release

## Revenue Model

**Why One-Time Purchase?**
- Aligns with calm, non-stressful app philosophy
- No recurring stress of subscription renewals
- User owns the features forever
- Fair pricing for value provided

**Target Market:**
- ADHD community
- Students
- Remote workers
- Anyone seeking digital wellness

**Expected Conversion Rate:**
- 2-5% of users upgrade (industry standard for utilities)
- Focus on delivering value in free tier
- Premium is for power users who want more control

## Pricing Strategy

**€6.99 Rationale:**
- Low enough to be impulse purchase
- High enough to be taken seriously
- Comparable to premium coffee
- One-time = less friction than subscription

**Price Points by Region:**
- Eurozone: €6.99
- USA: $7.99
- Czech Republic: 179 Kč
- UK: £5.99
- Other regions: Equivalent pricing

## Marketing Copy (Future)

**Premium Upgrade Screen:**
```
Unlock HUSH Premium
One-time payment. Yours forever.

✓ Custom durations
✓ Choose your own essential apps
✓ Usage statistics & insights
✓ Scheduled HUSH modes
✓ Advanced blocking
✓ More themes

€6.99 - Buy once, own forever
```

## Development Priority

**Phase 1** (Current): Free version MVP
**Phase 2**: Polish free version, gather user feedback  
**Phase 3**: Implement payment system
**Phase 4**: Add premium features progressively
**Phase 5**: Marketing & user acquisition

## Code Organization

All premium-related code should be:
1. **Isolated**: Easy to enable/disable
2. **Clean**: No spaghetti code mixing free/premium
3. **Testable**: Can test premium features without payment
4. **Documented**: Clear comments on what's premium

## Testing Premium Features

Use feature flag during development:
```typescript
// For testing only - remove before production
const FORCE_PREMIUM_FOR_TESTING = __DEV__ && false;

export const isPremiumUser = (): boolean => {
  if (FORCE_PREMIUM_FOR_TESTING) return true;
  // Real premium check when implemented
  return checkPurchaseStatus();
};
```

## Privacy & Data

**Free Users:**
- No data collection
- No analytics
- No accounts
- Local storage only

**Premium Users:**
- Same privacy policy
- Purchase receipt stored locally
- Optional: Anonymous usage statistics (opt-in only)
- Still no accounts, no cloud sync

## Support & Refunds

**Refund Policy:**
- Full refund within 48 hours, no questions asked
- Handled through Google Play's refund system
- Clear policy stated in app description

**Support:**
- Email support for premium users
- FAQ in app
- Community Discord (optional)

---

**Remember**: The free version should be genuinely useful. Premium is for those who want more power and control, not to make the free version annoying.
