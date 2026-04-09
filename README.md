# Crypto Tokens App

Мобильное приложение для просмотра списка криптовалют с интерактивными графиками и фильтрацией.

## Требования
- **Node.js**: 20+ (проверьте `.node-version`)
- **React Native**: 0.84.0
- **React**: 19.x
- **iOS** или **Android**

## Установка

### 1. Переключитесь на Node 20
```bash
nvm use 20
```

### 2. Скопируйте env файл
```bash
cp .env.example .env.local
# Если у вас есть CoinGecko Pro API ключ, добавьте его в .env.local
```

### 3. Установите зависимости
```bash
npm install
```

### 4. Установите pods (iOS)
```bash
cd ios && pod install && cd ..
```

## Запуск

### iOS (симулятор)
```bash
npm run ios
```

### Android (эмулятор/устройство)
```bash
npm run android
```

### Metro разработки
```bash
npm start
```

## Архитектура

### 3-слойная архитектура:

1. **Data Layer** (`src/api/`)
   - CoinGecko API клиент с перехватчиками
   - Встроенное кэширование (MMKV)
   - Retry логика для сетевых ошибок
   - Поддержка API ключей

2. **State Layer** (`src/state/`)
   - Effector stores для управления состоянием
   - `$tokens` — список токенов с пагинацией
   - `$filters` — фильтры поиска и сортировки
   - `$tokenDetail` + `$priceHistory` — детали и история цены
   - `$uiState` — loading, error, empty состояния

3. **UI Layer** (`src/components/`, `src/screens/`)
   - Переиспользуемые компоненты (TokenItem, TokenList, PriceChart)
   - Экраны: TokensListScreen, TokenDetailScreen
   - @react-navigation для навигации

## Функциональность

### Экран списка токенов
- ✅ Получение данных с CoinGecko API
- ✅ Пагинация с infinite scroll (кнопка "Load More")
- ✅ Фильтрация: поиск по названию/символу
- ✅ Сортировка: по market cap, цене, изменению за 24ч
- ✅ Состояния: loading, error, empty list
- ✅ Элемент раскрывается/сворачивается при нажатии

### Элемент списка (TokenItem)
- ✅ Название, символ, иконка
- ✅ Текущая цена
- ✅ Изменение за 24ч (зеленый/красный)
- ✅ Коллапсируемый блок с market cap, volume, rank
- ✅ Плавная анимация раскрытия (LayoutAnimation)

### Экран детали токена
- ✅ Основная информация (цена, 24ч изменение)
- ✅ Сетка статистики (rank, market cap, ATH, ATL)
- ✅ **Интерактивный график** (7-дневная история)
  - Свайп/клик для выбора точки
  - Отображение цены и даты в выбранной точке
  - Gradient fill под линией графика
  - Масштабируемая ось Y с grid lines

## Оптимизация и продвинутые возможности

### 1. **Кэширование (MMKV)**
```
- Список токенов: 5 минут
- Детали токена: 10 минут
- История цены: 1 час
- Поиск: 30 минут
- Автоматическая инвалидация при истечении TTL
```

### 2. **Retry логика**
```
- Автоматический повтор при сетевых ошибках
- Максимум 3 попытки с экспоненциальной задержкой
- Логирование попыток для дебака
```

### 3. **API интеграция**
```
- Поддержка CoinGecko Pro API ключей (через .env)
- Перехватчик ошибок (429 Rate Limit)
- Конфиг для URL и timeout
```

### 4. **Обработка состояний**
```
- Loading собственные скелеты
- Error с деталями
- Empty list с hint
- Graceful degradation при отсутствии интернета
```

## Переменные окружения

Создайте `.env.local` на основе `.env.example`:

```bash
# CoinGecko API (опционально, для Pro плана)
COINGECKO_API_KEY=your_api_key_here

# URL API
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# Timeout запросов в ms
API_TIMEOUT=10000
```

