import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, Activity } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/feed', icon: Activity, label: 'Feed' },
    { path: '/my-list', icon: Heart, label: 'Lists' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav glass-panel">
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path} 
          className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
        >
          <item.icon size={24} />
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
