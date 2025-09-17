# HyperBuds Messaging API Specification

## Overview
This document outlines the complete backend API specification for the HyperBuds messaging system. The API should be implemented to support real-time messaging, file sharing, and conversation management.

## Base URL
```
https://api-hyperbuds-backend.onrender.com/api/v1
```

## Authentication
All endpoints require Bearer token authentication in the Authorization header:
```
Authorization: Bearer <access_token>
```

## WebSocket Connection
Real-time features are handled via Socket.IO connection to:
```
https://api-hyperbuds-backend.onrender.com
```

Connection with authentication:
```javascript
const socket = io('https://api-hyperbuds-backend.onrender.com', {
  auth: {
    token: accessToken
  }
});
```

## Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}
```

### Message
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: string;
  editedAt?: string;
  replyTo?: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}
```

### MessageAttachment
```typescript
interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'video' | 'audio';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
}
```

### MessageReaction
```typescript
interface MessageReaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: string;
}
```

### Conversation
```typescript
interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  avatar?: string;
  participants: User[];
  lastMessage?: Message;
  lastMessageAt?: string;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  admins?: string[];
}
```

### MessageNotification
```typescript
interface MessageNotification {
  id: string;
  conversationId: string;
  messageId: string;
  recipientId: string;
  type: 'new_message' | 'reaction' | 'mention';
  content: string;
  isRead: boolean;
  createdAt: string;
}
```

## REST API Endpoints

### 1. Conversations

#### GET /messages/conversations
Get user's conversations with optional filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50)
- `type` (string, optional): 'direct' | 'group'
- `isArchived` (boolean, optional)
- `isMuted` (boolean, optional)
- `search` (string, optional): Search in conversation names and participant names

**Response:**
```json
{
  "conversations": [Conversation],
  "total": number,
  "hasMore": boolean
}
```

#### GET /messages/conversations/:id
Get specific conversation details.

**Response:**
```json
Conversation
```

#### POST /messages/conversations
Create a new conversation.

**Request Body:**
```json
{
  "type": "direct" | "group",
  "participantIds": string[],
  "name": string, // optional for groups
  "description": string // optional for groups
}
```

**Response:**
```json
Conversation
```

#### PUT /messages/conversations/:id
Update conversation details (name, description, avatar).

**Request Body (FormData):**
- `name` (string, optional)
- `description` (string, optional)
- `avatar` (file, optional)

**Response:**
```json
Conversation
```

#### DELETE /messages/conversations/:id
Delete a conversation.

**Response:**
```json
{
  "message": "Conversation deleted successfully"
}
```

#### POST /messages/conversations/:id/archive
Archive a conversation.

**Response:**
```json
{
  "message": "Conversation archived successfully"
}
```

#### POST /messages/conversations/:id/unarchive
Unarchive a conversation.

**Response:**
```json
{
  "message": "Conversation unarchived successfully"
}
```

#### POST /messages/conversations/:id/mute
Mute a conversation.

**Response:**
```json
{
  "message": "Conversation muted successfully"
}
```

#### POST /messages/conversations/:id/unmute
Unmute a conversation.

**Response:**
```json
{
  "message": "Conversation unmuted successfully"
}
```

#### POST /messages/conversations/:id/read
Mark all messages in conversation as read.

**Response:**
```json
{
  "message": "Conversation marked as read"
}
```

### 2. Messages

#### GET /messages/conversations/:conversationId/messages
Get messages for a specific conversation with pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50)
- `senderId` (string, optional)
- `type` (string, optional): 'text' | 'image' | 'file' | 'system'
- `dateFrom` (string, optional): ISO date string
- `dateTo` (string, optional): ISO date string
- `search` (string, optional): Search in message content

**Response:**
```json
{
  "messages": [Message],
  "total": number,
  "hasMore": boolean
}
```

#### POST /messages/conversations/:conversationId/messages
Send a new message.

**Request Body (FormData):**
- `content` (string, required)
- `type` (string, required): 'text' | 'image' | 'file'
- `replyTo` (string, optional): ID of message being replied to
- `attachments[0]`, `attachments[1]`, etc. (files, optional)

**Response:**
```json
Message
```

