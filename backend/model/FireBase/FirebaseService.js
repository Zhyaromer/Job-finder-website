const { initializeApp } = require("firebase/app");
const admin = require("firebase-admin");
const { sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } = require("firebase/auth");
const serviceAccount = require("./firebase.js");

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

initializeApp(firebaseConfig);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();

module.exports = { auth, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword };
