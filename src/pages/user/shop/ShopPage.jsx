import React, { useState } from "react";
import Navbar from '../../../components/user/header/Header';
import AuthModal from '../../auth/AuthPage';
import ProductCard from '../../../components/user/card/ProductCard';
import "../../../App.css";
import "./ShopPage.css";

function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const categories = ["전체", "신발", "상의", "하의", "아우터", "가방", "액세서리"];

  const allProducts = [
    { id: 1, image: "https://via.placeholder.com/300/222222", brand: "Nike", name: "Air Force 1 '07 Low White", price: "139,000", category: "신발" },
    { id: 2, image: "https://via.placeholder.com/300/333333", brand: "Adidas", name: "Samba OG Cloud White", price: "129,000", category: "신발" },
    { id: 3, image: "https://via.placeholder.com/300/444444", brand: "New Balance", name: "993 Made in USA Grey", price: "259,000", category: "신발" },
    { id: 4, image: "https://via.placeholder.com/300/555555", brand: "Nike", name: "Dunk Low Panda", price: "149,000", category: "신발" },
    { id: 5, image: "https://via.placeholder.com/300/666666", brand: "Stussy", name: "Basic Logo Tee Black", price: "65,000", category: "상의" },
    { id: 6, image: "https://via.placeholder.com/300/777777", brand: "IAB Studio", name: "Pigment Hoodie Grey", price: "89,000", category: "상의" },
    { id: 7, image: "https://via.placeholder.com/300/888888", brand: "Carhartt WIP", name: "OG Detroit Jacket Black", price: "289,000", category: "아우터" },
    { id: 8, image: "https://via.placeholder.com/300/999999", brand: "The North Face", name: "1996 Retro Nuptse Black", price: "369,000", category: "아우터" },
    { id: 9, image: "https://via.placeholder.com/300/aaaaaa", brand: "Levi's", name: "501 Original Fit Medium", price: "109,000", category: "하의" },
    { id: 10, image: "https://via.placeholder.com/300/bbbbbb", brand: "Dickies", name: "874 Work Pants Black", price: "59,000", category: "하의" },
    { id: 11, image: "https://via.placeholder.com/300/cccccc", brand: "Converse", name: "Chuck 70 High Black", price: "95,000", category: "신발" },
    { id: 12, image: "https://via.placeholder.com/300/dddddd", brand: "Salomon", name: "XT-6 Advanced Black", price: "219,000", category: "신발" },
    { id: 13, image: "https://via.placeholder.com/300/eeeeee", brand: "Asics", name: "Gel-1130 Silver White", price: "139,000", category: "신발" },
    { id: 14, image: "https://via.placeholder.com/300/e0e0e0", brand: "Acne Studios", name: "Face Logo Beanie Black", price: "180,000", category: "액세서리" },
    { id: 15, image: "https://via.placeholder.com/300/d0d0d0", brand: "Maison Margiela", name: "5AC Mini Bag White", price: "1,890,000", category: "가방" },
    { id: 16, image: "https://via.placeholder.com/300/c0c0c0", brand: "Musinsa Standard", name: "Crewneck Sweatshirt Grey", price: "34,900", category: "상의" },
  ];

  const filteredProducts = allProducts.filter((product) => {
    const matchCategory = selectedCategory === "전체" || product.category === selectedCategory;
    const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && (searchQuery === "" || matchSearch);
  });

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowAuthModal(true)} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* 페이지 헤더 */}
      <div className="shop-header">
        <h1 className="shop-title">Shop</h1>
        <p className="shop-subtitle">모든 상품을 둘러보세요</p>
      </div>

      {/* 검색바 */}
      <div className="shop-search-container">
        <form onSubmit={handleSearch} className="shop-search-form">
          <svg className="shop-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="shop-search-input"
            placeholder="브랜드, 상품명 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* 카테고리 탭 */}
      <div className="shop-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 상품 수 + 정렬 */}
      <div className="shop-toolbar">
        <span className="shop-count">상품 {filteredProducts.length}개</span>
      </div>

      {/* 상품 그리드 */}
      <div className="shop-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 결과 없음 */}
      {filteredProducts.length === 0 && (
        <div className="shop-empty">
          <p>검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default ShopPage;
