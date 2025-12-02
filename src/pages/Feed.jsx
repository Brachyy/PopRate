import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';
import { Heart, MessageSquare, Film, UserPlus, Search, User } from 'lucide-react';
import './Feed.css';

const Feed = () => {
  const { activities, fetchFeed, loading, following, searchUsers, followUser, createDummyUser } = useSocial();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, [currentUser]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    const results = await searchUsers(searchTerm);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleCreateDummy = async () => {
    try {
      const msg = await createDummyUser();
      alert(msg);
    } catch (error) {
      console.error("Failed to create dummy user:", error);
      alert("Error creating dummy user. Check console.");
    }
  };

  if (!currentUser) {
    return (
      <div className="feed-page container flex-center" style={{height: '80vh', flexDirection: 'column'}}>
        <h2>Sign in to see your feed</h2>
        <p className="text-secondary">Follow friends to see their activity here.</p>
      </div>
    );
  }

  return (
    <div className="feed-page container">
      <div className="feed-header-main">
        <h1 className="page-title">Activity Feed</h1>
        <button onClick={handleCreateDummy} className="btn-secondary btn-sm">
          + Add Test User
        </button>
      </div>

      {/* User Search */}
      <div className="user-search-section glass-panel">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Find friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="user-search-input"
          />
          <button type="submit" className="btn-primary">
            <Search size={18} />
          </button>
        </form>

        {searchResults.length > 0 ? (
          <div className="user-results">
            {searchResults.map(user => (
              <div key={user.uid} className="user-result-item">
                <div className="user-info-small">
                  <div className="user-avatar-small">
                    <User size={16} />
                  </div>
                  <Link to={`/profile/${user.uid}`} className="text-white hover-underline" style={{textDecoration: 'none'}}>
                    {user.displayName}
                  </Link>
                </div>
                <button 
                  className="btn-primary btn-sm"
                  onClick={() => followUser(user.uid, user.displayName, user.photoURL)}
                  disabled={following.some(f => f.uid === user.uid) || user.uid === currentUser.uid}
                >
                  {following.some(f => f.uid === user.uid) ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          searchTerm && !isSearching && searchResults.length === 0 && (
             <div className="text-center text-secondary" style={{ marginTop: '1rem' }}>No users found.</div>
          )
        )}
      </div>
      
      {loading ? (
        <div className="flex-center" style={{marginTop: '2rem'}}>Loading updates...</div>
      ) : (
        <div className="feed-list">
          {activities.length === 0 && following.length > 0 && (
             <p className="text-center text-secondary">No recent activity from friends.</p>
          )}
          {activities.map((activity) => (
            <div key={activity.id} className="feed-item glass-panel">
              <div className="feed-header">
                <div className="feed-user-info">
                  {activity.userPhoto ? (
                    <img src={activity.userPhoto} alt={activity.userName} className="feed-avatar" />
                  ) : (
                    <div className="feed-avatar-placeholder">
                      {activity.userName ? activity.userName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="feed-user-details">
                    <Link to={`/profile/${activity.userId}`} className="feed-username hover-underline" style={{color: 'white', textDecoration: 'none'}}>
                      {activity.userName}
                    </Link>
                    <span className="feed-action">
                      {activity.type === 'watch' && 'watched'}
                      {activity.type === 'like' && 'liked'}
                      {activity.type === 'comment' && 'commented on'}
                      {activity.type === 'follow' && 'started following'}
                    </span>
                    {activity.targetUserName && <span className="feed-target">{activity.targetUserName}</span>}
                  </div>
                </div>
                <span className="feed-time">
                  {activity.timestamp?.toDate().toLocaleDateString()}
                </span>
              </div>

              {(activity.contentId && activity.contentTitle) && (
                <Link to={`/details/movie/${activity.contentId}`} className="feed-content-card">
                  {activity.posterPath && (
                    <img 
                      src={getImageUrl(activity.posterPath, 'w200')} 
                      alt={activity.contentTitle} 
                      className="feed-content-poster" 
                    />
                  )}
                  <div className="feed-content-info">
                    <h3 className="feed-content-title">{activity.contentTitle}</h3>
                    <div className="feed-content-type">
                      <Film size={14} /> Movie
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
