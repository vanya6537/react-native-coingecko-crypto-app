# FSD Quick Reference

Fast reference for working with Feature Sliced Design in this project.

## 🎯 Quick Navigation

### Creating a New Feature

```bash
mkdir -p src/features/myFeature/{ui,model,api,types}
```

### Feature Template

```typescript
// src/features/myFeature/types/index.ts
export interface MyState { /* ... */ }

// src/features/myFeature/model/index.ts
import { createStore, createEvent } from 'effector';
export const $myStore = createStore(/* ... */);
export const myEvent = createEvent();

// src/features/myFeature/api/index.ts
export const myFeatureAPI = {
  async fetchData() { /* ... */ }
};

// src/features/myFeature/ui/MyComponent.tsx
import React from 'react';
export const MyComponent = () => { /* ... */ };

// src/features/myFeature/index.ts (PUBLIC API)
export * from './model';
export * from './api';
export { MyComponent } from './ui/MyComponent';
export * from './types';
```

## 📁 Feature Layer Breakdown

### `model/`
- **Purpose**: State management
- **Tools**: Effector (stores, events, effects)
- **Exports**: Stores, events, derived stores
- **Example**: `$tokens`, `fetchInitialTokens`, `setFilters`

### `api/`
- **Purpose**: Data fetching and transformation
- **Tools**: Axios, cache, retry logic
- **Exports**: API object with methods
- **Example**: `tokensListAPI.getTokensList(page, perPage)`

### `ui/`
- **Purpose**: Feature-specific UI components
- **Tools**: React Native
- **Exports**: React components
- **Example**: `LoginScreen`, reusable feature widgets

### `types/`
- **Purpose**: TypeScript types
- **Exports**: Interfaces and types
- **Example**: `ListFilters`, `UIState`

## 🔌 Using Features

### In Pages
```typescript
import { $myStore, myEvent } from '@/features/myFeature';
import { MyComponent } from '@/features/myFeature';

export const MyPage = () => {
  const myStore = useUnit($myStore);
  return <MyComponent />;
};
```

### In Shared Components
```typescript
// ✅ Import from feature's public API
import { $data } from '@/features/someFeature';

// ❌ Never import from internals
import { $data } from '@/features/someFeature/model';  // NO!
```

### In Other Features (Rare)
```typescript
// Only if truly needed - prefer communication through shared layer
import { $auth } from '@/features/auth';

// Better: Pass data as props from pages
```

## 🚀 Common Patterns

### Fetching Data with Effector
```typescript
// model/index.ts
const fetchDataFx = createEffect(async (id: string) => {
  return myFeatureAPI.fetchData(id);
});

export const $data = createStore(null)
  .on(fetchDataFx.doneData, (_, data) => data);

export const $loading = createStore(false)
  .on(fetchDataFx, () => true)
  .on(fetchDataFx.finally, () => false);
```

### Using Shared Components
```typescript
import { TokenItem, FilterBar } from '@/shared/ui';

export const MyComponent = () => {
  return (
    <>
      <FilterBar filters={filters} onFilterChange={setFilters} />
      <TokenItem token={token} onPress={handlePress} />
    </>
  );
};
```

### Caching API Responses
```typescript
import { cache } from '@/shared/lib/cache';

export const myFeatureAPI = {
  async fetchData(id: string) {
    const cached = cache.get(`data_${id}`);
    if (cached) return cached;
    
    const data = await client.get(`/data/${id}`);
    cache.set(`data_${id}`, data, 5 * 60 * 1000); // 5 min TTL
    return data;
  }
};
```

### Retrying Failed Requests
```typescript
import { withRetry } from '@/shared/lib/retry';

export const myFeatureAPI = {
  async fetchData(id: string) {
    return withRetry(async () => {
      const response = await client.get(`/data/${id}`);
      return response.data;
    }, 3); // retry 3 times
  }
};
```

## 📊 Import Paths

```typescript
// Features
import { $store, event } from '@/features/featureName';

// Shared UI
import { Component } from '@/shared/ui';

// Shared Types
import type { MyType } from '@/shared/types';

// Shared Utils
import { formatPrice } from '@/shared/utils/formatters';

// Shared Libraries
import { cache } from '@/shared/lib/cache';
import { withRetry } from '@/shared/lib/retry';

// Shared Config
import config from '@/shared/config';

// Pages
import { MyPage } from '@/pages';

// App
import { App } from '@/app';
```

## 🎨 Styling Best Practices

```typescript
// Colocate styles with components
const MyComponent = () => {
  return <View style={styles.container}>{/* ... */}</View>;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
});
```

## ✅ Checklist for New Features

- [ ] Created `features/myFeature/` with all subdirectories
- [ ] Defined types in `types/index.ts`
- [ ] Created API in `api/index.ts`
- [ ] Set up state in `model/index.ts`
- [ ] Built UI in `ui/` folder
- [ ] Exported public API in `index.ts`
- [ ] Created corresponding page in `pages/`
- [ ] Updated `app/App.tsx` navigation if needed
- [ ] Added TypeScript types throughout
- [ ] Tested feature independently

## 🐛 Debugging Tips

### 1. Check Feature Exports
```bash
# Verify public API includes what you need
cat src/features/myFeature/index.ts
```

### 2. Validate Import Paths
```typescript
// Use feature's public API
import { item } from '@/features/myFeature';

// NOT internals
import { item } from '@/features/myFeature/model'; // ❌
```

### 3. Check Types
```typescript
// Ensure types are properly exported
import type { MyType } from '@/features/myFeature/types';
```

### 4. Effector DevTools
```typescript
// Add to your store for debugging
import { createStore } from 'effector';

export const $myStore = createStore(initialValue)
  .watch(value => console.log('Store updated:', value));
```

## 📚 Resources

- **FSD_ARCHITECTURE.md** - Detailed architecture guide
- **MIGRATION_GUIDE.md** - Old → New structure mapping
- **Effector Docs** - https://effector.dev
- **React Navigation** - https://reactnavigation.org

---

**Happy coding with FSD! 🚀**
