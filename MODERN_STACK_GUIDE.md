# Modern Tech Stack - React Query + i18n + Live Notifications

## 📋 Overview

Complete implementation of a modern React Native tech stack featuring:
- **@tanstack/react-query** v5: Smart data fetching, caching, and synchronization
- **react-i18next** v14: Multi-language support (EN + RU)
- **lucide-react-native**: Beautiful vector icons
- **moti**: Smooth animations
- **Effector**: State management for notifications

---

## 🎯 Core Features Implemented

### 1. React Query Integration

**Location**: `src/api/`

#### Files:
- `queryClient.ts` - Query client setup with optimized defaults
- `hooks.ts` - Standard react-query hooks with caching strategies
- `prefetch.ts` - Intelligent prefetching and cache optimization
- `optimization.ts` - Memory-efficient garbage collection
- `useQueryWithLiveNotifications.ts` - **NEW** - Live updates with toast notifications

#### Key Configurations:

```typescript
// Cache Strategy
staleTime: 5-10 minutes          // Data considered "fresh"
gcTime: 10-15 minutes            // Keep in memory after unmount
retry: 2 attempts                // Exponential backoff retries
networkMode: 'online'            // Only refetch when online

// Automatic Behaviors
refetchOnWindowFocus: true       // Refetch when app regains focus
refetchOnReconnect: true         // Refetch after network restore
refetchOnMount: 'stale'          // Refetch if data is stale
```

#### Smart Prefetching:

```typescript
// Prefetch next page automatically
smartPrefetch(queryClient, currentPage, pageSize);

// Batch prefetch multiple token details
prefetchTokensInBatch(queryClient, tokenIds, batchSize);

// Prefetch trending tokens
prefetchTrendingTokens(queryClient, topN);
```

#### Memory Optimization:

```typescript
// Remove unused queries after 30 minutes
optimizeQueryCache(queryClient);

// Aggressive garbage collection
aggressiveGC(queryClient, threshold);

// Periodic cleanup
startCacheOptimization(queryClient);  // Runs every 5 minutes
```

---

### 2. Visual Notifications System

**Location**: `src/features/notifications/`

#### Toast Store (Effector):

```typescript
// Model: src/features/notifications/model/toastStore.ts
showToast(payload)              // Generic toast
successToast(message)           // ✅ Green success
errorToast(message)             // ❌ Red error
warningToast(message)           // ⚠️ Orange warning
infoToast(message)              // ℹ️ Blue info
```

#### Toast UI Component:

- **File**: `src/features/notifications/ui/ToastContainer.tsx`
- **Features**:
  - Stacked toasts with auto-dismiss (2-4 seconds)
  - Smooth moti animations
  - Lucide icons for each type
  - Action buttons with custom callbacks
  - Manual close option

#### Notification Types:

| Type | Icon | Color | Duration |
|------|------|-------|----------|
| Success | ✓ | #10b981 (green) | 2s |
| Error | ✕ | #ef4444 (red) | 4s |
| Info | ℹ | #3b82f6 (blue) | 3s |
| Warning | ⚠ | #f59e0b (amber) | 3.5s |

---

### 3. Live Price Notifications

**Location**: `src/api/useQueryWithLiveNotifications.ts`

#### Hooks:

**`useQueryWithLiveNotifications(tokenIds, config)`**
- Fetches tokens with react-query
- Auto-prefetches next pages
- Simulates live price updates
- Triggers notifications on price changes
- Returns: `{ tokens, isLoading, startLivePriceMonitoring, getCurrentPrice }`

**`useLiveTokenUpdates(pageSize)`**
- Infinite scroll with live updates
- Real-time price monitoring
- Automatic cache management
- Returns: `{ tokens, activePrices, fetchNextPage, startLiveUpdates }`

**`useCachedTokenWithNotifications(tokenId)`**
- Monitors cache hits
- Shows "cached" toast on hit
- Auto-prefetches related data
- Returns: `{ data, isLoading, cacheHit }`

#### Example Usage:

```typescript
const { tokens, startLivePriceMonitoring } = useQueryWithLiveNotifications([], {
  enablePrefetch: true,
  notificationThreshold: 1.5  // Notify on ±1.5% changes
});

// Start monitoring top 5 tokens
const cleanup = startLivePriceMonitoring(tokens.slice(0, 5), 2000);

// Cleanup on unmount
useEffect(() => {
  return () => cleanup();
}, []);
```

---

### 4. i18n Localization

**Location**: `src/shared/i18n/`

#### Supported Languages:
- **English (en)** - Full translations
- **Russian (ru)** - Full translations

