import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';

import messaging from '@react-native-firebase/messaging'; // Correct import for messaging
import { firebase } from '@react-native-firebase/messaging'; // Correct import for firebase


const androidConfig = {
  clientId: '118169707984303342226',
  appId: '1:790450439872:web:4d4b43199a7ab4b204cf2',
  apiKey: 'AIzaSyBd2U6tv_g0NLI1lGIJDZcxBuVRQOk7Jeo',
  databaseURL: 'https://ultimatehealth-41b71.firebaseio.com',
  storageBucket: 'ultimatehealth-41b71.firebasestorage.app',
  messagingSenderId: '790450439872',
  projectId: 'ultimatehealth-41b71',
  persistence: true,
  }

// Define the type for the FirebaseContext
const FirebaseContext = createContext<{
  messaging: typeof messaging | null;
  fcmToken: string | null;
}>({ messaging: null, fcmToken: null }); // We add fcmToken to the context

// Define the type for FirebaseProvider props (expecting children)
interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      // Initialize Firebase
      try {
        if (!firebase.apps.length) {
         await firebase.initializeApp(androidConfig);
       }else {
         firebase.app(); // if already initialized, use that one
       }
        //await firebase.initializeApp(androidConfig);
        const token = await messaging().getToken();
        console.log('Firebase Token:', token);
        setFcmToken(token); // Store the token in state
      } catch (error) {
        console.error('Error getting token:', error);
      }
    };

    initializeFirebase();

    return () => {
      // Cleanup if necessary (e.g., unsubscribe from listeners)
    };
  }, []);

  return (
    <FirebaseContext.Provider value={{ messaging, fcmToken }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to access Firebase messaging and token
export const useFirebaseMessaging = (): { messaging: typeof messaging | null; fcmToken: string | null } => {
  return useContext(FirebaseContext);
};
