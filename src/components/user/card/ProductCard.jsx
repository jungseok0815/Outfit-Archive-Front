import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../store/context/UserContext";
import { ToggleWishlist } from "../../../api/user/wishlist";
import "./Card.css";

function ProductCard({ product, rank, isWished = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(isWished);

  useEffect(() => {
    setWishlisted(isWished);
  }, [isWished]);

  const handleClick = () => {
    navigate(`/shop/${product.id}`, { state: { product: product._raw || product } });
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!user) return;
    ToggleWishlist(product.id)
      .then(res => setWishlisted(res.data.wished))
      .catch(() => {});
  };

  return (
    <div className="card" onClick={handleClick}>
      {rank && <div className="card-rank">{rank}</div>}
      {user && (
        <button className={`card-wishlist-btn ${wishlisted ? 'active' : ''}`} onClick={handleWishlistClick}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "#e74c3c" : "none"} stroke={wishlisted ? "#e74c3c" : "#ffffff"} strokeWidth="2.5">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      )}
      <div className="card-image">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="card-body">
        <span className="card-brand">{product.brand}</span>
        <p className="card-name">{product.name}</p>
        <span className="card-price">{product.price}원</span>
      </div>
    </div>
  );
}

export default ProductCard;
