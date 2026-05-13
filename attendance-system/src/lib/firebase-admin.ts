import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    let serviceAccount;
    // Fallback for Vercel deployment where env vars would be used
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      // Try to load from local file system using fs to avoid Webpack dynamic require issues
      const fs = require('fs');
      const path = require('path');
      const serviceAccountPath = path.resolve(process.cwd(), "../serviceAccountKey.json");
      if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      }
    }
    
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      console.warn("No Firebase Service Account provided. Admin SDK not fully initialized.");
      admin.initializeApp(); // Initialize empty to prevent crashing immediately
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
