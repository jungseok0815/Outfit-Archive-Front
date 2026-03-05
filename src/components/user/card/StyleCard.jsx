import React from "react";
import "./Card.css";

function StyleCard({ card, onClick }) {
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
          <span>❤️ {card.likes}</span>
          <span>💬 {card.comments}</span>
        </div>
      </div>
    </div>
  );
}

export default StyleCard;
