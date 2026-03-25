import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from '../../../components/user/header/Header';
import AuthModal from '../auth/AuthPage';
import ProductCard from '../../../components/user/card/ProductCard';
import { ListProduct } from '../../../api/user/product';
import { GetWishlistProductIds } from '../../../api/user/wishlist';
import { useAuth } from '../../../store/context/UserContext';
import "../../../App.css";
import "./ShopPage.css";

const PAGE_SIZE = 12;

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
  const { user } = useAuth();
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!user) return;
    GetWishlistProductIds()
      .then(setWishlistedIds)
      .catch(() => {});
  }, [user]);


  const debounceRef = useRef(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  const mapProduct = (p) => ({
    id: p.id,
    image: p.images?.length > 0 ? p.images[0].imgPath : '',
    brand: p.brandNm,
    name: p.productNm,
    price: p.productPrice?.toLocaleString(),
    category: CATEGORY_KOR[p.category] || p.category,
    _raw: p,
  });

  // 첫 페이지 로드 (검색어·카테고리 변경 시 리셋)
  useEffect(() => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
    setLoading(true);
    loadingRef.current = true;

    const categoryEnum = CATEGORY_MAP[selectedCategory];
    ListProduct(searchQuery, categoryEnum, 0, PAGE_SIZE)
      .then(res => {
        const data = res.data;
        setTotalCount(data.totalElements || 0);
        setProducts((data.content || []).map(mapProduct));
        setHasMore(!data.last);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        loadingRef.current = false;
      });
  }, [searchQuery, selectedCategory]);

  // 다음 페이지 로드
  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);
    loadingRef.current = true;

    const categoryEnum = CATEGORY_MAP[selectedCategory];
    ListProduct(searchQuery, categoryEnum, nextPage, PAGE_SIZE)
      .then(res => {
        const data = res.data;
        setProducts(prev => [...prev, ...(data.content || []).map(mapProduct)]);
        setHasMore(!data.last);
      })
      .catch(() => {})
      .finally(() => {
        loadingRef.current = false;
      });
  }, [page, hasMore, searchQuery, selectedCategory]);

  // IntersectionObserver — 하단 감지 시 다음 페이지 로드
  const sentinelRef = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    }, { threshold: 0.1 });

    observerRef.current.observe(node);
  }, [loadMore]);

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
      {loading && products.length === 0 ? (
        <div className="shop-empty"><p>상품을 불러오는 중...</p></div>
      ) : (
        <>
          <div className="shop-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} isWished={wishlistedIds.includes(product.id)} />
            ))}
          </div>

          {/* 무한 스크롤 감지 영역 */}
          {hasMore && products.length > 0 && (
            <div ref={sentinelRef} className="shop-scroll-sentinel">
              <div className="shop-spinner" />
            </div>
          )}
        </>
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
