# Certificate Generation Debug Guide

## Quick Diagnosis Steps

### Step 1: Test Server Connection
Open your browser and navigate to:
- `https://uburiza-backend.onrender.com/health` - Should return `{"status": "OK", "timestamp": "..."}`

If this fails, the server is down or not responding.

### Step 2: Test Authentication
In your browser console, run:
```javascript
fetch('https://uburiza-backend.onrender.com/api/debug/auth', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

This should return user info if authentication is working.

### Step 3: Test My Courses API
```javascript
fetch('https://uburiza-backend.onrender.com/api/my-courses', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Step 4: Monitor Console Logs
Check the backend logs (if you have access) or the browser console for detailed error messages.

## Common Issues & Solutions

### 1. **500 Internal Server Error on /api/my-courses**

**Possible Causes:**
- Database connection issues
- Corrupt enrollment data
- Missing course/module/lesson relationships
- Authentication token issues

**Debug Steps:**
1. Check the server console logs for detailed error messages
2. Verify your authentication token is valid
3. Test with a different user account
4. Check if you have any enrollments in the database

### 2. **Certificate Not Generating**

**Possible Causes:**
- Course lessons not properly marked as complete
- Missing course completion detection logic
- Database constraint issues
- Frontend not handling API response correctly

**Debug Steps:**
1. Verify all lessons are marked as complete in the database
2. Check the lesson completion API response for certificate data
3. Monitor network requests in browser DevTools
4. Check browser console for JavaScript errors

### 3. **Frontend Not Showing Certificates**

**Possible Causes:**
- API response not being processed correctly
- React Query cache issues
- Component state management issues

**Debug Steps:**
1. Check the certificate API response in Network tab
2. Clear browser cache and localStorage
3. Check React Query DevTools (if available)
4. Look for JavaScript console errors

## Manual Testing

### Test Lesson Completion
```javascript
// Replace with actual lesson ID
const lessonId = 'your-lesson-id-here';

fetch('https://uburiza-backend.onrender.com/api/progress', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ lessonId })
})
.then(r => r.json())
.then(data => {
  console.log('Lesson completion response:', data);
  if (data.courseCompleted && data.certificate) {
    console.log('🎉 Certificate generated!', data.certificate);
  }
})
.catch(console.error);
```

### Check Certificates
```javascript
// Replace with your user ID
const userId = 'your-user-id-here';

fetch(`https://uburiza-backend.onrender.com/api/certificates/user/${userId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('User certificates:', data.certificates);
})
.catch(console.error);
```

## Backend Logs to Check

Look for these log messages in the server console:

- `🚀 myCourses called for user: [userId]`
- `📚 Fetching enrollments for user: [userId]`
- `✅ Found enrollments: [count]`
- `📖 Processing course [x]/[total]: [courseName]`
- `📊 Total lessons: [count]`
- `✅ Completed lessons: [count]`
- `🎯 Returning courses: [count]`

If you see error messages like:
- `❌ Error processing course [courseId]: [error]`
- `💥 myCourses error: [error]`

These indicate specific issues that need to be addressed.

## Next Steps

1. **If server is unreachable:** Check deployment status on Render
2. **If authentication fails:** Clear localStorage and log in again
3. **If my-courses fails:** Check server logs for specific database errors
4. **If certificates don't generate:** Verify course completion logic and database constraints

## Support Information

Include this information when reporting issues:
- Browser and version
- Error messages from console
- Network request details from DevTools
- User ID and course ID (if applicable)
- Steps to reproduce the issue