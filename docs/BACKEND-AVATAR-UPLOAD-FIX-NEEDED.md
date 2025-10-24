# 🚨 URGENT: Avatar Upload Backend Fix Required

## Status
**Priority**: HIGH  
**Issue**: Profile picture upload failing with 500 Internal Server Error  
**Frontend**: Ready ✅  
**Backend**: Needs Fix ❌  
**Date**: 2025-01-23

---

## 📋 Issue Summary

The avatar upload functionality is **completely broken** due to backend API returning **500 Internal Server Error**. The frontend has been updated with a working UI, but the backend endpoint needs immediate attention.

### Current Error
- **Endpoint**: `POST /api/v1/profiles/upload-media`
- **Error**: `500 Internal Server Error`
- **Impact**: Users cannot upload or change their profile pictures

### 🔴 SPECIFIC ERROR IDENTIFIED (2025-01-23)
```json
{
  "message": "No value provided for input HTTP label: Bucket."
}
```

**Root Cause**: AWS S3 bucket name is **not configured** in backend environment variables.

**Solution**: Backend team needs to set the S3 bucket configuration or switch to alternative storage.

---

## 🔧 Frontend Implementation (Already Working)

### Upload Request Details

**Endpoint**: `POST /api/v1/profiles/upload-media`

**Headers**:
```javascript
{
  "Authorization": "Bearer {user_access_token}"
}
```

**Request Body** (FormData):
```javascript
{
  "file": File,        // Image file (JPG, PNG, GIF)
  "type": "avatar"     // String identifier
}
```

**Frontend Code Location**: 
- `src/components/profile/ProfileEdit/Card.tsx` (lines 296-316)
- `src/app/profile/complete-profile/page.jsx` (lines 181-205)

### Expected Response

**Success (200)**:
```json
{
  "url": "https://your-cdn.com/uploads/avatars/user123_avatar.jpg"
}
```

**Error Responses**:
```json
// 400 Bad Request
{
  "error": "Invalid file type",
  "message": "Only JPG, PNG, and GIF files are allowed"
}

// 413 Payload Too Large
{
  "error": "File too large",
  "message": "Maximum file size is 5MB"
}

// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "Valid authentication token required"
}
```

---

## 🛠️ What Backend Team Needs to Fix

### 🚨 URGENT: Fix S3 Bucket Configuration

**Error**: `"No value provided for input HTTP label: Bucket."`

The backend is missing the AWS S3 bucket name configuration. Add these environment variables:

```bash
# .env file
AWS_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1  # or your region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

**Backend Code Example**:
```javascript
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const uploadParams = {
  Bucket: process.env.AWS_BUCKET_NAME,  // ⚠️ THIS IS MISSING!
  Key: `avatars/${filename}`,
  Body: fileBuffer,
  ContentType: file.mimetype,
  ACL: 'public-read'
};
```

---

### 1. File Upload Middleware Configuration

**Check Multer/File Upload Setup**:
```javascript
// Example expected configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/avatars',
    filename: (req, file, cb) => {
      const uniqueName = `${req.user.id}_${Date.now()}_${file.originalname}`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});
```

### 2. Route Handler

**Expected Endpoint Implementation**:
```javascript
router.post('/profiles/upload-media', 
  authenticate,           // JWT validation middleware
  upload.single('file'),  // Multer middleware
  async (req, res) => {
    try {
      // 1. Validate file was uploaded
      if (!req.file) {
        return res.status(400).json({ 
          error: 'No file uploaded' 
        });
      }

      // 2. Get upload type from body
      const { type } = req.body;
      if (type !== 'avatar') {
        return res.status(400).json({ 
          error: 'Invalid upload type' 
        });
      }

      // 3. Generate file URL (adjust based on your storage)
      const fileUrl = `${process.env.CDN_URL}/uploads/avatars/${req.file.filename}`;
      
      // OR if using cloud storage (S3, Cloudinary, etc.)
      // const fileUrl = await uploadToCloud(req.file);

      // 4. Return URL to frontend
      res.status(200).json({ url: fileUrl });

    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({ 
        error: 'Upload failed',
        message: error.message 
      });
    }
  }
);
```

### 3. File Storage

**Options**:

**Option A: Local Storage**
- Create `/uploads/avatars/` directory
- Ensure write permissions
- Serve files statically

**Option B: Cloud Storage** (Recommended)
- AWS S3
- Cloudinary
- Google Cloud Storage
- Azure Blob Storage

### 4. Database Update

**After upload, update user profile**:
```javascript
// When profile is updated via PUT /api/v1/profiles/me
await User.findByIdAndUpdate(req.user.id, {
  'profile.avatar': avatarUrl
});
```

---

## 🧪 Testing Checklist

### Test Cases to Verify

- [ ] **Valid Upload**: JPG/PNG/GIF under 5MB → Returns URL
- [ ] **Large File**: Over 5MB → Returns 413 error
- [ ] **Invalid Type**: PDF/DOCX → Returns 400 error
- [ ] **No Auth**: No token → Returns 401 error
- [ ] **Invalid Token**: Bad token → Returns 401 error
- [ ] **No File**: Empty request → Returns 400 error

### Test with cURL

```bash
# Test with valid file
curl -X POST \
  http://localhost:5000/api/v1/profiles/upload-media \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@test-avatar.jpg" \
  -F "type=avatar"

# Expected: {"url": "https://..."}
```

### Test with Postman

1. Create POST request to `/api/v1/profiles/upload-media`
2. Add Authorization header: `Bearer {token}`
3. Body → form-data:
   - Key: `file` (type: File) → Select image
   - Key: `type` (type: Text) → Value: `avatar`
4. Send → Should return 200 with URL

---

## 🔍 Debugging Steps

1. **Check Server Logs**
   - Look for detailed error messages
   - Check stack traces

2. **Verify File Upload Middleware**
   - Is Multer properly configured?
   - Are file size limits set?
   - Is upload directory accessible?

3. **Test File Permissions**
   ```bash
   # On server
   ls -la uploads/avatars/
   # Should show write permissions
   ```

4. **Check Environment Variables**
   - CDN_URL
   - UPLOAD_PATH
   - Storage credentials (if using cloud)

5. **Database Connection**
   - Can profile updates write to DB?
   - Are there any schema validation errors?

---

## 📊 Impact

**Users Affected**: ALL users trying to upload profile pictures  
**Features Blocked**:
- Profile picture upload
- Profile picture change
- Complete profile flow
- Profile customization

---

## 🎯 Success Criteria

✅ Endpoint returns 200 with valid image URL  
✅ File is stored securely  
✅ URL is accessible and returns image  
✅ Profile updates include avatar URL  
✅ All test cases pass  
✅ Error handling works correctly  

---

## 📞 Contact

**Frontend Team**: Ready to test once fixed  
**Frontend Code**: Updated and committed ✅  
**Testing**: Can test immediately after backend fix  

---

## 🔗 Related Documentation

- Frontend Code: `src/components/profile/ProfileEdit/Card.tsx`
- Previous Issue Doc: `docs/AVATAR-UPLOAD-ISSUE.md`
- API Base URL: Configured in `src/config/baseUrl.ts`

---

**Please update this document when fixed and notify frontend team for testing.**

