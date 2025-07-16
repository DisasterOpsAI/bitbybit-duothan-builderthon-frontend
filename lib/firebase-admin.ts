import admin from 'firebase-admin'

// Use environment variables for Firebase Admin SDK credentials
const serviceAccount = {
  type: process.env.FIREBASE_ADMIN_TYPE || "service_account",
  project_id: process.env.FIREBASE_ADMIN_PROJECT_ID || "bitbybit-duothan-builderthon",
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID || "",
  private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n') || "",
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "",
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID || "",
  auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI || "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL || "",
  universe_domain: process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN || "googleapis.com"
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: `https://bitbybit-duothan-builderthon-default-rtdb.firebaseio.com/`
    })
  } catch (error: any) {
    console.log('Firebase admin initialization error', error.stack)
  }
}

export const adminAuth = admin.auth()
export const adminDb = admin.firestore()
export default admin