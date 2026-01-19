/**
 * Social Sync Test Script
 * 
 * Instructions:
 * 1. Navigate to: http://localhost:3000/profile/platform-analytics
 * 2. Open DevTools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter
 */

console.log('%c🧪 Starting Social Sync Test...', 'color: #00ff00; font-size: 16px; font-weight: bold');

// Test function
async function testSocialSync() {
   try {
      // Get token from localStorage
      const token = localStorage.getItem('accessToken');

      if (!token) {
         console.error('%c❌ No access token found. Please log in first.', 'color: red; font-weight: bold');
         return;
      }

      console.log('%c✅ Access token found', 'color: green');

      // Test payload with CORRECT field name
      const testPayload = {
         follow: 95,  // ← CORRECT: Using "follow" not "followers"
         engagement: 0
      };

      console.log('%c📤 Sending test request to TikTok sync endpoint...', 'color: blue');
      console.log('Payload:', testPayload);

      // Make the request
      const response = await fetch('https://api-hyperbuds-backend.onrender.com/api/v1/profiles/social-sync/tiktok', {
         method: 'POST',
         headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(testPayload)
      });

      console.log('%c📥 Response Status:', 'color: blue', response.status);

      const data = await response.json();

      if (response.ok) {
         console.log('%c✅ SUCCESS! Sync worked!', 'color: green; font-size: 18px; font-weight: bold');
         console.log('%c📊 Response:', 'color: green', data);
         console.log('%c💾 Profile stats:', 'color: cyan', data.profile?.stats);
         return { success: true, data };
      } else {
         console.error('%c❌ FAILED! Response:', 'color: red; font-size: 16px; font-weight: bold', data);
         console.error('%c🔍 Error details:', 'color: orange', data.details || data.message);
         return { success: false, error: data };
      }

   } catch (error) {
      console.error('%c❌ ERROR:', 'color: red; font-weight: bold', error);
      return { success: false, error: error.message };
   }
}

// Run the test
testSocialSync().then(result => {
   console.log('%c' + '='.repeat(60), 'color: gray');
   console.log('%c🎯 TEST COMPLETE', 'color: yellow; font-size: 16px; font-weight: bold');
   console.log('%c' + '='.repeat(60), 'color: gray');

   if (result.success) {
      console.log('%c✅ The sync fix is WORKING!', 'color: #00ff00; font-size: 20px; font-weight: bold');
      console.log('%cYou can now use the Sync buttons on the platform cards.', 'color: cyan');
   } else {
      console.log('%c❌ The sync is still failing.', 'color: red; font-size: 18px; font-weight: bold');
      console.log('%c🔧 Check the error details above.', 'color: orange');
   }
});

