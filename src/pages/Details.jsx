import React, { useState } from 'react';
import { Play, Plus, ThumbsUp, MessageSquare, Share2, Send } from 'lucide-react';
import './Details.css';

const Details = () => {
  // Mock Data
  const content = {
    title: "Stranger Things",
    rating: "9.2",
    year: "2016",
    seasons: "4 Seasons",
    description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop",
    cast: ["Winona Ryder", "David Harbour", "Finn Wolfhard", "Millie Bobby Brown"],
    director: "The Duffer Brothers",
    genre: ["Sci-Fi", "Horror", "Drama"]
  };

  const [comments, setComments] = useState([
    { id: 1, user: "Alex", text: "This show is absolutely mind-blowing! The 80s vibes are perfect.", time: "2h ago", likes: 24 },
    { id: 2, user: "Sarah", text: "Can't wait for the next season!", time: "5h ago", likes: 12 },
  ]);

  const [newComment, setNewComment] = useState("");

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setComments([
      { id: Date.now(), user: "You", text: newComment, time: "Just now", likes: 0 },
      ...comments
    ]);
    setNewComment("");
  };

  return (
    <div className="details-page">
      {/* Hero Banner */}
      <div className="details-hero" style={{ backgroundImage: `url(${content.image})` }}>
        <div className="details-overlay"></div>
        <div className="container details-content">
          <div className="content-meta">
            <span className="match-score">{content.rating} Match</span>
            <span className="year">{content.year}</span>
            <span className="seasons">{content.seasons}</span>
            <span className="quality">4K Ultra HD</span>
          </div>
          
          <h1 className="details-title">{content.title}</h1>
          
          <div className="details-actions">
            <button className="btn-primary flex-center">
              <Play size={24} style={{ marginRight: '12px', fill: 'currentColor' }} /> Play
            </button>
            <button className="btn-secondary flex-center">
              <Plus size={24} style={{ marginRight: '12px' }} /> My List
            </button>
            <button className="icon-btn-circle">
              <ThumbsUp size={20} />
            </button>
            <button className="icon-btn-circle">
              <Share2 size={20} />
            </button>
          </div>

          <p className="details-description">{content.description}</p>
          
          <div className="details-info">
            <p><strong>Starring:</strong> {content.cast.join(", ")}</p>
            <p><strong>Director:</strong> {content.director}</p>
            <p><strong>Genres:</strong> {content.genre.join(", ")}</p>
          </div>
        </div>
      </div>

      {/* Social Section */}
      <div className="container social-section">
        <h2 className="section-title">Community Discussion</h2>
        
        {/* Comment Input */}
        <form className="comment-form" onSubmit={handleAddComment}>
          <div className="input-wrapper">
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="button" className="gif-btn">GIF</button>
          </div>
          <button type="submit" className="send-btn" disabled={!newComment.trim()}>
            <Send size={20} />
          </button>
        </form>

        {/* Comments List */}
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item glass-panel">
              <div className="comment-header">
                <span className="user-name">{comment.user}</span>
                <span className="comment-time">{comment.time}</span>
              </div>
              <p className="comment-text">{comment.text}</p>
              <div className="comment-actions">
                <button className="action-btn">
                  <ThumbsUp size={14} /> {comment.likes}
                </button>
                <button className="action-btn">
                  <MessageSquare size={14} /> Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Details;
