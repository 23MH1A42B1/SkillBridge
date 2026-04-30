const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function setupTestAccounts() {
  const adminEmail = 'admin@skillbridge.com';
  const userEmail = 'testuser@skillbridge.com';
  const password = 'SkillBridge';

  // Setup Admin
  try {
    let adminUser;
    try {
      adminUser = await auth.getUserByEmail(adminEmail);
      console.log('Admin user exists:', adminUser.uid);
    } catch (e) {
      adminUser = await auth.createUser({
        email: adminEmail,
        password: password,
        displayName: 'Test Admin'
      });
      console.log('Admin user created:', adminUser.uid);
    }

    await db.collection('admins').doc(adminUser.uid).set({
      role: 'super',
      email: adminEmail,
      name: 'Test Admin'
    });
    console.log('Admin role set in Firestore');

    // Setup Test User
    let testUser;
    try {
      testUser = await auth.getUserByEmail(userEmail);
      console.log('Test user exists:', testUser.uid);
    } catch (e) {
      testUser = await auth.createUser({
        email: userEmail,
        password: password,
        displayName: 'Test User'
      });
      console.log('Test user created:', testUser.uid);
    }

    await db.collection('users').doc(testUser.uid).set({
      fullName: 'Test User',
      email: userEmail,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('User profile set in Firestore');

  } catch (error) {
    console.error('Error setting up test accounts:', error);
  } finally {
    process.exit();
  }
}

setupTestAccounts();
