# Testing Niche Validation

This guide explains how to test the niche validation feature to ensure it works correctly with the backend API.

## Backend Requirements

The backend expects:
- **Valid niche values** (lowercase only): `beauty`, `gaming`, `music`, `fitness`, `food`, `travel`, `fashion`, `tech`, `comedy`, `education`, `lifestyle`, `art`, `dance`, `sports`, `business`, `health`, `other`
- **Maximum niches**: 5
- **Minimum niches**: 1

## How to Test

### Method 1: Using the Complete Profile Form (Recommended)

1. **Navigate to the complete profile page**: `/profile/complete-profile`
2. **Test valid scenarios**:
   - Select 1-5 valid niches (e.g., "beauty", "gaming", "music")
   - Submit the form
   - Should succeed ✅

3. **Test invalid scenarios**:
   - Try to select more than 5 niches (the UI should prevent this)
   - If you somehow bypass the UI limit, the backend will reject it
   - Should show error: "You can select a maximum of 5 niches" ❌

### Method 2: Using Browser Console (Quick Test)

1. **Open your browser's Developer Console** (F12)
2. **Get your access token**:
   ```javascript
   const token = localStorage.getItem('accessToken');
   console.log('Token:', token);
   ```

3. **Test with valid niches**:
   ```javascript
   fetch('https://api-hyperbuds-backend.onrender.com/api/v1/profiles/me', {
     method: 'PUT',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
     },
     body: JSON.stringify({
       niche: ['beauty', 'gaming', 'music']
     })
   })
   .then(r => r.json())
   .then(data => console.log('✅ Success:', data))
   .catch(err => console.error('❌ Error:', err));
   ```

4. **Test with invalid niche**:
   ```javascript
   fetch('https://api-hyperbuds-backend.onrender.com/api/v1/profiles/me', {
     method: 'PUT',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
     },
     body: JSON.stringify({
       niche: ['invalid_niche']
     })
   })
   .then(r => r.json())
   .then(data => console.log('Response:', data))
   .catch(err => console.error('Error:', err));
   ```
   Should return validation error ❌

5. **Test with too many niches**:
   ```javascript
   fetch('https://api-hyperbuds-backend.onrender.com/api/v1/profiles/me', {
     method: 'PUT',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
     },
     body: JSON.stringify({
       niche: ['beauty', 'gaming', 'music', 'fitness', 'food', 'travel'] // 6 niches
     })
   })
   .then(r => r.json())
   .then(data => console.log('Response:', data))
   .catch(err => console.error('Error:', err));
   ```
   Should return: `"niche" must contain less than or equal to 5 items` ❌

6. **Test with capitalized niche**:
   ```javascript
   fetch('https://api-hyperbuds-backend.onrender.com/api/v1/profiles/me', {
     method: 'PUT',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
     },
     body: JSON.stringify({
       niche: ['Beauty', 'Gaming'] // Capitalized
     })
   })
   .then(r => r.json())
   .then(data => console.log('Response:', data))
   .catch(err => console.error('Error:', err));
   ```
   Should return validation error (frontend now normalizes to lowercase, but if backend receives capitalized, it will error) ❌

### Method 3: Using the Test Script

1. **Update the test script**:
   - Open `test-niche-validation.js`
   - Replace `ACCESS_TOKEN` with your actual token
   - Update `BASE_URL` if needed

2. **Run the script**:
   ```bash
   node test-niche-validation.js
   ```

3. **Review the results**:
   - The script will run multiple test cases
   - It will show which tests passed ✅ and which failed ❌
   - Check the console output for detailed error messages

## Expected Error Response Format

When validation fails, the backend returns:

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    "\"niche[0]\" must be one of [beauty, gaming, music, fitness, food, travel, fashion, tech, comedy, education, lifestyle, art, dance, sports, business, health, other]",
    "\"niche\" must contain less than or equal to 5 items"
  ]
}
```

## Frontend Error Handling

The frontend now:
1. ✅ **Normalizes niches to lowercase** before sending to backend
2. ✅ **Limits selection to 5 niches** in the UI
3. ✅ **Displays user-friendly error messages** when validation fails
4. ✅ **Shows validation errors** from the backend in a readable format

## Common Issues

### Issue: "niche must be one of [beauty, gaming, ...]"
**Cause**: Invalid niche value (not in the allowed list or capitalized)
**Solution**: 
- Ensure you're using lowercase niche values
- Only select from the available niche options in the UI

### Issue: "niche must contain less than or equal to 5 items"
**Cause**: More than 5 niches selected
**Solution**: 
- The UI should prevent selecting more than 5
- If you see this error, the frontend limit might not be working correctly

### Issue: Validation errors not showing in UI
**Cause**: Error handling might not be parsing the response correctly
**Solution**: 
- Check browser console for the actual error response
- Verify the error format matches what the frontend expects

## Testing Checklist

- [ ] Can select 1 niche ✅
- [ ] Can select 5 niches (max) ✅
- [ ] Cannot select more than 5 niches (UI prevents) ✅
- [ ] Invalid niche values are rejected by backend ❌
- [ ] Error messages display correctly in UI
- [ ] Niches are normalized to lowercase before sending
- [ ] Form submission works with valid niches
- [ ] Form shows appropriate error messages for invalid niches

## Notes

- The frontend now uses the correct niche list matching the backend
- All niche values are normalized to lowercase before API calls
- The UI enforces a maximum of 5 niches
- Error messages are user-friendly and informative

