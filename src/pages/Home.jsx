import React from 'react';
import { Play, Info, Plus } from 'lucide-react';
import './Home.css';

const Home = () => {
  // Mock Data
  const featuredContent = {
    title: "Stranger Things",
    description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop",
    tags: ["Sci-Fi", "Horror", "Drama"]
  };

  const trendingContent = [
    { id: 1, title: "The Dark Knight", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=500&auto=format&fit=crop", rating: 9.0 },
    { id: 2, title: "Inception", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=500&auto=format&fit=crop", rating: 8.8 },
    { id: 3, title: "Interstellar", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500&auto=format&fit=crop", rating: 8.6 },
    { id: 4, title: "Avengers: Endgame", image: "https://images.unsplash.com/photo-1560169856-c3042e9af583?q=80&w=500&auto=format&fit=crop", rating: 8.4 },
    { id: 5, title: "The Matrix", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=500&auto=format&fit=crop", rating: 8.7 },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section" style={{ backgroundImage: `url(${featuredContent.image})` }}>
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="hero-title">{featuredContent.title}</h1>
          <p className="hero-description">{featuredContent.description}</p>
          <div className="hero-tags">
            {featuredContent.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
          </div>
          <div className="hero-actions">
            <button className="btn-primary flex-center">
              <Play size={20} style={{ marginRight: '8px', fill: 'currentColor' }} /> Play
            </button>
            <button className="btn-secondary flex-center">
              <Info size={20} style={{ marginRight: '8px' }} /> More Info
            </button>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="section container">
        <h2 className="section-title">Trending Now</h2>
        <div className="content-grid">
          {trendingContent.map((item) => (
            <div key={item.id} className="content-card">
              <div className="card-image-wrapper">
                <img src={item.image} alt={item.title} className="card-image" />
                <div className="card-overlay">
                  <div className="card-actions">
                    <button className="icon-btn-small"><Play size={16} /></button>
                    <button className="icon-btn-small"><Plus size={16} /></button>
                  </div>
                </div>
              </div>
              <h3 className="card-title">{item.title}</h3>
              <span className="card-rating">★ {item.rating}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
