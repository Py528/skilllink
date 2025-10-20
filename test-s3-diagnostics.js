#!/usr/bin/env node

/**
 * S3 Diagnostics Test Script
 * 
 * This script helps diagnose S3 connectivity and permission issues.
 * Run with: node test-s3-diagnostics.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const DIAGNOSTICS_ENDPOINT = `${BASE_URL}/api/s3-diagnostics`;

console.log('🔍 S3 Diagnostics Test');
console.log('====================');
console.log(`Testing endpoint: ${DIAGNOSTICS_ENDPOINT}`);
console.log('');

// Make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (error) {
          resolve({ status: res.statusCode, data: data, error: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Run diagnostics
async function runDiagnostics() {
  try {
    console.log('⏳ Running S3 diagnostics...');
    const result = await makeRequest(DIAGNOSTICS_ENDPOINT);
    
    if (result.status !== 200) {
      console.log(`❌ Request failed with status: ${result.status}`);
      console.log('Response:', JSON.stringify(result.data, null, 2));
      return;
    }
    
    const diagnostics = result.data;
    
    // Display environment status
    console.log('📋 Environment Variables:');
    Object.entries(diagnostics.environment).forEach(([key, value]) => {
      console.log(`  ${key}: ${value ? '✅' : '❌'}`);
    });
    console.log('');
    
    // Display test results
    console.log('🧪 Test Results:');
    diagnostics.tests.forEach((test, index) => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`  ${index + 1}. ${test.test}: ${status}`);
      
      if (test.status === 'FAILED') {
        console.log(`     Error: ${test.error}`);
        if (test.code) {
          console.log(`     HTTP Code: ${test.code}`);
        }
      } else if (test.details) {
        console.log(`     Details: ${JSON.stringify(test.details, null, 6).replace(/\n/g, '\n     ')}`);
      }
    });
    console.log('');
    
    // Display recommendations
    console.log('💡 Recommendations:');
    diagnostics.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    console.log('');
    
    // Summary
    const passedTests = diagnostics.tests.filter(t => t.status === 'PASSED').length;
    const totalTests = diagnostics.tests.length;
    
    console.log('📊 Summary:');
    console.log(`  Tests Passed: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
      console.log('  🎉 All tests passed! S3 configuration looks good.');
    } else {
      console.log('  ⚠️  Some tests failed. Check the recommendations above.');
    }
    
  } catch (error) {
    console.log('❌ Failed to run diagnostics:');
    console.log(`   Error: ${error.message}`);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Make sure your Next.js app is running (npm run dev)');
    console.log('   2. Check that the API endpoint is accessible');
    console.log('   3. Verify your .env.local file has the correct AWS credentials');
  }
}

// Run the diagnostics
runDiagnostics();
