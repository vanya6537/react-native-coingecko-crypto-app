# Token Item Expansion Feature

## Overview

Implement expandable token list items with lazy-loaded data according to FSD architecture. Each token item can be expanded/collapsed to show detailed information including 7-day price chart and statistics.

## Architecture

### Layer Organization (FSD)

```
shared/
├── hooks/
│   ├── useExpandedToken.ts          # State management for expanded tokens
│   └── useOptimizedTokenExpanded.ts # Lazy data loading
├── ui/
│   ├── TokenItem.tsx                # Expandable list item component
│   └── ExpandedTokenInfo.tsx        # Expanded details display

features/tokensList/
├── ui/
│   └── ExpandableTokenItem.tsx      # Container component
└── index.ts                         # Public API

pages/
└── TokensListPage.tsx               # Usage example
```

## Components

### 1. TokenItem (shared/ui)
Base expandable list item component with minimal props.

**Props:**
```typescript
interface TokenItemProps {
  token: Token;
  isExpanded?: boolean;           // Expansion state
  onPress?: (token: Token) => void;
  onToggleExpand?: (tokenId: string) => void;  // Toggle handler
  expandedContent?: ReactNode;     // Custom expanded view
  isLoadingExpanded?: boolean;     // Loading indicator
}
```

**Features:**
- Collapse arrow indicator
- Animated expand/collapse with Reanimated
- Memoized to prevent unnecessary re-renders
- Memory efficient (only one item expanded)

### 2. ExpandedTokenInfo (shared/ui)
Displays detailed token information when expanded.

**Props:**
```typescript
interface ExpandedTokenInfoProps {
  token: Token;
  priceHistory?: PriceHistory[];
  isLoadingHistory?: boolean;
  stats?: StatItem[];  // Custom stats (optional)
}
```

**Displays:**
- 7-day price chart
- Market cap, volume, ATH/ATL
- Market cap rank
- Token description

### 3. useExpandedToken (shared/hooks)
State management hook for tracking expanded tokens.

**Usage:**
```typescript
const expandedState = useExpandedToken();

// Check if token is expanded
const isExpanded = expandedState.isExpanded(tokenId);

// Toggle expansion
expandedState.toggleExpanded(tokenId);

// Collapse all
expandedState.collapse();
```

**Benefits:**
- Only one token expanded at a time
- Memory efficient
- Prevents unnecessary data loading

### 4. useOptimizedTokenExpanded (shared/hooks)
Lazy-loads data only when token is expanded.

**Usage:**
```typescript
useOptimizedTokenExpanded({
  token,
  isExpanded,
  days: 7,  // Price history days
  options: { prefetchOnly: true }  // Prefetch data in advance
});
```

**Benefits:**
- Prefetches token details on expansion
- Integrates with React Query cache
- Prevents loading data for collapsed items
- Smooth expansion experience

### 5. ExpandableTokenItem (features/tokensList)
Container component that orchestrates everything.

**Usage:**
```typescript
<ExpandableTokenItem
  token={token}
  expandedState={expandedState}
  priceHistoryDays={7}
/>
```

## Implementation Example

### In List Component

```typescript
import { useExpandedToken } from '@shared/hooks';
import { ExpandableTokenItem } from '@features/tokensList';

export const TokensList = () => {
  const expandedState = useExpandedToken();

  return (
    <FlatList
      data={tokens}
      renderItem={({ item }) => (
        <ExpandableTokenItem
          token={item}
          expandedState={expandedState}
          priceHistoryDays={7}
        />
      )}
    />
  );
};
```

### Custom Expanded Content

If you need custom expanded content instead of ExpandedTokenInfo:

```typescript
<TokenItem
  token={token}
  isExpanded={isExpanded}
  onToggleExpand={handleToggle}
  expandedContent={<CustomInfoComponent token={token} />}
  isLoadingExpanded={isLoading}
/>
```

## Data Loading Flow

```
1. User taps token item header
   ↓
2. useExpandedToken toggles state
   ↓
3. TokenItem re-renders with isExpanded=true
   ↓
4. useOptimizedTokenExpanded prefetches data
   ↓
5. useTokenDetail hook fetches if not cached
   ↓
6. usePriceHistory hook fetches price data
   ↓
7. ExpandedTokenInfo renders with data
```

## Performance Optimizations

### Memory Efficiency
- Only one token expanded at a time (via useExpandedToken)
- Animations handled by Reanimated
- Memoized components prevent unnecessary re-renders

### Data Efficiency
- React Query caching prevents duplicate API calls
- Prefetching happens only on expansion
- Stale time: 10 minutes for token details
- Stale time: 1 hour for price history

### Rendering Efficiency
- Shallow memo comparison in TokenItem
- FlatList constraints:
  - maxToRenderPerBatch: 10
  - updateCellsBatchingPeriod: 50ms
  - removeClippedSubviews: true

## Key Features Implemented

✅ **Item Expansion/Collapse** - Click to expand/collapse  
✅ **Lazy Data Loading** - Data loads only when expanded  
✅ **7-Day Price Chart** - Animated chart display  
✅ **Token Statistics** - Market cap, volume, rank, etc.  
✅ **Memory Efficient** - Only one expanded at a time  
✅ **Smooth Animations** - Reanimated with spring physics  
✅ **FSD Architecture** - Clean layer separation  
✅ **React Query Cache** - Efficient data reuse  

## Testing Considerations

1. **Expansion State**: Verify only one item expanded per list
2. **Data Loading**: Check data loads on expansion, not on mount
3. **Animations**: Test smooth expand/collapse with Reanimated
4. **Cache**: Verify data reuse on re-expansion
5. **Memory**: Profile memory usage with expanded items

## Future Enhancements

- [ ] Swipe to expand gesture support
- [ ] Custom animation curves
- [ ] Persistent expansion state (localStorage)
- [ ] Multiple expanded items option
- [ ] Compare multiple tokens view
- [ ] Export expanded data (PDF/image)
