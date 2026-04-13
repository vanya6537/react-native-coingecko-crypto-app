# Crypto Tokens App - Navigation & Routing Guide

## Complete Navigation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        APP ENTRY POINT (App.tsx)                        │
│                                                                         │
│  ✓ Effector-powered Auth State ($isAuthenticated)                      │
│  ✓ QueryClient for API caching                                         │
│  ✓ GestureHandlerRootView for gestures                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            NOT AUTHENTICATED               AUTHENTICATED
                    │                               │
                    ▼                               ▼
        ┌──────────────────┐         ┌──────────────────────────┐
        │   LOGIN STACK    │         │    MAIN APP STACK        │
        └──────────────────┘         └──────────────────────────┘
                    │                               │
                    ▼                               ├─► TokensListScreen
              ┌──────────────┐                      ├─► TokenDetailScreen
              │ LoginScreen  │                      └─► PriceChartScreen
              │              │
              │ 🔐 Features: │
              │ • Email/PW   │
              │ • Show/Hide  │
              │ • Demo mode  │
              │ • Mock auth  │
              └──────────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
      Sign In           Try Demo
          │                   │
          │   (both work)     │
          │                   │
          └─────────┬─────────┘
                    │
              loginSuccess()
                    │
                    ▼
            ┌──────────────────┐
            │ TokensListScreen │  ← MAIN SCREEN
            │                  │
            │ 🎯 Features:     │
            │ • List all       │
            │ • Search         │
            │ • Sort (3 ways)  │
            │ • Pagination     │
            │ • Collapsible    │
            │ • Tap for detail │
            └──────────────────┘
                  │    (tap token)
                  ▼
            ┌──────────────────────────┐
            │  TokenDetailScreen       │  ← DETAIL SCREEN
            │                          │
            │ 🎯 Features:             │
            │ • Basic info + icon      │
            │ • Price + 24h change     │
            │ • Stats grid (4 items)   │
            │ • Interactive chart      │
            │ • Swipe chart points     │
            │ • 📈 Fullscreen button   │
            │ • Description            │
            └──────────────────────────┘
                  │    (tap 📈)
                  ▼
            ┌──────────────────────────┐
            │   PriceChartScreen       │  ← FULLSCREEN CHART
            │                          │
            │ 🎯 Features:             │
            │ • Large 7-day chart      │
            │ • Grid lines + labels    │
            │ • Selection circle       │
            │ • Vertical indicator     │
            │ • Price + date tooltip   │
            │ • Stats panel (H/L/Avg)  │
            │ • Instructions hint      │
            │ • Back button            │
            └──────────────────────────┘
