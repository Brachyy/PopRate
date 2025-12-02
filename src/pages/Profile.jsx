import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useList } from '../context/ListContext';
import { useSocial } from '../context/SocialContext';
import { Settings, LogOut, Film, Clock, Heart, Users, UserPlus, LogIn } from 'lucide-react';
import { getImageUrl } from '../services/api';
import AuthModal from '../components/AuthModal';
import './Profile.css';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { watchlist, watched } = useList();
  const { followers, following } = useSocial();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="profile-page container flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '2rem' }}>
        <div className="text-center">
          <h1 className="page-title" style={{ marginBottom: '1rem' }}>Guest Profile</h1>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>
            Sign in to track your watched movies, create lists, and follow friends.
          </p>
          <button className="btn-primary" onClick={() => setIsAuthModalOpen(true)}>
            <LogIn size={20} style={{ marginRight: '8px' }} /> Sign In / Register
          </button>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  const stats = [
    { label: 'Watched', value: watched.length, icon: <Film size={20} /> },
    { label: 'Watchlist', value: watchlist.length, icon: <Clock size={20} /> },
    { label: 'Followers', value: followers.length, icon: <Users size={20} /> },
    { label: 'Following', value: following.length, icon: <UserPlus size={20} /> },
  ];

  return (
    <div className="profile-page container">
      <div className="profile-header glass-panel">
        <div className="profile-cover"></div>
        <div className="profile-info">
          <div className="profile-avatar-wrapper">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <div className="profile-details">
            <h1 className="profile-name">{currentUser.displayName || 'User'}</h1>
            <p className="profile-email">{currentUser.email}</p>
            <div className="profile-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <span className="stat-icon">{stat.icon}</span>
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn-secondary">
              <Settings size={18} style={{marginRight: '8px'}} /> Settings
            </button>
            <button className="btn-primary" onClick={logout}>
              <LogOut size={18} style={{marginRight: '8px'}} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <h2 className="section-title">Recently Watched</h2>
        {watched.length > 0 ? (
          <div className="content-grid">
            {watched.slice(0, 5).map((item) => (
              <div key={item.id} className="content-card">
                <div className="card-image-wrapper">
                  <img 
                    src={getImageUrl(item.poster_path, 'w500')} 
                    alt={item.title || item.name} 
                    className="card-image" 
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-text">You haven't marked anything as watched yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
