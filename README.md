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

### 2. Установите зависимости
```bash
npm install
```

### 3. Установите pods (iOS)
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

### Metro bundler (для дебага)
```bash
npm start
```

## Архитектура

### 3-слойная архитектура:

1. **Data Layer** (`src/api/`)
   - CoinGecko API клиент
   - Запросы списка токенов, деталей, исторических данных
   - Эффективное кэширование через react-query

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

### Экран детали токена
- ✅ Основная информация (цена, 24ч изменение)
- ✅ Сетка статистики (rank, market cap, ATH, ATL)
- ✅ **Интерактивный график** (7-дневная история)
  - Свайп/клик для выбора точки
  - Отображение цены и даты в выбранной точке
  - Gradient fill под линией графика
  - Масштабируемая ось Y

## Примечание по стеку

### Почему Effector вместо Redux?
- Меньше бойлерплейта
- Более функциональный подход
- Проще масштабировать small-to-medium приложение

### Почему собственный график вместо библиотеки?
- Полный контроль над интерактивностью
- Минимальный bundle size
- react-native-svg + простая математика для масштабирования

### Пагинация: Load More вместо infinite scroll
- Симптоматичнее для React Native (FlatList может нагреваться)
- Явный контроль пользователя над загрузкой

## Оптимизация производительности
- ✅ FlatList с keyExtractor
- ✅ React.memo для компонентов
- ✅ Effector мемоизирует вычисления
- ✅ react-query кэширует запросы (5 мин по умолчанию)

## Возможные улучшения (не в scope)
- Локальный кэш (AsyncStorage или MMKV)
- Skeleton loaders
- Анимации раскрытия (Reanimated)
- Тесты (Jest + React Testing Library)
- PWA версия (Expo Web)

## Технический стек

| Слой | Инструменты |
|------|-----------|
| **UI** | React Native 0.84, @react-navigation |
| **State** | Effector 23, effector-react |
| **Data** | axios, @tanstack/react-query |
| **Graph** | react-native-svg, рассчет D3 |
| **Gestures** | react-native-gesture-handler |
| **Animation** | react-native-reanimated |
| **Lang** | TypeScript 5.4 |

## IDE Setup (WebStorm/VS Code)

Для лучшего DX:
1. Установите расширения/плагины для TypeScript
2. Скопируйте `.node-version` в проект
3. Используйте `nvm use` перед `npm install`

## Лицензия
MIT
