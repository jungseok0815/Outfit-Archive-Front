import React from "react";
import "./Card.css";

function StyleCard({ card, onClick, onLike }) {
  return (
    <div className="card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="card-image">
        <img src={card.image} alt={card.title} />
      </div>
      <div className="card-body">
        <div className="card-user">
          {card.avatar
            ? <img src={card.avatar} alt={card.user} className="card-avatar" />
            : <span className="card-avatar-default" />
          }
          <span className="card-username">{card.user}</span>
        </div>
        <h3 className="card-title">{card.title}</h3>
        <div className="card-stats">
          <button
            className={`card-like-btn ${card.liked ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onLike?.(); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={card.liked ? "#e74c3c" : "none"} stroke={card.liked ? "#e74c3c" : "currentColor"} strokeWidth="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {card.likes}
          </button>
          <span>💬 {card.comments}</span>
        </div>
      </div>
    </div>
  );
}

export default StyleCard;
