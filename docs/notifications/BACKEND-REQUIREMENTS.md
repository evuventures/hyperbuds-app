# Notification System - Backend Requirements

This document outlines all backend requirements for the notification system implementation.

## 📋 Overview

The frontend notification system is **fully implemented** and ready to connect to the backend. This document specifies what the backend team needs to implement.

### Quick Start for Backend Team

**Priority Order:**
1. **Start with REST API endpoints** (6 endpoints) - These are required first
2. **Then implement WebSocket** (4 events) - For real-time updates
3. **Database setup** - Notifications and preferences collections
4. **Testing** - Use the testing checklist provided

**Key Points:**
- All endpoints require JWT Bearer token authentication
- WebSocket connection uses `auth.token` in connection options
- `notification:deleted` event sends **string ID only** (not an object)
- Error responses must follow format: `{ success: false, message: "..." }`
- Frontend handles visual indicators automatically (red dot badge)

## ⚠️ Recent Changes (Frontend Updates)

### Removed Features
The following features have been **removed** from the frontend implementation:

1. **Browser Notifications (Alert System)**
   - ❌ Browser notification API integration removed
   - ❌ Permission request dialogs removed
   - ❌ Native browser alert notifications removed
   - **Reason**: Simplified UX - notifications are now only visible in-app

2. **Sound Notifications**
   - ❌ Audio notification sounds removed
   - ❌ Sound playback on new notifications removed
   - **Reason**: Cleaner, less intrusive user experience

### Current Frontend Implementation
✅ **Visual Indicator Only**: The notification system now uses a **red dot indicator** in the header to show unread notification count
- Simple, clean UI without sound or browser alerts
- Users can click the bell icon to view notifications in-app
- Real-time updates via WebSocket still work (without sound/alerts)

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

### ⚠️ Important: Error Response Format
All error responses across all endpoints follow this format:
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

Common HTTP status codes:
- `400 Bad Request` - Invalid parameters or request body
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error

---

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
- `400 Bad Request` - Invalid query parameters
  ```json
  {
    "success": false,
    "message": "Invalid parameter: 'limit' must be between 1 and 100"
  }
  ```
- `401 Unauthorized` - Invalid or missing token
  ```json
  {
    "success": false,
    "message": "Unauthorized. Please login."
  }
  ```
- `500 Internal Server Error` - Server error
  ```json
  {
    "success": false,
    "message": "Internal server error"
  }
  ```

**Query Parameter Validation:**
- `page`: Must be a positive integer ≥ 1 (default: 1)
- `limit`: Must be between 1 and 100 (default: 20)
- `type`: Must be a valid NotificationType (see Data Models section for allowed values)
- `read`: Must be boolean string `"true"` or `"false"` in query params (e.g., `?read=false`)

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
  },
  transports: ['websocket', 'polling'],  // Required: Support both transports
  timeout: 10000,  // Connection timeout
  reconnection: true,  // Enable auto-reconnection
  reconnectionAttempts: 5,  // Max reconnection attempts
  reconnectionDelay: 1000  // Delay between reconnection attempts
});
```

**Important Connection Requirements:**
- ✅ Must support both WebSocket and polling transports
- ✅ Must authenticate connection using JWT token in `auth.token`
- ✅ Must verify token and extract userId before allowing connection
- ✅ Must implement CORS for WebSocket connections
- ✅ Should use Socket.IO rooms/namespaces per user: `io.to(userId).emit(...)`

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

**Payload:** Just the notification ID as a string (not an object)

```typescript
string  // The notification ID directly
```

**Example:**
```javascript
// Send just the string ID, NOT an object
io.to(userId).emit('notification:deleted', '507f1f77bcf86cd799439011');
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

## 📝 Example API Requests

### Get Notifications
```bash
curl -X GET "https://api-hyperbuds-backend.onrender.com/api/v1/notifications?page=1&limit=20&read=false" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Mark Notification as Read
```bash
curl -X PUT "https://api-hyperbuds-backend.onrender.com/api/v1/notifications/507f1f77bcf86cd799439011/read" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Mark All as Read
```bash
curl -X PUT "https://api-hyperbuds-backend.onrender.com/api/v1/notifications/read-all" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Delete Notification
```bash
curl -X DELETE "https://api-hyperbuds-backend.onrender.com/api/v1/notifications/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Preferences
```bash
curl -X GET "https://api-hyperbuds-backend.onrender.com/api/v1/notifications/preferences" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Update Preferences
```bash
curl -X PUT "https://api-hyperbuds-backend.onrender.com/api/v1/notifications/preferences" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": {
      "match": true,
      "message": false
    },
    "inApp": {
      "collaboration": false
    }
  }'
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
   - ✅ Must authenticate with JWT token in `auth.token`
   - ✅ Must verify token and extract `userId` from JWT payload
   - ✅ Must emit events to specific user rooms/namespaces
   - ✅ Use Socket.IO rooms: `io.to(userId).emit(...)`
   - ✅ Must support both `websocket` and `polling` transports
   - ✅ Implement CORS configuration for WebSocket origin
   - ✅ Handle connection errors gracefully (frontend expects silent failures)

2. **Real-time Updates**
   - ✅ Emit WebSocket events **immediately** after database operations
   - ✅ Ensure consistency between REST API and WebSocket data
   - ✅ Always emit to the correct user room (verify userId matches)
   - ✅ Emit even if user is offline (Socket.IO will queue or ignore)

