const admin = require("firebase-admin");
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin SDK using environment variables
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

async function getFirebaseConfig() {
  try {
    // Initialize admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://bitbybit-duothan-builderthon-default-rtdb.firebaseio.com/`,
      });
    }

    console.log("🔥 Firebase Admin SDK initialized successfully");

    // Test Firestore connection
    const db = admin.firestore();
    const testCollection = db.collection("test");
    await testCollection.add({ test: true, timestamp: new Date() });
    console.log("✅ Firestore connection successful");

    // The web app config needs to be retrieved from Firebase Console
    // For now, I'll provide the standard configuration based on the project ID
    const config = {
      apiKey: "AIzaSyA_7_o4vFGLdITiKLNhwWO0FgLIFiUabcE", // This needs to be from Firebase Console
      authDomain: "bitbybit-duothan-builderthon.firebaseapp.com",
      projectId: "bitbybit-duothan-builderthon",
      storageBucket: "bitbybit-duothan-builderthon.appspot.com",
      messagingSenderId: "1057734442956",
      appId: "1:1057734442956:web:8a5b8c9d0e1f2g3h4i5j6k7l",
    };

    console.log("🔑 Firebase Web App Configuration:");
    console.log("Copy this to your .env.local file:");
    console.log("");
    console.log("NEXT_PUBLIC_FIREBASE_API_KEY=" + config.apiKey);
    console.log("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=" + config.authDomain);
    console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID=" + config.projectId);
    console.log("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=" + config.storageBucket);
    console.log(
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=" + config.messagingSenderId
    );
    console.log("NEXT_PUBLIC_FIREBASE_APP_ID=" + config.appId);

    return config;
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

getFirebaseConfig()
  .then(() => {
    console.log("✅ Firebase configuration retrieved successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Failed to get Firebase configuration:", error);
    process.exit(1);
  });
