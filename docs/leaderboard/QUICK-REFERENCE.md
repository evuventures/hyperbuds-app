# Rizz Score Leaderboard - Quick Reference

## 🚀 Quick Start

### Access the Leaderboard
- **URL**: `/profile/rizz-score/leaderboard`
- **Navigation**: Click "View Leaderboard" button on Rizz Score page
- **Direct Link**: Available from profile navigation menu

### Basic Usage
1. **View Rankings**: See top creators by Rizz Score
2. **Apply Filters**: Use dropdown filters to narrow results
3. **Remove Filters**: Click X on active filter tags
4. **Reset All**: Click "Reset" button to clear all filters

## 📁 File Structure

```
src/
├── app/profile/rizz-score/leaderboard/
│   └── page.tsx                    # Main leaderboard page
├── components/matching/
│   └── RizzLeaderboard.tsx        # Leaderboard component
├── hooks/features/
│   └── useMatching.ts             # API hooks (useRizzLeaderboard)
├── types/
│   └── matching.types.ts          # TypeScript definitions
└── app/
    └── globals.css                # Enhanced styling
```

## 🔧 Key Components

### 1. LeaderboardPage
**File**: `src/app/profile/rizz-score/leaderboard/page.tsx`
- Main page component with responsive layout
- Filter management and dropdown system
- Active filter display and removal

### 2. RizzLeaderboard
**File**: `src/components/matching/RizzLeaderboard.tsx`
- Reusable leaderboard display component
- Performance optimized with React.memo
- Next.js Image optimization for avatars

### 3. Custom Dropdowns
**Location**: Inline in LeaderboardPage component
- Modern glass morphism design
- Fixed positioning to prevent z-index issues
- Smooth animations with Framer Motion

## 🎛️ Filter Options

### Available Filters
| Filter | Options | Description |
|--------|---------|-------------|
| **Timeframe** | Current, Weekly, Monthly | Time period for rankings |
| **Niche** | Gaming, Tech, Vlogging, etc. | Content category filter |
| **Location** | USA, Canada, UK, etc. | Geographic location |
| **Limit** | 5, 10, 25, 50 | Number of results |

### Filter Usage
```typescript
// Example filter state
const filters = {
  timeframe: 'current',
  niche: 'gaming',
  location: 'USA',
  limit: 10
};
```

## 🎨 Styling Classes

### Dropdown System
```css
.dropdown-menu-enhanced {
  /* Modern glass morphism dropdown */
}

.custom-scrollbar {
  /* Custom purple gradient scrollbar */
}
```

### Button Variants
```css
/* Reset Button */
.btn-reset {
  /* Orange theme with refresh icon */
}

/* Close Button */
.btn-close {
  /* Red theme with X icon */
}

/* Filter Tags */
.filter-tag {
  /* Color-coded removable tags */
}
```

## 🔌 API Integration

### Endpoint
```
GET /api/v1/matching/leaderboard
```

### Query Parameters
```typescript
interface LeaderboardQuery {
  niche?: string;           // Content niche
  location?: string;        // Geographic location
  limit?: number;          // Result count (1-100)
  timeframe?: 'current' | 'weekly' | 'monthly';
}
```

### Response Format
```typescript
interface LeaderboardResponse {
  leaderboard: Array<{
    userId: string;
    currentScore: number;
    trending?: {
      isViral: boolean;
      trendingScore: number;
    };
    profile: {
      username: string;
      displayName: string;
      avatar?: string;
      niche: string[];
      stats: { totalFollowers: number };
      location?: { country: string };
    };
  }>;
}
```

## ⚡ Performance Tips

### Optimization Features
- **React.memo**: Memoized leaderboard items
- **Next.js Image**: Optimized avatar loading
- **Priority Loading**: Top 3 avatars load first
- **Code Splitting**: Dynamic imports for heavy components

### Bundle Size
- **Leaderboard Page**: 23.1 kB
- **First Load JS**: 230 kB
- **Build Time**: ~11 seconds

## 🎯 Responsive Breakpoints

### Screen Sizes
```typescript
const breakpoints = {
  xs: '475px',   // Extra small
  sm: '640px',   // Small
  md: '768px',   // Medium
  lg: '1024px',  // Large
  xl: '1280px',  // Extra large
  '2xl': '1536px' // 2X large
};
```

### Layout Adaptations
- **Mobile**: Single column, stacked elements
- **Tablet**: Two-column filter grid
- **Desktop**: Four-column filter grid
- **Large**: Expanded spacing and sizing

## 🎨 Theme Support

### Dark Mode
```typescript
// Dark mode classes
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
```

### Color Palette
- **Primary**: Blue theme for main elements
- **Orange**: Reset button and actions
- **Red**: Close/delete actions
- **Purple**: Dropdowns and accents
- **Green**: Success states
- **Yellow**: Highlights and rankings

## 🔧 Development Commands

### Build & Run
```bash
# Development
npm run dev

# Production build
npm run build

# Start production
npm start
```

### Code Quality
```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build with Turbopack
npm run build --turbopack
```

## 🐛 Troubleshooting

### Common Issues

#### Dropdown Not Visible
- **Cause**: Z-index stacking issues
- **Solution**: Uses fixed positioning with z-index 999999

#### TypeScript Errors
- **Cause**: Ref callback type issues
- **Solution**: Use proper ref callback syntax: `ref={(el) => { refs.current.key = el; }}`

#### Build Failures
- **Cause**: Unused imports or type errors
- **Solution**: Clean up unused imports and fix type definitions

### Debug Mode
```typescript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Leaderboard data:', data);
}
```

## 📱 Browser Support

### Supported Browsers
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Mobile Support
- **iOS Safari**: 14+
- **Chrome Mobile**: 90+
- **Samsung Internet**: 13+

## 🔐 Security Considerations

### Data Protection
- **Input Validation**: All user inputs validated
- **XSS Prevention**: React's built-in protection
- **Type Safety**: TypeScript prevents type vulnerabilities
- **API Security**: Proper authentication required

## 📊 Analytics Integration

### Tracking Events
```typescript
// Example analytics events
analytics.track('leaderboard_viewed', {
  filters: currentFilters,
  timestamp: Date.now()
});

analytics.track('filter_applied', {
  filter_type: 'niche',
  filter_value: 'gaming'
});
```

## 🚀 Deployment

### Production Checklist
- [ ] Build successful (`npm run build`)
- [ ] TypeScript compilation passed
- [ ] ESLint checks passed
- [ ] Bundle size optimized
- [ ] Performance metrics acceptable
- [ ] Accessibility validated

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.hyperbuds.com/api/v1
NEXT_PUBLIC_APP_ENV=production
```

---

## 📞 Support

### Documentation
- **README.md**: Complete feature overview
- **IMPLEMENTATION-GUIDE.md**: Development process
- **TECHNICAL-SPECIFICATIONS.md**: Architecture details
- **CHANGELOG.md**: Version history

### Code Examples
- **Component Usage**: See implementation files
- **API Integration**: Check hooks and types
- **Styling**: Reference globals.css and component styles

---

*This quick reference provides essential information for developers working with the Rizz Score Leaderboard feature.*
