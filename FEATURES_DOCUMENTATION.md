# 📋 Дополнительные функции - Документация

## Обзор

Этот документ описывает все дополнительные функции, добавленные в приложение Crypto Tokens App.

---

## 1. ⭐ Избранные токены (Favorites)

### Местоположение
- API: `src/features/favorites/api/index.ts`
- State: `src/features/favorites/model/index.ts`
- Types: `src/features/favorites/types/index.ts`

### Функциональность
- Добавление/удаление токенов в избранное
- Сохранение в AsyncStorage (персистентное хранилище)
- Toggle функция для быстрого переключения
- Встроенная валидация дубликатов

### Использование

```typescript
import { 
  toggleFavorite, 
  addFavorite, 
  removeFavorite, 
  $favoriteIds,
  initializeFavorites 
} from '@/features/favorites';
import { useUnit } from 'effector-react';

export const TokenItem = ({ token }) => {
  const [isFavorited, toggle] = useUnit([$favoriteIds, toggleFavorite]);
  
  useEffect(() => {
    initializeFavorites();
  }, []);

  return (
    <TouchableOpacity onPress={() => toggle(token.id)}>
      <Icon name={isFavorited.has(token.id) ? 'star-filled' : 'star'} />
    </TouchableOpacity>
  );
};
```

### API методы
- `loadFavorites()` - загрузить из хранилища
- `addFavorite(tokenId)` - добавить в избранное
- `removeFavorite(tokenId)` - удалить из избранного
- `isFavorited(tokenId)` - проверить статус
- `clearFavorites()` - очистить все

---

## 2. 🌙 Темный режим (Dark Mode)

### Местоположение
- Types: `src/features/theme/types/index.ts`
- Colors: `src/features/theme/model/colors.ts`
- State: `src/features/theme/model/index.ts`

### Функциональность
- Light / Dark / Auto режимы
- Полный набор цветов для обеих тем
- Автоматическое сохранение предпочтений
- Сопоставление с системным режимом (через `react-native-localize`)

### Цветовые схемы

#### Light Theme
```typescript
{
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#1a1a1a',
  success: '#00C853',
  error: '#D32F2F',
  primary: '#1976D2',
  // ... и другие
}
```

#### Dark Theme
```typescript
{
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  success: '#00C853',
  error: '#FF6B6B',
  primary: '#42A5F5',
  // ... и другие
}
```

### Использование

```typescript
import { useUnit } from 'effector-react';
import { $themeConfig, setThemeMode, toggleTheme } from '@/features/theme';
import { useEffect } from 'react';
import { initializeTheme } from '@/features/theme';

export const App = () => {
  const [themeConfig] = useUnit([$themeConfig]);
  
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <View style={{ 
      backgroundColor: themeConfig.colors.background,
      color: themeConfig.colors.text,
    }}>
      {/* Content */}
    </View>
  );
};

// Toggle theme
const handleToggleTheme = () => {
  toggleTheme();
};

// Set specific mode
const handleSetDarkMode = () => {
  setThemeMode('dark');
};
```

### Event'ы
- `initializeTheme()` - инициализировать из хранилища
- `setThemeMode(mode)` - установить режим (light | dark | auto)
- `toggleTheme()` - переключить между light/dark

### Stores
- `$themeMode` - текущий режим
- `$isDark` - текущее состояние (true/false)
- `$themeConfig` - полная конфигурация с цветами

---

## 3. 🌍 Локализация (i18n)

### Местоположение
- Config: `src/shared/i18n/index.ts`
- Локали: `src/shared/i18n/locales/`
- Поддерживаемые: русский (ru), английский (en)

### Функциональность
- Полная поддержка двух языков
- Автоматическое определение языка устройства
- Интерполяция переменных
- Обширный набор переводов для UI

### Использование

```typescript
import { useTranslation } from 'react-i18next';

export const TokensListScreen = () => {
  const { t, i18n } = useTranslation();

  return (
    <View>
      <Text>{t('tokensList.title')}</Text>
      <TextInput 
        placeholder={t('tokensList.search')} 
      />
      
      {/* Переключение языка */}
      <Button 
        title={i18n.language === 'ru' ? 'English' : 'Русский'}
        onPress={() => i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru')}
      />
    </View>
  );
};
```

### Структура переводов

