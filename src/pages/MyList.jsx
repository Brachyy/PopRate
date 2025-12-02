import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Check, Trash2 } from 'lucide-react';
import { useList } from '../context/ListContext';
import { getImageUrl } from '../services/api';
import './MyList.css';

const MyList = () => {
  const { watchlist, watched, removeFromWatchlist, removeFromWatched } = useList();
  const [activeTab, setActiveTab] = useState('watchlist');

  const list = activeTab === 'watchlist' ? watchlist : watched;

  return (
    <div className="mylist-page container">
      <h1 className="page-title">My Library</h1>
      
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('watchlist')}
        >
          Watchlist ({watchlist.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'watched' ? 'active' : ''}`}
          onClick={() => setActiveTab('watched')}
        >
          Watched ({watched.length})
        </button>
      </div>

      {list.length === 0 ? (
        <div className="empty-state flex-center">
          <p>Your {activeTab} is empty.</p>
          <Link to="/" className="btn-primary" style={{marginTop: '1rem'}}>Discover Content</Link>
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
                      <button className="icon-btn-small" onClick={(e) => {
                        e.preventDefault();
                        activeTab === 'watchlist' ? removeFromWatchlist(item.id) : removeFromWatched(item.id);
                      }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <h3 className="card-title">{item.title || item.name}</h3>
                <span className="card-rating">★ {item.vote_average?.toFixed(1)}</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyList;