3. **Default Preferences**
   - ✅ If user has no preferences, return all `true` by default
   - ✅ Create default preferences on user registration (optional but recommended)
   - ✅ Return full preferences object even for partial updates

4. **Action URLs**
   - ✅ Use relative paths (e.g., `/matching/123`, `/profile/edit`)
   - ✅ Ensure URLs navigate to correct pages in frontend
   - ✅ Optional but recommended for better UX

5. **Notification Payload Format**
   - ✅ `notification:deleted` event must send **just the string ID**, not an object
   - ✅ All other events send full notification objects
   - ✅ Use ISO 8601 format for all timestamps (e.g., `2025-01-15T10:30:00.000Z`)
   - ✅ `metadata` field can contain any JSON-serializable data

6. **Error Handling**
   - ✅ Return consistent error format: `{ success: false, message: "..." }`
   - ✅ Use appropriate HTTP status codes (400, 401, 403, 404, 500)
   - ✅ Validate all input parameters before processing
   - ✅ Sanitize notification titles and messages to prevent XSS

---

## 🔧 Technical Specifications

### WebSocket Implementation Details

#### Connection Flow
1. Client connects with JWT token in `auth.token`
2. Server validates token and extracts `userId`
3. Server joins socket to user-specific room: `socket.join(userId)`
4. Server can now emit to user: `io.to(userId).emit(...)`

#### Event Timing
- Emit `notification:new` **immediately after** creating notification in database
- Emit `notification:updated` **immediately after** updating notification
- Emit `notification:deleted` **immediately after** deleting notification (send string ID only)
- Emit `notifications:read-all` **immediately after** marking all as read

#### User Room Management
```javascript
// Example Socket.IO implementation
io.on('connection', (socket) => {
  const token = socket.handshake.auth.token;
  const userId = verifyTokenAndGetUserId(token);
  
  // Join user-specific room
  socket.join(`user:${userId}`);
  
  // When creating notification, emit to user's room
  socket.on('disconnect', () => {
    socket.leave(`user:${userId}`);
  });
});

// Emit notification to specific user
function notifyUser(userId, event, data) {
  io.to(`user:${userId}`).emit(event, data);
}
```

### Response Format Standards

All successful API responses must include:
```json
{
  "success": true,
  // ... response data
}
```

All error responses must include:
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

### CORS Configuration

For WebSocket connections, ensure CORS allows:
- Origin: Frontend domain (configure appropriately)
- Methods: `GET`, `POST`
- Headers: `Authorization`, `Content-Type`
- Credentials: `true` (if using cookies)

---

## 📋 Summary: What Backend Team Needs to Implement

### ✅ Required Implementation (No Changes)

The backend team still needs to implement all the following features. **No changes are required** based on frontend updates - all API endpoints and WebSocket events remain the same.

#### REST API Endpoints (6 endpoints required)
1. ✅ `GET /api/v1/notifications` - Get user notifications with pagination and filtering
2. ✅ `PUT /api/v1/notifications/:id/read` - Mark single notification as read
3. ✅ `PUT /api/v1/notifications/read-all` - Mark all notifications as read
4. ✅ `DELETE /api/v1/notifications/:id` - Delete a notification
5. ✅ `GET /api/v1/notifications/preferences` - Get user notification preferences
6. ✅ `PUT /api/v1/notifications/preferences` - Update notification preferences

#### WebSocket Events (4 events required)
1. ✅ `notification:new` - Emit when new notification is created
2. ✅ `notification:updated` - Emit when notification is updated
3. ✅ `notification:deleted` - Emit when notification is deleted
4. ✅ `notifications:read-all` - Emit when all notifications are marked as read

#### Database Schema
- ✅ Notification collection/model with required fields (see Database Schema section)
- ✅ Notification preferences collection/model
- ✅ Proper indexing for performance

### ❌ NOT Required (Removed from Frontend)

The following features are **NOT needed** from the backend because the frontend has removed support for them:

1. ❌ **Browser Notification API** - Backend does NOT need to support browser push notifications
2. ❌ **Sound/Audio Alerts** - Backend does NOT need to send audio file URLs or sound metadata
3. ❌ **Push Notification Service** - Backend does NOT need to integrate with FCM, APNs, or other push services

**Important**: The backend can focus purely on the REST API and WebSocket events. The frontend handles all visual indicators (red dot badge) automatically based on the `unreadCount` returned from the API.

---

## ✅ Final Checklist Before Implementation

Before starting implementation, ensure you understand:

- [ ] All 6 REST API endpoints and their exact paths
- [ ] All 4 WebSocket events and their payload formats
- [ ] `notification:deleted` sends **string ID only** (not an object)
- [ ] Error responses use consistent format: `{ success: false, message: "..." }`
- [ ] WebSocket must support both `websocket` and `polling` transports
- [ ] WebSocket authentication via `auth.token` in connection options
- [ ] User room management for targeted WebSocket emissions
- [ ] Default preferences return all `true` if user has no preferences
- [ ] All timestamps in ISO 8601 format
- [ ] Proper indexing on database for performance
- [ ] Authorization checks on all endpoints

---

**Last Updated:** January 2025  
**Version:** 1.2.0 (Updated with detailed error formats, WebSocket specs, and implementation examples)

