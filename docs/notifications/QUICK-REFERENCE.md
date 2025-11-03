# Notification System - Quick Reference

Quick reference guide for developers working with the notification system.

## 🚀 Quick Start

### Enable Notifications in Component

```typescript
import { useNotificationSocket } from '@/hooks/features/useNotificationSocket';

function MyComponent() {
  useNotificationSocket({
    enabled: true,
    playSound: true,
    showBrowserNotification: true,
  });
}
```

### Get Unread Count

```typescript
import { useUnreadNotificationCount } from '@/hooks/features/useNotifications';

const { unreadCount } = useUnreadNotificationCount();
```

### Fetch Notifications

```typescript
import { useNotifications } from '@/hooks/features/useNotifications';

const { data, isLoading } = useNotifications({
  page: 1,
  limit: 20,
  read: false, // Only unread
});
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | Get notifications |
| PUT | `/api/v1/notifications/:id/read` | Mark as read |
| PUT | `/api/v1/notifications/read-all` | Mark all as read |
| DELETE | `/api/v1/notifications/:id` | Delete notification |
| GET | `/api/v1/notifications/preferences` | Get preferences |
| PUT | `/api/v1/notifications/preferences` | Update preferences |

---

## 🔌 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `notification:new` | Server → Client | New notification created |
| `notification:updated` | Server → Client | Notification updated |
| `notification:deleted` | Server → Client | Notification deleted |
| `notifications:read-all` | Server → Client | All marked as read |

---

## 🎨 Components

### NotificationDropdown
```typescript
<NotificationDropdown
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  anchorRef={buttonRef}
/>
```

### NotificationCenter
```typescript
<NotificationCenter />
```

### NotificationItem
```typescript
<NotificationItem
  notification={notification}
  onRead={(n) => console.log(n)}
  onDelete={(id) => console.log(id)}
  compact={false}
/>
```

### NotificationSettings
```typescript
<NotificationSettings />
```

---

## 🪝 Hooks

### useNotifications
```typescript
const { data, isLoading, error } = useNotifications({
  page: 1,
  limit: 20,
  type: 'match',
  read: false,
});
```

### useUnreadNotificationCount
```typescript
const { unreadCount } = useUnreadNotificationCount();
```

### useMarkNotificationAsRead
```typescript
const markAsRead = useMarkNotificationAsRead();
markAsRead.mutate(notificationId);
```

### useMarkAllNotificationsAsRead
```typescript
const markAllAsRead = useMarkAllNotificationsAsRead();
markAllAsRead.mutate();
```

### useDeleteNotification
```typescript
const deleteNotification = useDeleteNotification();
deleteNotification.mutate(notificationId);
```

### useNotificationPreferences
```typescript
const { data: preferences } = useNotificationPreferences();
```

### useUpdateNotificationPreferences
```typescript
const updatePreferences = useUpdateNotificationPreferences();
updatePreferences.mutate({
  email: { match: true },
  push: { message: false },
});
```

### useNotificationSocket
```typescript
useNotificationSocket({
  enabled: true,
  playSound: true,
  showBrowserNotification: true,
  onNewNotification: (n) => console.log(n),
});
```

---

## 📝 Notification Types

```typescript
type NotificationType =
  | 'match'
  | 'message'
  | 'collaboration'
  | 'collaboration_invite'
  | 'collaboration_accepted'
  | 'collaboration_rejected'
  | 'collaboration_scheduled'
  | 'marketplace_order'
  | 'marketplace_review'
  | 'streaming_invite'
  | 'payment_received'
  | 'payment_failed'
  | 'system'
  | 'new_follower'
  | 'achievement';
```

---

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_SOCKET_URL=https://api-hyperbuds-backend.onrender.com
NEXT_PUBLIC_API_BASE_URL=https://api-hyperbuds-backend.onrender.com/api/v1
```

### Sound File
```
public/sounds/notification.mp3
```

---

## 🐛 Common Issues

### Notifications not appearing
1. Check WebSocket connection in console
2. Check API response in Network tab
3. Verify authentication token

### Sound not playing
1. Check file exists at `public/sounds/notification.mp3`
2. Browser may block autoplay
3. Check system volume

### Browser notifications not showing
1. Check permission granted
2. Browser may not support API
3. Check browser settings

---

## 📚 Full Documentation

- [README.md](./README.md) - Complete documentation
- [BACKEND-REQUIREMENTS.md](./BACKEND-REQUIREMENTS.md) - Backend guide
- [IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md) - Implementation details

---

**Last Updated:** January 2025

