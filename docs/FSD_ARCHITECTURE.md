# Feature Sliced Design (FSD) Architecture

This project now follows **Feature Sliced Design (FSD)** architecture with **KISS** (Keep It Simple, Stupid) principles.

## 📁 Project Structure

```
src/
├── app/                          # App-level entry point and configuration
│   ├── App.tsx                  # Main App component (navigation orchestration)
│   └── index.ts                 # Public API
│
├── pages/                        # Full-page components (composition layer)
│   ├── LoginPage.tsx            # Composes Auth feature
│   ├── TokensListPage.tsx       # Composes TokensList feature
│   ├── TokenDetailPage.tsx      # Composes TokenDetail feature
│   ├── TokenPriceChartPage.tsx  # Full-screen price chart
│   └── index.ts                 # Public API
│
├── features/                     # Business logic slices (feature-based)
│   ├── auth/                    # Authentication feature
│   │   ├── ui/                 # UI components
│   │   │   └── LoginScreen.tsx
│   │   ├── model/              # Effector stores and events
│   │   │   └── index.ts
│   │   ├── types/              # Feature types
│   │   │   └── index.ts
│   │   └── index.ts            # Feature public API
│   │
│   ├── tokensList/             # Token listing feature
│   │   ├── ui/                 # UI components
│   │   ├── model/              # State management
│   │   ├── api/                # API calls
│   │   ├── types/              # Types
│   │   └── index.ts
│   │
│   ├── tokenDetail/            # Token detail feature
│   │   ├── ui/                 # UI components
│   │   ├── model/              # State management
│   │   ├── api/                # API calls
│   │   ├── types/              # Types
│   │   └── index.ts
│   │
│   └── priceChart/             # Price chart feature
│       ├── ui/                 # UI components
│       ├── model/              # State (reuses tokenDetail)
│       └── index.ts
│
├── shared/                       # Shared across all features (KISS principle)
│   ├── ui/                      # Reusable UI components
│   │   ├── TokenItem.tsx
│   │   ├── FilterBar.tsx
│   │   ├── PriceChart.tsx
│   │   ├── SkeletonLoader.tsx
│   │   ├── StateComponents.tsx
│   │   ├── TokenDetailSections.tsx
│   │   ├── ExpandedPriceChart.tsx
│   │   └── index.ts
│   │
│   ├── api/                     # Shared API client
│   │   └── client.ts           # Axios instance with interceptors
│   │
│   ├── types/                   # Shared types
│   │   └── index.ts
│   │
│   ├── utils/                   # Utilities
│   │   └── formatters.ts       # Formatting functions
│   │
│   ├── lib/                     # Libraries
│   │   ├── cache.ts            # MMKV cache utility
│   │   └── retry.ts            # Retry utility
│   │
│   └── config/                  # Configuration
│       └── index.ts            # App configuration
│
├── App.tsx                       # Root app export
└── index.ts                      # Entry point
```

## 🎯 Core Principles

### Feature Sliced Design (FSD)

Each feature is **self-contained** with:
- **`ui/`** - UI components specific to the feature
- **`model/`** - State management (Effector stores and events)
- **`api/`** - API/data layer specific to the feature
- **`types/`** - TypeScript types specific to the feature
- **`index.ts`** - Public API (controlled exports)

**Benefits:**
- ✅ Easy to locate code by feature
- ✅ Low coupling between features
- ✅ Easy to add/remove features
- ✅ Clear dependencies
- ✅ Scalable for large teams

### KISS - Keep It Simple, Stupid

- **Shared Layer**: Only truly shared, reusable components go here
- **Feature Isolation**: Each feature manages its own state independently
- **No Over-Engineering**: Avoid complex abstractions unless needed
- **Single Responsibility**: Each layer has one job

## 🔄 Data Flow

```
UI (Components)
    ↓
Pages (Composition)
    ↓
Features (Business Logic)
    ├→ Model (State with Effector)
    ├→ API (Data fetching)
    └→ UI (Feature components)
    ↓
Shared (Utilities, Types, Components)
```

## 📱 Feature Examples

### Auth Feature
```typescript
// Accessing auth state
import { $isAuthenticated, loginSuccess } from '@/features/auth';

// Using auth components
import { LoginScreen } from '@/features/auth';
```

### TokensList Feature
```typescript
// Fetching tokens
import { fetchInitialTokens, $tokens } from '@/features/tokensList';

// Components layer accessed via pages
```

## 💡 Usage Guidelines

### Adding a New Feature

```bash
src/features/myFeature/
├── ui/
│   └── MyComponent.tsx
├── model/
│   └── index.ts          # Effector stores/events
├── api/
│   └── index.ts          # Data fetching
├── types/
│   └── index.ts          # TypeScript types
└── index.ts              # Public API
```

### Importing from Features

```typescript
// ✅ DO: Import from public API
import { $myStore, myEvent } from '@/features/myFeature';

// ❌ DON'T: Import from internal layers
import { $myStore } from '@/features/myFeature/model';
```

### Sharing Components

```typescript
// If a component is used in multiple features, move it to shared/ui
import { TokenItem } from '@/shared/ui';
```

## 🛠️ Technologies

- **React Native** - Mobile framework
- **TypeScript** - Type safety
- **Effector** - State management (declarative, functional)
- **React Navigation** - Routing
- **Axios** - HTTP client
- **MMKV** - Local storage (performance-optimized)
- **React Native Reanimated** - Animations
- **D3** - Data visualization

## 📊 Type Safety

All types are organized by feature:
- **Shared types** in `shared/types/`
- **Feature-specific types** in `features/*/types/`
- Strict TypeScript configuration (`tsconfig.json`)

## 🚀 Performance

- **Code Splitting**: Features can be lazy-loaded
- **Caching**: API responses cached with MMKV
- **Memoization**: Components memoized to prevent unnecessary re-renders
- **Pagination**: Infinite scroll implemented efficiently

## 📚 Summary

This architecture provides:
1. **Clear Structure**: Easy to understand and navigate
2. **Scalability**: Grows well with team size and feature count
3. **Maintainability**: Changes isolated to specific features
4. **Type Safety**: Full TypeScript support
5. **Performance**: Optimized for mobile
6. **Simplicity**: Avoids over-complexity (KISS)

---

**Remember**: Feature Sliced Design + KISS = Maintainable, scalable code! 🎯
