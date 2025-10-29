# Coming Soon Component - Technical Specifications

## Component Overview

**File**: `src/components/ui/ComingSoon.tsx`  
**Type**: React Functional Component  
**Purpose**: Display placeholder "Coming Soon" cards for features under development

---

## Props Interface

```typescript
interface ComingSoonProps {
  title?: string;
  description?: string;
  icon?: 'sparkles' | 'calendar' | 'bell' | 'rocket' | 'trending' | 'zap';
  variant?: 'default' | 'gradient' | 'minimal' | 'feature';
  size?: 'sm' | 'md' | 'lg';
}
```

### Prop Details

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Coming Soon'` | Heading text for the component |
| `description` | `string` | `'Get recent updates on events happening in HyperBuds'` | Descriptive text explaining the upcoming feature |
| `icon` | `'sparkles' \| 'calendar' \| 'bell' \| 'rocket' \| 'trending' \| 'zap'` | `'sparkles'` | Icon to display at the top |
| `variant` | `'default' \| 'gradient' \| 'minimal' \| 'feature'` | `'default'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Icon size |

---

## Variants

### 1. Gradient Variant (`variant="gradient"`)

**Use Case**: Main dashboard eye-catching sections  
**Appearance**: Full gradient background with animations

**Features**:
- Purple-blue-indigo gradient background
- Animated decorative blurred circles
- Animated pulse badge
- Centered content with large title
- White text for contrast
- Animated dots at bottom

**Example**:
```typescript
<ComingSoon
  variant="gradient"
  icon="rocket"
  title="Live Streaming & Go Live"
  description="Soon you'll be able to broadcast live sessions..."
/>
```

**CSS Classes**:
- Background: `bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600`
- Dark mode: `dark:from-purple-700 dark:via-blue-700 dark:to-indigo-700`
- Overlay: `bg-black/10 dark:bg-black/20`

---

### 2. Feature Variant (`variant="feature"`)

**Use Case**: Right sidebar feature previews  
**Appearance**: Compact card with subtle gradient background

**Features**:
- Subtle gradient background (gray to white)
- Purple accent badge
- Smaller, more compact design
- Optimized for sidebar width
- Purple icon accent

**Example**:
```typescript
<ComingSoon
  variant="feature"
  icon="bell"
  title="Recent Activities"
  description="Stay updated with friend requests..."
/>
```

**CSS Classes**:
- Background: `bg-gradient-to-br from-gray-50 via-white to-purple-50/20`
- Dark mode: `dark:from-gray-900 dark:via-gray-800 dark:to-purple-950/20`
- Badge: `bg-purple-100 dark:bg-purple-500/20`

---

### 3. Default Variant (`variant="default"`)

**Use Case**: General purpose cards  
**Appearance**: Clean white/gray card with blue accents

**Features**:
- White background with border
- Blue accent colors
- Medium-sized design
- Animated dots
- Balanced for any layout

**Example**:
```typescript
<ComingSoon
  variant="default"
  icon="trending"
  title="Creator Marketplace"
  description="Discover and offer services..."
/>
```

**CSS Classes**:
- Background: `bg-white dark:bg-gray-800/50`
- Border: `border-gray-200/60 dark:border-gray-700/60`
- Badge: `bg-blue-100 dark:bg-blue-500/20`

---

### 4. Minimal Variant (`variant="minimal"`)

**Use Case**: Simple, understated placeholders  
**Appearance**: Minimal design with gray tones

**Features**:
- Gray background
- Smaller text and elements
- No animations
- Very lightweight
- Subtle design

**Example**:
```typescript
<ComingSoon
  variant="minimal"
  icon="calendar"
  title="Events Calendar"
  description="View all upcoming events"
