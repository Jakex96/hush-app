export type Language = 'en' | 'cs';

export const translations = {
  en: {
    // Home Screen
    appName: 'HUSH',
    tagline: 'Find your calm',
    homeDescription: 'Block distractions.\nStay focused.\nReclaim your time.',
    enterHushMode: 'Enter HUSH Mode',
    essentialsAccessible: 'Your essential apps will remain accessible',
    
    // Duration Screen
    chooseDuration: 'Choose Duration',
    howLongFocus: 'How long do you\nwant to focus?',
    oneHour: '1 Hour',
    oneHourSubtitle: 'Quick focus session',
    untilEndOfDay: 'Until End of Day',
    untilEndOfDaySubtitle: 'Deep work mode',
    cannotExitWarning: 'You won\'t be able to exit HUSH mode until the time is up',
    
    // HUSH Mode Screen
    hushModeActive: 'HUSH MODE ACTIVE',
    hushIsActive: 'HUSH is active',
    stayPresentCalm: 'Stay present, stay calm',
    endsToday: 'Ends today',
    endsInAboutAnHour: 'Ends in about an hour',
    endsInFewHours: 'Ends in a few hours',
    endsSoon: 'Ends soon',
    almostDone: 'Almost done',
    remaining: 'remaining',
    tapToShow: 'Tap to show exact time',
    tapToHide: 'Tap to hide exact time',
    
    // Essential Apps
    essentialApps: 'Essential Apps',
    phone: 'Phone',
    messages: 'Messages',
    email: 'Email',
    maps: 'Maps',
    pay: 'Pay',
    music: 'Music',
    calculator: 'Calculator',
    
    // Info & Alerts
    allOtherAppsBlocked: 'All other apps are blocked until timer ends',
    hushModeActiveAlert: 'HUSH Mode Active',
    cannotExitMessage: 'You cannot exit HUSH mode until the timer ends.',
    hushModeComplete: 'HUSH Mode Complete! 🎉',
    greatJobFocused: 'Great job staying focused!',
    done: 'Done',
    ok: 'OK',
    
    // App Launch
    pleaseOpenFrom: 'Please open',
    fromAppDrawer: 'from your app drawer.',
    fromHomeScreen: 'from your home screen.',
    willOpenAutomatically: 'will open automatically on a real device.',
    pleaseOpenManually: 'Please open',
    manually: 'manually from your device.',
  },
  cs: {
    // Home Screen
    appName: 'HUSH',
    tagline: 'Najdi svůj klid',
    homeDescription: 'Zablokuj rozptýlení.\nZaměř se.\nVrať si svůj čas.',
    enterHushMode: 'Zapnout režim HUSH',
    essentialsAccessible: 'Tvé důležité aplikace zůstanou dostupné',
    
    // Duration Screen
    chooseDuration: 'Zvolte dobu trvání',
    howLongFocus: 'Jak dlouho se chceš\nsoustředit?',
    oneHour: '1 hodina',
    oneHourSubtitle: 'Rychlé soustředění',
    untilEndOfDay: 'Do konce dne',
    untilEndOfDaySubtitle: 'Hluboká práce',
    cannotExitWarning: 'Režim HUSH nebude možné vypnout dokud čas nevyprší',
    
    // HUSH Mode Screen
    hushModeActive: 'REŽIM HUSH AKTIVNÍ',
    hushIsActive: 'Režim HUSH je aktivní',
    stayPresentCalm: 'Buď tady a teď. V klidu.',
    endsToday: 'Skončí dnes',
    endsInAboutAnHour: 'Skončí asi za hodinu',
    endsInFewHours: 'Skončí za několik hodin',
    endsSoon: 'Brzy skončí',
    almostDone: 'Skoro hotovo',
    remaining: 'zbývá',
    tapToShow: 'Ťukni pro přesný čas',
    tapToHide: 'Ťukni pro skrytí času',
    
    // Essential Apps
    essentialApps: 'Důležité aplikace',
    phone: 'Telefon',
    messages: 'Zprávy',
    email: 'E-mail',
    maps: 'Mapy',
    pay: 'Platby',
    music: 'Hudba',
    calculator: 'Kalkulačka',
    
    // Info & Alerts
    allOtherAppsBlocked: 'Všechny ostatní aplikace jsou zablokovány do konce času',
    hushModeActiveAlert: 'Režim HUSH aktivní',
    cannotExitMessage: 'Režim HUSH nelze vypnout dokud čas nevyprší.',
    hushModeComplete: 'Režim HUSH dokončen! 🎉',
    greatJobFocused: 'Skvělá práce, výborné soustředění!',
    done: 'Hotovo',
    ok: 'OK',
    
    // App Launch
    pleaseOpenFrom: 'Prosím otevřete',
    fromAppDrawer: 'ze seznamu aplikací.',
    fromHomeScreen: 'z domovské obrazovky.',
    willOpenAutomatically: 'se otevře automaticky na skutečném zařízení.',
    pleaseOpenManually: 'Prosím otevřete',
    manually: 'ručně ze svého zařízení.',
  },
};

export const getTranslation = (lang: Language, key: keyof typeof translations.en): string => {
  return translations[lang][key] || translations.en[key];
};
