/**
 * Test Script for Niche Validation
 * 
 * This script helps test the backend niche validation by sending various test cases
 * to the profile update endpoint.
 * 
 * Usage:
 * 1. Update BASE_URL and ACCESS_TOKEN below
 * 2. Run: node test-niche-validation.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://api-hyperbuds-backend.onrender.com';
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE'; // Replace with your actual token

// Valid niches according to backend
const VALID_NICHES = [
   "beauty", "gaming", "music", "fitness", "food", "travel", "fashion", "tech",
   "comedy", "education", "lifestyle", "art", "dance", "sports", "business", "health", "other"
];

// Test cases
const testCases = [
   {
      name: "✅ Valid: 1 niche (lowercase)",
      niche: ["beauty"],
      expectedSuccess: true
   },
   {
      name: "✅ Valid: 5 niches (max allowed)",
      niche: ["beauty", "gaming", "music", "fitness", "food"],
      expectedSuccess: true
   },
   {
      name: "❌ Invalid: 6 niches (exceeds max)",
      niche: ["beauty", "gaming", "music", "fitness", "food", "travel"],
      expectedSuccess: false,
      expectedError: "must contain less than or equal to 5 items"
   },
   {
      name: "❌ Invalid: Invalid niche value",
      niche: ["invalid_niche"],
      expectedSuccess: false,
      expectedError: "must be one of"
   },
   {
      name: "❌ Invalid: Capitalized niche (should be lowercase)",
      niche: ["Beauty", "Gaming"],
      expectedSuccess: false,
      expectedError: "must be one of"
   },
   {
      name: "❌ Invalid: Mixed valid and invalid",
      niche: ["beauty", "invalid_niche", "gaming"],
      expectedSuccess: false,
      expectedError: "must be one of"
   },
   {
      name: "❌ Invalid: 10 niches (way over limit)",
      niche: ["beauty", "gaming", "music", "fitness", "food", "travel", "fashion", "tech", "comedy", "education"],
      expectedSuccess: false,
      expectedError: "must contain less than or equal to 5 items"
   },
   {
      name: "✅ Valid: All valid niches (5 max)",
      niche: ["beauty", "gaming", "music", "fitness", "food"],
      expectedSuccess: true
   }
];

async function testNicheValidation(testCase) {
   console.log(`\n🧪 Testing: ${testCase.name}`);
   console.log(`   Niche array:`, testCase.niche);

   try {
      const response = await fetch(`${BASE_URL}/api/v1/profiles/me`, {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`
         },
         body: JSON.stringify({
            niche: testCase.niche
         })
      });

      const data = await response.json();

      if (testCase.expectedSuccess) {
         if (response.ok && data.success) {
            console.log(`   ✅ PASS: Request succeeded as expected`);
            return true;
         } else {
            console.log(`   ❌ FAIL: Expected success but got error:`, data);
            return false;
         }
      } else {
         if (!response.ok && data.success === false) {
            const errorDetails = data.details || [];
            const hasExpectedError = errorDetails.some(detail =>
               typeof detail === 'string' && detail.includes(testCase.expectedError)
            );

            if (hasExpectedError) {
               console.log(`   ✅ PASS: Validation error caught as expected`);
               console.log(`   Error details:`, errorDetails);
               return true;
            } else {
               console.log(`   ⚠️  PARTIAL: Got error but not the expected one`);
               console.log(`   Error details:`, errorDetails);
               return false;
            }
         } else {
            console.log(`   ❌ FAIL: Expected validation error but request succeeded`);
            return false;
         }
      }
   } catch (error) {
      console.log(`   ❌ ERROR: Network or other error:`, error.message);
      return false;
   }
}

async function runAllTests() {
   console.log('🚀 Starting Niche Validation Tests');
   console.log('='.repeat(60));
   console.log(`Base URL: ${BASE_URL}`);
   console.log(`Valid niches: ${VALID_NICHES.join(', ')}`);
   console.log(`Max niches allowed: 5`);
   console.log('='.repeat(60));

   if (ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE') {
      console.error('\n❌ ERROR: Please set ACCESS_TOKEN in the script!');
      console.log('   Get your token from localStorage.getItem("accessToken") in browser console');
      process.exit(1);
   }

   const results = [];

   for (const testCase of testCases) {
      const passed = await testNicheValidation(testCase);
      results.push({ testCase: testCase.name, passed });

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
   }

   // Summary
   console.log('\n' + '='.repeat(60));
   console.log('📊 Test Summary');
   console.log('='.repeat(60));

   const passedCount = results.filter(r => r.passed).length;
   const totalCount = results.length;

   results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.testCase}`);
   });

   console.log('\n' + '='.repeat(60));
   console.log(`Total: ${passedCount}/${totalCount} tests passed`);
   console.log('='.repeat(60));
}

// Run tests
runAllTests().catch(console.error);