```

---

## Screen Details

### 1️⃣ LoginScreen (`src/screens/LoginScreen.tsx`)

**Flow:** App Start → Check `$isAuthenticated` → Show LoginScreen

**Props:**
```typescript
interface LoginScreenProps {
  onLoginSuccess: (token: string) => void;
}
```

**UI Elements:**
- 💰 Logo emoji
- "Crypto Tokens" title
- Email input (prefilled: demo@example.com)
- Password input (prefilled: password123) with show/hide toggle
- "Sign In" button (calls `handleLogin()`)
- "Try Demo" button (quick login)
- Demo credentials hint
- Version info footer

**Behavior:**
- Any email/password combination works (mock auth)
- 1.5s simulated delay
- Shows loading spinner during "API call"
- Calls `onLoginSuccess()` with mock token
- Token format: `token_${timestamp}_${random}`

**State Management:**
```typescript
loginSuccess(token) → $authState updated → isAuthenticated = true
```

---

### 2️⃣ TokensListScreen (`src/screens/TokensListScreen.tsx`)

**Flow:** After login → Show TokensListScreen (main screen)

**Route Name:** `"TokensList"`

**Features:**

#### Search & Filter
- Real-time search by token name/symbol
- `filterTokens()` utility function
- FlatList with online filtering
- Clears on item select

#### Sorting (3 options)
1. **Market Cap** (default, descending)
2. **Price** (descending)
3. **24h Change** (descending)

#### Pagination
- "Load More" button at bottom
- Infinite scroll pattern
- `page` state increments on press
- Fetches from API with cache + retry

#### UI Elements
- Header: "Crypto Tokens" + count
- Search bar (magnifying glass icon)
- 3 sort buttons (gray when inactive, blue when active)
- TokenList component (FlatList wrapper)
- States: loading (skeleton), error (with retry), empty, data

#### Navigation
- **Tap TokenItem** → navigate to `TokenDetailScreen`
- Passes `tokenId` param

---

### 3️⃣ TokenDetailScreen (`src/screens/TokenDetailScreen.tsx`)

**Flow:** `TokensListScreen` → (tap token) → `TokenDetailScreen`

**Route Params:**
```typescript
{
  tokenId: string; // e.g., "bitcoin"
}
```

**Features:**

#### Header Section
- Token icon (from API or placeholder)
- Token name (e.g., "Bitcoin")
- Symbol (e.g., "BTC")
- Current price (large, bold)
- 24h change % (green/red, ▲/▼)

#### Stats Grid (2x2)
- Rank (#1, #2, etc.)
- Market Cap ($xxx B/M)
- All-Time High ($xxx)
- All-Time Low ($xxx)

#### Interactive Chart (Inline)
- Height: ~180px
- 7-day price data
- PanResponder for touch tracking:
  - Drag finger → shows price at point
  - Vertical line indicator
  - Selection circle on point
  - Tooltip with price + date
  - Day counter (e.g., "3/7")
- Gradient fill under line
- Grid lines on Y-axis
- X-axis time labels

#### Description Section
- Token description from API
- Scrollable within screen

#### Navigation
- **Header back button** → TokensListScreen
- **Tap 📈 Fullscreen button** → navigate to `PriceChartScreen`
  - Passes `tokenId` and `tokenName` as params

---

### 4️⃣ PriceChartScreen (`src/screens/PriceChartScreen.tsx`)

**Flow:** `TokenDetailScreen` → (tap 📈) → `PriceChartScreen`

**Route Params:**
```typescript
{
  tokenId: string;     // e.g., "bitcoin"
  tokenName: string;   // e.g., "Bitcoin"
}
```

**Features:**

#### Chart Display (ExpandedPriceChart)
- Height: 300+ px (more detail)
- Full width
- 7-day data
- PanResponder gestures:
  - Touch to select point
  - Shows price + date on selection
  - Vertical dashed line indicator
  - Selection circle
  - Day position (e.g., "3/7")
- Grid lines with Y-axis price labels
- Gradient fill
- Instructions panel: "👆 Drag your finger across the chart"

#### Header
- Token name in title
- Current price display
- 24h change %

#### Stats Panel (Bottom)
- 7-day High: $XXX.XX
- 7-day Low: $XXX.XX
- 7-day Average: $XXX.XX

#### Navigation
- **Header back button** → TokenDetailScreen
- Swipe-back on iOS supported

---

## State Management (Effector)

### Auth State (`src/state/auth.ts`)

```typescript
Store: $authState
├── isAuthenticated: boolean
├── authToken: string | null
└── user: { id: string; email: string } | null

Events:
├── loginSuccess(token: string) → sets isAuthenticated=true
├── logout() → clears auth state
└── restoreToken(token: string) → restores from storage (future)

Derived Stores:
├── $isAuthenticated
├── $authToken
└── $user
```

### Token List State (`src/state/tokens.ts`)

```typescript
Store: $tokens (Token array)
Store: $filters (search, sortBy)
Store: $pagination (page, limit, total)
Store: $loading, $error

Events:
├── fetchTokens() → API call + cache
├── setFilters({ search, sortBy })
├── nextPage()
├── resetTokens()
└── selectToken(tokenId)
```

### Token Detail State (`src/state/tokenDetail.ts`)

```typescript
Store: $tokenDetail (full metadata)
Store: $priceHistory (7-day history)
Store: $selectedToken
Store: $loading, $error

Events:
├── fetchTokenDetail(id)
├── fetchPriceHistory(id)
└── fetchPriceChart(id)
```

---

## Complete Navigation Stack

```typescript
// App.tsx

