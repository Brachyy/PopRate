import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Check, Trash2, Film, Clock } from 'lucide-react';
import { useList } from '../context/ListContext';
import { getImageUrl } from '../services/api';
import './MyList.css';

const MyList = () => {
  const { watchlist, watched, removeFromWatchlist, removeFromWatched } = useList();
  const [activeTab, setActiveTab] = useState('watchlist');

  const list = activeTab === 'watchlist' ? watchlist : watched;

  return (
    <div className="mylist-page container">
      <div className="mylist-header">
        <h1 className="page-title">My Library</h1>
        <div className="tabs glass-panel">
          <button 
            className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            <Clock size={18} /> Watchlist <span className="count-badge">{watchlist.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'watched' ? 'active' : ''}`}
            onClick={() => setActiveTab('watched')}
          >
            <Check size={18} /> Watched <span className="count-badge">{watched.length}</span>
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty-state glass-panel flex-center">
          <div className="empty-icon-wrapper">
            <Film size={48} />
          </div>
          <h2>Your {activeTab} is empty</h2>
          <p>Start adding movies and series to track what you want to watch.</p>
          <Link to="/" className="btn-primary" style={{marginTop: '1.5rem'}}>
            Discover Content
          </Link>
        </div>
      ) : (
        <div className="content-grid">
          {list.map((item) => (
            <div key={item.id} className="content-card">
              <Link to={`/details/${item.media_type || 'movie'}/${item.id}`} className="card-link">
                <div className="card-image-wrapper">
                  <img 
                    src={getImageUrl(item.poster_path, 'w500')} 
                    alt={item.title || item.name} 
                    className="card-image" 
                    loading="lazy"
                  />
                  <div className="card-overlay">
                    <div className="card-actions">
                      <button 
                        className="icon-btn-small delete-btn" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          activeTab === 'watchlist' ? removeFromWatchlist(item.id) : removeFromWatched(item.id);
                        }}
                        title="Remove from list"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <h3 className="card-title">{item.title || item.name}</h3>
                <div className="card-meta">
                  <span className="card-rating">★ {item.vote_average?.toFixed(1)}</span>
                  <span className="card-year">
                    {new Date(item.release_date || item.first_air_date).getFullYear() || 'N/A'}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyList;
