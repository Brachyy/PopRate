import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/feed', icon: Activity, label: 'Feed' },
    { path: '/my-list', icon: Heart, label: 'My List' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-logo">
        <span className="logo-pop">Pop</span><span className="logo-rate">Rate</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <item.icon size={24} />
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        {currentUser ? (
          <div className="user-mini-profile">
            <img 
              src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}&background=random`} 
              alt="Profile" 
              className="mini-avatar"
            />
            <div className="mini-info">
              <span className="mini-name">{currentUser.displayName}</span>
              <button onClick={logout} className="logout-btn-mini">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          <Link to="/profile" className="btn-primary w-full">Sign In</Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
