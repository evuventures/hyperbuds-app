# Avatar Upload Issue - Backend Fix Required

## 🚨 Issue
Avatar upload is failing with **500 Internal Server Error** on the `/api/v1/profiles/upload-media` endpoint.

## 📋 Current Implementation

### Frontend Request Details
- **Endpoint**: `POST /api/v1/profiles/upload-media`
- **Headers**: 
  ```
  Authorization: Bearer {user_token}
  ```
- **Body**: `FormData` with:
  - `file`: Image file (JPG, PNG, etc.)
  - `type`: "avatar" (string)

### Expected Response
```json
{
  "url": "https://example.com/uploads/avatar_123.jpg"
}
```

## 🔍 Error Details
- **Status Code**: 500 Internal Server Error
- **Error Message**: Server responds with 500 without detailed error info
- **Frontend Logs**: `Failed to load resource: the server responded with a status of 500`

## 🛠️ Backend Investigation Needed

### Check These Areas:
1. **File Upload Processing**
   - Multer/file upload middleware configuration
   - File size limits
   - File type validation
   - File storage path/permissions

2. **Database Operations**
   - User profile update queries
   - Avatar URL storage
   - Database connection issues

3. **Authentication**
   - Token validation
   - User authorization for profile updates

4. **Server Configuration**
   - Request body size limits
   - CORS settings
   - Error handling middleware

## 🧪 Test Cases
1. Upload small image file (< 1MB)
2. Upload larger image file (2-5MB)
3. Upload non-image file (should return 400)
4. Upload without authentication token (should return 401)
5. Upload with invalid token (should return 401)

## 📝 Suggested Fix Steps
1. Check server logs for detailed error messages
2. Verify file upload middleware is properly configured
3. Ensure database can handle avatar URL updates
4. Add proper error handling and logging
5. Test endpoint with Postman/curl

## 🔗 Related Files
- Frontend: `src/components/profile/ProfileEdit/Card.tsx` (lines 107-127)
- Backend endpoint: `/api/v1/profiles/upload-media`

---
**Priority**: High - Blocks profile picture functionality
**Assignee**: Backend Team
**Date**: $(date)
