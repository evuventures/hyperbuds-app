/**
 * Test Script for All Matchmaker API Endpoints
 * 
 * Usage:
 *   node test-all-endpoints.js
 * 
 * Or with environment variables:
 *   NEXT_PUBLIC_BASE_URL=https://api.example.com TEST_TOKEN=your_token TEST_USER_ID=12345 node test-all-endpoints.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://api-hyperbuds-backend.onrender.com';
const TOKEN = process.env.TEST_TOKEN || '';
const USER_ID = process.env.TEST_USER_ID || '';
const USERNAME = process.env.TEST_USERNAME || 'testuser';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, options = {}) {
  try {
    log(`\n🧪 Testing: ${name}`, 'cyan');
    log(`   URL: ${url}`, 'blue');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log(`   ✅ Success (${response.status})`, 'green');
      const preview = JSON.stringify(data, null, 2).substring(0, 300);
      console.log(`   Response: ${preview}${preview.length >= 300 ? '...' : ''}`);
      return { success: true, status: response.status, data };
    } else {
      log(`   ❌ Error (${response.status})`, 'red');
      console.log(`   Error:`, data);
      return { success: false, status: response.status, data };
    }
  } catch (error) {
    log(`   ❌ Exception: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  log('\n🚀 Starting API Tests...', 'yellow');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`User ID: ${USER_ID || 'NOT SET'}`, 'blue');
  log(`Username: ${USERNAME}`, 'blue');
  log(`Token: ${TOKEN ? 'SET' : 'NOT SET'}`, TOKEN ? 'green' : 'red');
  
  if (!TOKEN) {
    log('\n⚠️  WARNING: TEST_TOKEN not set. Some tests may fail.', 'yellow');
  }
  
  if (!USER_ID) {
    log('⚠️  WARNING: TEST_USER_ID not set. Some tests may fail.', 'yellow');
  }
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Test 1: Get Niches
  const test1 = await testEndpoint(
    '1. GET /matchmaker/niches',
    `${BASE_URL}/api/v1/matchmaker/niches`
  );
  results.tests.push({ name: 'Get Niches', ...test1 });
  if (test1.success) results.passed++; else results.failed++;
  
  // Test 2: Update Niches (requires USER_ID and TOKEN)
  if (USER_ID && TOKEN) {
    const test2 = await testEndpoint(
      '2. POST /matchmaker/niches/update',
      `${BASE_URL}/api/v1/matchmaker/niches/update`,
      {
        method: 'POST',
        body: JSON.stringify({
          userId: USER_ID,
          niches: ['Gaming', 'Tech Reviews', 'Music', 'Fitness']
        })
      }
    );
    results.tests.push({ name: 'Update Niches', ...test2 });
    if (test2.success) results.passed++; else results.failed++;
  } else {
    log('\n⏭️  Skipping: Update Niches (missing USER_ID or TOKEN)', 'yellow');
  }
  
  // Test 3: Get Rizz Score (requires USER_ID and TOKEN)
  if (USER_ID && TOKEN) {
    const test3 = await testEndpoint(
      '3. GET /matchmaker/rizz-score/:userId',
      `${BASE_URL}/api/v1/matchmaker/rizz-score/${USER_ID}`
    );
    results.tests.push({ name: 'Get Rizz Score', ...test3 });
    if (test3.success) results.passed++; else results.failed++;
  } else {
    log('\n⏭️  Skipping: Get Rizz Score (missing USER_ID or TOKEN)', 'yellow');
  }
  
  // Test 4: Get Suggestions (requires USER_ID and TOKEN)
  if (USER_ID && TOKEN) {
    const test4 = await testEndpoint(
      '4. GET /matchmaker/suggestions/:userId',
      `${BASE_URL}/api/v1/matchmaker/suggestions/${USER_ID}`
    );
    results.tests.push({ name: 'Get Suggestions', ...test4 });
    if (test4.success) results.passed++; else results.failed++;
  } else {
    log('\n⏭️  Skipping: Get Suggestions (missing USER_ID or TOKEN)', 'yellow');
  }
  
  // Test 5: Get Profile by Username
  const test5 = await testEndpoint(
    '5. GET /profile/:username',
    `${BASE_URL}/api/v1/profile/${USERNAME}`
  );
  results.tests.push({ name: 'Get Profile by Username', ...test5 });
  if (test5.success) results.passed++; else results.failed++;
  
  // Test 6: Connect Social (requires TOKEN)
  if (TOKEN) {
    const test6 = await testEndpoint(
      '6. POST /social/connect',
      `${BASE_URL}/api/v1/social/connect`,
      {
        method: 'POST',
        body: JSON.stringify({
          platform: 'tiktok',
          url: 'https://tiktok.com/@testuser'
        })
      }
    );
    results.tests.push({ name: 'Connect Social', ...test6 });
    if (test6.success) results.passed++; else results.failed++;
  } else {
    log('\n⏭️  Skipping: Connect Social (missing TOKEN)', 'yellow');
  }
  
  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('📊 Test Summary', 'yellow');
  log('='.repeat(50), 'cyan');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');
  log(`📝 Total: ${results.passed + results.failed}`, 'blue');
  
  log('\n📋 Detailed Results:', 'yellow');
  results.tests.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    const color = test.success ? 'green' : 'red';
    log(`${index + 1}. ${status} ${test.name}`, color);
    if (test.status) {
      log(`   Status: ${test.status}`, 'blue');
    }
  });
  
  log('\n✨ All tests completed!', 'green');
  
  return results;
}

// Run tests
if (require.main === module) {
  runAllTests().catch(error => {
    log(`\n💥 Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runAllTests, testEndpoint };


