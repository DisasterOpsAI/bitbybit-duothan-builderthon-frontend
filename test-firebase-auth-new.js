// Test Firebase authentication setup
const admin = require("firebase-admin");

const serviceAccount = {
  type: process.env.FIREBASE_ADMIN_TYPE || "service_account",
  project_id:
    process.env.FIREBASE_ADMIN_PROJECT_ID || "bitbybit-duothan-builderthon",
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID || "",
  private_key:
    process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n") || "",
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "",
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID || "",
  auth_uri:
    process.env.FIREBASE_ADMIN_AUTH_URI ||
    "https://accounts.google.com/o/oauth2/auth",
  token_uri:
    process.env.FIREBASE_ADMIN_TOKEN_URI ||
    "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url:
    process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL ||
    "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL || "",
  universe_domain:
    process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN || "googleapis.com",
};

async function testFirebaseSetup() {
  try {
    console.log("🔧 Testing Firebase Authentication Setup...");

    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://bitbybit-duothan-builderthon-default-rtdb.firebaseio.com/`,
      });
    }

    console.log("✅ Firebase Admin SDK initialized");

    // Test Firestore
    const db = admin.firestore();

    // Test write
    const testDoc = db.collection("test").doc("auth-test");
    await testDoc.set({
      message: "Firebase auth test successful",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("✅ Firestore write test passed");

    // Test read
    const doc = await testDoc.get();
    if (doc.exists) {
      console.log("✅ Firestore read test passed");
      console.log("📄 Document data:", doc.data());
    }

    // Test authentication
    const auth = admin.auth();
    console.log("✅ Firebase Auth initialized");

    // Clean up test document
    await testDoc.delete();
    console.log("✅ Test document cleaned up");

    console.log(
      "\n🎉 All Firebase tests passed! Your setup is working correctly."
    );
  } catch (error) {
    console.error("❌ Firebase setup failed:", error);
    console.error("\n🔧 Troubleshooting tips:");
    console.error(
      "1. Make sure your .env.local file has all Firebase Admin SDK variables"
    );
    console.error(
      "2. Check that the private key is properly formatted with newlines"
    );
    console.error("3. Verify your Firebase project configuration");
    console.error(
      "4. Ensure your service account has the necessary permissions"
    );
  }
}

// Run the test
testFirebaseSetup();
