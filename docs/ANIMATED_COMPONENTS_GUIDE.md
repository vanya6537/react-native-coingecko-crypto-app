# 🎬 Animated Components Guide

Complete collection of premium animated UI components for the React Native app. All components feature smooth Reanimated v2 animations with spring physics for a "WOW" user experience.

## Components Overview

### 1. **PriceChartAdvanced** 🎨
TradingView-like interactive price chart with animations, gradients, and data points.

```tsx
import { PriceChartAdvanced } from '@/shared/ui';

<PriceChartAdvanced
  data={priceHistory}
  height={320}
/>
```

**Features:**
- SVG gradient fills
- Interactive crosshair on tap
- Animated grid and data points
- Min/Max indicators
- 7D price range legend

---

### 2. **PricePulseBadge** 💓
Animated price display with pulse on price changes.

```tsx
import { PricePulseBadge } from '@/shared/ui';

<PricePulseBadge price={currentPrice} changeColor={priceUp ? 'green' : 'red'} />
```

**Features:**
- Scale pulse animation on price prop change
- Customizable colors for up/down
- Smooth 350ms animation sequence

---

### 3. **AnimatedStatCard** 📊
Premium stat card with scale and entrance animations.

```tsx
import { AnimatedStatCard } from '@/shared/ui';

<AnimatedStatCard
  label="Market Cap"
  value="$1.2B"
  color="#1976D2"
  delay={100}
/>
```

**Features:**
- FadeInUp entrance animation
- Scale effects on hover
- Color bar indicator
- Customizable delay for cascading

---

### 4. **AnimatedScreenHeader** 🏢
Expandable screen header with collapsible animations.

```tsx
import { AnimatedScreenHeader } from '@/shared/ui';

<AnimatedScreenHeader
  title="Bitcoin"
  subtitle="BTC"
  onBackPress={() => navigation.goBack()}
  rightAction={{ icon: '⭐', onPress: toggleFavorite }}
  color="#1976D2"
/>
```

**Features:**
- Expandable on tap
- Animated title resize (16px → 28px)
- Animated subtitle fade-in
- Left/Right action buttons
- Gradient indicator bar

---

### 5. **AnimatedFloatingActionButton** 🚀
Premium FAB with pulse and wobble effects.

```tsx
import { AnimatedFloatingActionButton } from '@/shared/ui';

<AnimatedFloatingActionButton
  icon="+"
  color="#1976D2"
  size="large"
  position="bottom-right"
  label="Add Token"
  onPress={addToken}
/>
```

**Features:**
- BounceInUp entrance
- Wobble rotation on press
- Customizable sizes (small/medium/large)
- Pulse background effect
- Position options for layout control

---

### 6. **AnimatedTabBar** 📑
Navigation bar with sliding indicator animation.

```tsx
import { AnimatedTabBar } from '@/shared/ui';

const tabs = [
  { id: 'all', label: 'All', icon: '📊' },
  { id: 'favorites', label: 'Favorites', icon: '⭐' },
  { id: 'portfolio', label: 'Portfolio', icon: '💼' },
];

<AnimatedTabBar
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  color="#1976D2"
/>
```

**Features:**
- Smooth indicator animation
- Auto-scroll to active tab
- Icon + label support
- Staggered entrance animations

---

### 7. **AnimatedSnackBar** 🔔
Toast notifications with auto-dismiss.

```tsx
import { AnimatedSnackBar } from '@/shared/ui';

<AnimatedSnackBar
  visible={visible}
  message="Data updated successfully"
  type="success"
  duration={3000}
  actionLabel="Undo"
  onAction={undo}
  onDismiss={onDismiss}
/>
```

**Features:**
- Type variants: success, error, warning, info
- Auto-dismiss with timer
- Action button support
- SlideInUp/SlideOutDown animations
- Progress indicator bar

---

### 8. **AnimatedLoader** ⏳
Loading indicator with rotating segments and pulse.

```tsx
import { AnimatedLoader } from '@/shared/ui';

<AnimatedLoader
  visible={isLoading}
  size="large"
  color="#1976D2"
  message="Loading tokens..."
/>
```

**Features:**
- Rotating segment animation
- Pulsing outer ring
- Customizable sizes
- Optional loading message
- 1500ms rotation cycle

---

### 9. **AnimatedCard** 🎴
Reusable card with interactive elevation and scale.

```tsx
import { AnimatedCard } from '@/shared/ui';

<AnimatedCard
  onPress={handleCardPress}
  backgroundColor="#F8F9FA"
  borderRadius={12}
  elevation={2}
  index={0}
>
  {/* Card content */}
</AnimatedCard>
```

**Features:**
- FadeInUp entrance with stagger
- Scale animation on hover (0.97x)
- Elevation interpolation
- Shadow animations
- Optional long-press support

---

### 10. **AnimatedBadge & AnimatedDivider** 🏷️
Reusable badge and divider components.

```tsx
import { AnimatedBadge, AnimatedDivider } from '@/shared/ui';

<AnimatedBadge label="New" color="white" backgroundColor="#FF6B6B" />
<AnimatedBadge variant="pulse" label="5" />
<AnimatedBadge variant="dot" />

<AnimatedDivider color="#E0E0E0" thickness={1} />
```

