import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const SocialContext = createContext();

export const useSocial = () => useContext(SocialContext);

export const SocialProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's social graph
  useEffect(() => {
    if (!currentUser) {
      setFollowing([]);
      setFollowers([]);
      return;
    }

    const fetchSocialGraph = async () => {
      const userRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFollowing(data.following || []);
        setFollowers(data.followers || []);
      }
    };

    fetchSocialGraph();
  }, [currentUser]);

  // Follow a user
  const followUser = async (targetUserId, targetUserName, targetUserPhoto) => {
    if (!currentUser) return;

    try {
      // Add to current user's following
      const currentUserRef = doc(db, 'users', currentUser.uid);
      await updateDoc(currentUserRef, {
        following: arrayUnion({ uid: targetUserId, displayName: targetUserName, photoURL: targetUserPhoto })
      });

      // Add to target user's followers
      const targetUserRef = doc(db, 'users', targetUserId);
      await updateDoc(targetUserRef, {
        followers: arrayUnion({ uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL })
      });

      // Update local state
      setFollowing(prev => [...prev, { uid: targetUserId, displayName: targetUserName, photoURL: targetUserPhoto }]);
      
      // Log activity
      await logActivity('follow', null, null, targetUserId, targetUserName);

    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // Unfollow a user
  const unfollowUser = async (targetUserId) => {
    if (!currentUser) return;

    try {
      // Get current user data to find the object to remove
      const currentUserRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(currentUserRef);
      const userData = userSnap.data();
      const followingItem = userData.following?.find(u => u.uid === targetUserId);

      if (followingItem) {
        await updateDoc(currentUserRef, {
          following: arrayRemove(followingItem)
        });
      }

      // Remove from target user's followers (requires finding the object)
      const targetUserRef = doc(db, 'users', targetUserId);
      const targetSnap = await getDoc(targetUserRef);
      const targetData = targetSnap.data();
      const followerItem = targetData.followers?.find(u => u.uid === currentUser.uid);

      if (followerItem) {
        await updateDoc(targetUserRef, {
          followers: arrayRemove(followerItem)
        });
      }

      // Update local state
      setFollowing(prev => prev.filter(u => u.uid !== targetUserId));

    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  // Log an activity
  const logActivity = async (type, contentId = null, contentTitle = null, targetUserId = null, targetUserName = null) => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'activities'), {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userPhoto: currentUser.photoURL,
        type, // 'watch', 'like', 'comment', 'follow'
        contentId,
        contentTitle,
        targetUserId,
        targetUserName,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  // Fetch Feed (activities of people I follow)
  const fetchFeed = async () => {
    if (!currentUser || following.length === 0) return [];

    setLoading(true);
    try {
      const followingIds = following.map(u => u.uid);
      // Firestore 'in' query supports up to 10 values. For production, needs chunking.
      // For now, we'll just fetch recent activities and filter client-side or use limited 'in'
      
      const q = query(
        collection(db, 'activities'),
        where('userId', 'in', followingIds.slice(0, 10)), 
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const feedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivities(feedData);
      return feedData;
    } catch (error) {
      console.error("Error fetching feed:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Global Likes (Content Stats)
  const toggleGlobalLike = async (contentId, contentTitle, posterPath) => {
    if (!currentUser) return;

    const statsRef = doc(db, 'content_stats', contentId.toString());
    const userLikeRef = doc(db, 'users', currentUser.uid, 'likes', contentId.toString());

    try {
      const userLikeSnap = await getDoc(userLikeRef);
      
      if (userLikeSnap.exists()) {
        // Unlike
        await setDoc(statsRef, {
          likeCount: (await getDoc(statsRef)).data()?.likeCount - 1 || 0
        }, { merge: true });
        
        await setDoc(userLikeRef, { liked: false }, { merge: true }); // Or delete doc
        
        return false; // Not liked anymore
      } else {
        // Like
        const statsSnap = await getDoc(statsRef);
        const currentCount = statsSnap.exists() ? statsSnap.data().likeCount : 0;
        
        await setDoc(statsRef, {
          likeCount: currentCount + 1,
          title: contentTitle,
          posterPath: posterPath
        }, { merge: true });

        await setDoc(userLikeRef, { 
          liked: true,
          timestamp: serverTimestamp() 
        });

        await logActivity('like', contentId, contentTitle);
        return true; // Liked
      }
    } catch (error) {
      console.error("Error toggling global like:", error);
      return false;
    }
  };

  const getGlobalLikes = async (contentId) => {
    try {
      const docSnap = await getDoc(doc(db, 'content_stats', contentId.toString()));
      return docSnap.exists() ? docSnap.data().likeCount : 0;
    } catch (error) {
      return 0;
    }
  };

  const getMostLikedContent = async () => {
    try {
      const q = query(collection(db, 'content_stats'), orderBy('likeCount', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching most liked:", error);
      return [];
    }
  };

  return (
    <SocialContext.Provider value={{
      following,
      followers,
      activities,
      loading,
      followUser,
      unfollowUser,
      fetchFeed,
      logActivity,
      toggleGlobalLike,
      getGlobalLikes,
      getMostLikedContent
    }}>
      {children}
    </SocialContext.Provider>
  );
};
