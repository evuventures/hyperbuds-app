/**
 * Test Script for Dynamic Profile Endpoint
 * 
 * This script tests the dynamic profile endpoint:
 * GET /api/v1/update/profile/@:username
 * 
 * Usage:
 * node test-profile-endpoint.js [username]
 * 
 * Examples:
 * node test-profile-endpoint.js Esther
 * node test-profile-endpoint.js @Esther
 * node test-profile-endpoint.js nonexistentuser123
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://api-hyperbuds-backend.onrender.com';

async function testProfile(username) {
   if (!username) {
      console.log('⚠️ Please provide a username to test');
      console.log('Usage: node test-profile-endpoint.js [username]');
      return;
   }

   // Handle username with or without @
   const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
   const endpoint = `/api/v1/update/profile/@${encodeURIComponent(cleanUsername)}`;
   const url = `${BASE_URL}${endpoint}`;

   console.log('🚀 Testing Dynamic Profile Endpoint');
   console.log('='.repeat(60));
   console.log(`Base URL: ${BASE_URL}`);
   console.log(`Username: ${username}`);
   console.log(`Endpoint: ${endpoint}`);
   console.log(`Full URL: ${url}`);
   console.log('='.repeat(60));

   try {
      const startTime = Date.now();
      const response = await fetch(url, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      });
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`\n📡 Status: ${response.status} ${response.statusText}`);
      console.log(`⏱️ Duration: ${duration}ms`);

      // Try to parse JSON response regardless of status
      let data;
      try {
         data = await response.json();
      } catch (e) {
         console.log('⚠️ Could not parse JSON response');
         const text = await response.text();
         console.log('Response text:', text.substring(0, 200) + '...');
         return;
      }

      if (response.ok) {
         console.log('\n✅ SUCCESS: Profile Found');
         console.log('='.repeat(60));
         console.log(JSON.stringify(data, null, 2));
         console.log('='.repeat(60));

         // Validation Check
         console.log('\n🔍 Validation Check:');
         const checks = [
            { name: 'Has userId/id', valid: !!(data.userId || data.id) },
            { name: 'Has username', valid: !!data.username },
            { name: 'Has displayName', valid: !!data.displayName },
            { name: 'Has social links', valid: !!data.social },
         ];

         checks.forEach(check => {
            console.log(`   ${check.valid ? '✅' : '❌'} ${check.name}`);
         });

      } else {
         console.log('\n❌ FAILURE: API Error');
         console.log('='.repeat(60));
         console.log(JSON.stringify(data, null, 2));
         console.log('='.repeat(60));

         if (response.status === 404) {
            console.log('ℹ️ Note: 404 is expected for non-existent users');
         }
      }

   } catch (error) {
      console.log(`\n❌ ERROR: Network or Script Error`);
      console.log(`   ${error.message}`);
      if (error.cause) console.log(`   Cause: ${error.cause}`);
   }
}

// Get username from command line args
const username = process.argv[2] || 'Esther';

testProfile(username).catch(console.error);
