const { initializeApp } = require("firebase/app");
const admin = require("firebase-admin");
const {sendPasswordResetEmail,GoogleAuthProvider,signInWithPopup,signInWithEmailAndPassword} = require("firebase/auth");
const serviceAccount = require("./job-finder-firebase-adminsdk.json");

const firebaseConfig = {
    apiKey: "AIzaSyCLkzo07_CrlMFma3ZUTEznOtr-nouInhE",
    authDomain: "job-finder-3ff0b.firebaseapp.com",
    projectId: "job-finder-3ff0b",
    storageBucket: "job-finder-3ff0b.appspot.com",
    messagingSenderId: "967835756388",
    appId: "1:967835756388:web:7c57cacbc7ea7b90f23c71"
};

initializeApp(firebaseConfig);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();

module.exports = {auth,sendPasswordResetEmail,GoogleAuthProvider,signInWithPopup,signInWithEmailAndPassword};
