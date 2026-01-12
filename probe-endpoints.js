/**
 * Probe Profile Endpoints
 * 
 * This script tests multiple endpoint variations to find the working one for fetching a public profile.
 * 
 * Usage:
 * node probe-endpoints.js [username]
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://api-hyperbuds-backend.onrender.com/api/v1';

const username = process.argv[2] || 'khaled';

const variations = [
   // Documented endpoint
   `/update/profile/@${username}`,

   // Variations
   `/update/profile/${username}`,
   `/profile/@${username}`,
   `/profile/${username}`,
   `/users/@${username}`,
   `/users/${username}`,
   `/public/profile/@${username}`,
   `/public/profile/${username}`,
];

async function probe() {
   console.log(`🔍 Probing endpoints for user: ${username}`);
   console.log(`   Base URL: ${BASE_URL}\n`);

   for (const path of variations) {
      const url = `${BASE_URL}${path}`;
      try {
         process.stdout.write(`Testing ${path.padEnd(40)} ... `);
         const response = await fetch(url);


         if (response.ok) {
            console.log(`✅ ${response.status} OK`);
            const data = await response.json();
            console.log(`   FOUND! Response keys: ${Object.keys(data).join(', ')}`);

            // NOW TEST WITH AUTH HEADER
            console.log(`\n🤔 Testing ${path} WITH Auth Header...`);
            try {
               const authResponse = await fetch(url, {
                  headers: { 'Authorization': 'Bearer dummy_token_123' }
               });
               if (authResponse.ok) {
                  console.log(`   ✅ Auth Header OK (${authResponse.status})`);
               } else {
                  console.log(`   ❌ Auth Header FAILED (${authResponse.status}) - BACKEND REJECTS AUTH!`);
               }
            } catch (e) {
               console.log(`   ❌ Auth Header ERROR: ${e.message}`);
            }

            return; // Stop after first match
         } else {
            console.log(`❌ ${response.status}`);
         }
      } catch (err) {
         console.log(`💥 Error: ${err.message}`);
      }
   }

   console.log('\n🏁 Probe finished. No working public endpoint found.');
}

probe();
