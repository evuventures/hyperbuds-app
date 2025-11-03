# Notification System - Backend Requirements

This document outlines all backend requirements for the notification system implementation.

## 📋 Overview

The frontend notification system is **fully implemented** and ready to connect to the backend. This document specifies what the backend team needs to implement.

---

## 🔌 REST API Endpoints Required

### Base URL
```
https://api-hyperbuds-backend.onrender.com/api/v1
```

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <access_token>
```

---

## 📡 API Endpoints

### 1. Get Notifications

**Endpoint:** `GET /api/v1/notifications`

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 20 | Number of notifications per page |
| `type` | string | No | - | Filter by notification type |
| `read` | boolean | No | - | Filter by read status (true/false) |

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "507f1f77bcf86cd799439011",
      "userId": "507f191e810c19729de860ea",
      "type": "match",
      "title": "New Match Found",
      "message": "You have a new collaboration match!",
      "read": false,
      "actionUrl": "/matching/507f1f77bcf86cd799439012",
      "metadata": {
        "matchId": "507f1f77bcf86cd799439012",
        "compatibilityScore": 85
      },
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "total": 42,
  "unreadCount": 5,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

### 2. Mark Notification as Read

**Endpoint:** `PUT /api/v1/notifications/:id/read`

**Path Parameters:**
- `id` (string, required) - Notification ID

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": {
    "id": "507f1f77bcf86cd799439011",
    "read": true,
    "updatedAt": "2025-01-15T10:35:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Notification not found
- `403 Forbidden` - Notification belongs to another user
- `500 Internal Server Error` - Server error

---

### 3. Mark All Notifications as Read

**Endpoint:** `PUT /api/v1/notifications/read-all`

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "count": 5
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

### 4. Delete Notification

**Endpoint:** `DELETE /api/v1/notifications/:id`

**Path Parameters:**
- `id` (string, required) - Notification ID

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Notification not found
- `403 Forbidden` - Notification belongs to another user
- `500 Internal Server Error` - Server error

---

### 5. Get Notification Preferences

**Endpoint:** `GET /api/v1/notifications/preferences`

**Response:**
```json
{
  "email": {
    "match": true,
    "message": true,
    "collaboration": true,
    "marketplace": false,
    "payment": true,
    "system": true
  },
  "push": {
    "match": true,
    "message": true,
    "collaboration": true,
    "marketplace": false,
    "payment": true,
    "system": false
  },
  "inApp": {
    "match": true,
    "message": true,
    "collaboration": true,
    "marketplace": true,
    "payment": true,
    "system": true
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

**Note:** If user hasn't set preferences, return all `true` by default.

---

### 6. Update Notification Preferences

**Endpoint:** `PUT /api/v1/notifications/preferences`

**Request Body:**
```json
{
  "email": {
    "match": true,
    "message": false
  },
  "push": {
    "match": true
  },
  "inApp": {
    "collaboration": false
  }
}
```

**Note:** Only send the fields that need to be updated. Partial updates are supported.

**Response:**
```json
{
  "email": {
    "match": true,
    "message": false,
    "collaboration": true,
    "marketplace": false,
    "payment": true,
    "system": true
  },
  "push": {
    "match": true,
    "message": true,
    "collaboration": true,
    "marketplace": false,
    "payment": true,
    "system": false
  },
  "inApp": {
    "match": true,
    "message": true,
    "collaboration": false,
    "marketplace": true,
    "payment": true,
    "system": true
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid preference values
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

## 🔌 WebSocket Requirements

### Connection

**URL:** `https://api-hyperbuds-backend.onrender.com`

**Authentication:**
```javascript
socket = io('https://api-hyperbuds-backend.onrender.com', {
  auth: {
    token: accessToken  // JWT token from login
  }
});
```

### Events to Emit (Server → Client)

#### 1. notification:new

Emit when a new notification is created for the user.

**Event:** `notification:new`

**Payload:**
```typescript
{
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}
```

**Example:**
```javascript
// When a new match notification is created
io.to(userId).emit('notification:new', {
  id: '507f1f77bcf86cd799439011',
  userId: '507f191e810c19729de860ea',
  type: 'match',
  title: 'New Match Found',
  message: 'You have a new collaboration match!',
  read: false,
  actionUrl: '/matching/507f1f77bcf86cd799439012',
  metadata: {
    matchId: '507f1f77bcf86cd799439012',
    compatibilityScore: 85
  },
  createdAt: '2025-01-15T10:30:00.000Z'
});
```

#### 2. notification:updated

Emit when a notification is updated (e.g., marked as read).

**Event:** `notification:updated`

**Payload:** Same as `notification:new`

**Example:**
```javascript
io.to(userId).emit('notification:updated', {
  id: '507f1f77bcf86cd799439011',
  read: true,
  updatedAt: '2025-01-15T10:35:00.000Z'
  // ... other fields
});
```

#### 3. notification:deleted

Emit when a notification is deleted.

**Event:** `notification:deleted`

**Payload:**
```typescript
{
  notificationId: string;
}
```

**Example:**
```javascript
io.to(userId).emit('notification:deleted', {
  notificationId: '507f1f77bcf86cd799439011'
});
```

#### 4. notifications:read-all

Emit when all notifications are marked as read.

**Event:** `notifications:read-all`

**Payload:** `void` (no payload needed)

**Example:**
```javascript
io.to(userId).emit('notifications:read-all');
```

---

## 📊 Data Models

### Notification Model

```typescript
interface Notification {
  id: string;                    // Unique notification ID (MongoDB ObjectId)
  userId: string;                // User who receives the notification
  type: NotificationType;        // Type of notification (see below)
  title: string;                 // Notification title (e.g., "New Match Found")
  message: string;               // Notification message body
  read: boolean;                 // Whether notification has been read
  actionUrl?: string;            // Optional URL to navigate when clicked
  metadata?: Record<string, unknown>; // Additional data (matchId, orderId, etc.)
  createdAt: string;             // ISO 8601 timestamp
  updatedAt?: string;            // ISO 8601 timestamp
}
```

### Notification Types

The backend must support these notification types:

```typescript
type NotificationType =
  | 'match'                      // New AI match found
  | 'message'                    // New message received
  | 'collaboration'              // Collaboration update
  | 'collaboration_invite'       // Collaboration invite received
  | 'collaboration_accepted'     // Collaboration invite accepted
  | 'collaboration_rejected'     // Collaboration invite rejected
  | 'collaboration_scheduled'    // Collaboration scheduled
  | 'marketplace_order'          // New marketplace order
  | 'marketplace_review'          // New marketplace review
  | 'streaming_invite'           // Streaming invite
  | 'payment_received'           // Payment received
  | 'payment_failed'             // Payment failed
  | 'system'                     // System notification
  | 'new_follower'               // New follower
  | 'achievement';               // Achievement unlocked
```

### Notification Preferences Model

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

## 🗄️ Database Schema Suggestions

### MongoDB Example

```javascript
// notifications collection
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  userId: ObjectId("507f191e810c19729de860ea"),
  type: "match",
  title: "New Match Found",
  message: "You have a new collaboration match!",
  read: false,
  actionUrl: "/matching/507f1f77bcf86cd799439012",
  metadata: {
    matchId: "507f1f77bcf86cd799439012",
    compatibilityScore: 85
  },
  createdAt: ISODate("2025-01-15T10:30:00.000Z"),
  updatedAt: ISODate("2025-01-15T10:30:00.000Z")
}

// Indexes recommended:
// - userId, createdAt (descending) - for fetching user notifications
// - userId, read - for counting unread notifications
// - userId, type - for filtering by type

// notification_preferences collection
{
  _id: ObjectId("..."),
  userId: ObjectId("507f191e810c19729de860ea"),
  email: {
    match: true,
    message: true,
    collaboration: true,
    marketplace: false,
    payment: true,
    system: true
  },
  push: {
    match: true,
    message: true,
    collaboration: true,
    marketplace: false,
    payment: true,
    system: false
  },
  inApp: {
    match: true,
    message: true,
    collaboration: true,
    marketplace: true,
    payment: true,
    system: true
  },
  updatedAt: ISODate("2025-01-15T10:30:00.000Z")
}

// Indexes recommended:
// - userId (unique) - for quick lookup
```

---

## 🔔 When to Create Notifications

### Suggested Triggers

1. **Match Notifications**
   - When AI matching finds a new compatible user
   - When mutual match occurs

2. **Message Notifications**
   - When user receives a new message
   - When mentioned in a message

3. **Collaboration Notifications**
   - When collaboration invite is sent
   - When collaboration invite is accepted/rejected
   - When collaboration is scheduled
   - When collaboration status changes

4. **Marketplace Notifications**
   - When order is placed
   - When order status changes
   - When review is received

5. **Payment Notifications**
   - When payment is received
   - When payment fails
   - When payout is processed

6. **System Notifications**
   - Account updates
   - Security alerts
   - Feature announcements

---

## ⚡ Performance Recommendations

1. **Pagination**
   - Default limit: 20 notifications per page
   - Maximum limit: 100 notifications per page
   - Use cursor-based pagination if possible for better performance

2. **Caching**
   - Cache unread count (update on every notification create/read)
   - Cache recent notifications (last 10) for quick access

3. **Database Indexing**
   - Index on `userId + createdAt` for fetching notifications
   - Index on `userId + read` for unread count queries

4. **WebSocket Optimization**
   - Only emit to connected users
   - Batch multiple notifications if needed (optional)

---

## 🔒 Security Considerations

1. **Authorization**
   - Verify user can only access their own notifications
   - Verify user can only update/delete their own notifications
   - Use JWT token validation on all endpoints

2. **Rate Limiting**
   - Limit notification creation rate
   - Limit preference update rate

3. **Input Validation**
   - Validate notification type
   - Sanitize notification title and message
   - Validate preference boolean values

4. **WebSocket Security**
   - Authenticate WebSocket connections with JWT
   - Verify user ID matches socket user
   - Implement connection timeout

---

## 📝 Testing Checklist

- [ ] GET /api/v1/notifications returns user's notifications
- [ ] GET /api/v1/notifications with filters works correctly
- [ ] PUT /api/v1/notifications/:id/read marks notification as read
- [ ] PUT /api/v1/notifications/read-all marks all as read
- [ ] DELETE /api/v1/notifications/:id deletes notification
- [ ] GET /api/v1/notifications/preferences returns user preferences
- [ ] PUT /api/v1/notifications/preferences updates preferences
- [ ] WebSocket emits notification:new when notification created
- [ ] WebSocket emits notification:updated when notification updated
- [ ] WebSocket emits notification:deleted when notification deleted
- [ ] WebSocket emits notifications:read-all when all marked as read
- [ ] Authorization: Users can only access their own notifications
- [ ] Pagination works correctly
- [ ] Unread count is accurate

---

## 🚨 Critical Implementation Notes

1. **WebSocket Connection**
   - Must authenticate with JWT token
   - Must emit events to specific user rooms/namespaces
   - Use Socket.IO rooms: `io.to(userId).emit(...)`

2. **Real-time Updates**
   - Emit WebSocket events immediately after database operations
   - Ensure consistency between REST API and WebSocket data

3. **Default Preferences**
   - If user has no preferences, return all `true`
   - Create default preferences on user registration

4. **Action URLs**
   - Use relative paths (e.g., `/matching/123`)
   - Ensure URLs navigate to correct pages in frontend

---

## 📞 Support

For questions or clarifications, please contact the frontend team.

**Last Updated:** January 2025  
**Version:** 1.0.0