#### Translation Keys:

```typescript
// Common
common.loading, common.error, common.retry, common.search
common.cancel, common.save, common.delete, common.close

// Notifications (NEW)
notifications.title                  // "Notifications"
notifications.success                // "Notification sent successfully"
notifications.dataLoaded             // "Data loaded successfully"
notifications.dataRefreshed          // "Data refreshed"
notifications.cacheHit               // "Using cached data"
notifications.prefetching            // "Prefetching data..."
notifications.offlineMode            // "Offline Mode: Using cached data"
notifications.reconnected            // "Connection restored"
notifications.priceUp                // "{{name}} price increased by {{percent}}%"
notifications.priceDown              // "{{name}} price decreased by {{percent}}%"

// Tokens, Favorites, Export, Offline, Errors, Success...
```

#### Usage:

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <View>
      <Text>{t('notifications.dataLoaded')}</Text>
      <Text>{t('common.loading')}</Text>
      
      {/* Switch language */}
      <Button 
        onPress={() => i18n.changeLanguage('ru')} 
        title="Русский"
      />
    </View>
  );
}
```

---

### 5. Notifications Showcase Page

**Location**: `src/pages/NotificationsShowcasePage.tsx`

#### Features:

1. **Visual Notifications Demo**
   - Random notification types
   - All toast variants (success, error, info, warning)

2. **Live Price Alerts** (NEW)
   - Start/Stop live monitoring
   - Real-time price updates
   - Toast notifications on price changes
   - Top 5 tokens preview

3. **Cache Statistics**
   - Queries cached count
   - Current cache size
   - Real-time updates

4. **Optimization Controls**
   - Prefetch next page
   - Batch prefetch tokens
   - Optimize cache
   - Clear all cache

5. **Data Preview**
   - Loading state
   - Tokens list sample
   - Error handling

---

## 🚀 Performance Optimizations

### Memory Management

```typescript
// Automatic cleanup
- Unused queries removed after 30 minutes
- Aggressive GC on demand
- Periodic cache optimization every 5 minutes

// Cache size tracking
estimateCacheSize(queryClient)  // Get cache size in bytes
formatCacheSize(bytes)          // Format for display
```

### Data Fetching

```typescript
// Prefetching Strategy
1. Prefetch next page on scroll
2. Prefetch related token details
3. Batch load up to 5 items
4. Avoid duplicate API calls

// Caching Hierarchy
- Tokens list: 5 min fresh, 10 min cache lifetime
- Token detail: 10 min fresh, 15 min cache lifetime
- Price history: 30 min fresh, keeps longer for trends
```

### Network Handling

```typescript
// Offline first
- Use cached data when offline
- Queue mutations for sync
- Resume sync on reconnect
- Show "offline mode" indicator

// Retry Strategy
- Exponential backoff: 1s, 2s, 4s... (max 30s)
- Only retry on network errors
- Skip retry on 4xx errors
- Manual retry available
```

---

## 📊 Quick Start

### 1. Using React Query Hooks

```typescript
import { useTokensList, useTokenDetail } from '@/api/hooks';

function TokensScreen() {
  const { data: tokens, isLoading } = useTokensList(1, 50);
  const { data: detail } = useTokenDetail(tokenId);
  
  return <FlatList data={tokens} />;
}
```

### 2. Showing Notifications

```typescript
import { successToast, errorToast } from '@/features/notifications/model/toastStore';

// In your event handler
try {
  await fetchData();
  successToast('Data loaded! 🎉');
} catch (error) {
  errorToast('Failed to load data');
}
```

### 3. Live Monitoring

```typescript
import { useQueryWithLiveNotifications } from '@/api/useQueryWithLiveNotifications';

function LivePrices() {
  const { tokens, startLivePriceMonitoring } = useQueryWithLiveNotifications();
  
  const handleMonitor = () => {
    const cleanup = startLivePriceMonitoring(tokens.slice(0, 5));
    return cleanup;
  };
}
```

### 4. Prefetching

```typescript
import { prefetchTokensList, smartPrefetch } from '@/api/prefetch';

