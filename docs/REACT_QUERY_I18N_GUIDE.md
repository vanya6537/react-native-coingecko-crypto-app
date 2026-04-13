# React Query + i18n Optimization & Notifications Guide

## 🎯 Overview

Complete implementation of:
- **React Query v5** for data fetching with smart caching
- **i18n** translations for notifications and UI
- **Visual Toast Notifications** with lucide icons
- **Cache Optimization** strategies for memory efficiency
- **Prefetching** strategies for better perceived performance

---

## 📦 Dependencies Installed

```json
{
  "@tanstack/react-query": "^5.99.0",
  "react-i18next": "^14.0.0",
  "i18next": "^23.7.6",
  "lucide-react-native": "^latest",
  "moti": "^0.latest"
}
```

---

## 🎨 Visual Toast Notifications

### Features
- ✅ 4 toast types: success, error, info, warning
- ✅ Lucide icons for visual feedback
- ✅ Auto-dismiss with customizable duration
- ✅ Manual close button
- ✅ Optional action buttons
- ✅ Smooth animations with Moti
- ✅ Full i18n support

### Usage

```typescript
// Available in any component
import { successToast, errorToast, infoToast, warningToast } from '@/features/notifications';

// Simple usage
successToast('Operation completed!');
errorToast('Something went wrong');
infoToast('Loading data...');
warningToast('Low memory warning');

// With custom action
showToast({
  type: 'info',
  message: 'Retry operation?',
  duration: 5000,
  action: {
    label: 'Retry',
    onPress: () => {
      // Handle retry
    },
  },
});
```

### i18n Translations

```typescript
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <Button 
      onPress={() => successToast(t('notifications.success'))}
    >
      {t('common.save')}
    </Button>
  );
}
```

---

## ⚡ React Query Optimization

### 1. Prefetching Strategies

#### Basic Prefetch
```typescript
import { prefetchTokensList, prefetchTokenDetail } from '@/api/prefetch';

const queryClient = useQueryClient();

// Prefetch single item
await prefetchTokenDetail(queryClient, 'bitcoin');

// Prefetch list with pagination
await prefetchTokensList(queryClient, 1, 50);
```

#### Smart Prefetching
```typescript
import { smartPrefetch, prefetchTokensInBatch } from '@/api/prefetch';

// Intelligent prefetch (next page + page after)
await smartPrefetch(queryClient, currentPage);

// Batch prefetch multiple tokens
const tokenIds = ['bitcoin', 'ethereum', 'solana'];
await prefetchTokensInBatch(queryClient, tokenIds, batchSize=3);
```

#### Trending Tokens
```typescript
import { prefetchTrendingTokens } from '@/api/prefetch';

// Prefetch top 10 trending with full details
const trending = await prefetchTrendingTokens(queryClient, topN=10);
```

### 2. Cache Management

#### Query Keys Factory
```typescript
import { queryKeys } from '@/api/queryClient';

// Type-safe query keys
const tokenListKey = queryKeys.tokens.list(page, limit);
const tokenDetailKey = queryKeys.tokenDetail.detail(tokenId);
const priceHistoryKey = queryKeys.priceHistory.history(tokenId, days);
```

#### Cache Configuration

```typescript
// Aggressive: Frequent updates, higher memory
CACHE_STRATEGIES.aggressive = {
  staleTime: 2 * 60 * 1000,    // 2 min
  gcTime: 5 * 60 * 1000,       // 5 min
};

// Moderate: Balanced (default)
CACHE_STRATEGIES.moderate = {
  staleTime: 5 * 60 * 1000,    // 5 min
  gcTime: 10 * 60 * 1000,      // 10 min
};

// Conservative: Low memory usage
CACHE_STRATEGIES.conservative = {
  staleTime: 15 * 60 * 1000,   // 15 min
  gcTime: 30 * 60 * 1000,      // 30 min
};
```

### 3. Memory Optimization

#### Monitor Cache Size
```typescript
import { estimateCacheSize, formatCacheSize } from '@/api/optimization';

const queryClient = useQueryClient();
const sizeBytes = estimateCacheSize(queryClient);
const sizeFormatted = formatCacheSize(sizeBytes); // "2.5 MB"
```

#### Aggressive Garbage Collection
```typescript
import { aggressiveGC } from '@/api/optimization';

// Auto-cleanup when cache exceeds 50MB
aggressiveGC(queryClient, maxSizeMB=50);
```

#### Automatic Cleanup
```typescript
import { startCacheOptimization } from '@/api/prefetch';

// Start 5-minute interval cleanup
const stopCleanup = startCacheOptimization(queryClient);

// Later: stop cleanup
// stopCleanup();
```

### 4. Network-Aware Caching

```typescript
import { getNetworkAdjustedConfig } from '@/api/optimization';

const baseConfig = CACHE_STRATEGIES.moderate;
const networkState = {
  isOnline: true,
  effectiveType: '4g' // 'slow-2g' | '2g' | '3g' | '4g'
};

const adjustedConfig = getNetworkAdjustedConfig(baseConfig, networkState);
// Offline: gcTime = 2 hours, staleTime = 1 hour
// Slow network: More aggressive caching
```

---

## 🎯 useOptimizedQuery Hook

Universal hook combining query, notifications, and prefetching:

