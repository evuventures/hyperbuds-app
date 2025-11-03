# Notification System Documentation

Complete documentation for the HyperBuds notification system implementation.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [API Integration](#api-integration)
5. [WebSocket Integration](#websocket-integration)
6. [Component Structure](#component-structure)
7. [Usage Guide](#usage-guide)
8. [Backend Requirements](#backend-requirements)
9. [Configuration](#configuration)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The notification system provides real-time notifications to users for various events including:
- New matches
- Messages
- Collaboration invites/updates
- Marketplace orders
- Payment updates
- System notifications
- Achievements

### Key Features

✅ **Real-time Updates** - WebSocket integration for instant notifications  
✅ **Browser Notifications** - Native browser notification support  
✅ **Sound Alerts** - Audio notifications for new notifications  
✅ **Grouping** - Smart grouping of similar notifications  
✅ **Infinite Scroll** - Smooth pagination with infinite scroll  
✅ **Filtering** - Filter by type or read status  
✅ **Preferences** - User-configurable notification preferences  
✅ **Dark Mode** - Full dark mode support  
✅ **Responsive** - Works on all screen sizes  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │   Header     │───▶│Notification  │                  │
│  │  Component   │    │  Dropdown    │                  │
│  └──────────────┘    └──────────────┘                  │
│         │                    │                           │
│         │                    │                           │
│         ▼                    ▼                           │
│  ┌──────────────────────────────────┐                   │
│  │     useNotificationSocket       │                   │
│  │     (WebSocket Hook)            │                   │
│  └──────────────────────────────────┘                   │
│         │                    │                           │
│         ▼                    ▼                           │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │notification │    │useNotifications│                 │
│  │   Socket    │    │  (React Query) │                 │
│  └──────────────┘    └──────────────┘                  │
│         │                    │                           │
└─────────┼────────────────────┼──────────────────────────┘
          │                    │
          │                    │
          ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API + WebSocket Server              │
│                                                           │
│  REST API:  /api/v1/notifications                        │
│  WebSocket: Socket.IO connection                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 API Integration

### REST API Endpoints

All endpoints require Bearer token authentication.

#### Get Notifications
```
GET /api/v1/notifications
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - type: NotificationType (optional)
  - read: boolean (optional)
```

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "string",
      "userId": "string",
      "type": "match" | "message" | "collaboration" | ...,
      "title": "string",
      "message": "string",
      "read": boolean,
      "actionUrl": "string (optional)",
      "metadata": {},
      "createdAt": "ISO string",
      "updatedAt": "ISO string (optional)"
    }
  ],
  "total": number,
  "unreadCount": number,
  "page": number,
  "limit": number,
  "hasMore": boolean
}
```

#### Mark as Read
```
PUT /api/v1/notifications/:id/read
```

#### Mark All as Read
```
PUT /api/v1/notifications/read-all
```

#### Delete Notification
```
DELETE /api/v1/notifications/:id
```

#### Get Preferences
```
GET /api/v1/notifications/preferences
```

#### Update Preferences
```
PUT /api/v1/notifications/preferences
Body: {
  email?: { match: boolean, message: boolean, ... },
  push?: { match: boolean, message: boolean, ... },
  inApp?: { match: boolean, message: boolean, ... }
}
```

---

## 🔌 WebSocket Integration

### Connection

The notification system uses Socket.IO for real-time updates. Connection is automatically established when user is authenticated.

**Connection URL:**
```
https://api-hyperbuds-backend.onrender.com
```

**Authentication:**
```javascript
{
  auth: { token: accessToken }
}
```

### WebSocket Events

#### Server → Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `notification:new` | New notification received | `Notification` object |
| `notification:updated` | Notification updated | `Notification` object |
| `notification:deleted` | Notification deleted | `notificationId: string` |
| `notifications:read-all` | All notifications marked as read | `void` |

#### Client → Server Events

Currently, the frontend only listens to events. No client emissions required.

### Implementation

```typescript
import { useNotificationSocket } from '@/hooks/features/useNotificationSocket';

// In your component
useNotificationSocket({
  enabled: true,
  playSound: true,
  showBrowserNotification: true,
  onNewNotification: (notification) => {
    // Custom handler
  },
});
```

---

## 🧩 Component Structure

### Files Created

```
src/
├── types/
│   └── notifications.types.ts          # TypeScript types
├── lib/
│   ├── api/
│   │   └── notifications.api.ts       # API service
│   └── socket/
│       └── notificationSocket.ts       # WebSocket service
├── hooks/
│   └── features/
│       ├── useNotifications.ts         # React Query hooks
│       └── useNotificationSocket.ts    # WebSocket hook
├── components/
│   ├── features/
│   │   └── notifications/
│   │       ├── NotificationItem.tsx
│   │       ├── NotificationCenter.tsx
│   │       └── NotificationSettings.tsx
│   └── layout/
│       └── Header/
│           └── NotificationDropdown.tsx
├── utils/
│   └── notificationGrouping.ts         # Grouping utility
└── app/
    ├── notifications/
    │   └── page.tsx                    # Notification center page
    └── settings/
        └── notifications/
            └── page.tsx                 # Preferences page
```

### Key Components

#### 1. NotificationItem
Displays a single notification with icon, colors, and actions.

**Props:**
- `notification: Notification`
- `onRead?: (notification: Notification) => void`
- `onDelete?: (notificationId: string) => void`
- `compact?: boolean`

#### 2. NotificationDropdown
Header dropdown showing recent notifications.

**Features:**
- Shows last 10 notifications
- Mark all as read button
- Click outside to close
- Real-time updates

#### 3. NotificationCenter
Full notification center page with advanced features.

**Features:**
- Filtering by type
- Grouping toggle
- Infinite scroll
- Mark all as read

#### 4. NotificationSettings
User preferences management.

**Features:**
- Email notifications toggle
- Push notifications toggle
- In-app notifications toggle
- Per-type configuration

---

## 📖 Usage Guide

### Basic Usage

#### 1. Header Integration (Automatic)
The Header component automatically connects to WebSocket and displays notifications.

#### 2. Using Notifications Hook
```typescript
import { useNotifications } from '@/hooks/features/useNotifications';

function MyComponent() {
  const { data, isLoading } = useNotifications({
    page: 1,
    limit: 20,
    read: false, // Only unread
  });

  const notifications = data?.notifications || [];
  
  return (
    <div>
      {notifications.map(notification => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
```

#### 3. Mark Notification as Read
```typescript
import { useMarkNotificationAsRead } from '@/hooks/features/useNotifications';

function MyComponent() {
  const markAsRead = useMarkNotificationAsRead();

  const handleClick = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };
}
```

#### 4. Get Unread Count
```typescript
import { useUnreadNotificationCount } from '@/hooks/features/useNotifications';

function MyComponent() {
  const { unreadCount } = useUnreadNotificationCount();
  
  return <span>Unread: {unreadCount}</span>;
}
```

---

## 🔧 Backend Requirements

### Required API Endpoints

1. **GET /api/v1/notifications**
   - Query params: `page`, `limit`, `type`, `read`
   - Response: List of notifications with pagination

2. **PUT /api/v1/notifications/:id/read**
   - Mark single notification as read

3. **PUT /api/v1/notifications/read-all**
   - Mark all notifications as read
   - Response: `{ success: true, count: number }`

4. **DELETE /api/v1/notifications/:id**
   - Delete a notification

5. **GET /api/v1/notifications/preferences**
   - Get user notification preferences

6. **PUT /api/v1/notifications/preferences**
   - Update user preferences

### Required WebSocket Events

#### Server Must Emit:

1. **notification:new**
   ```typescript
   socket.emit('notification:new', {
     id: string,
     userId: string,
     type: NotificationType,
     title: string,
     message: string,
     read: boolean,
     actionUrl?: string,
     metadata?: object,
     createdAt: string,
   });
   ```

2. **notification:updated**
   ```typescript
   socket.emit('notification:updated', notificationObject);
   ```

3. **notification:deleted**
   ```typescript
   socket.emit('notification:deleted', notificationId);
   ```

4. **notifications:read-all**
   ```typescript
   socket.emit('notifications:read-all');
   ```

### Notification Types

The backend should support these notification types:
- `match`
- `message`
- `collaboration`
- `collaboration_invite`
- `collaboration_accepted`
- `collaboration_rejected`
- `collaboration_scheduled`
- `marketplace_order`
- `marketplace_review`
- `streaming_invite`
- `payment_received`
- `payment_failed`
- `system`
- `new_follower`
- `achievement`

### Data Model

```typescript
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;      // URL to navigate when clicked
  metadata?: Record<string, unknown>; // Additional data
  createdAt: string;       // ISO 8601 format
  updatedAt?: string;       // ISO 8601 format
}
```

### Preferences Model

```typescript
interface NotificationPreferences {
  email: {
    match: boolean;
    message: boolean;
    collaboration: boolean;
    marketplace: boolean;
    payment: boolean;
    system: boolean;
  };
  push: {
    match: boolean;
    message: boolean;
    collaboration: boolean;
    marketplace: boolean;
    payment: boolean;
    system: boolean;
  };
  inApp: {
    match: boolean;
    message: boolean;
    collaboration: boolean;
    marketplace: boolean;
    payment: boolean;
    system: boolean;
  };
}
```

---

## ⚙️ Configuration

### Environment Variables

```env
# Socket.IO connection URL
NEXT_PUBLIC_SOCKET_URL=https://api-hyperbuds-backend.onrender.com

# API Base URL (already configured)
NEXT_PUBLIC_API_BASE_URL=https://api-hyperbuds-backend.onrender.com/api/v1
```

### Sound Configuration

Place notification sound file at:
```
public/sounds/notification.mp3
```

The system will automatically use this file for audio notifications.

### Browser Notifications

The system automatically requests browser notification permission on first use. Users can:
1. Allow - Notifications will appear
2. Deny - Only in-app notifications
3. Dismiss - Can change later in browser settings

---

## 🐛 Troubleshooting

### Notifications Not Appearing

1. **Check WebSocket Connection**
   - Open browser DevTools → Console
   - Look for "✅ Notification socket connected"
   - If not connected, check authentication token

2. **Check API Response**
   - Open Network tab
   - Check `/api/v1/notifications` response
   - Verify authentication token is valid

3. **Check Browser Console**
   - Look for error messages
   - Verify WebSocket events are being received

### Sound Not Playing

1. **Check File Exists**
   - Verify `/public/sounds/notification.mp3` exists
   - Try loading directly: `http://localhost:3000/sounds/notification.mp3`

2. **Browser Autoplay Policy**
   - Some browsers block autoplay
   - User interaction may be required first

3. **Volume Settings**
   - Check system volume
   - Check browser tab volume (not muted)

### Browser Notifications Not Showing

1. **Check Permission**
   - Browser DevTools → Application → Notifications
   - Verify permission is granted

2. **Browser Support**
   - Verify browser supports Notification API
   - Chrome, Firefox, Edge supported
   - Safari has limited support

### WebSocket Not Connecting

1. **Check Authentication**
   - Verify `accessToken` in localStorage
   - Token should be valid JWT

2. **Check Server**
   - Verify Socket.IO server is running
   - Check CORS configuration
   - Verify connection URL is correct

3. **Network Issues**
   - Check firewall/proxy settings
   - Verify WebSocket ports are open

---

## 📝 Additional Notes

### Performance Considerations

- Notifications are cached for 30 seconds
- Auto-refetch every 60 seconds (polling fallback)
- WebSocket provides real-time updates
- Infinite scroll loads 20 notifications at a time
- Grouping reduces DOM nodes for better performance

### Accessibility

- All interactive elements have keyboard support
- ARIA labels on all buttons
- Screen reader friendly
- Focus management for dropdowns

### Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+ (limited Notification API support)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Maintained By:** Frontend Team

