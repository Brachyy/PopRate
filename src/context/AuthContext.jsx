import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, username) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: username });
    
    // Create user document in Firestore
    try {
      await setDoc(doc(db, 'users', result.user.uid), {
        displayName: username,
        email: email,
        photoURL: result.user.photoURL,
        searchName: username.toLowerCase(),
        createdAt: serverTimestamp(),
        followers: [],
        following: []
      });
    } catch (error) {
      console.error("Error creating user document:", error);
    }
    
    return result;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = () => {
    return signOut(auth);
  };

  const syncProfile = async () => {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        searchName: currentUser.displayName?.toLowerCase(),
        lastSynced: serverTimestamp(),
      }, { merge: true });
      alert("Profile synced successfully!");
    } catch (error) {
      console.error("Error syncing profile:", error);
      alert("Failed to sync profile.");
    }
  };

  // Auto-sync profile on login/load
  useEffect(() => {
    if (currentUser) {
      const autoSync = async () => {
        try {
          await setDoc(doc(db, 'users', currentUser.uid), {
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            searchName: currentUser.displayName?.toLowerCase(),
            lastSynced: serverTimestamp(),
          }, { merge: true });
        } catch (error) {
          console.error("Auto-sync failed:", error);
        }
      };
      autoSync();
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    syncProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
