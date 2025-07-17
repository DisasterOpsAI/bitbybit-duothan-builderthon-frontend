import admin from "firebase-admin";

// Check if we're in a build environment
const isBuilding = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Check if we have the required environment variables
const hasRequiredEnvVars = 
  process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  process.env.FIREBASE_ADMIN_PROJECT_ID;

let adminInitialized = false;

// Only initialize Firebase Admin if we're not in build mode and have required env vars
if (!isBuilding && !admin.apps.length && hasRequiredEnvVars) {
  try {
    // Use environment variables for Firebase Admin SDK credentials
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
      private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
      auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
      token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN || "googleapis.com",
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: `https://bitbybit-duothan-builderthon-default-rtdb.firebaseio.com/`,
    });
    
    adminInitialized = true;
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error: any) {
    console.error("Firebase admin initialization error", error.message);
    adminInitialized = false;
  }
} else if (isBuilding) {
  console.log("Skipping Firebase Admin initialization during build");
} else if (!hasRequiredEnvVars) {
  console.warn("Firebase Admin SDK not initialized: Missing required environment variables");
  console.warn("Required: FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PROJECT_ID");
}

// Create safe getter functions
function getAdminAuth() {
  if (!adminInitialized) {
    console.warn("Firebase Admin not initialized. Returning null.");
    return null;
  }
  return admin.auth();
}

function getAdminDb() {
  if (!adminInitialized) {
    console.warn("Firebase Admin not initialized. Returning null.");
    return null;
  }
  return admin.firestore();
}

// Export functions that handle initialization gracefully
export const adminAuth = getAdminAuth();
export const adminDb = getAdminDb();
export { adminInitialized };
export default admin;
