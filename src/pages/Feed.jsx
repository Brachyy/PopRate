import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';
import { Heart, MessageSquare, Film, UserPlus } from 'lucide-react';
import './Feed.css';

const Feed = () => {
  const { activities, fetchFeed, loading, following } = useSocial();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchFeed();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="feed-page container flex-center" style={{height: '80vh', flexDirection: 'column'}}>
        <h2>Sign in to see your feed</h2>
        <p className="text-secondary">Follow friends to see their activity here.</p>
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <div className="feed-page container flex-center" style={{height: '80vh', flexDirection: 'column'}}>
        <div className="empty-feed-icon">
          <UserPlus size={48} />
        </div>
        <h2>Your feed is empty</h2>
        <p className="text-secondary">Follow other users to see what they are watching and liking.</p>
        <Link to="/search" className="btn-primary" style={{marginTop: '1rem'}}>Find Friends</Link>
      </div>
    );
  }

  return (
    <div className="feed-page container">
      <h1 className="page-title">Activity Feed</h1>
      
      {loading ? (
        <div className="flex-center" style={{marginTop: '2rem'}}>Loading updates...</div>
      ) : (
        <div className="feed-list">
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
                    <span className="feed-username">{activity.userName}</span>
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
