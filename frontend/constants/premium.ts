// Premium features configuration
// This will be implemented when payment is added

export const PREMIUM_FEATURES = {
  customDurations: false, // Will be premium: custom time periods
  unlimitedSessions: false, // Will be premium: unlimited HUSH sessions per day
  advancedBlocking: false, // Will be premium: stricter app blocking
  statistics: false, // Will be premium: usage statistics and insights
  themes: false, // Will be premium: custom themes
  schedules: false, // Will be premium: scheduled HUSH modes
};

export const PREMIUM_PRICE = {
  EUR: 6.99,
  USD: 7.99,
  CZK: 179,
};

// Placeholder for future premium check
export const isPremiumUser = (): boolean => {
  // TODO: Implement when payment system is added
  // This will check if user has purchased the one-time unlock
  return false;
};

// Free tier limitations
export const FREE_TIER_LIMITS = {
  durationsAvailable: ['hour', 'endOfDay'] as const,
  essentialAppsCount: 8,
  languagesAvailable: ['en', 'cs'] as const,
};

// Premium tier features (for future)
export const PREMIUM_TIER_FEATURES = {
  durationsAvailable: ['custom', 'hour', 'endOfDay', 'halfDay', 'twoHours'] as const,
  customAppWhitelist: true,
  usageStatistics: true,
  advancedSettings: true,
  themesAvailable: ['dark', 'darkBlue', 'darkGreen'] as const,
};
