import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTrending, getTopRated, getUpcoming, getImageUrl } from '../services/api';
import { useList } from '../context/ListContext';
import { useSocial } from '../context/SocialContext';
import './Home.css';

const Home = () => {
  const [trendingContent, setTrendingContent] = useState([]);
  const [topRatedContent, setTopRatedContent] = useState([]);
  const [upcomingContent, setUpcomingContent] = useState([]);
  const [mostLiked, setMostLiked] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToWatchlist, isInWatchlist } = useList();
  const { getMostLikedContent } = useSocial();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trending, topRated, upcoming, mostLikedData] = await Promise.all([
          getTrending('all', 'week'),
          getTopRated('movie'),
          getUpcoming(),
          getMostLikedContent()
        ]);
        
        setTrendingContent(trending.results.slice(0, 10));
        setTopRatedContent(topRated.results.slice(0, 10));
        setUpcomingContent(upcoming.results.slice(0, 10));
        setMostLiked(mostLikedData);
        
        // Pick a random item for the hero section
        if (trending.results.length > 0) {
          const random = Math.floor(Math.random() * 5);
          setFeatured(trending.results[random]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      {featured && (
        <div 
          className="hero-section" 
          style={{ backgroundImage: `url(${getImageUrl(featured.backdrop_path)})` }}
        >
          <div className="hero-overlay"></div>
          <div className="hero-content container">
            <h1 className="hero-title">{featured.title || featured.name}</h1>
            <p className="hero-overview">{featured.overview}</p>
            <div className="hero-actions">
              <Link to={`/details/${featured.media_type || 'movie'}/${featured.id}`} className="btn-primary">
                <Play size={20} style={{ marginRight: '8px', fill: 'currentColor' }} /> Play
              </Link>
              <button 
                className="btn-secondary"
                onClick={() => addToWatchlist(featured)}
              >
                {isInWatchlist(featured.id) ? (
                  <>In Watchlist</>
                ) : (
                  <><Plus size={20} style={{ marginRight: '8px' }} /> My List</>
                )}
              </button>
              <Link to={`/details/${featured.media_type || 'movie'}/${featured.id}`} className="btn-secondary glass-btn">
                <Info size={20} style={{ marginRight: '8px' }} /> More Info
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Trending Section */}
      <div className="content-section container">
        <h2 className="section-title">Trending Now</h2>
        <div className="content-row">
          {trendingContent.map((item) => (
            <Link to={`/details/${item.media_type || 'movie'}/${item.id}`} key={item.id} className="content-card">
              <div className="card-image-wrapper">
                <img 
                  src={getImageUrl(item.poster_path, 'w500')} 
                  alt={item.title || item.name} 
                  className="card-image" 
                  loading="lazy"
                />
                <div className="card-overlay">
                  <span className="rating-badge">★ {item.vote_average?.toFixed(1)}</span>
                </div>
              </div>
              <h3 className="card-title">{item.title || item.name}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Most Liked Section (Community Favorites) */}
      {mostLiked.length > 0 && (
        <div className="content-section container">
          <h2 className="section-title">Community Favorites</h2>
          <div className="content-row">
            {mostLiked.map((item) => (
              <Link to={`/details/movie/${item.id}`} key={item.id} className="content-card">
                <div className="card-image-wrapper">
                  <img 
                    src={getImageUrl(item.posterPath, 'w500')} 
                    alt={item.title} 
                    className="card-image" 
                    loading="lazy"
                  />
                  <div className="card-overlay">
                    <div className="card-rating-badge" style={{display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(229, 9, 20, 0.8)', padding: '4px 8px', borderRadius: '4px'}}>
                      <Heart size={12} fill="white" color="white" /> {item.likeCount}
                    </div>
                  </div>
                </div>
                <h3 className="card-title">{item.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Top Rated Section */}
      <div className="content-section container">
        <h2 className="section-title">Top Rated Movies</h2>
        <div className="content-row">
          {topRatedContent.map((item) => (
            <Link to={`/details/movie/${item.id}`} key={item.id} className="content-card">
              <div className="card-image-wrapper">
                <img 
                  src={getImageUrl(item.poster_path, 'w500')} 
                  alt={item.title} 
                  className="card-image" 
                  loading="lazy"
                />
                <div className="card-overlay">
                  <span className="rating-badge">★ {item.vote_average?.toFixed(1)}</span>
                </div>
              </div>
              <h3 className="card-title">{item.title}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Section */}
      <div className="content-section container">
        <h2 className="section-title">Coming Soon</h2>
        <div className="content-row">
          {upcomingContent.map((item) => (
            <Link to={`/details/movie/${item.id}`} key={item.id} className="content-card">
              <div className="card-image-wrapper">
                <img 
                  src={getImageUrl(item.poster_path, 'w500')} 
                  alt={item.title} 
                  className="card-image" 
                  loading="lazy"
                />
              </div>
              <h3 className="card-title">{item.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
