#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 OASIS Protocol Quick Start Setup');
console.log('====================================');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# Firebase Configuration (Demo Mode)
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bitbybit-duothan-builderthon.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bitbybit-duothan-builderthon
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bitbybit-duothan-builderthon.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Judge0 API Configuration
JUDGE0_API_URL=http://10.3.5.139:2358/
JUDGE0_API_TOKEN=ZHVvdGhhbjUuMA==

# Admin Configuration
ADMIN_EMAIL=admin@oasis.com
ADMIN_PASSWORD=oasis2045
JWT_SECRET=your-super-secret-jwt-key-for-admin-auth

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created');
} else {
  console.log('✅ .env.local file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
const nodeModulesExists = fs.existsSync(nodeModulesPath);

if (!nodeModulesExists) {
  console.log('📦 Installing dependencies...');
  console.log('Run: npm install');
} else {
  console.log('✅ Dependencies installed');
}

console.log('\n🎮 DEMO MODE ENABLED');
console.log('===================');
console.log('The app is configured to run in demo mode without requiring Firebase setup.');
console.log('You can test all features with simulated data.');
console.log('');
console.log('🔧 To set up real Firebase:');
console.log('1. Follow the instructions in firebase-setup-guide.md');
console.log('2. Replace the demo-api-key with your real Firebase API key');
console.log('');
console.log('🚀 To start the development server:');
console.log('npm run dev');
console.log('');
console.log('🌐 Then open: http://localhost:3000');
console.log('');
console.log('👤 Demo Login Credentials:');
console.log('- Teams: Use "Continue with Google" (will use demo auth)');
console.log('- Admin: admin / oasis2045');
console.log('');
console.log('🎯 Available Demo Features:');
console.log('- Team registration and authentication');
console.log('- Challenge viewing and code execution');
console.log('- Flag submission (try flag "6" for first challenge)');
console.log('- Leaderboard with demo teams');
console.log('- Admin dashboard with demo statistics');
console.log('- Challenge management interface');
console.log('');
console.log('Happy coding! 🎉');