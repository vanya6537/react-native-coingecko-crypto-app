# Migration Guide: FSD Implementation

This document maps old project structure to the new FSD-based architecture.

## Old vs New Structure

### Authentication

| Old | New |
|-----|-----|
| `src/state/auth.ts` | `src/features/auth/model/index.ts` |
| `src/screens/LoginScreen.tsx` | `src/features/auth/ui/LoginScreen.tsx` |
| - | `src/features/auth/types/auth.ts` |
| - | `src/features/auth/index.ts` (public API) |

**Import changes:**
```typescript
// OLD
import { $isAuthenticated, loginSuccess } from './state/auth';
import { LoginScreen } from './screens';

// NEW
import { $isAuthenticated, loginSuccess } from '@/features/auth';
import { LoginScreen } from '@/features/auth';
```

### Token Listing

| Old | New |
|-----|-----|
| `src/state/tokens.ts` | `src/features/tokensList/model/index.ts` |
| `src/api/coingecko.ts` (partial) | `src/features/tokensList/api/index.ts` |
| `src/screens/TokensListScreen.tsx` | `src/pages/TokensListPage.tsx` |
| `src/components/TokenItem.tsx` | `src/shared/ui/TokenItem.tsx` |
| `src/components/FilterBar.tsx` | `src/shared/ui/FilterBar.tsx` |

### Token Detail

| Old | New |
|-----|-----|
| `src/state/tokenDetail.ts` | `src/features/tokenDetail/model/index.ts` |
| `src/api/coingecko.ts` (partial) | `src/features/tokenDetail/api/index.ts` |
| `src/screens/TokenDetailScreen.tsx` | `src/pages/TokenDetailPage.tsx` |
| `src/screens/PriceChartScreen.tsx` | `src/pages/TokenPriceChartPage.tsx` |

### Shared Types

| Old | New |
|-----|-----|
| `src/types/index.ts` | `src/shared/types/index.ts` |
| `src/config.ts` | `src/shared/config/index.ts` |
| `src/api/client.ts` | `src/shared/api/client.ts` |

### Shared Utils

| Old | New |
|-----|-----|
| `src/utils/formatters.ts` | `src/shared/utils/formatters.ts` |
| `src/utils/cache.ts` | `src/shared/lib/cache.ts` |
| `src/utils/retry.ts` | `src/shared/lib/retry.ts` |

### Shared UI Components

| Old | New |
|-----|-----|
| `src/components/TokenItem.tsx` | `src/shared/ui/TokenItem.tsx` |
| `src/components/FilterBar.tsx` | `src/shared/ui/FilterBar.tsx` |
| `src/components/PriceChart.tsx` | `src/shared/ui/PriceChart.tsx` |
| `src/components/SkeletonLoader.tsx` | `src/shared/ui/SkeletonLoader.tsx` |
| `src/components/StateComponents.tsx` | `src/shared/ui/StateComponents.tsx` |
| `src/components/TokenDetailSections.tsx` | `src/shared/ui/TokenDetailSections.tsx` |
| `src/components/ExpandedPriceChart.tsx` | `src/shared/ui/ExpandedPriceChart.tsx` |

### Main App

| Old | New |
|-----|-----|
| `src/App.tsx` | `src/app/App.tsx` |
| - | `src/pages/` (composition layer) |

## Import Path Examples

### Before (Old Structure)

```typescript
import { $tokens, fetchInitialTokens } from './state/tokens';
import { coingeckoAPI } from './api/coingecko';
import { TokenItem, FilterBar } from './components';
import type { Token, ListFilters } from './types';
import { formatPrice } from './utils/formatters';
import { cache } from './utils/cache';
import { withRetry } from './utils/retry';
```

### After (FSD Structure)

```typescript
import { $tokens, fetchInitialTokens } from '@/features/tokensList';
import { tokensListAPI } from '@/features/tokensList/api';
import { TokenItem, FilterBar } from '@/shared/ui';
import type { Token } from '@/shared/types';
import { formatPrice } from '@/shared/utils/formatters';
import { cache } from '@/shared/lib/cache';
import { withRetry } from '@/shared/lib/retry';
```

## Key Changes in Implementation

### State Management (Effector)

No changes to Effector usage - it's been moved to feature layers:

```typescript
// Still the same, just relocated
export const $myStore = createStore(initialValue);
export const myEvent = createEvent();
```

### API Calls

API functions now organized per feature:

```typescript
// src/features/tokensList/api/index.ts
export const tokensListAPI = {
  async getTokensList(page, perPage) {
    // ...
  },
};

// Usage in model
const fetchTokensPageFx = createEffect(async (params) => {
  return tokensListAPI.getTokensList(params.page, params.pageSize);
});
```

### Page Composition

Pages now compose features:

```typescript
// src/pages/TokensListPage.tsx
export const TokensListPage: React.FC<TokensListPageProps> = ({ navigation }) => {
  // Uses TokensList feature
  const [tokens, filters] = useUnit([$tokens, $filters]);
  // ...
};
```

## alias Configuration

For easier imports, consider adding path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"],
      "@/pages/*": ["src/pages/*"],
      "@/app/*": ["src/app/*"]
    }
  }
}
```

Then use cleaner imports:
```typescript
import { $tokens } from '@/features/tokensList';
```

## Backward Compatibility

The old `src/` files remain for now as a gradual migration path:
- Old imports still work
- New code uses FSD structure  
- Gradually refactor old code

## Next Steps

1. **Review the FSD structure** - Understand feature organization
2. **Update your imports** - Use feature public APIs
3. **Add new features** - Follow the FSD pattern
4. **Gradual migration** - Move old screens/state to new structure
5. **Archive old files** - Delete `src/screens`, `src/state`, `src/components` after migration

## Questions?

Refer to `FSD_ARCHITECTURE.md` for detailed architecture documentation.
