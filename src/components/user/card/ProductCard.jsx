import React from "react";
import { useNavigate } from "react-router-dom";
import "./Card.css";

function ProductCard({ product, rank }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/shop/${product.id}`, { state: { product: product._raw || product } });
  };

  return (
    <div className="card" onClick={handleClick}>
      {rank && <div className="card-rank">{rank}</div>}
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