```typescript
import { useOptimizedQuery } from '@/shared/hooks/useOptimizedQuery';
import { queryKeys } from '@/api/queryClient';

export function TokensList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Basic usage
  const { data: tokens, isLoading } = useOptimizedQuery(
    {
      queryKey: queryKeys.tokens.list(1, 50),
      queryFn: () => coingecko.getTokensList(50, 0),
    },
    {
      showSuccessNotification: true,
      prefetchNext: true,
      onSuccess: () => {
        console.log('Data loaded successfully');
      },
    }
  );

  return (
    <View>
      {isLoading ? <Loader /> : <TokenListView data={tokens} />}
    </View>
  );
}
```

### Advanced Options

```typescript
interface UseOptimizedQueryOptions<T> {
  showSuccessNotification?: boolean;     // Show toast on success
  successMessage?: string;                // Custom success message
  showErrorNotification?: boolean;        // Show toast on error
  errorMessage?: string;                  // Custom error message
  prefetchNext?: boolean;                 // Auto-prefetch next page
  onSuccess?: (data: T) => void;         // Success callback
  onError?: (error: Error) => void;      // Error callback
}
```

---

## 📊 Demo Page

Complete showcase available at: `NotificationsShowcasePage`

### Features Demo
1. **Random Notifications** - Test all 4 toast types
2. **Visual Feedback** - See icons, colors, animations
3. **Prefetching Controls** - Test various prefetch strategies
4. **Cache Utilities** - Monitor, optimize, clear cache
5. **Memory Stats** - Real-time cache size tracking
6. **Data Preview** - See loaded tokens

### Access via Navigation
```typescript
<Stack.Screen
  name="NotificationsShowcase"
  component={NotificationsShowcasePage}
/>
```

---

## 🔄 Complete Workflow Example

```typescript
import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useOptimizedQuery } from '@/shared/hooks/useOptimizedQuery';
import { usePrefetch } from '@/shared/hooks/useOptimizedQuery';
import { queryKeys } from '@/api/queryClient';
import { coingecko } from '@/api/coingecko';

export function TokensScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { prefetch } = usePrefetch();

  // Load page 1
  const { data: tokens, isLoading } = useOptimizedQuery(
    {
      queryKey: queryKeys.tokens.list(1, 50),
      queryFn: () => coingecko.getTokensList(50, 0),
    },
    {
      showSuccessNotification: true,
      successMessage: t('notifications.dataLoaded'),
    }
  );

  // Prefetch page 2 after tokens load
  useEffect(() => {
    if (tokens && tokens.length > 0) {
      prefetch(
        queryKeys.tokens.list(2, 50),
        () => coingecko.getTokensList(50, 50),
        { staleTime: 5 * 60 * 1000, silent: true }
      );
    }
  }, [tokens, prefetch]);

  return (
    <ScrollView>
      {isLoading ? (
        <Loader />
      ) : (
        tokens?.map(token => (
          <TokenCard key={token.id} token={token} />
        ))
      )}
    </ScrollView>
  );
}
```

---

## 📈 Performance Best Practices

### 1. Paginated Data
```typescript
// Use cursor-based pagination for infinite scroll
const getPaginationHelper = createCursorPaginationHelper(50);

const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: queryKeys.tokens.infinite(),
  queryFn: ({ pageParam }) => fetchTokens(pageParam),
  initialPageParam: 0,
  getNextPageParam: getPaginationHelper.getNextPageParam,
});
```

### 2. Batch Operations
```typescript
// Group prefetches to avoid race conditions
await Promise.all([
  prefetchTokenDetail(queryClient, 'bitcoin'),
  prefetchTokenDetail(queryClient, 'ethereum'),
  prefetchTokenDetail(queryClient, 'solana'),
]);
```

### 3. Selective Loading
```typescript
// Only load necessary fields
const selectiveQuery = useOptimizedQuery({
  queryKey: queryKeys.tokenDetail.detail(id),
  queryFn: async () => {
    const full = await coingecko.getTokenDetail(id);
    return {
      id: full.id,
      name: full.name,
      price: full.price,
      // Omit heavy data
    };
  },
});
```

### 4. Smart Invalidation
```typescript
import { smartInvalidate } from '@/api/optimization';

// Invalidate only related queries
await smartInvalidate(queryClient, (key) => 
  key[0] === 'tokens' && key[1] === 'detail'
);
```

---

## 🌍 i18n Integration

### Add New Language
1. Create `src/shared/i18n/locales/xx.ts`
2. Export in `src/shared/i18n/index.ts`
3. Add to resources in i18next config

```typescript
// New locale
export const es = {
  notifications: {
    success: '¡Éxito!',
    prefetching: 'Precargando...',
    // ...
  },
};
```

### Language Switching
```typescript
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  return (
    <Button 
      onPress={() => i18n.changeLanguage('es')}
    >
      Español
    </Button>
  );
}
```

---

## 📱 Node 22 Compatibility

✅ Fully compatible with Node.js 22.22.0 and npm 10.9.4
- ES2024 features supported
- No breaking changes
- Performance optimized

---

## 🚀 Summary

| Feature | Location | Status |
|---------|----------|--------|
| React Query | `@/api/` | ✅ Installed & Configured |
| i18n Translations | `@/shared/i18n/` | ✅ Extended with notifications |
| Toast Notifications | `@/features/notifications/ui/` | ✅ Built with lucide |
| Prefetching | `@/api/prefetch.ts` | ✅ Multiple strategies |
| Cache Optimization | `@/api/optimization.ts` | ✅ Memory management |
| Custom Hooks | `@/shared/hooks/` | ✅ useOptimizedQuery ready |
| Demo Page | `NotificationsShowcasePage.tsx` | ✅ Full showcase |

All systems are production-ready! 🎉
