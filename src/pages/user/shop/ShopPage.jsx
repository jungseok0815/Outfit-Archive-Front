import React, { useState, useEffect, useRef } from "react";
import Navbar from '../../../components/user/header/Header';
import AuthModal from '../auth/AuthPage';
import ProductCard from '../../../components/user/card/ProductCard';
import { ListProduct } from '../../../api/user/product';
import "../../../App.css";
import "./ShopPage.css";

const IMG_BASE = 'http://localhost:8080/api/img/get?imgNm=';

const CATEGORY_MAP = {
  "전체": null,
  "상의": "TOP",
  "하의": "BOTTOM",
  "아우터": "OUTER",
  "원피스": "DRESS",
  "신발": "SHOES",
  "가방": "BAG",
};

const CATEGORY_KOR = {
  TOP: '상의', BOTTOM: '하의', OUTER: '아우터',
  DRESS: '원피스', SHOES: '신발', BAG: '가방',
};

const categories = ["전체", "상의", "하의", "아우터", "원피스", "신발", "가방"];

function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const categoryEnum = CATEGORY_MAP[selectedCategory];
    ListProduct(searchQuery, categoryEnum)
      .then(res => {
        const items = res.data.content || [];
        setTotalCount(res.data.totalElements || 0);
        setProducts(items.map(p => ({
          id: p.id,
          image: p.images?.length > 0 ? `${IMG_BASE}${p.images[0].imgNm}` : '',
          brand: p.brandNm,
          name: p.productNm,
          price: p.productPrice?.toLocaleString(),
          category: CATEGORY_KOR[p.category] || p.category,
        })));
      })
      .catch(e => console.error('상품 조회 실패:', e))
      .finally(() => setLoading(false));
  }, [searchQuery, selectedCategory]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 400);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    setSearchQuery(inputValue);
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
            value={inputValue}
            onChange={handleInputChange}
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

      {/* 상품 수 */}
      <div className="shop-toolbar">
        <span className="shop-count">상품 {totalCount}개</span>
      </div>

      {/* 상품 그리드 */}
      {loading ? (
        <div className="shop-empty"><p>상품을 불러오는 중...</p></div>
      ) : (
        <div className="shop-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="shop-empty">
          <p>검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default ShopPage;
