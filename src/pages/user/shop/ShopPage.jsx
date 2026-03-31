import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from '../../../components/user/header/Header';
import AuthModal from '../auth/AuthPage';
import ProductCard from '../../../components/user/card/ProductCard';
import { ListProduct } from '../../../api/user/product';
import { GetWishlistProductIds } from '../../../api/user/wishlist';
import { RecommendAiProducts, RecommendProducts } from '../../../api/user/recommend';
import { useAuth } from '../../../store/context/UserContext';
import "../../../App.css";
import "./ShopPage.css";

const PAGE_SIZE = 15;

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

  // AI 추천 모드
  const [aiMode, setAiMode] = useState(false);
  const [aiProducts, setAiProducts] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPage, setAiPage] = useState(0);
  const [aiHasMore, setAiHasMore] = useState(true);
  const aiLoadingRef = useRef(false);
  const aiObserverRef = useRef(null);
  const aiPageRef = useRef(0);
  const aiHasMoreRef = useRef(true);

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
    enName: p.productEnNm,
    price: p.productPrice?.toLocaleString(),
    category: CATEGORY_KOR[p.category] || p.category,
    reviewCount: p.reviewCount || 0,
    orderCount: p.orderCount || 0,
    _raw: p,
  });

  const mapAiProduct = (p) => ({
    id: p.productId,
    image: p.imgPath || '',
    brand: p.brandNm,
    name: p.productNm,
    enName: null,
    price: p.productPrice?.toLocaleString(),
    category: CATEGORY_KOR[p.category] || p.category,
    reviewCount: p.reviewCount || 0,
    orderCount: p.orderCount || 0,
    reason: p.reason,
    _raw: { id: p.productId },
  });

  // 첫 페이지 로드 (검색어·카테고리 변경 시 리셋)
  useEffect(() => {
    if (aiMode) return;
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
  }, [searchQuery, selectedCategory, aiMode]);

  // 다음 페이지 로드
  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore || aiMode) return;

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
  }, [page, hasMore, searchQuery, selectedCategory, aiMode]);

  // IntersectionObserver — 하단 감지 시 다음 페이지 로드
  const sentinelRef = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
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

  const AI_PAGE_SIZE = 15;

  const loadAiPage = useCallback((page) => {
    if (aiLoadingRef.current) return;
    if (!aiHasMoreRef.current && page > 0) return;
    aiLoadingRef.current = true;
    setAiLoading(true);
    RecommendAiProducts(AI_PAGE_SIZE, page)
      .then(res => {
        const items = (res.data || []).map(mapAiProduct);
        const hasMore = items.length >= AI_PAGE_SIZE;
        setAiProducts(prev => page === 0 ? items : [...prev, ...items]);
        setAiHasMore(hasMore);
        aiHasMoreRef.current = hasMore;
        setAiPage(page);
        aiPageRef.current = page;
      })
      .catch(() => {
        if (page === 0) setAiProducts([]);
        setAiHasMore(false);
        aiHasMoreRef.current = false;
      })
      .finally(() => {
        setAiLoading(false);
        aiLoadingRef.current = false;
      });
  }, []);

  const handleAiClick = () => {
    if (aiMode) {
      setAiMode(false);
      return;
    }
    if (!user) {
      setAiMode(true);
      return;
    }
    setAiMode(true);
    setAiProducts([]);
    setAiPage(0);
    setAiHasMore(true);
    aiPageRef.current = 0;
    aiHasMoreRef.current = true;
    loadAiPage(0);
  };

  const aiSentinelRef = useCallback(node => {
    if (aiObserverRef.current) {
      aiObserverRef.current.disconnect();
      aiObserverRef.current = null;
    }
    if (!node) return;
    aiObserverRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && aiHasMoreRef.current && !aiLoadingRef.current) {
        loadAiPage(aiPageRef.current + 1);
      }
    }, { threshold: 0.1 });
    aiObserverRef.current.observe(node);
  }, [loadAiPage]);

  const isAiActive = aiMode;

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

      {/* 카테고리 탭 + AI 추천 버튼 */}
      <div className="shop-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-tab ${!isAiActive && selectedCategory === cat ? 'active' : ''}`}
            onClick={() => { setAiMode(false); setSelectedCategory(cat); }}
          >
            {cat}
          </button>
        ))}
        <button className={`shop-ai-btn ${isAiActive ? 'active' : ''}`} onClick={handleAiClick}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          {isAiActive ? '전체 상품 보기' : 'AI 추천 받기'}
        </button>
      </div>

      {/* AI 추천 모드 */}
      {isAiActive ? (
        <>
          {!user ? (
            <div className="shop-ai-login-required">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <p className="shop-ai-login-title">로그인 후 사용 가능합니다</p>
              <p className="shop-ai-login-desc">로그인하면 취향을 분석해 딱 맞는 상품을 추천해드려요</p>
              <button className="shop-ai-login-btn" onClick={() => { setAiMode(false); setShowAuthModal(true); }}>
                로그인하기
              </button>
            </div>
          ) : (
          <>
          <div className="shop-toolbar">
            <span className="shop-ai-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              취향 분석 기반 AI 맞춤 추천
            </span>
          </div>

          {aiLoading && aiProducts.length === 0 ? (
            <div className="shop-empty"><p>AI가 상품을 분석 중이에요...</p></div>
          ) : !aiLoading && aiProducts.length === 0 ? (
            <div className="shop-empty"><p>추천 상품을 불러오지 못했습니다.</p></div>
          ) : (
            <>
              <div className="shop-grid">
                {aiProducts.map((product) => (
                  <div key={product.id} className="shop-ai-card-wrap">
                    <ProductCard product={product} isWished={wishlistedIds.includes(product.id)} />
                    {product.reason && (
                      <div className="shop-ai-reason">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        {product.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {aiHasMore && (
                <div ref={aiSentinelRef} className="shop-scroll-sentinel">
                  {aiLoading && <div className="shop-spinner" />}
                </div>
              )}
            </>
          )}
          </>
          )}
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default ShopPage;
