/**
 * Update API Testing Script
 * 
 * Run this script to test all Update API endpoints
 * 
 * Usage:
 *   node docs/update-api/test-update-api.js
 * 
 * Or in browser console (copy the testEndpoint function and runAllTests)
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-hyperbuds-backend.onrender.com/api/v1';

// For Node.js testing, you'll need to provide a token
const TOKEN = process.env.TEST_TOKEN || 'YOUR_TOKEN_HERE';

// Helper function for API calls
async function testEndpoint(name, method, endpoint, body = null) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   ${method} ${endpoint}`);
  
  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Success:`, JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      console.log(`   ❌ Error (${response.status}):`, JSON.stringify(data, null, 2));
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`   ❌ Network Error:`, error.message);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Update API Tests...\n');
  console.log('='.repeat(50));
  
  if (TOKEN === 'YOUR_TOKEN_HERE') {
    console.log('⚠️  Warning: Please set TEST_TOKEN environment variable or update TOKEN in this file');
    console.log('   For browser testing, use the script in TESTING-GUIDE.md\n');
  }
  
  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };
  
  // Test 1: Get Rizz Score
  const test1 = await testEndpoint(
    'Get Rizz Score',
    'GET',
    '/update/rizz-score'
  );
  results.tests.push({ name: 'Get Rizz Score', ...test1 });
  if (test1.success) results.passed++; else results.failed++;
  
  // Test 2: Calculate Profile Rizz Score
  const test2 = await testEndpoint(
    'Calculate Profile Rizz Score',
    'POST',
    '/update/rizz/profile-score',
    { niches: ['Tech', 'Gaming', 'Programming'] }
  );
  results.tests.push({ name: 'Calculate Profile Rizz Score', ...test2 });
  if (test2.success) results.passed++; else results.failed++;
  
  // Test 3: Calculate Matching Rizz Score
  // Note: Replace with actual user IDs for real testing
  const test3 = await testEndpoint(
    'Calculate Matching Rizz Score',
    'POST',
    '/update/rizz/matching-score',
    { userA: 'user-id-1', userB: 'user-id-2' }
  );
  results.tests.push({ name: 'Calculate Matching Rizz Score', ...test3 });
  if (test3.success) results.passed++; else results.failed++;
  
  // Test 4: Get All Niches
  const test4 = await testEndpoint(
    'Get All Niches',
    'GET',
    '/update/niches'
  );
  results.tests.push({ name: 'Get All Niches', ...test4 });
  if (test4.success) results.passed++; else results.failed++;
  
  // Test 5: Update Niches
  const test5 = await testEndpoint(
    'Update Niches',
    'PUT',
    '/update/niches',
    { niches: ['Tech', 'Gaming', 'Programming', 'AI', 'Web Development'] }
  );
  results.tests.push({ name: 'Update Niches', ...test5 });
  if (test5.success) results.passed++; else results.failed++;
  
  // Test 6: Connect Social Media
  const test6 = await testEndpoint(
    'Connect Social Media',
    'POST',
    '/update/social/connect',
    { platform: 'instagram', url: 'https://instagram.com/username' }
  );
  results.tests.push({ name: 'Connect Social Media', ...test6 });
  if (test6.success) results.passed++; else results.failed++;
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary:');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📈 Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));
  
  return results;
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  // Node.js environment
  if (typeof fetch === 'undefined') {
    console.log('⚠️  fetch is not available. Install node-fetch or use Node.js 18+');
    console.log('   For browser testing, use the script in TESTING-GUIDE.md');
  } else {
    runAllTests().catch(console.error);
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testEndpoint, runAllTests };
}