#### PUT /messages/conversations/:conversationId/messages/:messageId
Edit a message.

**Request Body:**
```json
{
  "content": string
}
```

**Response:**
```json
Message
```

#### DELETE /messages/conversations/:conversationId/messages/:messageId
Delete a message.

**Response:**
```json
{
  "message": "Message deleted successfully"
}
```

#### POST /messages/conversations/:conversationId/messages/:messageId/read
Mark a specific message as read.

**Response:**
```json
{
  "message": "Message marked as read"
}
```

### 3. Message Reactions

#### POST /messages/conversations/:conversationId/messages/:messageId/reactions
Add a reaction to a message.

**Request Body:**
```json
{
  "emoji": string
}
```

**Response:**
```json
{
  "message": "Reaction added successfully"
}
```

#### DELETE /messages/conversations/:conversationId/messages/:messageId/reactions/:emoji
Remove a reaction from a message.

**Response:**
```json
{
  "message": "Reaction removed successfully"
}
```

### 4. Search

#### GET /messages/search
Search messages across all conversations.

**Query Parameters:**
- `q` (string, required): Search query
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `conversationId` (string, optional)
- `senderId` (string, optional)
- `type` (string, optional)
- `dateFrom` (string, optional)
- `dateTo` (string, optional)

**Response:**
```json
{
  "results": [
    {
      "message": Message,
      "conversation": Conversation,
      "highlightedContent": string
    }
  ],
  "total": number,
  "hasMore": boolean
}
```

### 5. Notifications

#### GET /messages/notifications
Get user's message notifications.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50)

**Response:**
```json
{
  "notifications": [MessageNotification],
  "total": number,
  "hasMore": boolean
}
```

#### POST /messages/notifications/:notificationId/read
Mark a notification as read.

**Response:**
```json
{
  "message": "Notification marked as read"
}
```

#### POST /messages/notifications/read-all
Mark all notifications as read.

**Response:**
```json
{
  "message": "All notifications marked as read"
}
```

### 6. File Upload

#### POST /messages/upload
Upload a file for messaging.

**Request Body (FormData):**
- `file` (file, required)

**Response:**
```json
{
  "url": string,
  "filename": string,
  "size": number,
  "mimeType": string
}
```

## WebSocket Events

### Client to Server Events

#### Connection
```javascript
// Authenticate connection
socket.emit('authenticate', { token: accessToken });
```

#### Typing Indicators
```javascript
// Start typing
socket.emit('typing:start', { 
  conversationId: string, 
  userId: string 
});

// Stop typing
socket.emit('typing:stop', { 
  conversationId: string, 
  userId: string 
});
```

#### User Status
```javascript
// Update user status
socket.emit('user:status', { 
  status: 'online' | 'offline' | 'away' 
});
```

### Server to Client Events

#### Message Events
```javascript
// New message received
socket.on('message:received', (message: Message) => {
  // Handle new message
});

// Message status updated
socket.on('message:status', (data: { 
  messageId: string, 
  status: 'sent' | 'delivered' | 'read' 
}) => {
  // Update message status
});

// Message edited
socket.on('message:edited', (data: { 
  messageId: string, 
  content: string, 
  editedAt: string 
}) => {
  // Update message content
});

// Message deleted
socket.on('message:deleted', (data: { 
  messageId: string, 
  conversationId: string 
}) => {
  // Remove message from UI
});

// Message reaction added/removed
socket.on('message:reaction', (data: { 
  messageId: string, 
  reaction: MessageReaction 
}) => {
  // Update message reactions
});
```

#### Typing Events
```javascript
// User started typing
socket.on('typing:start', (data: { 
  conversationId: string, 
  userId: string, 
  userName: string 
}) => {
  // Show typing indicator
});

// User stopped typing
socket.on('typing:stop', (data: { 
  conversationId: string, 
  userId: string 
}) => {
  // Hide typing indicator
});
```

