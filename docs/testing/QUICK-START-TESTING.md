# 🚀 Quick Start Testing Guide

## Prerequisites

1. **Get your credentials**:
   ```javascript
   // In browser console (on your app):
   console.log('Token:', localStorage.getItem('accessToken'));
   console.log('User ID:', localStorage.getItem('userId'));
   console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'));
   ```

2. **Set environment variables** (for script testing):
   ```bash
   export NEXT_PUBLIC_BASE_URL="https://api-hyperbuds-backend.onrender.com"
   export TEST_TOKEN="your_access_token_here"
   export TEST_USER_ID="your_user_id_here"
   export TEST_USERNAME="your_username_here"
   ```

## Quick Tests

### 1. Test Niches API (No Auth Required)
```javascript
// Browser console
const response = await fetch('https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/niches');
const data = await response.json();
console.log('Niches count:', data.niches?.length);
console.log('First 10:', data.niches?.slice(0, 10));
```

### 2. Test Update Niches (Requires Auth)
```javascript
// Browser console
const token = localStorage.getItem('accessToken');
const userId = localStorage.getItem('userId');

const response = await fetch('https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/niches/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    userId: userId,
    niches: ['Gaming', 'Tech Reviews', 'Music']
  })
});

const data = await response.json();
console.log('Result:', data);
```

### 3. Test Rizz Score
```javascript
// Browser console
const token = localStorage.getItem('accessToken');
const userId = localStorage.getItem('userId');

const response = await fetch(`https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/rizz-score/${userId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
console.log('Rizz Score:', data.rizzScore);
console.log('Suggestions:', data.suggestions);
```

### 4. Test Suggestions
```javascript
// Browser console
const token = localStorage.getItem('accessToken');
const userId = localStorage.getItem('userId');

const response = await fetch(`https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/suggestions/${userId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
console.log('Suggestions:', data.suggestions);
```

### 5. Test Profile by Username
```javascript
// Browser console (no auth required)
const username = 'testuser'; // Replace with actual username

const response = await fetch(`https://api-hyperbuds-backend.onrender.com/api/v1/profile/${username}`);
const data = await response.json();
console.log('Profile:', data);
```

## UI Testing Checklist

### ✅ Niche Selection
- [ ] Go to `/profile/complete-profile` or `/profile/edit`
- [ ] Open niche dropdown
- [ ] Verify 100+ niches load
- [ ] Select multiple niches (try 5, 10, 20+)
- [ ] Save profile
- [ ] Verify niches are saved

### ✅ Matching Page
- [ ] Go to `/matching`
- [ ] Verify suggestions load
- [ ] Check matching scores display
- [ ] Verify shared niches show (if any)
- [ ] Test refresh button

### ✅ Public Profile
- [ ] Go to `/profile/[username]` (replace with actual username)
- [ ] Verify profile displays
- [ ] Check niches show as chips
- [ ] Verify Rizz score displays
- [ ] Test with invalid username (should show error)

## Run Automated Tests

```bash
# Using Node.js
node test-all-endpoints.js

# Or with environment variables
NEXT_PUBLIC_BASE_URL=https://api.example.com \
TEST_TOKEN=your_token \
TEST_USER_ID=12345 \
TEST_USERNAME=testuser \
node test-all-endpoints.js
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "Authentication required" | Check `accessToken` in localStorage |
| "User ID not found" | Check `userId` in localStorage or profile response |
| "Profile not found" | Verify username is correct and user exists |
| Niches not loading | Check `NEXT_PUBLIC_BASE_URL` in `.env.local` |
| CORS errors | Verify backend CORS settings |

## Full Documentation

See `docs/TESTING-GUIDE.md` for comprehensive testing guide.


