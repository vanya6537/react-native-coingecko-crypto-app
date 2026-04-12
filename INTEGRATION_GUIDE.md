# 🔧 Руководство интеграции новых функций

Этот документ содержит пошаговые инструкции для интеграции всех новых функций в приложение.

---

## 1. Инициализация приложения

### Обновите App.tsx

```typescript
import React, { useEffect } from 'react';
import { initializeTheme } from '@/features/theme';
import { initializeFavorites } from '@/features/favorites';
import { initializeNotifications } from '@/features/notifications';
import { initializeOfflineMode } from '@/features/offline';
import i18next from '@/shared/i18n';

export const App = () => {
  useEffect(() => {
    // Инициализировать все features
    initializeTheme();
    initializeFavorites();
    initializeNotifications();
    initializeOfflineMode();
  }, []);

  return (
    // ... существующий код
  );
};
```

---

## 2. Интеграция Favorites в TokenItem

### Обновите `src/components/TokenItem.tsx`

```typescript
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useUnit } from 'effector-react';
import { toggleFavorite, $favoriteIds } from '@/features/favorites';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { Token } from '@/shared/types';

interface TokenItemProps {
  token: Token;
  onPress: (token: Token) => void;
}

export const TokenItem: React.FC<TokenItemProps> = ({ token, onPress }) => {
  const [favoriteIds, toggle] = useUnit([$favoriteIds, toggleFavorite]);
  
  const isFavorited = useMemo(
    () => favoriteIds.has(token.id),
    [favoriteIds, token.id]
  );

  const handleToggleFavorite = () => {
    toggle(token.id);
  };

  const changeColor = token.price_change_percentage_24h >= 0 ? '#00C853' : '#D32F2F';

  return (
    <TouchableOpacity 
      onPress={() => onPress(token)}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.name}>{token.name}</Text>
          <Text style={styles.symbol}>{token.symbol.toUpperCase()}</Text>
        </View>
        
        <View style={styles.middle}>
          <Text style={styles.price}>${token.current_price?.toFixed(2)}</Text>
          <Text style={[styles.change, { color: changeColor }]}>
            {token.price_change_percentage_24h?.toFixed(2)}%
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
        >
          <Icon 
            name={isFavorited ? 'star' : 'star-outline'}
            size={24}
            color={isFavorited ? '#FFD700' : '#999'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { ... },
  content: { ... },
  left: { ... },
  middle: { ... },
  price: { ... },
  change: { ... },
  favoriteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: { ... },
  symbol: { ... },
});
```

---

## 3. Применение Dark Mode

### Обновите общие стили

Создайте `src/shared/styles/useThemeStyles.ts`:

```typescript
import { useMemo } from 'react';
import { useUnit } from 'effector-react';
import { $themeConfig } from '@/features/theme';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';

export const useThemeStyles = () => {
  const [themeConfig] = useUnit([$themeConfig]);
  const { colors } = themeConfig;

  return useMemo(
    () => ({
      container: {
        flex: 1,
        backgroundColor: colors.background,
      } as ViewStyle,
      
      screenContainer: {
        flex: 1,
        backgroundColor: colors.background,
      } as ViewStyle,

      text: {
        color: colors.text,
      } as TextStyle,

      secondaryText: {
        color: colors.textSecondary,
      } as TextStyle,

      surface: {
        backgroundColor: colors.surface,
      } as ViewStyle,

      border: {
        borderColor: colors.border,
        borderWidth: 1,
      } as ViewStyle,

      card: {
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 12,
        borderColor: colors.border,
        borderWidth: 1,
      } as ViewStyle,

      input: {
        backgroundColor: colors.surfaceVariant,
        color: colors.text,
        borderColor: colors.border,
        borderWidth: 1,
      } as ViewStyle,

      button: {
        backgroundColor: colors.primary,
      } as ViewStyle,

      buttonText: {
        color: colors.background,
      } as TextStyle,

      error: {
        color: colors.error,
      } as TextStyle,

      success: {
        color: colors.success,
      } as TextStyle,
    }),
    [colors]
  );
};
```

### Используйте в компонентах

```typescript
import { useThemeStyles } from '@/shared/styles/useThemeStyles';

export const MyComponent = () => {
  const styles = useThemeStyles();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, styles.bold]}>Hello</Text>
    </View>
  );
};
```

---

## 4. Применение i18n

### Обновите все текстовые строки

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
      <Text>{t('common.loading')}</Text>
      
      {/* Переключатель языка */}
      <TouchableOpacity 
        onPress={() => 
          i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru')
        }
      >
        <Text>{i18n.language === 'ru' ? 'EN' : 'RU'}</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Интерполяция переменных

```typescript
const { t } = useTranslation();

// В переводах: "priceUp": "Price {{name}} increased by {{percent}}%"
const message = t('notifications.priceUp', {
  name: 'Bitcoin',
  percent: 5.2,
});
// Результат: "Price Bitcoin increased by 5.2%"
```

