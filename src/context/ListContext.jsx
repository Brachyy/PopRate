import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, setDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const ListContext = createContext();

export const useList = () => useContext(ListContext);

export const ListProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [watched, setWatched] = useState(() => {
    const saved = localStorage.getItem('watched');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync with Firestore when user logs in
  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    
    // Create user document if it doesn't exist
    const checkUserDoc = async () => {
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, { watchlist: [], watched: [] }, { merge: true });
      }
    };
    checkUserDoc();

    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.watchlist) {
          setWatchlist(data.watchlist);
          localStorage.setItem('watchlist', JSON.stringify(data.watchlist));
        }
        if (data.watched) {
          setWatched(data.watched);
          localStorage.setItem('watched', JSON.stringify(data.watched));
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Sync to localStorage for guest users
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }
  }, [watchlist, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('watched', JSON.stringify(watched));
    }
  }, [watched, currentUser]);

  const addToWatchlist = async (item) => {
    if (watchlist.some((i) => i.id === item.id)) return;
    
    const newItem = { ...item, addedAt: new Date().toISOString() };
    
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        watchlist: arrayUnion(newItem)
      }, { merge: true });
    } else {
      setWatchlist([...watchlist, newItem]);
    }
  };

  const removeFromWatchlist = async (id) => {
    if (currentUser) {
      const itemToRemove = watchlist.find(i => i.id === id);
      if (!itemToRemove) return;
      
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        watchlist: arrayRemove(itemToRemove)
      });
    } else {
      setWatchlist(watchlist.filter((item) => item.id !== id));
    }
  };

  const isInWatchlist = (id) => {
    return watchlist.some((item) => item.id === id);
  };

  const addToWatched = async (item) => {
    if (watched.some((i) => i.id === item.id)) return;
    
    const newItem = { ...item, watchedAt: new Date().toISOString() };

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        watched: arrayUnion(newItem)
      }, { merge: true });
    } else {
      setWatched([...watched, newItem]);
    }
  };

  const removeFromWatched = async (id) => {
    if (currentUser) {
      const itemToRemove = watched.find(i => i.id === id);
      if (!itemToRemove) return;

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        watched: arrayRemove(itemToRemove)
      });
    } else {
      setWatched(watched.filter((item) => item.id !== id));
    }
  };

  const isInWatched = (id) => {
    return watched.some((item) => item.id === id);
  };

  return (
    <ListContext.Provider
      value={{
        watchlist,
        watched,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        addToWatched,
        removeFromWatched,
        isInWatched,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};