/>
```

**CSS Classes**:
- Background: `bg-gray-50 dark:bg-gray-800/50`
- Border: `border-gray-200 dark:border-gray-700`
- Badge: `bg-gray-200 dark:bg-gray-700`

---

## Icons

### Available Icons

| Icon Value | Lucide Icon | Color | Use Case |
|------------|-------------|-------|----------|
| `sparkles` | `<Sparkles>` | Blue/Purple | General features, recommendations |
| `calendar` | `<Calendar>` | Purple | Events, scheduling, sessions |
| `bell` | `<Bell>` | Blue | Notifications, activities, alerts |
| `rocket` | `<Rocket>` | Purple | Launch features, new capabilities |
| `trending` | `<TrendingUp>` | Pink | Trending content, analytics |
| `zap` | `<Zap>` | Yellow | Quick actions, energy, power features |

### Icon Sizes

| Size | Class | Pixels |
|------|-------|--------|
| `sm` | `w-5 h-5` | 20px |
| `md` | `w-6 h-6` | 24px (default) |
| `lg` | `w-8 h-8` | 32px |

---

## Dark Mode Support

All variants fully support dark mode with automatic color adjustments:

### Color Transformations

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background gradient | `from-purple-600` | `dark:from-purple-700` |
| Text primary | `text-gray-900` | `dark:text-gray-100` |
| Text secondary | `text-gray-600` | `dark:text-gray-400` |
| Badge background | `bg-purple-100` | `dark:bg-purple-500/20` |
| Border | `border-gray-200` | `dark:border-gray-700` |

---

## Animations

### Pulse Animation
Used for the "Coming Soon" badge indicator:
```css
animate-pulse /* Tailwind utility */
```

### Custom Delay Animations
Bottom dots have staggered animations:
```typescript
style={{ animationDelay: '0.15s' }}
style={{ animationDelay: '0.3s' }}
```

### Bounce Animation
Icon in gradient variant:
```css
animate-bounce /* Tailwind utility */
```

---

## Responsive Design

All variants are responsive by default:

### Breakpoints
- **Mobile** (< 640px): Full width, stacked layout
- **Tablet** (640px - 1024px): Adjusted padding and text sizes
- **Desktop** (> 1024px): Full layout with optimal spacing

### Text Scaling
```typescript
// Title
className="text-2xl md:text-3xl" // Gradient variant
className="text-lg" // Feature variant

// Description  
className="text-base md:text-lg" // Gradient variant
className="text-sm" // Feature variant
```

---

## Usage Examples

### Example 1: Main Dashboard Section
```typescript
<ComingSoon
  variant="gradient"
  icon="zap"
  title="Welcome Dashboard & Quick Actions"
  description="We're working on an amazing personalized dashboard experience with quick actions, live streaming, new collaboration features, and real-time stats. Stay tuned for updates on HyperBuds!"
/>
```

### Example 2: Sidebar Feature
```typescript
<ComingSoon
  variant="feature"
  icon="bell"
  title="Recent Activities"
  description="Stay updated with friend requests, collaboration invites, live sessions, achievements, and all your important notifications on HyperBuds"
/>
```

### Example 3: Two-Column Grid
```typescript
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
  <ComingSoon
    variant="default"
    icon="trending"
    title="Creator Marketplace"
    description="Discover and offer services, collaborate on paid projects"
  />
  
  <ComingSoon
    variant="default"
    icon="bell"
    title="Smart Notifications"
    description="Get personalized alerts for collaboration opportunities"
  />
</div>
```

### Example 4: Minimal Placeholder
```typescript
<ComingSoon
  variant="minimal"
  icon="calendar"
  size="sm"
  title="Feature Name"
  description="Short description"
/>
```

---

## Accessibility

### ARIA Considerations
The component uses semantic HTML but could be enhanced:

**Recommended additions**:
```typescript
<div 
  role="status" 
  aria-label={`${title} - Coming Soon`}
>
  {/* Component content */}
</div>
```

### Keyboard Navigation
Component is not interactive by default (no focusable elements).

---

## Performance

### Bundle Size
- **Component Size**: ~5KB (minified)
- **Dependencies**: 
  - `lucide-react` (for icons - already in project)
  - No additional dependencies

### Rendering
- Pure functional component
- No state management
- No side effects
- Very lightweight

---

## Browser Compatibility

Fully compatible with all modern browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Note**: Uses CSS Grid, Flexbox, and modern gradient syntax.

---

## Customization

### Extending the Component

To add a new variant:

```typescript
// In ComingSoon.tsx
if (variant === 'custom') {
  return (
    <div className="your-custom-classes">
      {/* Your custom layout */}
    </div>
  );
}
```

### Adding New Icons

```typescript
// In getIcon() function
case 'newIcon':
  return <NewIcon className={iconProps} />;
```

---

## Testing

### Visual Regression Testing
Test all variants in:
- [ ] Light mode
- [ ] Dark mode
- [ ] Mobile viewport
- [ ] Tablet viewport
- [ ] Desktop viewport

### Props Testing
Test with:
- [ ] Default props (no props passed)
- [ ] Custom title and description
- [ ] All icon variations
- [ ] All variant types
- [ ] All size options

---

## Future Enhancements

Potential improvements:
1. Add custom color schemes
2. Support for custom icons (via props)
3. Animation on/off toggle
4. Loading state variant
5. Progress indicator option
6. ETA/date display option

---

## Related Files

- **Component**: `src/components/ui/ComingSoon.tsx`
- **Used In**: 
  - `src/app/dashboard/page.tsx`
  - `src/components/layout/RightSideBar/RightSidebar.tsx`

---

**Last Updated**: October 29, 2025  
**Component Version**: 1.0  
**Maintainer**: HyperBuds Team

