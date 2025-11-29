/**
 * Test Script for Niche Endpoint
 * 
 * This script tests which niche endpoint is available on the backend.
 * 
 * Usage:
 * node test-niche-endpoint.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://api-hyperbuds-backend.onrender.com';

const endpoints = [
  { path: '/api/v1/matchmaker/niches', name: 'Matchmaker Niches' },
  { path: '/api/v1/niches', name: 'Simple Niches' },
];

async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  console.log(`\n🧪 Testing: ${endpoint.name}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ SUCCESS!`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      console.log(`   Niches count: ${data.niches?.length || 0}`);
      return { success: true, endpoint: endpoint.path, data };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`   ❌ FAILED`);
      console.log(`   Error:`, errorData);
      return { success: false, endpoint: endpoint.path, status: response.status };
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return { success: false, endpoint: endpoint.path, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing Niche Endpoints');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log('='.repeat(60));

  const results = [];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));

  const successful = results.find(r => r.success);
  const failed = results.filter(r => !r.success);

  if (successful) {
    console.log(`\n✅ Working Endpoint Found:`);
    console.log(`   ${successful.endpoint}`);
    console.log(`   Use this endpoint in your code!`);
  } else {
    console.log(`\n❌ No Working Endpoints Found`);
    console.log(`   All endpoints returned errors:`);
    failed.forEach(f => {
      console.log(`   - ${f.endpoint}: ${f.status || f.error}`);
    });
    console.log(`\n⚠️  Action Required:`);
    console.log(`   1. Verify backend is running`);
    console.log(`   2. Check backend API documentation`);
    console.log(`   3. Contact backend team to implement endpoint`);
  }

  console.log('\n' + '='.repeat(60));
}

// Run tests
runTests().catch(console.error);