// On page change
const handleLoadMore = async (page) => {
  setCurrentPage(page);
  await smartPrefetch(queryClient, page);  // Prefetch next pages
};
```

---

## 🔧 Configuration

### React Query Client

**File**: `src/api/queryClient.ts`

```typescript
queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      gcTime: 10 * 60 * 1000,       // 10 minutes
      retry: 2,
      networkMode: 'online',
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: 'stale',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
}
```

### i18n Configuration

**File**: `src/shared/i18n/index.ts`

```typescript
// Detects device language (RU or EN)
// Falls back to EN
// Supports manual language switching
```

---

## 📁 File Structure

```
src/
├── api/
│   ├── queryClient.ts                (✅ Query setup + cache keys)
│   ├── hooks.ts                      (✅ React Query hooks)
│   ├── prefetch.ts                   (✅ Smart prefetching)
│   ├── optimization.ts               (✅ Cache optimization)
│   ├── useQueryWithLiveNotifications.ts  (✨ NEW)
│   ├── coingecko.ts
│   └── client.ts
│
├── features/notifications/
│   ├── model/
│   │   ├── index.ts                  (Price alerts)
│   │   ├── toastStore.ts             (✨ NEW - Toast state)
│   │   └── index.ts
│   ├── ui/
│   │   ├── ToastContainer.tsx        (✨ NEW - Toast UI)
│   │   └── index.ts
│   ├── api/
│   ├── types/
│   └── index.ts
│
├── shared/
│   ├── i18n/
│   │   ├── index.ts              (✅ i18n setup)
│   │   └── locales/
│   │       ├── en.ts             (✅ English translations)
│   │       └── ru.ts             (✅ Russian translations)
│   ├── hooks/
│   │   └── useLivePriceNotifications.ts
│   └── ui/
│
├── pages/
│   └── NotificationsShowcasePage.tsx  (✨ NEW - Full demo)
│
└── app/
    └── App.tsx                       (Integrates ToastContainer)
```

---

## 🎨 Design System

### Colors

**Success**: `#10b981` (Emerald)
**Error**: `#ef4444` (Red)
**Info**: `#3b82f6` (Blue)
**Warning**: `#f59e0b` (Amber)
**Background**: `#f8fafc` (Slate)
**Text**: `#1e293b` (Slate dark)

### Typography

**Title**: 24px, bold
**Section title**: 16px, bold
**Label**: 13px, regular
**Button**: 14px, semi-bold

---

## 🧪 Testing the Stack

### Demo Page

Navigate to the Notifications Showcase page to test:

1. **Random notifications** - Click button to see random toast type
2. **Individual notification types** - Test each type separately
3. **Live price alerts** - Start monitoring top 5 tokens
4. **Cache statistics** - Watch real-time queue/cache size
5. **Prefetching** - Prefetch next pages
6. **Cache optimization** - Run garbage collection
7. **Data preview** - View loaded tokens

### Expected Behaviors

✅ Toasts appear at top of screen
✅ Auto-dismiss after configured duration
✅ Stack when multiple toasts shown
✅ Live prices update every 2 seconds
✅ Notifications on price changes ±1.5%
✅ Cache size decreases after optimization
✅ Language switches between EN/RU instantly

---

## 📚 Dependencies

```json
{
  "@tanstack/react-query": "^5.99.0",
  "react-i18next": "^14.0.0",
  "i18next": "^23.7.6",
  "lucide-react-native": "latest",
  "moti": "latest",
  "effector": "^23.4.4",
  "effector-react": "^23.3.0",
  "@notifee/react-native": "^9.1.8"
}
```

---

## ✨ What's New

### Added Files
- ✨ `src/api/useQueryWithLiveNotifications.ts` - Live notifications with react-query
- ✨ `src/features/notifications/model/toastStore.ts` - Toast state management
- ✨ `src/features/notifications/ui/ToastContainer.tsx` - Toast UI with lucide
- ✨ Enhanced i18n translations for notifications
- ✨ `src/pages/NotificationsShowcasePage.tsx` - Full feature demo

### Updated Files
- ✅ `src/api/prefetch.ts` - Fixed TypeScript error
- ✅ `src/api/queryClient.ts` - Already optimized
- ✅ `src/shared/i18n/locales/en.ts` - Added notification keys
- ✅ `src/shared/i18n/locales/ru.ts` - Added notification keys

---

## 🎯 Next Steps

1. **Integration**: Add `<ToastContainer />` to your main App
2. **Usage**: Replace toast/notification calls with new hooks
3. **Testing**: Use NotificationsShowcasePage for testing
4. **Customization**: Adjust cache times based on your data
5. **Monitoring**: Track cache size and query counts in production

---

## 📖 Documentation Links

- [React Query Docs](https://tanstack.com/query/latest)
- [i18next Docs](https://www.i18next.com/)
- [Lucide Icons](https://lucide.dev/)
- [Moti Animations](https://moti.fyi/)
- [Effector State Management](https://effector.dev/)

