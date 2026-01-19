# User Search Feature - Backend Requirements

## Overview

This document specifies the backend API requirements for the user search functionality implemented in the frontend. The search feature allows users to search for other users by username, with a dropdown showing matching results as they type.

## Frontend Implementation Summary

### What We Built

1. **Search Bar Component** (`src/components/layout/Header/Header.tsx`)
   - Search input field in the header (visible on md+ screens)
   - Placeholder: "Search @username..."
   - Shows dropdown after typing 1+ character(s)

2. **Search Dropdown Component** (`src/components/layout/Header/UserSearchDropdown.tsx`)
   - Debounced search (300ms delay)
   - Loading, error, and empty states
   - Keyboard navigation (Arrow keys, Enter, Escape)
   - Click on result navigates to `/profile/@username`
   - Displays user avatar, display name, and username

3. **API Client Function** (`src/lib/api/user.api.ts`)
   - `searchUsers(query: string)` function
   - Handles query cleaning (removes `@` symbol)
   - Error handling for missing endpoints
   - Limits results to 20 matches

### User Flow

1. User types in search bar (minimum 1 character)
2. Frontend debounces the query (300ms delay)
3. Frontend calls `GET /users/search?q={query}&limit=20`
4. Backend returns matching users
5. Frontend displays results in dropdown
6. User clicks a result → navigates to `/profile/@username`

## Backend API Requirements

### Endpoint Specification

**Endpoint**: `GET /api/v1/users/search`

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `q` (string, required): Search query (username or display name)
- `limit` (number, optional): Maximum number of results to return (default: 20, max: 50)

**Request Example**:
```
GET /api/v1/users/search?q=john&limit=20
Authorization: Bearer {accessToken}
```

### Expected Response Format

**Success Response** (200 OK):
```json
{
  "users": [
    {
      "id": "user123",
      "username": "johndoe",
      "displayName": "John Doe",
      "avatar": "https://example.com/avatars/johndoe.jpg"
    },
    {
      "id": "user456",
      "username": "johnsmith",
      "displayName": "John Smith",
      "avatar": null
    }
  ],
  "total": 2
}
```

**Response Fields**:
- `users` (array, required): Array of user objects matching the search query
  - `id` (string, required): User's unique identifier
  - `username` (string, required): User's username (used for profile routing)
  - `displayName` (string, optional): User's display name
  - `avatar` (string | null, optional): URL to user's avatar image
- `total` (number, optional): Total number of matching users (useful for pagination in future)

### Search Behavior Requirements

1. **Search Criteria**:
   - Search should match users by:
     - Username (partial match, case-insensitive)
     - Display name (partial match, case-insensitive)
   - Results should be ordered by relevance (exact matches first, then partial matches)

2. **Query Handling**:
   - Backend should handle queries with or without `@` symbol (frontend removes it, but handle both for safety)
   - Trim whitespace from query
   - Ignore empty queries (return empty array)

3. **Result Limiting**:
   - Respect the `limit` parameter
   - Default limit: 20 results
   - Maximum limit: 50 results (to prevent performance issues)
   - Return top matches first (most relevant)

4. **Performance**:
   - Search should be fast (< 200ms for typical queries)
   - Consider indexing username and displayName fields in database
   - Use full-text search or efficient LIKE queries

### Error Responses

**400 Bad Request**:
```json
{
  "message": "Invalid search query"
}
```
- Return when query is missing or invalid

**401 Unauthorized**:
```json
{
  "message": "Unauthorized"
}
```
- Return when authentication token is missing or invalid
- Frontend will handle this by redirecting to login

**500 Internal Server Error**:
```json
{
  "message": "Internal server error"
}
```
- Return for unexpected server errors
- Frontend will display error message to user

**404 Not Found**:
- Frontend currently treats 404 as "endpoint not available" and shows empty results
- This allows graceful degradation until endpoint is implemented

### TypeScript Interface (for reference)

```typescript
interface UserSearchResult {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string | null;
}

interface UserSearchResponse {
  users: UserSearchResult[];
  total?: number;
}
```

## Database Considerations

### Recommended Indexes

To ensure fast search performance, consider adding database indexes:

```sql
-- Example for PostgreSQL
CREATE INDEX idx_users_username_search ON users USING gin(to_tsvector('english', username));
CREATE INDEX idx_users_displayname_search ON users USING gin(to_tsvector('english', display_name));

-- Or for simple LIKE queries
CREATE INDEX idx_users_username_lower ON users(LOWER(username));
CREATE INDEX idx_users_displayname_lower ON users(LOWER(display_name));
```

### Recommended Query Pattern

**PostgreSQL Example**:
```sql
SELECT id, username, display_name, avatar
FROM users
WHERE 
  LOWER(username) LIKE LOWER('%' || $1 || '%')
  OR LOWER(display_name) LIKE LOWER('%' || $1 || '%')
ORDER BY 
  CASE 
    WHEN LOWER(username) = LOWER($1) THEN 1
    WHEN LOWER(username) LIKE LOWER($1 || '%') THEN 2
    ELSE 3
  END,
  username ASC
LIMIT $2;
```

**MongoDB Example**:
```javascript
db.users.find({
  $or: [
    { username: { $regex: query, $options: 'i' } },
    { displayName: { $regex: query, $options: 'i' } }
  ]
})
.sort({ username: 1 })
.limit(limit);
```

## Testing Recommendations

### Test Cases

1. **Basic Search**:
   - Search for exact username match → should return 1 result
   - Search for partial username → should return multiple matches
   - Search for display name → should return matching users

2. **Edge Cases**:
   - Empty query → should return empty array (or 400 error)
   - Query with special characters → should handle safely
   - Query with `@` symbol → should work (frontend removes it, but backend should handle both)
   - Very long query → should handle gracefully

3. **Pagination**:
   - Test with different `limit` values
   - Verify results don't exceed limit
   - Test with limit > total results

4. **Authentication**:
   - Request without token → should return 401
   - Request with invalid token → should return 401
   - Request with valid token → should return results

5. **Performance**:
   - Test with large database (1000+ users)
   - Verify response time < 200ms
   - Test concurrent requests

## Integration Checklist

- [ ] Endpoint `GET /api/v1/users/search` is implemented
- [ ] Authentication is required and validated
- [ ] Query parameter `q` is handled correctly
- [ ] Query parameter `limit` is respected (default: 20, max: 50)
- [ ] Response format matches specification
- [ ] Search works for both username and display name
- [ ] Results are ordered by relevance
- [ ] Error responses follow specification
- [ ] Database indexes are added for performance
- [ ] Endpoint is tested with various queries
- [ ] Endpoint handles edge cases gracefully

## Notes

- Frontend currently handles 404/500 errors gracefully (shows empty results)
- Once backend endpoint is implemented, search will work automatically
- Frontend debounces queries (300ms) to reduce API calls
- Frontend limits results display to 20 items (backend should respect this)
- Users can navigate to profile pages via `/profile/@username` route

## Questions or Issues?

If there are any questions about the implementation or requirements, please contact the frontend team.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Frontend Implementation**: Complete  
**Backend Status**: Pending
