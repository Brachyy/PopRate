import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container container">
          <div className="navbar-left">
            <Link to="/" className="logo">
              Pop<span className="logo-accent">Rate</span>
            </Link>
            
            <div className="desktop-menu">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/feed" className={`nav-link ${location.pathname === '/feed' ? 'active' : ''}`}>Feed</Link>
          <Link to="/my-list" className={`nav-link ${location.pathname === '/my-list' ? 'active' : ''}`}>My List</Link>
        </div>
          </div>

          <div className="navbar-right">
            <Link to="/search" className="icon-btn" aria-label="Search">
              <Search size={20} />
            </Link>
            
            {currentUser ? (
              <div className="user-menu">
                <Link to="/profile" className="user-profile-link">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="user-avatar-small" />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </Link>
                <button className="icon-btn" onClick={logout} title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button className="btn-primary login-btn" onClick={() => setIsAuthModalOpen(true)}>
                Sign In
              </button>
            )}

            <button className="icon-btn mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="mobile-link">Home</Link>
          <Link to="/my-list" className="mobile-link">My List</Link>
          {currentUser && <Link to="/profile" className="mobile-link">Profile</Link>}
          {!currentUser && (
            <button className="mobile-link" onClick={() => setIsAuthModalOpen(true)}>Sign In</button>
          )}
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;
