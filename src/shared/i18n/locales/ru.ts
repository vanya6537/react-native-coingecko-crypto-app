/**
 * Russian translations
 */

export const ru = {
  // Common
  common: {
    loading: 'Загрузка...',
    error: 'Ошибка',
    retry: 'Повторить',
    search: 'Поиск',
    cancel: 'Отмена',
    save: 'Сохранить',
    delete: 'Удалить',
    close: 'Закрыть',
    back: 'Назад',
    settings: 'Параметры',
    about: 'О приложении',
    tryAgain: 'Повторить',
  },

  // Navigation
  navigation: {
    tokensList: 'Токены',
    tokenDetail: 'Детали',
    favorites: 'Избранное',
    settings: 'Параметры',
  },

  // TokensList
  tokensList: {
    title: 'Криптовалюты',
    search: 'Поиск токенов...',
    sortBy: 'Сортировать по',
    sortByTitle: 'Сортировать по',
    marketCap: 'Капитализация',
    price: 'Цена',
    change24h: 'Изменение за 24ч',
    noTokens: 'Токены не найдены',
    trySearching: 'Попробуйте изменить поиск',
    loadMore: 'Загрузить еще',
    pullToRefresh: 'Потяните для обновления',
    searchMode: '🔍 Поиск',
    sortMode: '⚙️ Сортировка',
    tryAdjusting: 'Попробуйте изменить фильтры поиска',
  },

  // TokenDetail
  tokenDetail: {
    title: 'Информация о токене',
    price: 'Цена',
    marketCap: 'Капитализация рынка',
    volume24h: 'Объем (24ч)',
    rank: 'Ранг',
    high24h: 'Максимум (24ч)',
    low24h: 'Минимум (24ч)',
    change24h: 'Изменение (24ч)',
    chart: 'График цены',
    fullscreen: 'Полный экран',
    explore: 'Исследовать цены',
    notFound: 'Токен не найден',
    marketCapRank: 'Рейтинг капитализации',
    currentPrice: 'Текущая цена',
    volume24hLabel: 'Объем за 24ч',
    ath: 'Максимум',
    atl: 'Минимум',
    about: 'О токене',
    priceHistory7Day: 'История цены за 7 дней',
    expandChart: 'Развернуть',
    loadingChart: 'Загрузка графика...',
  },

  // Stats
  stats: {
    label: 'Статистика',
    loading: 'Загрузка статистики...',
    marketCap: 'Капитализация',
    volume: 'Объем',
    ath: 'Максимум',
    atl: 'Минимум',
    marketCapRank: 'Ранг капитализации',
  },

  // Time Ranges
  timeRange: {
    '7d': '7D',
    '30d': '30D',
    '90d': '90D',
    '1y': '1Y',
    'all': 'ALL',
    chartTitle7d: 'Цена за последние 7 дней',
    chartTitle30d: 'Цена за последние 30 дней',
    chartTitle90d: 'Цена за последние 90 дней',
    chartTitle1y: 'Цена за последний год',
    chartTitleAll: 'Вся история цены',
    day: 'День',
  },

  // Extended Info
  extendedInfo: {
    aboutToken: 'О токене',
    noPriceData: 'Нет данных о цене',
  },

  // Loader
  loader: {
    chartData: 'Загрузка данных...',
    statistics: 'Загрузка статистики...',
    description: 'Загрузка описания...',
    nextPage: 'Загрузка еще...',
    expandedContent: 'Загрузка...',
  },

  // Favorites
  favorites: {
    title: 'Избранные',
    addedToFavorites: 'Добавлено в избранное',
    removedFromFavorites: 'Удалено из избранного',
    noFavorites: 'Нет избранных токенов',
  },

  // Theme
  theme: {
    title: 'Тема',
    light: 'Светлая',
    dark: 'Темная',
    auto: 'Авто',
  },

  // Notifications
  notifications: {
    title: 'Уведомления и Демо',
    priceAlerts: 'Оповещения о цене',
    enableNotifications: 'Включить уведомления',
    disableNotifications: 'Отключить уведомления',
    alertThreshold: 'Порог оповещения (%)',
    priceUp: 'Цена {{name}} выросла на {{percent}}%',
    priceDown: 'Цена {{name}} упала на {{percent}}%',
    success: 'Уведомление отправлено успешно',
    dataLoaded: 'Данные загружены успешно',
    dataRefreshed: 'Данные обновлены',
    cacheHit: 'Используются кэшированные данные',
    prefetching: 'Предзагрузка данных...',
    offlineMode: 'Офлайн режим: кэшированные данные',
    reconnected: 'Соединение восстановлено',
    
    // Demo page sections
    demoVisualNotifications: 'Визуальные уведомления',
    demoVisualDesc: 'Нажмите "Случайное уведомление" чтобы увидеть разные типы',
    demoPriceAlerts: 'Оповещения о цене в реальном времени',
    demoPriceAlertsDesc: 'Мониторьте топ 5 токенов с уведомлениями (имитация)',
    demoCacheOpt: 'Оптимизация кеша',
    demoExport: 'Экспорт данных',
    demoTokensPreview: 'Предпросмотр данных',
    demoAbout: 'О демо',
    demoAboutText: '• Использует react-query для умного кеширования\n• Показывает уведомления с иконками lucide\n• Демонстрирует стратегии оптимизации кеша\n• Эффективен по памяти с автоматической очисткой\n• Полная поддержка многоязычности i18n',
    
    // Demo buttons
    randomNotification: 'Случайное уведомление',
    startLiveMonitoring: 'Начать мониторинг',
    stopLiveMonitoring: 'Остановить мониторинг',
    prefetchNext: 'Предзагрузить следующую',
    batchPrefetch: 'Пакетная предзагрузка',
    optimizeCache: 'Оптимизировать кеш',
    clearCache: 'Очистить кеш',
    exportCsv: 'Экспортировать CSV',
    monitoringTokens: 'Монируемые токены',
    monitoringNote: '💡 Цены обновляются каждые 2 секунды (имитация)',
    
    // Demo messages
    toastSuccess: '✅ Успешно! Операция завершена',
    toastInfo: 'ℹ️ Информация: Данные загружены',
    toastWarning: '⚠️ Предупреждение: Низкая память',
    toastError: '❌ Ошибка: Не удалось загрузить',
    exportingCsv: 'Экспортирование токенов в CSV...',
    exportSuccess: 'Токены успешно экспортированы!',
    exportFailed: 'Ошибка экспорта токенов',
    noTokensToExport: 'Нет токенов для экспорта',
    noTokensMonitoring: 'Нет доступных токенов',
    monitoringStarted: 'Мониторинг цен запущен 🚀',
    monitoringStopped: 'Мониторинг остановлен',
    rateLimitError: 'Лимит запросов превышен (429) - квота API исчерпана',
    sendNotifications: '📤 Отправить уведомления',
    successNotificationButtonLabel: 'Уведомление об успехе',
    infoNotificationButtonLabel: 'Информационное уведомление',
    warningNotificationButtonLabel: 'Предупреждение',
    errorNotificationButtonLabel: 'Уведомление об ошибке',
  },

  // Export
  export: {
    title: 'Экспорт',
    csv: 'Экспортировать CSV',
    image: 'Сохранить как изображение',
    share: 'Поделиться',
    exported: 'Экспортировано',
  },

  // Offline
  offline: {
    title: 'Офлайн режим',
    noConnection: 'Нет подключения к интернету',
    usingCached: 'Используются кэшированные данные',
    syncing: 'Синхронизация...',
  },

  // Errors
  errors: {
    networkError: 'Ошибка сети. Проверьте подключение.',
    serverError: 'Ошибка сервера. Попробуйте позже.',
    dataError: 'Ошибка при загрузке данных.',
    notFound: 'Данные не найдены.',
    oops: 'Ой!',
  },

  // Success
  success: {
    saved: 'Сохранено',
    deleted: 'Удалено',
    copied: 'Скопировано в буфер обмена',
  },

  // Auth
  auth: {
    email: 'Email',
    password: 'Пароль',
    enterEmail: 'Введите ваш email',
    enterPassword: 'Введите ваш пароль',
    signIn: 'Вход',
    tryDemo: 'Попробовать демо',
    demoCredentials: '🔐 Все учетные данные для демо',
    demoHint: 'Демо: любые учетные данные работают',
    missingCredentials: 'Пожалуйста, введите email и пароль',
    version: 'v1.0.0 • React Native 0.84 • TypeScript',
  },

  // Login/Home
  home: {
    title: 'Криптовалюты',
    subtitle: 'Отслеживайте ваши токены в реальном времени',
    logo: '💰',
  },

  // Token Detail
  tokenDetailPage: {
    priceHistory: 'История цены за 7 дней',
    expand: 'Развернуть',
    marketCap: 'Рейтинг капитализации',
    currentPrice: 'Текущая цена',
    volume24h: 'Объем за 24ч',
    ath: 'Максимум',
    atl: 'Минимум',
    marketRank: 'Рейтинг рынка',
  },

  // Charts
  charts: {
    title: 'Статистика рынка',
    priceHistory: 'История цены за 7 дней',
    fullscreen: '📈 Полный экран',
    marketStatistics: 'Статистика рынка',
    marketRank: 'Рейтинг рынка',
    marketCap: 'Капитализация рынка',
    volume24h: 'Объем за 24ч',
    allTimeHigh: 'Максимум всех времен',
    allTimeLow: 'Минимум всех времен',
  },

  // Filter
  filter: {
    searchTokens: 'Поиск токенов...',
  },

  // Demo buttons
  demoButtons: {
    sendNotifications: '📤 Отправить уведомления',
    successNotification: 'Уведомление об успехе',
    infoNotification: 'Информационное уведомление',
    warningNotification: 'Предупреждение',
    errorNotification: 'Уведомление об ошибке',
    queriesCached: 'Запросов в кеше',
    cacheSize: 'Размер кеша',
  },

  // Expanded Chart
  expandedChart: {
    noHistory: 'История цены недоступна',
    title: 'График цены (7 дней)',
    currentPrice: 'Текущая цена',
    change: 'Изменение',
    position: 'Позиция',
    high: 'Максимум 7 дней',
    low: 'Минимум 7 дней',
    avg: 'Среднее за 7 дней',
    highLabel: 'Максимум за 7 дней',
    lowLabel: 'Минимум за 7 дней',
    avgLabel: 'Среднее за 7 дней',
    tip: '💡 Совет',
    dragTip: 'Потяните пальцем по графику чтобы увидеть цену в любой точке. Вертикальная линия и индикатор значения будут следовать вашему выбору.',
  },
};