> **Примечание**: Если API ключ не указан, приложение будет использовать free tier CoinGecko.

## Примечание по стеку

### Почему Effector вместо Redux?
- Меньше бойлерплейта
- Более функциональный подход
- Лучше масштабируется для small-to-medium приложения
- Built-in мемоизация

### Почему собственный график вместо библиотеки?
- Полный контроль над интерактивностью
- Минимальный bundle size (~50kb vs 500kb+ для recharts)
- Нативные SVG + React gestures, no WebGL

### Пагинация: Load More вместо infinite scroll
- Стабильнее для React Native (FlatList может нагреваться)
- Явный контроль пользователя над загрузкой
- Меньше сетевых запросов

### MMKV vs AsyncStorage
- MMKV: ~10x быстрее, меньше overhead
- Встроенное TTL не нужно вручную управлять
- Удобнее для частых обновлений кэша

## Оптимизация производительности
- ✅ FlatList с keyExtractor
- ✅ React.memo на компонентах
- ✅ Effector мемоизирует вычисления
- ✅ MMKV кэширует API ответы (с TTL)
- ✅ Retry логика избегает дублирования запросов
- ✅ LayoutAnimation для плавной анимации раскрытия
- ✅ SVG граф без re-render всего списка

## Возможные улучшения (5-10 часов work)
- Skeleton loaders (react-native-skeletons)
- Анимации раскрытия (Reanimated spring)
- Автоматическая refresh при pull-down
- Уведомления о скачках цены (Local Notifications)
- Избранные токены (со звездочкой)
- Экспорт в CSV/изображение
- Темный режим (Dark Mode)
- Локализация (i18n)
- Offline mode (Service Workers на Web)
- Unit тесты (Jest + RTL)

## Технический стек

| Слой | Инструменты |
|------|-----------|
| **UI** | React Native 0.84, @react-navigation |
| **State** | Effector 23, effector-react |
| **Data** | axios, @tanstack/react-query, dotenv |
| **Cache** | react-native-mmkv |
| **Graph** | react-native-svg, SVG рендеринг |
| **Gestures** | react-native-gesture-handler |
| **Animation** | react-native-reanimated, LayoutAnimation |
| **Lang** | TypeScript 5.4 |
| **Env** | dotenv 16 (для API ключей) |

## Структура файлов

```
src/
├── api/                  # Data Layer
│   ├── client.ts        # axios клиент с interceptors
│   └── coingecko.ts     # API методы с кэшем и retry
├── state/               # State Layer (Effector)
│   ├── tokens.ts        # store для списка, фильтров
│   ├── tokenDetail.ts   # store для детали и графика
│   └── index.ts
├── screens/             # UI Layer - экраны
│   ├── TokensListScreen.tsx
│   ├── TokenDetailScreen.tsx
│   └── index.ts
├── components/          # UI Layer - компоненты
│   ├── TokenItem.tsx
│   ├── TokenList.tsx
│   ├── PriceChart.tsx
│   └── index.ts
├── utils/               # Утилиты
│   ├── formatters.ts    # цина, % изменения
│   ├── cache.ts         # MMKV кэш-слой
│   ├── retry.ts         # retry логика
│ └── types/              # TypeScript типы
│   └── index.ts
├── config.ts            # Конфиг из .env
└── App.tsx              # Точка входа + навигация
```

## IDE Setup (WebStorm/VS Code)

Для лучшего DX:
1. Установите расширения для TypeScript и React Native
2. Скопируйте `.node-version` (автоматический switch Node в nvm)
3. Используйте `nvm use 20` перед работой
4. При первом открытии - доверьте конфигу TypeScript

## Debug консоль

В dev режиме выводит:
```
🔧 Config loaded: { COINGECKO_API_URL, API_TIMEOUT, Platform }
📦 Cache hit: tokens_page_1_50
⚠️ Rate limit hit, consider upgrading API key
🗑️ Cache cleared
```

## Лицензия
MIT