<NavigationContainer>
  <Stack.Navigator>
    {!isAuthenticated ? (
      // Auth Group
      <Stack.Group>
        <Stack.Screen name="Login">
          {() => <LoginScreen onLoginSuccess={handleLoginSuccess} />}
        </Stack.Screen>
      </Stack.Group>
    ) : (
      // App Group
      <Stack.Group>
        <Stack.Screen name="TokensList" component={TokensListScreen} />
        <Stack.Screen name="TokenDetail" component={TokenDetailScreen} />
        <Stack.Screen name="PriceChart" component={PriceChartScreen} />
      </Stack.Group>
    )}
  </Stack.Navigator>
</NavigationContainer>
```

---

## Route Names (TypeScript Type-Safe)

```typescript
type RootStackParamList = {
  Login: undefined;
  TokensList: undefined;
  TokenDetail: {
    tokenId: string;
  };
  PriceChart: {
    tokenId: string;
    tokenName: string;
  };
};
```

---

## Navigation Usage Examples

### From LoginScreen to TokensList
```typescript
eventBus.api
loginSuccess(token) → $isAuthenticated = true → RenderTokensListScreen
```

### From TokensList to TokenDetail
```typescript
navigation.navigate('TokenDetail', { tokenId: 'bitcoin' })
```

### From TokenDetail to PriceChart
```typescript
navigation.navigate('PriceChart', { 
  tokenId: 'bitcoin',
  tokenName: 'Bitcoin'
})
```

### From PriceChart back to TokenDetail
```typescript
navigation.goBack()
```

### Logout (from any authenticated screen)
```typescript
logout() → $isAuthenticated = false → RenderLoginScreen
```

---

## Key Features by Screen

| Feature | Login | TokensList | TokenDetail | PriceChart |
|---------|-------|-----------|-------------|-----------|
| Auth flow | ✅ | ✗ | ✗ | ✗ |
| Search | ✗ | ✅ | ✗ | ✗ |
| Sort | ✗ | ✅ | ✗ | ✗ |
| Pagination | ✗ | ✅ | ✗ | ✗ |
| Collapsible | ✗ | ✅ | ✓ | ✗ |
| Interactive chart | ✗ | ✗ | ✅ | ✅ |
| Touch gestures | ✗ | ✗ | ✅ | ✅ |
| Stats display | ✗ | ✗ | ✅ | ✅ |
| Full-screen mode | ✗ | ✗ | ✗ | ✅ |

---

## API Integration

### Endpoints Used

| Endpoint | Used In | Cache TTL |
|----------|---------|-----------|
| `/markets` | TokensList | 5 min |
| `/{id}` | TokenDetail | 10 min |
| `/{id}/market_chart/data` | PriceChart, TokenDetail | 1 hour |
| `/search` | TokensList search | 30 min |

### Data Flow

```
LoginScreen (no API)
    ↓
TokensListScreen ←→ CoinGecko API (/markets)
    ↓
    (MMKV Cache + Retry)
TokenDetailScreen ←→ CoinGecko API (/{id}, /{id}/market_chart)
    ↓
PriceChartScreen ←→ Cache (reuse)
```

---

## Testing Mock Features

### 1. Login Mock
- **Email**: demo@example.com (or any email)
- **Password**: password123 (or any password)
- **Result**: Any credentials work; returns mock token

### 2. Token Data (Real)
- Fetched from CoinGecko API
- Real prices, 7-day history

### 3. Auth State (Mock)
- Persists during session
- Lost on app restart (no AsyncStorage persistence yet)
- Can be restored via `restoreToken` event

---

## TypeScript Types

```typescript
// Navigation
declare global {
  namespace RootStackParamList {
    Login: undefined;
    TokensList: undefined;
    TokenDetail: { tokenId: string };
    PriceChart: { tokenId: string; tokenName: string };
  }
}

// Auth
interface AuthState {
  isAuthenticated: boolean;
  authToken: string | null;
  user: { id: string; email: string } | null;
}

// Token
interface Token {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap_rank: number | null;
  price_change_percentage_24h: number;
  // ...
}
```

---

## Now Live ✅

- ✅ **Login Screen** with mock authentication
- ✅ **4-screen navigation** (Login, List, Detail, Chart)
- ✅ **Effector auth state** (~isAuthenticated)
- ✅ **Interactive routing** with params
- ✅ **All features documented**

**Ready for**: TypeScript validation, Metro bundling, iOS/Android builds
