/**
 * ONE-TIME SETUP SCRIPT: SET OWNER AS ADMIN
 * 
 * Instructions:
 * 1. Download your service account key from: 
 *    Firebase Console > Project Settings > Service Accounts > Generate new private key.
 * 2. Rename it to 'serviceAccountKey.json' and place it in this directory.
 * 3. Run: node set-admin.js <OWNER_EMAIL>
 */

const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");

const email = process.argv[2];

if (!email) {
    console.error("Please provide the owner email: node set-admin.js your@email.com");
    process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdmin(userEmail) {
    try {
        const user = await admin.auth().getUserByEmail(userEmail);
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        console.log(`Successfully set admin claim for: ${userEmail}`);
        console.log("The owner can now access the admin dashboard.");
        process.exit(0);
    } catch (error) {
        console.error("Error setting admin claim:", error);
        process.exit(1);
    }
}

setAdmin(email);