---

## 5. Интеграция Local Notifications

### Обновите TokensListScreen для проверки цен

```typescript
import { useEffect } from 'react';
import { useUnit } from 'effector-react';
import { checkPrices } from '@/features/notifications';

export const TokensListScreen = () => {
  const tokens = ...; // получить токены

  useEffect(() => {
    // Проверить цены каждые 60 секунд (или использовать BackgroundJob)
    const interval = setInterval(() => {
      const priceData = tokens.map(t => ({
        tokenId: t.id,
        tokenName: t.name,
        price: t.current_price,
      }));
      checkPrices(priceData);
    }, 60000); // каждую минуту

    return () => clearInterval(interval);
  }, [tokens]);

  return (
    // ... существующий код
  );
};
```

---

## 6. Интеграция Export

### Добавьте кнопку экспорта в TokensListScreen

```typescript
import { useRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { csvExportAPI } from '@/features/export';

export const TokensListScreen = () => {
  const tokens = ...; // получить токены

  const handleExportCSV = async () => {
    try {
      await csvExportAPI.exportTokensAsCSV(tokens);
      // Показать success toast
    } catch (error) {
      // Показать error toast
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={handleExportCSV}>
        <Text>📥 Export CSV</Text>
      </TouchableOpacity>
      
      {/* Существующий контент */}
    </View>
  );
};
```

### Добавьте экспорт графика в TokenDetailScreen

```typescript
import { useRef } from 'react';
import { imageExportAPI } from '@/features/export';
import { PriceChart } from '@/components';

export const TokenDetailScreen = () => {
  const chartRef = useRef();

  const handleExportChart = async () => {
    try {
      await imageExportAPI.exportChartAsImage(chartRef);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={handleExportChart}>
        <Text>📈 Export Chart</Text>
      </TouchableOpacity>

      <PriceChart ref={chartRef} {...props} />
    </View>
  );
};
```

---

## 7. Интеграция Offline Mode

### Обновите API клиент

```typescript
import { offlineAPI } from '@/features/offline';

export const fetchTokensWithOfflineSupport = async (page: number) => {
  // Попробовать загрузить с интернета
  try {
    const data = await coingeckoAPI.getTokensList(page, 50);
    // Кэшировать для офлайна
    offlineAPI.cacheForOffline(`tokens_page_${page}`, data, 3600000);
    return data;
  } catch (error) {
    // Попытаться загрузить из кэша
    const cached = offlineAPI.getCacheForOffline(`tokens_page_${page}`);
    if (cached) {
      console.log('Using cached data for page', page);
      return cached;
    }
    throw error;
  }
};
```

### Добавьте offline индикатор

```typescript
import { useUnit } from 'effector-react';
import { $offlineModeEnabled } from '@/features/offline';

export const App = () => {
  const [offlineEnabled] = useUnit([$offlineModeEnabled]);

  return (
    <View>
      {offlineEnabled && (
        <View style={styles.offlineBanner}>
          <Text>🔌 {t('offline.noConnection')}</Text>
        </View>
      )}
      
      {/* Контент */}
    </View>
  );
};
```

---

## 8. Запуск тестов

### Добавьте тесты

```bash
npm test
```

### Примеры файлов:
- `src/features/favorites/__tests__/api.test.ts`
- `src/features/theme/__tests__/colors.test.ts`
- `src/shared/__tests__/formatters.test.ts`

---

## Чеклист интеграции

- [ ] Инициализировать все features в App.tsx
- [ ] Добавить Favorites звездочку в TokenItem
- [ ] Применить Dark Mode стили
- [ ] Заменить все текстовые строки на i18n
- [ ] Добавить проверку цен для Notifications
- [ ] Интегрировать Export функции
- [ ] Добавить Offline индикатор
- [ ] Запустить тесты: `npm test`
- [ ] Проверить типизацию: `npm run type-check`

---

## Решение проблем

### Проблема: "Cannot find module '@/features/...'"
**Решение:** Убедитесь, что пути в `tsconfig.json` правильные.

### Проблема: Offline mode не работает
**Решение:** Убедитесь, что `@react-native-community/netinfo` установлен.

### Проблема: Уведомления не показываются
**Решение:** Проверьте разрешения в `notificationsAPI.initialize()`.

### Проблема: Темная тема не применяется
**Решение:** Используйте `useThemeStyles()` hook в компонентах.

---

## Дальнейшие улучшения

1. **Settings Screen** - экран для управления темой, языком, уведомлениями
2. **Favorites Screen** - отдельный экран для просмотра избранных
3. **Analytics** - отслеживание использования новых функций
4. **Push Notifications** - фоновые уведомления о цене
5. **Database** - локальная БД для истории цен и закладок
