# Firebase Configuration Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `bitbybit-duothan-builderthon`
4. Enable Google Analytics (optional)
5. Create project

## Step 2: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Add your domain (e.g., localhost:3000) to authorized domains

## Step 3: Create Web App

1. In Firebase Console, click the web icon (</>) in project overview
2. Enter app nickname: "OASIS Protocol Web App"
3. Click "Register app"
4. Copy the Firebase configuration object (this contains your real API key)

## Step 4: Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location
5. Click "Done"

## Step 5: Update Environment Variables

Replace the `.env.local` file with the real values from your Firebase config:

```env
# Firebase Configuration (Replace with your actual values)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC7_YOUR_ACTUAL_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bitbybit-duothan-builderthon.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bitbybit-duothan-builderthon
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bitbybit-duothan-builderthon.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_ACTUAL_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_ACTUAL_APP_ID

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
```

## Step 6: Security Rules for Firestore

In Firebase Console > Firestore Database > Rules, update the rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes for now (development only)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Step 7: Test the Setup

Run the development server:
```bash
npm run dev
```

Navigate to `http://localhost:3000` and test Google authentication.

## Troubleshooting

If you get API key errors:
1. Ensure you've replaced the demo API key with your real one
2. Check that Google Auth is enabled in Firebase Console
3. Verify your domain is added to authorized domains
4. Make sure Firestore is enabled and accessible

## Security Notes

- The Firebase API key is safe to expose in frontend code
- Firebase automatically restricts it to Firebase services only
- For production, add proper domain restrictions in Google Cloud Console