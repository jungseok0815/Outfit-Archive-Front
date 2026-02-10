import React from "react";
import "./Card.css";

function ProductCard({ product, rank }) {
  return (
    <div className="card">
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
