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
- ✅ **Интерактивный встроенный график** (7-дневная история)
  - Свайп/клик для выбора точки
  - Отображение цены и даты в выбранной точке
  - Vertical line indicator при выборе
  - Gradient fill под линией графика
  - Масштабируемая ось Y с grid lines
  - Кнопка "📈 Fullscreen" для перехода на полноэкранный граф

### Полноэкранный экран графика (NEW! 🎉)
- ✅ **Расширенная интерактивность**:
  - Палец по графику показывает точку + цену + даты
  - Вертикальная пунктирная линия для точности
  - Selection circle на выбранной точке
  - Day position индикатор (e.g., "3/7")
  - Tooltip с ценой при наведении
- ✅ **Расширенная статистика**:
  - Текущая цена в заголовке
  - 7-дневный High/Low/Average в панели внизу
  - Market stats grid (rank, cap, volume)
- ✅ **UX улучшения**:
  - Instruction panel с советом "Drag your finger across"
  - Grid lines с ценовыми метками
  - Gradient fill для визуализации тренда
  - Плавная работа под рукой
  - Back button для возврата

## Экраны приложения

### 1. Список токенов (`TokensListScreen`)
Главный экран с прокруткой всех криптовалют. Поддерживает фильтрацию, сортировку и пагинацию.

**UI элементы:**
- Заголовок "Crypto Tokens" + счетчик токенов
- Поле поиска с real-time фильтрацией
- 3 кнопки сортировки (Market Cap, Price, 24h Change)
- Список TokenItem с коллапсом
- Кнопка "Load More" для пагинации

### 2. Детали токена (`TokenDetailScreen`)
Экран с основной информацией и встроенным графиком.

**UI элементы:**
- Иконка токена + название + символ
- Текущая цена (крупно) + 24ч изменение
- Сетка статистики (4 инфо-блока)
- **Интерактивный встроенный график** с жестами
- Кнопка "📈 Fullscreen" для перехода на полний граф
- Hint "👆 Tap & drag to explore prices"

### 3. Полноэкранный график (`PriceChartScreen`) — NEW!
Экран для детального изучения графика цены с максимальной интерактивностью.

**Интерактивные жесты:**
```
Пользователь водит палец по графику:
1. Движение палца по X-оси = выбор дня (1-7)
2. Vertical line следует за пальцем
3. Selection circle на точке в реальном времени
4. Tooltip показывает цену (e.g., "$42,543.21")
5. Day counter показывает позицию (e.g., "3/7")
6. При lift-off (отпускание) — остается последняя выбранная точка
```

**Статистика в реал-тайме:**
- Текущая цена (обновляется при выборе точки)
- День недели + дата (обновляется при выборе)
- Position counter (какой день из 7)

**Нижняя панель статистики:**
- 7-дневный High (зеленый)
- 7-дневный Low (красный)  
- 7-дневный Average (нейтральный)

**Визуальные элементы:**
- Grid lines с ценовыми метками на Y-оси
- Gradient fill под кривой (зеленый тренд up / красный trend down)
- Плавная кривая цены (stroke-width: 2.5px)
- Selection indicator (vertical dash line)

### Навигация

```
Главный экран (TokensList)
  ↓ [Tap token]
Детали токена (TokenDetail)
  ├─ [Коллапс item] → показывает доп. инфо
  ├─ [Tap & drag chart] → интерактивный граф
  └─ [📈 Fullscreen] → переход на PriceChartScreen
       ↓
  Полноэкранный граф (PriceChart)
       ↑
  [Back button] → возврат на TokenDetail
```

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
- ✅ Skeleton loaders (реализовано)
- ✅ Интерактивный график с жестами (реализовано)
- Pull-to-refresh на TokensListScreen
- Уведомления о скачках цены (Local Notifications)
- Избранные токены (со звездочкой, AsyncStorage)
- Анимации раскрытия (Reanimated spring animations)
- Экспорт в CSV/изображение
- Темный режим (Dark Mode)
- Локализация (i18n)
- Оффлайн режим
- Unit тесты (Jest + React Native Testing Library)

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
├── api/
│   ├── client.ts         — axios + interceptors + API ключи
│   └── coingecko.ts      — API методы с MMKV кэшем & retry
├── state/
│   ├── tokens.ts         — Effector store (список, фильтры)
│   ├── tokenDetail.ts    — Effector store (детали, граф)
│   └── index.ts
├── screens/
│   ├── TokensListScreen.tsx      — экран списка + фильтры + retry
│   ├── TokenDetailScreen.tsx     — детали + встроенный граф
│   ├── PriceChartScreen.tsx      — полноэкранный граф (NEW!)
│   └── index.ts
├── components/
│   ├── TokenItem.tsx             — элемент списка (коллапс)
│   ├── TokenList.tsx             — FlatList с фильтрацией
│   ├── PriceChart.tsx            — встроенный SVG граф с жестами
│   ├── ExpandedPriceChart.tsx    — расширенный граф (NEW!)
│   ├── SkeletonLoader.tsx        — loader анимация 📦
│   ├── StateComponents.tsx       — error + empty states
│   └── index.ts
├── utils/
│   ├── formatters.ts    — цена, %, фильтрация
│   ├── cache.ts         — MMKV с TTL 💾
│   ├── retry.ts         — exponential backoff
│   └── types/
│       └── index.ts     — TypeScript типы
├── config.ts            — .env => конфиг
└── App.tsx              — NavigationContainer (3 экрана)
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
