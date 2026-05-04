const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function listAllUsers() {
  try {
    const listUsersResult = await admin.auth().listUsers(10);
    console.log("Registered Emails:");
    listUsersResult.users.forEach((userRecord) => {
      console.log("-", userRecord.email);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}

listAllUsers();
