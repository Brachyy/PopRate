import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Plus, ThumbsUp, MessageSquare, Share2, Send, Check, User } from 'lucide-react';
import { getDetails, getImageUrl } from '../services/api';
import { useList } from '../context/ListContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import './Details.css';

const Details = () => {
  const { mediaType, id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, addToWatched, removeFromWatched, isInWatched } = useList();
  const { currentUser } = useAuth();
  
  const [comments, setComments] = useState([
    { id: 1, user: "Alex", text: "This show is absolutely mind-blowing! The 80s vibes are perfect.", time: "2h ago", likes: 24, replies: [] },
    { id: 2, user: "Sarah", text: "Can't wait for the next season!", time: "5h ago", likes: 12, replies: [] },
  ]);
  const [newComment, setNewComment] = useState("");
  const [showTrailer, setShowTrailer] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getDetails(mediaType || 'movie', id);
        setContent(data);
      } catch (error) {
        console.error("Failed to fetch details", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [mediaType, id]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    
    setComments([
      { 
        id: Date.now(), 
        user: currentUser.displayName || "User", 
        text: newComment, 
        time: "Just now", 
        likes: 0,
        replies: []
      },
      ...comments
    ]);
    setNewComment("");
  };

  const handleLike = (commentId, isReply = false, parentId = null) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const updateLikes = (items) => {
      return items.map(item => {
        if (item.id === commentId) {
          // Toggle like (simplified logic: just add 1 for now, in real app would track user likes)
          return { ...item, likes: item.likes + 1 };
        }
        if (item.replies) {
          return { ...item, replies: updateLikes(item.replies) };
        }
        return item;
      });
    };

    setComments(updateLikes(comments));
  };

  const handleReply = (commentId, userName = null) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setReplyingTo(commentId);
    setReplyText(userName ? `@${userName} ` : "");
  };

  const submitReply = (commentId) => {
    if (!replyText.trim()) return;

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [
            ...(comment.replies || []),
            {
              id: Date.now(),
              user: currentUser.displayName || "User",
              text: replyText,
              time: "Just now",
              likes: 0
            }
          ]
        };
      }
      return comment;
    });

    setComments(updatedComments);
    setReplyingTo(null);
    setReplyText("");
  };

  if (loading) return <div className="flex-center" style={{height: '100vh'}}>Loading...</div>;
  if (!content) return <div className="flex-center" style={{height: '100vh'}}>Content not found</div>;

  const title = content.title || content.name;
  const releaseDate = content.release_date || content.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const runtime = content.runtime ? `${content.runtime} min` : (content.episode_run_time?.[0] ? `${content.episode_run_time[0]} min` : '');
  const genres = content.genres?.map(g => g.name).join(", ") || "";
  const director = content.credits?.crew?.find(c => c.job === 'Director')?.name || "Unknown";
  const cast = content.credits?.cast?.slice(0, 5).map(c => c.name).join(", ") || "";

  const inWatchlist = isInWatchlist(content.id);
  const inWatched = isInWatched(content.id);

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(content.id);
    } else {
      addToWatchlist({ ...content, media_type: mediaType || 'movie' });
    }
  };

  const handleWatchedToggle = () => {
    if (inWatched) {
      removeFromWatched(content.id);
    } else {
      addToWatched({ ...content, media_type: mediaType || 'movie' });
    }
  };

  const trailer = content.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube");
  const similarContent = content.similar?.results?.filter(item => item.poster_path).slice(0, 6) || [];

  return (
    <div className="details-page">
      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="trailer-modal" onClick={() => setShowTrailer(false)}>
          <div className="trailer-content">
            <button className="close-btn" onClick={() => setShowTrailer(false)}>×</button>
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title="Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="details-hero" style={{ backgroundImage: `url(${getImageUrl(content.backdrop_path)})` }}>
        <div className="details-overlay"></div>
        <div className="container details-content">
          <div className="content-meta">
            <span className="match-score">{content.vote_average?.toFixed(1)} Rating</span>
            <span className="year">{year}</span>
            {runtime && <span className="seasons">{runtime}</span>}
            <span className="quality">HD</span>
          </div>
          
          <h1 className="details-title">{title}</h1>
          
          <div className="details-actions">
            <button className="btn-primary flex-center" onClick={() => setShowTrailer(true)} disabled={!trailer}>
              <Play size={24} style={{ marginRight: '12px', fill: 'currentColor' }} /> {trailer ? 'Play Trailer' : 'No Trailer'}
            </button>
            <button 
              className={`btn-secondary flex-center ${inWatchlist ? 'active' : ''}`} 
              onClick={handleWatchlistToggle}
            >
              {inWatchlist ? <Check size={24} style={{ marginRight: '12px' }} /> : <Plus size={24} style={{ marginRight: '12px' }} />}
              {inWatchlist ? 'In My List' : 'My List'}
            </button>
            <button 
              className={`icon-btn-circle ${inWatched ? 'active' : ''}`}
              onClick={handleWatchedToggle}
              title={inWatched ? "Mark as unwatched" : "Mark as watched"}
            >
              <Check size={20} style={{ opacity: inWatched ? 1 : 0.5 }} />
            </button>
            <button className="icon-btn-circle">
              <ThumbsUp size={20} />
            </button>
            <button className="icon-btn-circle">
              <Share2 size={20} />
            </button>
          </div>

          <p className="details-description">{content.overview}</p>
          
          <div className="details-info">
            <p><strong>Starring:</strong> {cast}</p>
            <p><strong>Director:</strong> {director}</p>
            <p><strong>Genres:</strong> {genres}</p>
          </div>
        </div>
      </div>

      {/* Similar Content Section */}
      {similarContent.length > 0 && (
        <div className="container section">
          <h2 className="section-title">More Like This</h2>
          <div className="content-grid">
            {similarContent.map((item) => (
              <a href={`/details/${mediaType || 'movie'}/${item.id}`} key={item.id} className="content-card">
                <div className="card-image-wrapper">
                  <img 
                    src={getImageUrl(item.poster_path, 'w500')} 
                    alt={item.title || item.name} 
                    className="card-image" 
                    loading="lazy"
                  />
                </div>
                <h3 className="card-title">{item.title || item.name}</h3>
                <span className="card-rating">★ {item.vote_average?.toFixed(1)}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Social Section */}
      <div className="container social-section">
        <h2 className="section-title">Community Discussion</h2>
        
        {/* Comment Input */}
        <form className="comment-form" onSubmit={handleAddComment}>
          <div className="input-wrapper">
            <input 
              type="text" 
              placeholder={currentUser ? "Add a comment..." : "Log in to comment..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!currentUser}
            />
            <button type="button" className="gif-btn">GIF</button>
          </div>
          {currentUser ? (
            <button type="submit" className="send-btn" disabled={!newComment.trim()}>
              <Send size={20} />
            </button>
          ) : (
            <button type="button" className="send-btn" onClick={() => setIsAuthModalOpen(true)}>
              <User size={20} />
            </button>
          )}
        </form>
        
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

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
                <button className="action-btn" onClick={() => handleLike(comment.id)}>
                  <ThumbsUp size={14} /> {comment.likes}
                </button>
                <button className="action-btn" onClick={() => handleReply(comment.id)}>
                  <MessageSquare size={14} /> Reply
                </button>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="replies-list">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="reply-item">
                      <div className="comment-header">
                        <span className="user-name">{reply.user}</span>
                        <span className="comment-time">{reply.time}</span>
                      </div>
                      <p className="comment-text">{reply.text}</p>
                      <div className="comment-actions">
                        <button className="action-btn" onClick={() => handleLike(reply.id, true, comment.id)}>
                          <ThumbsUp size={12} /> {reply.likes}
                        </button>
                        <button className="action-btn" onClick={() => handleReply(comment.id, reply.user)}>
                          <MessageSquare size={12} /> Reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="reply-input-wrapper">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    autoFocus
                    className="reply-input"
                  />
                  <div className="reply-actions">
                    <button className="btn-primary btn-sm" onClick={() => submitReply(comment.id)}>Send</button>
                    <button className="btn-secondary btn-sm" onClick={() => setReplyingTo(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Details;
