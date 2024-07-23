const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: '.env.default' });
}

const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} = process.env;

// Import the functions from the SDKs
const { initializeApp } = require('firebase/app');
const logger = require('../../loggers/logger');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage')

// Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  databaseURL: FIREBASE_DATABASE_URL,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};
let app = null;
let firestore = null;
let firebaseStorage = null;

const initializeFirebaseApp = () => {
  try {
    app = initializeApp(firebaseConfig);
    logger.info(`Initialized Firebase App`);
  } catch (e) {
    logger.error(`Failed to Initialize Firebase App: ${e}`);
  }
};

const initializeFirestoreDB = () => {
  try {
    firestore = getFirestore();
    logger.info(`Initialized Firestore`);
  } catch (e) {
    logger.error(`Failed to Initialize Firestore: ${e}`);
  }
};

const initializeFirebaseStorage = () => {
  try{
    firebaseStorage = getStorage(app);
    logger.info(`Initialized Firebase Storage`);
    return firebaseStorage;
  } catch (e) {
    logger.error(`Failed to Initialize Firebase Storage: ${e}`);
  }
}

const getFirestoreDB = () => firestore;
const getFirebaseStorage = () => firebaseStorage;

module.exports = { initializeFirebaseApp, initializeFirestoreDB, getFirestoreDB, initializeFirebaseStorage, getFirebaseStorage };
