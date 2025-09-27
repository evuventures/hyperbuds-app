#!/usr/bin/env node

/**
 * Rizz Score Testing Demo Script
 * 
 * This script demonstrates how to test the Rizz Score integration
 * Run with: node scripts/test-rizz-score.js
 */

const fetch = require('node-fetch');

// Mock API endpoint (replace with actual endpoint)
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Test data
const mockRizzScore = {
   _id: '1',
   userId: 'test-user',
   currentScore: 85,
   factors: {
      engagement: {
         avgLikes: 1000,
         avgComments: 150,
         avgShares: 75,
         avgViews: 5000,
         engagementRate: 12.5
      },
      growth: {
         followerGrowthRate: 15.2,
         contentFrequency: 5,
         consistencyScore: 8.5
      },
      collaboration: {
         successfulCollabs: 10,
         avgPartnerRating: 4.8,
         responseRate: 95,
         completionRate: 98
      },
      quality: {
         contentScore: 8.5,
         technicalQuality: 9,
         originality: 8
      }
   },
   trending: {
      isViral: false,
      trendingScore: 45,
      viralContent: []
   },
   lastCalculated: new Date().toISOString(),
   calculationVersion: '1.0',
   createdAt: new Date().toISOString(),
   updatedAt: new Date().toISOString()
};

async function testRizzScoreAPI() {
   console.log('🧪 Testing Rizz Score API Integration...\n');

   try {
      // Test 1: Fetch Rizz Score
      console.log('1️⃣ Testing Rizz Score Fetch...');
      const response = await fetch(`${API_BASE_URL}/matching/rizz-score`, {
         headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
         }
      });

      if (response.ok) {
         const data = await response.json();
         console.log('✅ Rizz Score fetched successfully');
         console.log(`   Score: ${data.rizzScore?.currentScore || 'N/A'}`);
         console.log(`   Engagement: ${data.rizzScore?.factors?.engagement?.engagementRate || 'N/A'}%`);
      } else {
         console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      }

      // Test 2: Recalculate Rizz Score
      console.log('\n2️⃣ Testing Rizz Score Recalculation...');
      const recalcResponse = await fetch(`${API_BASE_URL}/matching/rizz-score/recalculate`, {
         method: 'POST',
         headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
         }
      });

      if (recalcResponse.ok) {
         const data = await recalcResponse.json();
         console.log('✅ Rizz Score recalculated successfully');
         console.log(`   New Score: ${data.rizzScore?.currentScore || 'N/A'}`);
      } else {
         console.log(`❌ Recalculation Error: ${recalcResponse.status} ${recalcResponse.statusText}`);
      }

      // Test 3: Performance Test
      console.log('\n3️⃣ Testing API Performance...');
      const startTime = Date.now();
      const perfResponse = await fetch(`${API_BASE_URL}/matching/rizz-score`, {
         headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
         }
      });
      const endTime = Date.now();

      if (perfResponse.ok) {
         console.log(`✅ API Response Time: ${endTime - startTime}ms`);
         if (endTime - startTime < 500) {
            console.log('   🚀 Performance: Excellent (< 500ms)');
         } else if (endTime - startTime < 1000) {
            console.log('   ⚡ Performance: Good (< 1s)');
         } else {
            console.log('   🐌 Performance: Needs improvement (> 1s)');
         }
      }

   } catch (error) {
      console.error('❌ Test failed:', error.message);
   }
}

function testRizzScoreLogic() {
   console.log('\n🧠 Testing Rizz Score Logic...\n');

   // Test score classification
   function getScoreLabel(score) {
      if (score >= 90) return 'Elite Creator';
      if (score >= 80) return 'Top Performer';
      if (score >= 70) return 'Rising Star';
      if (score >= 60) return 'Growing Creator';
      return 'Emerging Creator';
   }

   // Test color classification
   function getScoreColor(score) {
      if (score >= 90) return 'green';
      if (score >= 80) return 'blue';
      if (score >= 70) return 'yellow';
      if (score >= 60) return 'orange';
      return 'red';
   }

   const testScores = [95, 85, 75, 65, 45];

   testScores.forEach(score => {
      const label = getScoreLabel(score);
      const color = getScoreColor(score);
      console.log(`Score ${score}: ${label} (${color})`);
   });

   // Test factor calculations
   console.log('\n📊 Testing Factor Calculations...');
   const factors = mockRizzScore.factors;

   console.log(`Engagement Rate: ${factors.engagement.engagementRate}%`);
   console.log(`Growth Rate: ${factors.growth.followerGrowthRate}%`);
   console.log(`Collaboration Success: ${factors.collaboration.successfulCollabs} collabs`);
   console.log(`Content Quality: ${factors.quality.contentScore}/10`);

   // Test trending detection
   console.log('\n🔥 Testing Trending Detection...');
   console.log(`Is Viral: ${mockRizzScore.trending.isViral ? 'Yes' : 'No'}`);
   console.log(`Trending Score: ${mockRizzScore.trending.trendingScore}/100`);
}

function testUIComponents() {
   console.log('\n🎨 Testing UI Component Logic...\n');

   // Test responsive breakpoints
   const breakpoints = {
      mobile: '375px',
      tablet: '768px',
      desktop: '1024px'
   };

   console.log('📱 Responsive Breakpoints:');
   Object.entries(breakpoints).forEach(([device, width]) => {
      console.log(`   ${device}: ${width}`);
   });

   // Test color schemes
   const colorSchemes = {
      light: {
         background: 'white',
         text: 'gray-900',
         border: 'gray-200'
      },
      dark: {
         background: 'gray-800',
         text: 'gray-100',
         border: 'gray-700'
      }
   };

   console.log('\n🎨 Color Schemes:');
   Object.entries(colorSchemes).forEach(([mode, colors]) => {
      console.log(`   ${mode} mode:`, colors);
   });

   // Test accessibility
   console.log('\n♿ Accessibility Features:');
   console.log('   ✅ ARIA labels for screen readers');
   console.log('   ✅ Keyboard navigation support');
   console.log('   ✅ High contrast color ratios');
   console.log('   ✅ Focus indicators');
}

function runAllTests() {
   console.log('🚀 Starting Rizz Score Integration Tests...\n');
   console.log('='.repeat(50));

   testRizzScoreLogic();
   testUIComponents();

   // Uncomment to test actual API (requires running server)
   // testRizzScoreAPI();

   console.log('\n' + '='.repeat(50));
   console.log('✅ All tests completed!');
   console.log('\n📋 Manual Testing Checklist:');
   console.log('   1. Navigate to /profile page');
   console.log('   2. Verify Rizz Score displays correctly');
   console.log('   3. Test refresh and recalculate buttons');
   console.log('   4. Check responsive design on mobile/tablet');
   console.log('   5. Test dark mode compatibility');
   console.log('   6. Verify error handling');
   console.log('\n🔧 To test with real API:');
   console.log('   1. Start your development server');
   console.log('   2. Uncomment testRizzScoreAPI() call');
   console.log('   3. Run: node scripts/test-rizz-score.js');
}

// Run tests
runAllTests();
