import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Play, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchContent, getImageUrl } from '../services/api';
import './Search.css';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Search effect
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await searchContent(debouncedQuery);
        // Filter out people, only show movies and tv
        const filtered = data.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
        setResults(filtered);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  return (
    <div className="search-page container">
      <div className="search-header">
        <div className="search-input-wrapper glass-panel">
          <SearchIcon className="search-icon" size={24} />
          <input
            type="text"
            placeholder="Search for movies, series..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {loading && <div className="flex-center" style={{marginTop: '2rem'}}>Loading...</div>}

      {!loading && results.length > 0 && (
        <div className="content-grid" style={{marginTop: '2rem'}}>
          {results.map((item) => (
            <Link to={`/details/${item.media_type}/${item.id}`} key={item.id} className="content-card">
              <div className="card-image-wrapper">
                <img 
                  src={getImageUrl(item.poster_path, 'w500') || 'https://via.placeholder.com/500x750?text=No+Image'} 
                  alt={item.title || item.name} 
                  className="card-image" 
                  loading="lazy"
                />
                <div className="card-overlay">
                  <div className="card-actions">
                    <button className="icon-btn-small"><Play size={16} /></button>
                    <button className="icon-btn-small"><Plus size={16} /></button>
                  </div>
                </div>
              </div>
              <h3 className="card-title">{item.title || item.name}</h3>
              <span className="card-rating">★ {item.vote_average?.toFixed(1)}</span>
            </Link>
          ))}
        </div>
      )}

      {!loading && debouncedQuery && results.length === 0 && (
        <div className="flex-center" style={{marginTop: '2rem', color: 'var(--text-secondary)'}}>
          No results found for "{debouncedQuery}"
        </div>
      )}
    </div>
  );
};

export default Search;
