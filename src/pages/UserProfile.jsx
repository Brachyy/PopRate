import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { Film, Heart, MessageSquare, UserPlus, Clock } from 'lucide-react';
import { getImageUrl } from '../services/api';
import './Profile.css'; // Reuse Profile styles

const UserProfile = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const { followUser, unfollowUser, following } = useSocial();
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({ watched: 0, likes: 0, comments: 0 });
  const [recentLikes, setRecentLikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch User Doc
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }

        // Fetch Stats (Approximate for this demo)
        // In a real app, these should be aggregated counters on the user doc
        
        // Count watched (from a subcollection or array - assuming array 'watched' exists on user doc for simplicity in this demo, 
        // though in ListContext we store it in a subcollection 'lists/watched/items'. 
        // Accessing subcollections of other users requires permission rules. 
        // For this demo, we'll assume we can read 'users/{uid}/lists/watched/items' if rules allow, 
        // OR we just use the 'activities' collection to count 'watch' events.)
        
        const qWatch = query(collection(db, 'activities'), where('userId', '==', userId), where('type', '==', 'watch'));
        const watchSnap = await getDocs(qWatch);
        
        const qLikes = query(collection(db, 'activities'), where('userId', '==', userId), where('type', '==', 'like'));
        const likeSnap = await getDocs(qLikes);

        const qComments = query(collection(db, 'activities'), where('userId', '==', userId), where('type', '==', 'comment'));
        const commentSnap = await getDocs(qComments);

        setStats({
          watched: watchSnap.size,
          likes: likeSnap.size,
          comments: commentSnap.size
        });

        // Get recent likes for display
        const recentLikesData = likeSnap.docs.slice(0, 5).map(d => d.data());
        setRecentLikes(recentLikesData);

      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  if (loading) return <div className="flex-center" style={{height: '100vh'}}>Loading...</div>;
  if (!userProfile) return <div className="flex-center" style={{height: '100vh'}}>User not found</div>;

  const isFollowing = following.some(u => u.uid === userId);
  const isMe = currentUser?.uid === userId;

  return (
    <div className="profile-page container">
      <div className="profile-header glass-panel">
        <div className="profile-info">
          <div className="profile-avatar-large">
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt={userProfile.displayName} />
            ) : (
              <div className="avatar-placeholder-large">
                {userProfile.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="profile-text">
            <h1 className="profile-name">{userProfile.displayName}</h1>
            <p className="profile-email">Movie Enthusiast</p>
            <div className="profile-stats-row">
              <span><strong>{userProfile.followers?.length || 0}</strong> Followers</span>
              <span><strong>{userProfile.following?.length || 0}</strong> Following</span>
            </div>
          </div>
        </div>
        
        {!isMe && (
          <button 
            className={`btn-${isFollowing ? 'secondary' : 'primary'}`}
            onClick={() => isFollowing 
              ? unfollowUser(userId) 
              : followUser(userId, userProfile.displayName, userProfile.photoURL)
            }
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <Film size={24} className="stat-icon" />
          <div className="stat-value">{stats.watched}</div>
          <div className="stat-label">Watched</div>
        </div>
        <div className="stat-card glass-panel">
          <Heart size={24} className="stat-icon" />
          <div className="stat-value">{stats.likes}</div>
          <div className="stat-label">Likes</div>
        </div>
        <div className="stat-card glass-panel">
          <MessageSquare size={24} className="stat-icon" />
          <div className="stat-value">{stats.comments}</div>
          <div className="stat-label">Comments</div>
        </div>
      </div>

      {recentLikes.length > 0 && (
        <div className="section">
          <h2 className="section-title">Recently Liked</h2>
          <div className="content-row">
            {recentLikes.map((item, index) => (
              <div key={index} className="content-card">
                 {/* Note: Activity log might not have poster path for older activities, need to handle that */}
                 {item.posterPath ? (
                    <img 
                      src={getImageUrl(item.posterPath, 'w200')} 
                      alt={item.contentTitle} 
                      className="card-image" 
                      style={{height: '200px'}}
                    />
                 ) : (
                   <div className="card-image-placeholder" style={{height: '200px'}}>
                     <Film />
                   </div>
                 )}
                 <h4 className="card-title" style={{fontSize: '0.9rem'}}>{item.contentTitle}</h4>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
