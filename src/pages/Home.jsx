import React, { useState, useEffect } from 'react';
import { Play, Info, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTrending, getTopRated, getUpcoming, getImageUrl } from '../services/api';
import './Home.css';

const Home = () => {
  const [featuredContent, setFeaturedContent] = useState(null);
  const [trendingContent, setTrendingContent] = useState([]);
  const [topRatedContent, setTopRatedContent] = useState([]);
  const [upcomingContent, setUpcomingContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trending, topRated, upcoming] = await Promise.all([
          getTrending('all', 'week'),
          getTopRated('movie'),
          getUpcoming()
        ]);
        
        setTrendingContent(trending);
        setTopRatedContent(topRated);
        setUpcomingContent(upcoming);
        
        // Pick a random item for the hero section
        if (trending.length > 0) {
          const randomItem = trending[Math.floor(Math.random() * trending.length)];
          setFeaturedContent(randomItem);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex-center" style={{height: '100vh'}}>Loading...</div>;

  const ContentRow = ({ title, data }) => (
    <div className="section container">
      <h2 className="section-title">{title}</h2>
      <div className="content-grid">
        {data.slice(0, 10).map((item) => (
          <Link to={`/details/${item.media_type || 'movie'}/${item.id}`} key={item.id} className="content-card">
            <div className="card-image-wrapper">
              <img 
                src={getImageUrl(item.poster_path, 'w500')} 
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
    </div>
  );

  return (
    <div className="home-page">
      {/* Hero Section */}
      {featuredContent && (
        <div className="hero-section" style={{ backgroundImage: `url(${getImageUrl(featuredContent.backdrop_path)})` }}>
          <div className="hero-overlay"></div>
          <div className="container hero-content">
            <h1 className="hero-title">{featuredContent.title || featuredContent.name}</h1>
            <p className="hero-description">{featuredContent.overview}</p>
            <div className="hero-tags">
              <span className="tag">{featuredContent.media_type === 'tv' ? 'Series' : 'Movie'}</span>
              <span className="tag">Trending</span>
            </div>
            <div className="hero-actions">
              <Link to={`/details/${featuredContent.media_type}/${featuredContent.id}`} className="btn-primary flex-center">
                <Play size={20} style={{ marginRight: '8px', fill: 'currentColor' }} /> Play
              </Link>
              <Link to={`/details/${featuredContent.media_type}/${featuredContent.id}`} className="btn-secondary flex-center">
                <Info size={20} style={{ marginRight: '8px' }} /> More Info
              </Link>
            </div>
          </div>
        </div>
      )}

      <ContentRow title="Trending Now" data={trendingContent} />
      <ContentRow title="Top Rated Movies" data={topRatedContent} />
      <ContentRow title="Upcoming Movies" data={upcomingContent} />
    </div>
  );
};

export default Home;
