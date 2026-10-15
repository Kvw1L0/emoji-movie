import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const projectId = 'granpremiof1veltis';

const firebaseConfig = {
  apiKey: "AIzaSyASb08jIpy0FeBDFgCDTM-snlQsJsesUnk",
  authDomain: `${projectId}.firebaseapp.com`,
  databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
  projectId: projectId,
  storageBucket: `${projectId}.firebasestorage.app`,
  messagingSenderId: "308661074409",
  appId: "1:308661074409:web:f7886564bfe3df8ec27378"
};

export const isFirebaseConfigured = () => {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
};

let app = null;
let database = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    try {
      database = getDatabase(app);
    } catch (e) {
      console.warn('Firebase RTDB init note:', e);
    }
  } catch (error) {
    console.error('Error al inicializar Firebase:', error);
  }
}

export { app, database, firebaseConfig };
