/**
 * English translations
 */

export const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    search: 'Search',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    close: 'Close',
    back: 'Back',
    settings: 'Settings',
    about: 'About',
    tryAgain: 'Try Again',
  },

  // Navigation
  navigation: {
    tokensList: 'Tokens',
    tokenDetail: 'Details',
    favorites: 'Favorites',
    settings: 'Settings',
  },

  // TokensList
  tokensList: {
    title: 'Cryptocurrencies',
    search: 'Search tokens...',
    sortBy: 'Sort by',
    sortByTitle: 'Sort By',
    marketCap: 'Market Cap',
    price: 'Price',
    change24h: '24h Change',
    noTokens: 'No tokens found',
    trySearching: 'Try changing your search',
    loadMore: 'Load More',
    pullToRefresh: 'Pull to refresh',
    searchMode: '🔍 Search',
    sortMode: '⚙️ Enable Sort',
    tryAdjusting: 'Try adjusting your search filters',
  },

  // TokenDetail
  tokenDetail: {
    title: 'Token Information',
    price: 'Price',
    marketCap: 'Market Capitalization',
    volume24h: 'Volume (24h)',
    rank: 'Rank',
    high24h: 'High (24h)',
    low24h: 'Low (24h)',
    change24h: 'Change (24h)',
    chart: 'Price Chart',
    fullscreen: 'Fullscreen',
    explore: 'Explore prices',
    notFound: 'Token not found',
    marketCapRank: 'Market Cap Rank',
    currentPrice: 'Current Price',
    volume24hLabel: '24h Volume',
    ath: 'ATH',
    atl: 'ATL',
    about: 'About',
    priceHistory7Day: '7-Day Price History',
    expandChart: 'Expand',
    loadingChart: 'Loading chart...',
  },

  // Stats
  stats: {
    marketCapRank: 'Market Cap Rank',
    label: 'Statistics',
    loading: 'Loading statistics...',
    marketCap: 'Market Cap',
    volume: 'Volume',
    ath: 'All-Time High',
    atl: 'All-Time Low',
  },

  // Time Ranges
  timeRange: {
    '7d': '7D',
    '30d': '30D',
    '90d': '90D',
    '1y': '1Y',
    'all': 'ALL',
    chartTitle7d: 'Price for the last 7 days',
    chartTitle30d: 'Price for the last 30 days',
    chartTitle90d: 'Price for the last 90 days',
    chartTitle1y: 'Price for the last year',
    chartTitleAll: 'Complete price history',
    day: 'Day',
  },

  // Extended Info
  extendedInfo: {
    aboutToken: 'About',
    noPriceData: 'No price data',
  },

  // Loader
  loader: {
    chartData: 'Loading chart data...',
    statistics: 'Loading statistics...',
    description: 'Loading description...',
    nextPage: 'Loading next...',
    expandedContent: 'Loading...',
  },

  // Favorites
  favorites: {
    title: 'Favorites',
    addedToFavorites: 'Added to favorites',
    removedFromFavorites: 'Removed from favorites',
    noFavorites: 'No favorite tokens',
  },

  // Theme
  theme: {
    title: 'Theme',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
  },

  // Notifications
  notifications: {
    title: 'Notifications & Demo',
    priceAlerts: 'Price Alerts',
    enableNotifications: 'Enable Notifications',
    disableNotifications: 'Disable Notifications',
    alertThreshold: 'Alert Threshold (%)',
    priceUp: '{{name}} price increased by {{percent}}%',
    priceDown: '{{name}} price decreased by {{percent}}%',
    success: 'Notification sent successfully',
    dataLoaded: 'Data loaded successfully',
    dataRefreshed: 'Data refreshed',
    cacheHit: 'Using cached data',
    prefetching: 'Prefetching data...',
    offlineMode: 'Offline Mode: Using cached data',
    reconnected: 'Connection restored',
    
    // Demo page sections
    demoVisualNotifications: 'Visual Notifications',
    demoVisualDesc: 'Click "Random Notification" to see different toast types',
    demoPriceAlerts: 'Live Price Alerts',
    demoPriceAlertsDesc: 'Monitor top 5 tokens with real-time notifications (mocked)',
    demoCacheOpt: 'Cache Optimization',
    demoExport: 'Export Data',
    demoTokensPreview: 'Tokens Data Preview',
    demoAbout: 'About This Demo',
    demoAboutText: '• Uses react-query for smart caching and prefetching\n• Displays toast notifications with lucide icons\n• Demonstrates cache optimization strategies\n• Memory-efficient with automatic GC\n• Full i18n support for multi-language',
    
    // Demo buttons
    randomNotification: 'Random Notification',
    startLiveMonitoring: 'Start Live Monitoring',
    stopLiveMonitoring: 'Stop Live Monitoring',
    prefetchNext: 'Prefetch Next Page',
    batchPrefetch: 'Batch Prefetch Tokens',
    optimizeCache: 'Optimize Cache',
    clearCache: 'Clear All Cache',
    exportCsv: 'Export Tokens as CSV',
    monitoringTokens: 'Monitoring Tokens',
    monitoringNote: '💡 Prices will update every 2 seconds with toast notifications (mocked)',
    
    // Demo messages
    toastSuccess: '✅ Success! Operation completed',
    toastInfo: 'ℹ️ Information: Data loaded',
    toastWarning: '⚠️ Warning: Low memory',
    toastError: '❌ Error: Failed to load',
    exportingCsv: 'Exporting tokens to CSV...',
    exportSuccess: 'Tokens exported successfully!',
    exportFailed: 'Failed to export tokens',
    noTokensToExport: 'No tokens to export',
    noTokensMonitoring: 'No tokens available for monitoring',
    monitoringStarted: 'Live price monitoring started 🚀',
    monitoringStopped: 'Live monitoring stopped',
    rateLimitError: 'Rate limit exceeded (429) - API quota reached',
    sendNotifications: '📤 Send Notifications',
    successNotificationButtonLabel: 'Success Notification',
    infoNotificationButtonLabel: 'Info Notification',
    warningNotificationButtonLabel: 'Warning Notification',
    errorNotificationButtonLabel: 'Error Notification',
  },

  // Export
  export: {
    title: 'Export',
    csv: 'Export as CSV',
    image: 'Save as Image',
    share: 'Share',
    exported: 'Exported',
  },

  // Offline
  offline: {
    title: 'Offline Mode',
    noConnection: 'No internet connection',
    usingCached: 'Using cached data',
    syncing: 'Syncing...',
  },

  // Errors
  errors: {
    networkError: 'Network error. Check your connection.',
    serverError: 'Server error. Try again later.',
    dataError: 'Error loading data.',
    notFound: 'Data not found.',
    oops: 'Oops!',
  },

  // Success
  success: {
    saved: 'Saved',
    deleted: 'Deleted',
    copied: 'Copied to clipboard',
  },

  // Auth
  auth: {
    email: 'Email',
    password: 'Password',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    signIn: 'Sign In',
    tryDemo: 'Try Demo',
    demoCredentials: '🔐 All credentials are mock for demo purposes',
    demoHint: 'Demo: any credentials work',
    missingCredentials: 'Please enter both email and password',
    version: 'v1.0.0 • React Native 0.84 • TypeScript',
  },

  // Login/Home
  home: {
    title: 'Crypto Tokens',
    subtitle: 'Track your favorite tokens in real-time',
    logo: '💰',
  },

  // Token Detail
  tokenDetailPage: {
    priceHistory: '7-Day Price History',
    expand: 'Expand',
    marketCap: 'Market Cap Rank',
    currentPrice: 'Current Price',
    volume24h: '24h Volume',
    ath: 'ATH',
    atl: 'ATL',
    marketRank: 'Market Rank',
  },

  // Charts
  charts: {
    title: 'Market Statistics',
    priceHistory: '7-Day Price History',
    fullscreen: '📈 Fullscreen',
    marketStatistics: 'Market Statistics',
    marketRank: 'Market Rank',
    marketCap: 'Market Cap',
    volume24h: '24h Volume',
    allTimeHigh: 'All-Time High',
    allTimeLow: 'All-Time Low',
  },

  // Filter
  filter: {
    searchTokens: 'Search tokens...',
  },

  // Demo buttons
  demoButtons: {
    sendNotifications: '📤 Send Notifications',
    successNotification: 'Success Notification',
    infoNotification: 'Info Notification',
    warningNotification: 'Warning Notification',
    errorNotification: 'Error Notification',
    queriesCached: 'Queries Cached',
    cacheSize: 'Cache Size',
  },

  // Expanded Chart
  expandedChart: {
    noHistory: 'No price history available',
    title: 'Price Chart (7 Days)',
    currentPrice: 'Current Price',
    change: 'Change',
    position: 'Position',
    high: '7D High',
    low: '7D Low',
    avg: '7D Average',
    highLabel: '7-Day High',
    lowLabel: '7-Day Low',
    avgLabel: '7-Day Average',
    tip: '💡 Tip',
    dragTip: 'Drag your finger across the chart to view price at any point. The vertical line and value indicator will follow your selection.',
  },
};