**Features:**
- Badge variants: default, pulse, dot
- Customizable colors and sizes
- ScaleIn entrance animations
- Divider FadeInDown animation

---

### 11. **AnimatedButton** 🔘
Material Design inspired button with press animations.

```tsx
import { AnimatedButton } from '@/shared/ui';

<AnimatedButton
  label="Send"
  onPress={send}
  variant="solid"
  size="large"
  icon="✓"
  color="#00C853"
/>
```

**Features:**
- Variants: solid, outlined, text
- Sizes: small, medium, large
- Optional icon with wobble animation
- Scale animation on press
- Loading state support

---

### 12. **AnimatedModal** 🪟
Modal dialogs with backdrop and scale animations.

```tsx
import { AnimatedModal } from '@/shared/ui';

<AnimatedModal
  visible={visible}
  onDismiss={onDismiss}
  animationType="zoom"
  backdropOpacity={0.5}
>
  {/* Modal content */}
</AnimatedModal>
```

**Features:**
- AnimationType: fade, slide, zoom
- Backdrop fade animation
- ZoomIn/ZoomOut content
- Customizable backdrop opacity
- Auto-dismiss on backdrop tap

---

### 13. **AnimatedListItem** 📋
List item with swipe actions and entrance animations.

```tsx
import { AnimatedListItem } from '@/shared/ui';

<AnimatedListItem
  title="Bitcoin"
  subtitle="$29,450.00"
  icon="₿"
  onPress={selectToken}
  actions={[
    { label: 'Buy', icon: '🛒', color: '#00C853', onPress: buy },
    { label: 'Sell', icon: '📉', color: '#F44336', onPress: sell },
  ]}
  isDragging={isDragging}
  index={index}
/>
```

**Features:**
- FadeInLeft entrance (staggered by index)
- Title + optional subtitle
- Icon support
- Swipe actions
- Drag indicator
- Scale on press

---

### 14. **AnimatedInput** 📝
Text input with floating label animations.

```tsx
import { AnimatedInput } from '@/shared/ui';

<AnimatedInput
  label="Enter amount"
  value={amount}
  onChangeText={setAmount}
  icon="💰"
  error={error}
  color="#1976D2"
  delay={100}
/>
```

**Features:**
- Floating label (14px → 11px)
- Focus animations with color change
- Error state with red underline
- Optional icon
- FadeInDown entrance

---

### 15. **AnimatedBottomSheet** 📄
Bottom sheet with swipe and snap animations.

```tsx
import { AnimatedBottomSheet } from '@/shared/ui';

<AnimatedBottomSheet
  visible={visible}
  onDismiss={closeBs}
  snapPoints={[100, 300, 500]}
>
  {/* Sheet content */}
</AnimatedBottomSheet>
```

**Features:**
- SlideInUp entrance
- Drag handle
- Multi-point snapping
- Backdrop dismiss
- Smooth animations between snap points

---

### 16. **AnimatedProgressBar** 📈
Linear and circular progress indicators.

```tsx
import { 
  AnimatedProgressBar, 
  AnimatedCircularProgress 
} from '@/shared/ui';

// Linear
<AnimatedProgressBar
  value={progress}
  color="#1976D2"
  height={4}
  showLabel={true}
/>

// Circular
<AnimatedCircularProgress
  value={progress}
  size={80}
  color="#1976D2"
  showLabel={true}
/>
```

**Features:**
- Linear: smooth width animation
- Circular: rotating arc animation
- Customizable colors and sizes
- Optional labels (0% - 100%)
- 800ms animation duration

---

## Animation Stack

All components use **Reanimated v2** with:
- **Spring Physics**: `damping: 6-8` for natural feel
- **Entrance Animations**: FadeInDown, FadeInLeft, BounceInUp, ZoomIn
- **Interaction Animations**: Scale, rotate, elevation changes
- **Layout Animations**: `Layout.springify()` for smooth remounting

## Usage Patterns

### Staggered Entrance
```tsx
{items.map((item, index) => (
  <AnimatedCard key={item.id} delay={index * 50} index={index}>
    {item.content}
  </AnimatedCard>
))}
```

### Cascading Animation
```tsx
{/* Chart at 100ms delay */}
{/* Stats at 300ms with 150ms stagger between items */}
{/* Description at 500ms delay */}
```

### Gesture Feedback
```tsx
const handlePressIn = () => {
  scaleValue.value = withSpring(0.95); // Press feedback
};

const handlePressOut = () => {
  scaleValue.value = withSpring(1); // Return to normal
};
```

## Performance Tips

1. **Use index-based delays** for better control over animation timing
2. **Memoize animated components** to prevent unnecessary re-renders
3. **Limit simultaneous animations** - use delays to spread them out
4. **Test on mid-range devices** - 60fps target but optimize for 30fps

## Import Examples

```tsx
// Import entire UI library
import {
  AnimatedCard,
  AnimatedButton,
  AnimatedTabBar,
  // ... etc
} from '@/shared/ui';

// Or import specific components
import { AnimatedFloatingActionButton } from '@/shared/ui';
```

---

**Total Animated Components: 16+** ✨  
**Animation Framework: Reanimated v2** 🎬  
**Physics Engine: Spring animations** 🌟
