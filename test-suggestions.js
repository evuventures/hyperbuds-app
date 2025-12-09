/**
 * Test Script for Match Suggestions API
 * 
 * This script tests the Match Suggestions endpoint to verify it's working correctly.
 * 
 * Usage:
 * 1. Update ACCESS_TOKEN and USER_ID below
 * 2. Run: node test-suggestions.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://api-hyperbuds-backend.onrender.com';
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE'; // Replace with your actual token
const USER_ID = 'YOUR_USER_ID_HERE'; // Replace with your actual userId

async function testSuggestions() {
  console.log('🚀 Testing Match Suggestions API');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`User ID: ${USER_ID}`);
  console.log('='.repeat(60));

  if (ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE') {
    console.error('\n❌ ERROR: Please set ACCESS_TOKEN in the script!');
    console.log('   Get your token from localStorage.getItem("accessToken") in browser console');
    process.exit(1);
  }

  if (USER_ID === 'YOUR_USER_ID_HERE') {
    console.error('\n❌ ERROR: Please set USER_ID in the script!');
    console.log('   Get your userId from:');
    console.log('   const user = JSON.parse(localStorage.getItem("user") || "{}");');
    console.log('   const userId = user.userId;');
    process.exit(1);
  }

  try {
    console.log(`\n🧪 Testing: GET /api/v1/matchmaker/suggestions/${USER_ID}`);
    console.log(`   URL: ${BASE_URL}/api/v1/matchmaker/suggestions/${USER_ID}`);

    const response = await fetch(`${BASE_URL}/api/v1/matchmaker/suggestions/${USER_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ SUCCESS!`);
      console.log(`\n   Response Data:`);
      console.log(JSON.stringify(data, null, 2));

      // Validate response structure
      console.log(`\n   📊 Validation:`);
      
      // Check required fields
      const checks = [
        { field: 'userId', value: data.userId, required: true },
        { field: 'suggestions', value: data.suggestions, required: true, type: 'array' },
      ];

      let allValid = true;
      checks.forEach(check => {
        if (check.required && (check.value === undefined || check.value === null)) {
          console.log(`   ❌ Missing required field: ${check.field}`);
          allValid = false;
        } else if (check.type === 'array') {
          if (!Array.isArray(check.value)) {
            console.log(`   ❌ ${check.field} should be an array, got: ${typeof check.value}`);
            allValid = false;
          } else {
            console.log(`   ✅ ${check.field}: Array with ${check.value.length} items`);
            if (check.value.length > 0) {
              console.log(`      First suggestion:`, check.value[0]);
              
              // Validate suggestion structure
              const firstSuggestion = check.value[0];
              const suggestionChecks = [
                { field: 'userId', value: firstSuggestion.userId, required: true },
                { field: 'username', value: firstSuggestion.username, required: true },
                { field: 'matchingScore', value: firstSuggestion.matchingScore, required: true, type: 'number', range: [0, 100] },
                { field: 'sharedNiches', value: firstSuggestion.sharedNiches, required: true, type: 'array' },
              ];
              
              suggestionChecks.forEach(sCheck => {
                if (sCheck.required && (sCheck.value === undefined || sCheck.value === null)) {
                  console.log(`      ❌ Missing in suggestion: ${sCheck.field}`);
                  allValid = false;
                } else if (sCheck.type === 'number') {
                  if (typeof sCheck.value !== 'number') {
                    console.log(`      ❌ suggestion.${sCheck.field} should be a number, got: ${typeof sCheck.value}`);
                    allValid = false;
                  } else if (sCheck.range) {
                    const [min, max] = sCheck.range;
                    if (sCheck.value < min || sCheck.value > max) {
                      console.log(`      ⚠️  suggestion.${sCheck.field} is ${sCheck.value}, expected range: ${min}-${max}`);
                    } else {
                      console.log(`      ✅ suggestion.${sCheck.field}: ${sCheck.value} (valid range)`);
                    }
                  }
                } else if (sCheck.type === 'array') {
                  if (!Array.isArray(sCheck.value)) {
                    console.log(`      ❌ suggestion.${sCheck.field} should be an array, got: ${typeof sCheck.value}`);
                    allValid = false;
                  } else {
                    console.log(`      ✅ suggestion.${sCheck.field}: Array with ${sCheck.value.length} items`);
                  }
                } else {
                  console.log(`      ✅ suggestion.${sCheck.field}: ${sCheck.value}`);
                }
              });
            }
          }
        } else {
          console.log(`   ✅ ${check.field}: ${check.value}`);
        }
      });

      if (allValid) {
        console.log(`\n   ✅ All validations passed!`);
      } else {
        console.log(`\n   ⚠️  Some validations failed - check response structure`);
      }

      // Summary
      console.log(`\n   📈 Summary:`);
      console.log(`   - Total Suggestions: ${data.suggestions?.length || 0} users`);
      if (data.suggestions?.length > 0) {
        const avgScore = data.suggestions.reduce((sum, s) => sum + (s.matchingScore || 0), 0) / data.suggestions.length;
        const maxScore = Math.max(...data.suggestions.map(s => s.matchingScore || 0));
        const minScore = Math.min(...data.suggestions.map(s => s.matchingScore || 0));
        console.log(`   - Average Matching Score: ${avgScore.toFixed(1)}`);
        console.log(`   - Highest Score: ${maxScore}`);
        console.log(`   - Lowest Score: ${minScore}`);
      }
      
      return { success: true, data };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`   ❌ FAILED`);
      console.log(`   Error:`, errorData);
      
      if (response.status === 404) {
        console.log(`\n   ⚠️  Endpoint not found - Backend not implemented yet`);
        console.log(`   Expected: GET /api/v1/matchmaker/suggestions/:userId`);
      } else if (response.status === 401) {
        console.log(`\n   ⚠️  Authentication failed - Check your access token`);
      } else if (response.status === 400) {
        console.log(`\n   ⚠️  Bad request - Check userId format`);
      } else if (response.status === 500) {
        console.log(`\n   ⚠️  Server error - Backend may have issues`);
      }
      
      return { success: false, status: response.status, error: errorData };
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Run test
testSuggestions()
  .then(result => {
    console.log('\n' + '='.repeat(60));
    if (result.success) {
      console.log('✅ Test completed successfully!');
    } else {
      console.log('❌ Test failed - See details above');
    }
    console.log('='.repeat(60));
  })
  .catch(console.error);