```typescript
{
  common: { ... },           // Общие фразы
  navigation: { ... },       // Названия экранов
  tokensList: { ... },       // Список токенов
  tokenDetail: { ... },      // Детали токена
  favorites: { ... },        // Избранное
  theme: { ... },            // Тема
  notifications: { ... },    // Уведомления
  export: { ... },           // Экспорт
  offline: { ... },          // Офлайн режим
  errors: { ... },           // Ошибки
  success: { ... }           // Успешные действия
}
```

---

## 4. 🔔 Локальные уведомления (Local Notifications)

### Местоположение
- API: `src/features/notifications/api/index.ts`
- State: `src/features/notifications/model/index.ts`
- Types: `src/features/notifications/types/index.ts`
- Library: `react-native-notifee`

### Функциональность
- Оповещения о скачках цены
- Настраиваемые пороги уведомлений
- Управление разрешениями (iOS/Android)
- Фоновые проверки цен

### Использование

```typescript
import { 
  initializeNotifications, 
  addPriceAlert, 
  checkPrices,
  $priceAlertConfig 
} from '@/features/notifications';
import { useUnit } from 'effector-react';

export const Settings = () => {
  const [alertConfig] = useUnit([$priceAlertConfig]);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const handleAddAlert = (tokenId, tokenName) => {
    addPriceAlert({
      tokenId,
      tokenName,
      threshold: 5, // 5% порог
      enabled: true,
    });
  };

  // Проверить цены (обычно в фоновой задаче)
  const handleCheckPrices = (tokenPrices) => {
    checkPrices(tokenPrices);
  };

  return (
    <View>
      {/* UI для управления уведомлениями */}
    </View>
  );
};
```

### API методы
- `initialize()` - инициализировать уведомления
- `sendPriceAlert(alert)` - отправить оповещение
- `sendNotification(payload)` - отправить обычное уведомление
- `onNotificationTap(callback)` - обработчик клика

### Store
- `$priceAlertConfig` - конфигурация оповещений
- Поля:
  - `alerts` - Map с настройками
  - `enabled` - включены ли уведомления
  - `globalThreshold` - глобальный порог (%)

---

## 5. 📥 Экспорт (Export)

### Местоположение
- CSV: `src/features/export/api/csv.ts`
- Image: `src/features/export/api/image.ts`

### Функциональность
- Экспорт списка токенов в CSV
- Экспорт деталей токена в CSV
- Сохранение графика как PNG
- Автоматический шеринг через native Share

### Использование

```typescript
import { csvExportAPI, imageExportAPI } from '@/features/export';
import { useRef } from 'react';

export const ExportScreen = () => {
  const chartRef = useRef();

  const handleExportCSV = async (tokens) => {
    try {
      await csvExportAPI.exportTokensAsCSV(tokens);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportChart = async () => {
    try {
      await imageExportAPI.exportChartAsImage(chartRef);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <View>
      <Button title="Export CSV" onPress={() => handleExportCSV(tokens)} />
      <Button title="Export Chart" onPress={handleExportChart} />
      
      <View ref={chartRef}>
        {/* Chart component */}
      </View>
    </View>
  );
};
```

### CSV Структура
```csv
Name,Symbol,Price,Market Cap,24h Change %,Rank
Bitcoin,BTC,95000,1950000000000,5.2,1
Ethereum,ETH,3200,384000000000,-1.3,2
```

---

## 6. 🔌 Офлайн режим (Offline Mode)

### Местоположение
- API: `src/features/offline/api/index.ts`
- State: `src/features/offline/model/index.ts`

### Функциональность
- Обнаружение сетевого соединения
- Кэширование данных через MMKV
- Автоматическая синхронизация при reconnect
- Логирование сетевых событий

### Использование

```typescript
import { 
  initializeOfflineMode, 
  $networkState, 
  $offlineModeEnabled,
  offlineAPI 
} from '@/features/offline';
import { useUnit } from 'effector-react';

export const App = () => {
  const [networkState, offlineEnabled] = useUnit([$networkState, $offlineModeEnabled]);

  useEffect(() => {
    initializeOfflineMode();

    // Subscribe to network changes
    const unsubscribe = offlineAPI.subscribeToNetworkState((isConnected) => {
      if (!isConnected) {
        console.log('Going offline');
      } else {
        console.log('Back online');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View>
      {offlineEnabled && (
        <Banner>
          {t('offline.noConnection')}
        </Banner>
      )}
      
      {/* Content */}
    </View>
  );
};

// Кэшировать данные для офлайна
offlineAPI.cacheForOffline('tokens_list', tokensList, 3600000); // 1 час TTL

// Получить кэшированные данные
const cached = offlineAPI.getCacheForOffline('tokens_list');
```

