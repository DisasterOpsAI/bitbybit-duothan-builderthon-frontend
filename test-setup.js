// Simple test to verify basic functionality
const { spawn } = require('child_process');
const path = require('path');

// Test functions
const tests = [
  {
    name: 'Firebase Admin SDK Test',
    test: async () => {
      try {
        const { adminDb } = require('./lib/firebase-admin');
        console.log('✓ Firebase Admin SDK initialized successfully');
        return true;
      } catch (error) {
        console.error('✗ Firebase Admin SDK failed:', error.message);
        return false;
      }
    }
  },
  {
    name: 'Environment Variables Test',
    test: async () => {
      const required = ['JUDGE0_API_URL', 'JUDGE0_API_TOKEN'];
      const missing = required.filter(key => !process.env[key]);
      
      if (missing.length > 0) {
        console.error('✗ Missing environment variables:', missing.join(', '));
        return false;
      }
      
      console.log('✓ All required environment variables are set');
      return true;
    }
  },
  {
    name: 'Package Dependencies Test',
    test: async () => {
      try {
        require('firebase-admin');
        require('firebase');
        require('jsonwebtoken');
        require('bcryptjs');
        console.log('✓ All required packages are installed');
        return true;
      } catch (error) {
        console.error('✗ Package dependency failed:', error.message);
        return false;
      }
    }
  }
];

// Run tests
async function runTests() {
  console.log('🧪 Running basic functionality tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    try {
      const result = await test.test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`✗ ${test.name} threw an error:`, error.message);
      failed++;
    }
    console.log('');
  }
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! The application should work correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the issues above.');
  }
}

runTests().catch(console.error);