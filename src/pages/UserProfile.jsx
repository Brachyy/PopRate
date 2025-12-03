import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { Film, Heart, MessageSquare, UserPlus, Clock, Users } from 'lucide-react';
import { getImageUrl } from '../services/api';
import './Profile.css'; // Reuse Profile styles

const UserProfile = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const { followUser, unfollowUser, following } = useSocial();
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({ watched: 0, likes: 0, comments: 0, followers: 0, following: 0 });
  const [recentLikes, setRecentLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('likes'); // Default to likes as it's more interesting usually

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch User Doc
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
          
          // Fetch Likes (from subcollection if possible, or activities)
          // We'll try to fetch from the 'likes' subcollection first as it has poster/title
          const likesRef = collection(db, 'users', userId, 'likes');
          const qLikes = query(likesRef, where('liked', '==', true), orderBy('timestamp', 'desc'), limit(20));
          const likeSnap = await getDocs(qLikes);
          const likesData = likeSnap.docs.map(d => d.data());
          
          setRecentLikes(likesData);
          
          // Update stats
          setStats({
            watched: 0, // Placeholder as we can't easily read other's watched list in this simple schema without more rules
            likes: likeSnap.size, // This is just the fetched batch size, ideally we'd have a counter
            comments: 0,
            followers: userData.followers?.length || 0,
            following: userData.following?.length || 0
          });
        }
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

  const displayStats = [
    { label: 'Likes', value: recentLikes.length + (recentLikes.length === 20 ? '+' : ''), icon: <Heart size={20} /> },
    { label: 'Followers', value: stats.followers, icon: <Users size={20} /> },
    { label: 'Following', value: stats.following, icon: <UserPlus size={20} /> },
  ];

  return (
    <div className="profile-page container">
      <div className="profile-header glass-panel">
        <div className="profile-cover"></div>
        <div className="profile-info">
          <div className="profile-avatar-wrapper">
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt={userProfile.displayName} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {userProfile.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="profile-details">
            <h1 className="profile-name">{userProfile.displayName}</h1>
            <p className="profile-email">Movie Enthusiast</p>
            <div className="profile-stats">
              {displayStats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <span className="stat-icon">{stat.icon}</span>
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="profile-actions">
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
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button 
            className={`btn-secondary ${activeTab === 'likes' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('likes')}
          >
            Liked Content
          </button>
        </div>

        {activeTab === 'likes' && (
          <>
            {recentLikes.length > 0 ? (
              <div className="content-grid">
                {recentLikes.map((item, index) => (
                  <div key={index} className="content-card">
                    <div className="card-image-wrapper">
                      {item.posterPath ? (
                        <img 
                          src={getImageUrl(item.posterPath, 'w500')} 
                          alt={item.title} 
                          className="card-image" 
                        />
                      ) : (
                        <div className="card-image-placeholder flex-center" style={{background: '#333', height: '100%'}}>
                          <Film size={40} />
                        </div>
                      )}
                      <div className="card-overlay"></div>
                      <div className="card-rating-badge" style={{position: 'absolute', top: '10px', right: '10px', background: 'rgba(229, 9, 20, 0.9)', padding: '4px', borderRadius: '4px'}}>
                        <Heart size={14} fill="white" color="white" />
                      </div>
                    </div>
                    <h3 className="card-title">{item.title || item.contentTitle}</h3>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">This user hasn't liked any content yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