#### Conversation Events
```javascript
// New conversation created
socket.on('conversation:created', (conversation: Conversation) => {
  // Add to conversation list
});

// Conversation updated
socket.on('conversation:updated', (conversation: Conversation) => {
  // Update conversation in list
});

// Conversation deleted
socket.on('conversation:deleted', (data: { 
  conversationId: string 
}) => {
  // Remove from conversation list
});

// Participant added
socket.on('conversation:participant_added', (data: { 
  conversationId: string, 
  user: User 
}) => {
  // Add participant to conversation
});

// Participant removed
socket.on('conversation:participant_removed', (data: { 
  conversationId: string, 
  userId: string 
}) => {
  // Remove participant from conversation
});
```

#### User Events
```javascript
// User status changed
socket.on('user:status', (data: { 
  userId: string, 
  status: 'online' | 'offline' | 'away' 
}) => {
  // Update user status in UI
});
```

#### Notification Events
```javascript
// New notification
socket.on('notification:new', (notification: MessageNotification) => {
  // Show notification
});

// Notification read
socket.on('notification:read', (data: { 
  notificationId: string 
}) => {
  // Mark notification as read
});
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": string,
    "message": string,
    "details": any // optional
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Invalid or missing authentication token
- `FORBIDDEN`: User doesn't have permission for the action
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `RATE_LIMITED`: Too many requests
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `INVALID_FILE_TYPE`: File type not allowed
- `CONVERSATION_NOT_FOUND`: Conversation doesn't exist
- `MESSAGE_NOT_FOUND`: Message doesn't exist
- `PARTICIPANT_NOT_FOUND`: User is not a participant in the conversation

## Rate Limiting
- **Messages**: 60 per minute per user
- **File uploads**: 10 per minute per user
- **API calls**: 1000 per hour per user
- **WebSocket events**: 1000 per hour per connection

## File Upload Limits
- **Maximum file size**: 10MB
- **Allowed file types**: 
  - Images: jpg, jpeg, png, gif, webp
  - Documents: pdf, doc, docx, txt
  - Audio: mp3, wav, ogg
  - Video: mp4, webm, avi (max 5MB)

## Security Considerations

### Authentication
- All endpoints require valid JWT token
- Token should include user ID and permissions
- Implement token refresh mechanism

### Authorization
- Users can only access conversations they participate in
- Users can only edit/delete their own messages
- Group admins can manage participants and settings

### Data Validation
- Sanitize all text inputs
- Validate file uploads (type, size, content)
- Implement CSRF protection
- Use HTTPS for all communications

### Privacy
- Implement end-to-end encryption for sensitive conversations
- Log access and modifications for audit trail
- Implement data retention policies

## Performance Considerations

### Database Optimization
- Index conversation_id, sender_id, timestamp on messages table
- Use pagination for large datasets
- Implement message archiving for old conversations
- Use connection pooling

### Caching
- Cache conversation lists
- Cache user status
- Use Redis for real-time features
- Implement CDN for file uploads

### Real-time Features
- Use Socket.IO with Redis adapter for scaling
- Implement connection management
- Handle reconnection gracefully
- Optimize event payloads

## Testing Requirements

### Unit Tests
- Test all API endpoints
- Test WebSocket event handlers
- Test data validation
- Test error handling

### Integration Tests
- Test complete messaging flows
- Test file upload/download
- Test real-time features
- Test authentication/authorization

### Load Tests
- Test concurrent users
- Test message throughput
- Test file upload performance
- Test WebSocket connections

## Deployment Considerations

### Environment Variables
```
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
FILE_UPLOAD_PATH=
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/*,application/pdf,text/*
```

### Health Checks
- Database connectivity
- Redis connectivity
- File storage accessibility
- WebSocket server status

### Monitoring
- API response times
- WebSocket connection count
- Error rates
- File upload success rates
- Message delivery rates

## Implementation Priority

### Phase 1 (Core Features)
1. Basic conversation CRUD
2. Text messaging
3. Real-time message delivery
4. Typing indicators
5. Basic authentication

### Phase 2 (Enhanced Features)
1. File uploads and sharing
2. Message reactions
3. Message editing/deletion
4. Search functionality
5. Notifications

### Phase 3 (Advanced Features)
1. Voice messages
2. Video calls integration
3. Message encryption
4. Advanced search
5. Analytics and reporting

This specification provides a comprehensive foundation for implementing the HyperBuds messaging backend. The backend team should prioritize Phase 1 features first and ensure proper testing and security measures are in place before moving to subsequent phases.