### API методы
- `checkNetworkState()` - проверить сетевое состояние
- `subscribeToNetworkState(callback)` - подписаться на изменения
- `cacheForOffline(key, data, ttl)` - сохранить в офлайн кэш
- `getCacheForOffline(key)` - получить кэшированные данные
- `clearOfflineCache()` - очистить кэш

### Stores
- `$networkState` - информация о сети
- `$offlineModeEnabled` - включен ли офлайн режим
- `$isSyncing` - идет ли синхронизация

---

## 7. 🎬 Анимации (Animations)

### Улучшения
- Spring animations для плавных переходов
- Expand/collapse анимации с Reanimated
- Layout transitions

### Использование

```typescript
import Animated, { 
  FadeIn, 
  ZoomIn, 
  Layout,
  SpringUtils 
} from 'react-native-reanimated';

export const AnimatedTokenItem = () => {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      layout={Layout.springify()}
    >
      {/* Content */}
    </Animated.View>
  );
};
```

---

## 8. 🧪 Unit Тесты (Unit Tests)

### Конфигурация
- Jest config: `jest.config.js`
- Setup: `jest.setup.js`
- Примеры: `src/**/__tests__/*.test.ts`

### Запуск тестов

```bash
# Все тесты
npm test

# С покрытием
npm test --coverage

# Конкретный файл
npm test api.test.ts

# Watch mode
npm test --watch
```

### Примеры тестов

```typescript
describe('favoritesAPI', () => {
  it('should add a favorite', async () => {
    await favoritesAPI.addFavorite('bitcoin');
    const isFav = await favoritesAPI.isFavorited('bitcoin');
    expect(isFav).toBe(true);
  });
});
```

### Покрытие
- Минимум 50% для branches, functions, lines, statements
- Исключены: index.ts, d.ts файлы, __tests__

---

## Архитектура

### Слои приложения

```
UI Layer (components/screens)
    ↓
Features Layer (features/*/ui)
    ↓
State Layer (features/*/model)
    ↓
Data Layer (features/*/api, shared/api)
```

### FSD (Feature Sliced Design)

Каждый feature имеет структуру:

```
feature/
├── model/           # Effector stores & effects
├── api/            # Data fetching & operations
├── ui/             # React components (optional)
├── types/          # TypeScript types
└── index.ts        # Public API
```

---

## Типизация

### Строгая типизация
- 100% TypeScript - все файлы .ts/.tsx
- Strict mode: `noImplicitAny: true`
- Полная типизация props и returns

### Типы для ключевых структур

```typescript
// Token
interface Token {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap?: number;
  market_cap_rank?: number | null;
}

// Favorites
interface PriceAlert {
  tokenId: string;
  tokenName: string;
  threshold: number;
  enabled: boolean;
}

// Theme
type ThemeMode = 'light' | 'dark' | 'auto';
interface ThemeColors { /* ... */ }
```

---

## Лучшие практики

1. **State Management**
   - Используем Effector для всего состояния
   - Events для действий, Effects для async операций
   - Stores immutable и типизированные

2. **Компоненты**
   - Функциональные компоненты с hooks
   - React.memo для оптимизации
   - Правильная обработка ошибок

3. **Async операции**
   - Try-catch+console.error логирование
   - Proper cleanup в useEffect
   - Retry логика где нужна

4. **Тестирование**
   - Unit тесты для API и утилит
   - Mock'и для native модулей
   - Минимум 50% coverage

---

## FAQ

### Как добавить новый язык?
1. Создать файл `src/shared/i18n/locales/xx.ts`
2. Экспортировать в `src/shared/i18n/index.ts`
3. Добавить в i18next конфиг

### Как синхронизировать данные при reconnect?
Используйте `offlineAPI.subscribeToNetworkState()` и `checkPrices()` из notifications.

### Как добавить новую тему помимо Light/Dark?
Добавьте новый набор цветов в `src/features/theme/model/colors.ts` и ThemeMode тип.

---

## Заключение

Все функции полностью интегрированы в FSD архитектуру приложения и готовы к использованию. Каждая feature независима и может быть использована в других проектах.
