import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../store/context/UserContext";
import { ToggleWishlist } from "../../../api/user/wishlist";
import "./Card.css";

const formatCount = (n) => {
  if (!n) return '0';
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + '만';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + '천';
  return n.toLocaleString();
};

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

      <div className="card-image">
        <img src={product.image || '/api/placeholder/400/400'} alt={product.name} />
      </div>

      <div className="card-body">
        <div className="card-body-top">
          <div className="card-body-info">
            <span
              className="card-brand"
              onClick={(e) => {
                e.stopPropagation();
                if (product._raw?.brandId) navigate(`/brand/${product._raw.brandId}`);
              }}
            >
              {product.brand}
            </span>
            <p className="card-name">{product.name}</p>
          </div>
          <button
            className={`card-wishlist-btn ${wishlisted ? 'active' : ''}`}
            onClick={handleWishlistClick}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlisted ? "#222" : "none"} stroke="#222" strokeWidth="1.8">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
        <span className="card-price">{product.price}원</span>
        {(product.reviewCount > 0 || product.orderCount > 0) && (
          <div className="card-stats">
            <span>리뷰 {formatCount(product.reviewCount)}</span>
            <span className="card-stats-dot">·</span>
            <span>거래 {formatCount(product.orderCount)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
