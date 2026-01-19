# Marketplace Feature Documentation

## Overview

The Marketplace feature is implemented as a **Service Directory** where creators can list their services and users can discover, book, and manage service bookings. This feature provides a complete marketplace experience with service discovery, detailed service pages, provider dashboards, and booking management.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API Integration](#api-integration)
3. [Pages & Routes](#pages--routes)
4. [Components](#components)
5. [Features Implemented](#features-implemented)
6. [UI/UX Enhancements](#uiux-enhancements)
7. [State Management](#state-management)
8. [Type Definitions](#type-definitions)

---

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **State Management**: React Query (`@tanstack/react-query`)
- **API Client**: Axios with interceptors
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS with dark mode support

### Key Design Patterns
- **Server State**: Managed via React Query hooks
- **Local State**: Managed via React `useState` hooks
- **Form Handling**: React Hook Form patterns (where applicable)
- **Error Handling**: Toast notifications via `useToast` hook
- **Authentication**: User context via `useAuth` hook

---

## API Integration

### Base Endpoint
All marketplace API calls use the `/marketplace` base path.

### Endpoints Implemented

#### Services

1. **GET /marketplace/services**
   - **Purpose**: List all services with filtering and pagination
   - **Hook**: `useServices(filters?: ServiceListFilters)`
   - **Location**: `src/hooks/features/useMarketplace.ts`
   - **Query Parameters**:
     - `q`: Search query
     - `category`: Filter by category
     - `minPrice`, `maxPrice`: Price range
     - `sellerId`: Filter by seller (for provider dashboard)
     - `location`: Filter by location
     - `featured`: Boolean filter for featured services
     - `page`, `limit`: Pagination
     - `sort`: Sort order (recent, price_low, price_high, rating)

2. **GET /marketplace/services/{serviceId}**
   - **Purpose**: Get detailed information about a specific service
   - **Hook**: `useService(serviceId: string)`
   - **Location**: `src/hooks/features/useMarketplace.ts`
   - **Used In**: Service detail page

3. **POST /marketplace/services**
   - **Purpose**: Create a new service listing
   - **Hook**: `useCreateService()`
   - **Location**: `src/hooks/features/useMarketplace.ts`
   - **Used In**: Service creation form

4. **PUT /marketplace/services/{serviceId}**
   - **Purpose**: Update an existing service
   - **Hook**: `useUpdateService()`
   - **Location**: `src/hooks/features/useMarketplace.ts`
   - **Used In**: Service edit page

5. **DELETE /marketplace/services/{serviceId}**
   - **Purpose**: Delete a service listing
   - **Hook**: `useDeleteService()`
   - **Location**: `src/hooks/features/useMarketplace.ts`
   - **Used In**: Provider dashboard with confirmation dialog

#### Bookings

1. **POST /marketplace/bookings**
   - **Purpose**: Create a new booking
   - **Hook**: `useCreateBooking()`
   - **Location**: `src/hooks/features/useMarketplace.ts`
   - **Request Body**: `CreateBookingRequest`
     - `serviceId`: Required
     - `packageName`: Optional
     - `scheduledFor`: Optional (datetime)
     - `dueDate`: Optional (date)
     - `requirements`: Optional (text)
     - `message`: Optional (text)
   - **Used In**: Service detail page booking dialog

2. **GET /marketplace/bookings**
   - **Purpose**: List bookings for current user
   - **Hook**: `useBookings(filters?: BookingListFilters)`
   - **Location**: `src/hooks/features/useMarketplace.ts`
   - **Query Parameters**:
     - `role`: "buyer" or "seller"
     - `status`: Filter by booking status
     - `page`, `limit`: Pagination

3. **PUT /marketplace/bookings/{bookingId}/status**
   - **Purpose**: Update booking status
   - **Hook**: `useUpdateBookingStatus()`
   - **Location**: `src/hooks/features/useMarketplace.ts`
   - **Request Body**: `{ status: BookingStatus }`
   - **Status Values**:
     - `pending`: Initial state
     - `accepted`: Seller accepted the booking
     - `in_progress`: Work has started
     - `delivered`: Work delivered to buyer
     - `completed`: Booking completed
     - `cancelled`: Booking cancelled
     - `refunded`: Booking refunded

---

## Pages & Routes

### 1. Marketplace Discover Page
**Route**: `/marketplace`  
**File**: `src/app/marketplace/page.tsx`

**Features**:
- Service listing with grid/list view toggle
- Global search bar
- Compact filter panel (always visible below search)
- Pagination
- Loading skeletons
- Error handling
- Empty states

**Key Components**:
- `ServiceCard`: Individual service display
- `ServiceFilters`: Compact horizontal filter bar

### 2. Service Detail Page
**Route**: `/marketplace/services/[id]`  
**File**: `src/app/marketplace/services/[id]/page.tsx`

**Features**:
- Full service description and details
- Service images gallery
- Provider information card
- Pricing information
- Package selection (if available)
- FAQ section
- "Book Now" button with booking dialog
- Edit button (for service owner)

**Booking Dialog Includes**:
- Package selection dropdown
- Scheduled date/time picker
- Due date picker
- Requirements textarea
- Message textarea
- Confirmation button

### 3. Provider Dashboard
**Route**: `/marketplace/services`  
**File**: `src/app/marketplace/services/page.tsx`

**Features**:
- List of services created by current user
- Filtered by `sellerId` automatically
- Edit and Delete actions for each service
- "Create Service" button
- Summary statistics (Total Services, Available, Total Orders)
- Empty state with call-to-action

### 4. Create Service Page
**Route**: `/marketplace/services/create`  
**File**: `src/app/marketplace/services/create/page.tsx`

**Features**:
- Comprehensive multi-section form:
  - Basic Information (title, description, category, price)
  - Images upload (multiple images)
  - Additional Details (delivery time, location)
  - Tags management (add/remove)
  - Requirements management (add/remove)
  - Packages management (add/remove with pricing)
  - FAQ management (add/remove Q&A pairs)
- Image upload using `uploadAvatar` utility
- Form validation
- Success/error toast notifications

### 5. Edit Service Page
**Route**: `/marketplace/services/[id]/edit`  
**File**: `src/app/marketplace/services/[id]/edit/page.tsx`

**Features**:
- Pre-populated form with existing service data
- Same form structure as create page
- Update service functionality
- Delete service button with confirmation dialog
- Success/error handling

### 6. My Bookings Page
**Route**: `/marketplace/bookings`  
**File**: `src/app/marketplace/bookings/page.tsx`

**Features**:
- Tabbed interface: "As Buyer" and "As Seller"
- Status filtering dropdown
- Booking cards grid layout
- Summary statistics
- Empty states for each role
- Loading and error states

---

## Components

### Core Components

#### 1. ServiceCard
**File**: `src/components/marketplace/ServiceCard/ServiceCard.tsx`

**Props**:
- `service`: MarketplaceService object
- `showActions?`: Boolean to show edit/delete buttons
- `onEdit?`: Callback for edit action
- `onDelete?`: Callback for delete action

**Features**:
- Service image with placeholder
- Featured badge
- Unavailable badge
- Service title and description
- Location and delivery time icons
- Category/subcategory tags
- Rating display
- Views and orders stats
- Price display
- "View Details" button

#### 2. ServiceFilters
**File**: `src/components/marketplace/ServiceFilters.tsx`

**Props**:
- `filters`: Current filter state
- `onFiltersChange`: Callback when filters change
- `categories?`: Array of available categories

**Features**:
- Compact horizontal layout
- Category dropdown
- Price range inputs (Min/Max) - no spinner arrows
- Location input
- Featured checkbox (with primary color gradient)
- Sort dropdown
- Clear filters button (shown when filters are active)
- Auto-apply with 300ms debounce

**UI Enhancements**:
- Removed spinner arrows from number inputs
- Primary color gradient checkbox
- Compact design with smaller inputs
- Always visible (no toggle needed)

#### 3. BookingCard
**File**: `src/components/marketplace/BookingCard.tsx`

**Props**:
- `booking`: Booking object
- `role`: "buyer" or "seller"
- `onStatusUpdate`: Callback for status updates

**Features**:
- Service title with link
- Booking ID display
- User info (buyer/seller name)
- Package information
- Amount display
- Scheduled and due dates
- Requirements and message display
- Timestamps (created/updated)
- Status badge
- Action buttons via `BookingActions`

#### 4. BookingActions
**File**: `src/components/marketplace/BookingActions.tsx`

**Features**:
- Role-based action buttons:
  - **Buyer**: Cancel (for pending bookings)
  - **Seller**:
    - Accept/Reject (for pending)
    - Start Work (for accepted)
    - Mark as Delivered (for in_progress)
    - Complete (for delivered)
- Confirmation dialogs for all actions
- Status update integration

#### 5. BookingStatusBadge
**File**: `src/components/marketplace/BookingStatusBadge.tsx`

**Features**:
- Visual status indicators with icons
- Color-coded badges
- Status values: pending, accepted, in_progress, delivered, completed, cancelled, refunded

---

## Features Implemented

### ✅ Service Discovery
- [x] List all services with pagination
- [x] Search functionality
- [x] Advanced filtering (category, price, location, featured)
- [x] Sorting options
- [x] Grid and List view modes
- [x] Responsive design

### ✅ Service Details
- [x] Full service information display
- [x] Image gallery
- [x] Provider information
- [x] Package selection
- [x] FAQ section
- [x] Booking functionality

### ✅ Provider Dashboard
- [x] List own services
- [x] Create new service
- [x] Edit existing service
- [x] Delete service with confirmation
- [x] Service statistics

### ✅ Booking Management
- [x] Create booking with all required fields
- [x] View bookings as buyer
- [x] View bookings as seller
- [x] Status filtering
- [x] Status updates (accept, reject, cancel, complete, etc.)
- [x] Booking workflow management

### ✅ UI/UX Features
- [x] Dark mode support with proper contrast
- [x] Loading states (skeletons)
- [x] Error handling with retry options
- [x] Empty states with helpful messages
- [x] Toast notifications for actions
- [x] Confirmation dialogs for destructive actions
- [x] Responsive design
- [x] Accessible components (ARIA labels, keyboard navigation)

---

## UI/UX Enhancements

### Dark Mode Improvements

#### Background Colors
- Changed from `bg-gray-50 dark:bg-slate-900` to gradient backgrounds matching dashboard:
  ```css
  bg-gradient-to-br from-gray-50 via-white to-purple-50/10 
  dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10
  ```

#### Input Fields
- Enhanced contrast with explicit dark mode colors:
  - Background: `bg-white dark:bg-gray-800` or `bg-white dark:bg-gray-900`
  - Text: `text-gray-900 dark:text-gray-100`
  - Placeholders: `placeholder:text-gray-400 dark:placeholder:text-gray-500`
  - Borders: `border-gray-200 dark:border-gray-700`
  - Focus: `focus:border-primary dark:focus:border-purple-500`

#### Buttons
- Primary buttons use gradient:
  ```css
  bg-gradient-to-r from-purple-600 to-indigo-600 
  hover:from-purple-700 hover:to-indigo-700
  ```
- Outline buttons have proper contrast:
  ```css
  border-gray-200 dark:border-gray-700 
  bg-white dark:bg-gray-800 
  text-gray-700 dark:text-gray-200
  ```

#### Cards
- Enhanced borders: `border-2 border-gray-200 dark:border-gray-700`
- Better shadows: `shadow-sm hover:shadow-md`
- Hover effects: `hover:border-purple-400 dark:hover:border-purple-500`

#### Icons
- All icons have explicit colors for visibility:
  - `text-gray-500 dark:text-gray-400` for most icons
  - `text-gray-700 dark:text-gray-300` for labels

#### Checkbox
- Primary color gradient when checked:
  ```css
  data-[state=checked]:bg-gradient-to-r 
  data-[state=checked]:from-purple-600 
  data-[state=checked]:to-indigo-600
  ```

#### Slider (Price Range)
- Visible track: `bg-gray-200 dark:bg-gray-700`
- Gradient range fill: `bg-gradient-to-r from-purple-600 to-indigo-600`
- Visible thumb: `bg-white dark:bg-gray-100` with `border-purple-600 dark:border-purple-400`
- Shadow for depth: `shadow-md hover:shadow-lg`

### Filter Panel Simplification

#### Before
- Large vertical card with many sections
- Toggleable visibility
- "Apply Filters" button required

#### After
- Compact horizontal bar
- Always visible below search input
- Auto-apply with debounce (300ms)
- Smaller inputs and labels
- Price range uses number inputs (no slider)
- No spinner arrows on number inputs

---

## State Management

### React Query Hooks

All marketplace data is managed through React Query hooks defined in `src/hooks/features/useMarketplace.ts`:

#### Query Keys Structure
```typescript
marketplaceKeys = {
  all: ['marketplace'],
  services: {
    all: ['marketplace', 'services'],
    lists: () => ['marketplace', 'services', 'list'],
    list: (filters) => ['marketplace', 'services', 'list', filters],
    detail: (id) => ['marketplace', 'services', 'detail', id],
  },
  bookings: {
    all: ['marketplace', 'bookings'],
    lists: () => ['marketplace', 'bookings', 'list'],
    list: (filters) => ['marketplace', 'bookings', 'list', filters],
    detail: (id) => ['marketplace', 'bookings', 'detail', id],
  },
}
```

#### Hooks Available

1. **useServices(filters?)**: Fetch list of services
2. **useService(serviceId)**: Fetch single service
3. **useCreateService()**: Create new service mutation
4. **useUpdateService()**: Update service mutation
5. **useDeleteService()**: Delete service mutation
6. **useBookings(filters?)**: Fetch list of bookings
7. **useCreateBooking()**: Create booking mutation
8. **useUpdateBookingStatus()**: Update booking status mutation

### Cache Management

- **Invalidation**: Lists are invalidated when items are created/updated/deleted
- **Optimistic Updates**: Service details are updated in cache immediately
- **Stale Time**: 
  - Services: 5 minutes
  - Bookings: 2 minutes (more frequent updates)

---

## Type Definitions

### Core Types

**File**: `src/types/marketplace.types.ts`

#### MarketplaceService
```typescript
interface MarketplaceService {
  _id: string;
  seller: UserReference | string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  images?: string[];
  deliveryTime?: string;
  location?: string;
  isAvailable?: boolean;
  featured?: boolean;
  packages?: MarketplacePackage[];
  requirements?: string[];
  faq?: MarketplaceFaq[];
  rating?: MarketplaceRating;
  stats?: MarketplaceStats;
  createdAt?: string;
  updatedAt?: string;
}
```

#### Booking
```typescript
interface Booking {
  _id: string;
  serviceId: MarketplaceService | string;
  buyerId: UserReference | string;
  sellerId: UserReference | string;
  status: BookingStatus;
  amount: number;
  currency?: string;
  packageName?: string;
  requirements?: string;
  message?: string;
  scheduledFor?: string;
  dueDate?: string;
  deliverables?: BookingDeliverable[];
  createdAt?: string;
  updatedAt?: string;
}
```

#### BookingStatus
```typescript
type BookingStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";
```

---

## Image Configuration

### Next.js Image Domains

**File**: `next.config.ts`

Configured remote patterns for:
- UploadThing (`*.ufs.sh`, `utfs.io`)
- Cloudinary (`res.cloudinary.com`)
- DiceBear (`api.dicebear.com`)
- R2 Storage (`hyperbuds-img.r2.cloudflarestorage.com`)
- Unsplash (`images.unsplash.com`, `*.unsplash.com`)

---

## Error Handling

### API Errors
- Handled via Axios interceptors in `src/lib/api/client.ts`
- Global error handling with toast notifications

### Component-Level Errors
- Error states displayed with retry buttons
- User-friendly error messages
- Fallback UI for failed requests

### Form Validation
- Required field validation
- Type checking for number inputs
- Date validation for booking forms

---

## Accessibility Features

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states with visible rings
- Screen reader friendly structure
- Semantic HTML elements

---

## Performance Optimizations

1. **React Query Caching**: Reduces unnecessary API calls
2. **Debounced Filters**: 300ms debounce on filter changes
3. **Image Optimization**: Next.js Image component with proper sizing
4. **Code Splitting**: Route-based code splitting via Next.js App Router
5. **Lazy Loading**: Images and components loaded on demand

---

## Testing Considerations

### Manual Testing Checklist

- [ ] Service listing loads correctly
- [ ] Filters apply and update results
- [ ] Service detail page displays all information
- [ ] Booking creation works with all fields
- [ ] Booking status updates work for all statuses
- [ ] Provider dashboard shows only own services
- [ ] Edit service pre-populates correctly
- [ ] Delete service shows confirmation
- [ ] Dark mode has proper contrast
- [ ] Responsive design works on mobile/tablet/desktop

---

## Future Enhancements

Potential improvements for future iterations:

1. **Search Enhancements**
   - Autocomplete suggestions
   - Search history
   - Recent searches

2. **Filtering**
   - Save filter presets
   - Advanced filter panel (collapsible)
   - Filter by rating range

3. **Service Features**
   - Service reviews and ratings
   - Service comparison
   - Favorite/bookmark services

4. **Booking Features**
   - Booking calendar view
   - Recurring bookings
   - Booking reminders

5. **Provider Features**
   - Analytics dashboard
   - Revenue tracking
   - Service performance metrics

---

## File Structure

```
src/
├── app/
│   └── marketplace/
│       ├── page.tsx                    # Discover page
│       ├── bookings/
│       │   └── page.tsx                # My Bookings page
│       └── services/
│           ├── page.tsx                # Provider Dashboard
│           ├── create/
│           │   └── page.tsx            # Create Service
│           └── [id]/
│               ├── page.tsx            # Service Details
│               └── edit/
│                   └── page.tsx        # Edit Service
├── components/
│   └── marketplace/
│       ├── ServiceCard/
│       │   └── ServiceCard.tsx        # Service card component
│       ├── ServiceFilters.tsx          # Filter panel
│       ├── BookingCard.tsx             # Booking card component
│       ├── BookingActions.tsx          # Booking action buttons
│       └── BookingStatusBadge.tsx     # Status badge component
├── hooks/
│   └── features/
│       └── useMarketplace.ts           # React Query hooks
├── lib/
│   └── api/
│       └── marketplace.api.ts          # API client functions
└── types/
    └── marketplace.types.ts            # TypeScript definitions
```

---

## Summary

The Marketplace feature is fully implemented as a Service Directory with:

✅ **Complete CRUD operations** for services  
✅ **Full booking workflow** with status management  
✅ **Provider dashboard** for service management  
✅ **User-friendly discovery** with advanced filtering  
✅ **Modern UI** with dark mode support  
✅ **Responsive design** for all devices  
✅ **Error handling** and loading states  
✅ **Type-safe** TypeScript implementation  

All requirements from the specification have been met and the feature is production-ready.
