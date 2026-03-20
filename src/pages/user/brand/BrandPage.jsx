import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import Navbar from '../../../components/user/header/Header';
import AuthModal from '../auth/AuthPage';
import ProductCard from '../../../components/user/card/ProductCard';
import { GetBrand } from '../../../api/user/brand';
import { ListProduct } from '../../../api/user/product';
import { GetWishlistProductIds } from '../../../api/user/wishlist';
import { useAuth } from '../../../store/context/UserContext';
import "../../../App.css";
import "./BrandPage.css";

const PAGE_SIZE = 12;

const CATEGORIES = [
  { value: '', label: '전체' },
  { value: 'TOP', label: '상의' },
  { value: 'BOTTOM', label: '하의' },
  { value: 'OUTER', label: '아우터' },
  { value: 'DRESS', label: '원피스/세트' },
  { value: 'SHOES', label: '신발' },
  { value: 'BAG', label: '가방' },
];

function BrandPage() {
  const { brandId } = useParams();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const loadingRef = useRef(false);
  const observerRef = useRef(null);

  const mapProduct = (p) => ({
    id: p.id,
    image: p.images?.length > 0 ? p.images[0].imgPath : '',
    brand: p.brandNm,
    name: p.productNm,
    price: p.productPrice?.toLocaleString(),
    _raw: p,
  });

  // 브랜드 정보 로드
  useEffect(() => {
    GetBrand(brandId)
      .then(res => setBrand(res.data))
      .catch(() => setBrand(null));
  }, [brandId]);

  // 카테고리/브랜드 변경 시 상품 초기화 후 재로드
  useEffect(() => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
    setLoading(true);
    loadingRef.current = true;

    ListProduct('', selectedCategory || null, 0, PAGE_SIZE, brandId)
      .then(res => {
        const data = res.data;
        setProducts((data.content || []).map(mapProduct));
        setHasMore(!data.last);
      })
      .finally(() => { setLoading(false); loadingRef.current = false; });
  }, [brandId, selectedCategory]);

  useEffect(() => {
    if (!user) return;
    GetWishlistProductIds().then(setWishlistedIds).catch(() => {});
  }, [user]);

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadingRef.current = true;

    ListProduct('', selectedCategory || null, nextPage, PAGE_SIZE, brandId)
      .then(res => {
        const data = res.data;
        setProducts(prev => [...prev, ...(data.content || []).map(mapProduct)]);
        setHasMore(!data.last);
      })
      .finally(() => { loadingRef.current = false; });
  }, [page, hasMore, brandId, selectedCategory]);

  const sentinelRef = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { threshold: 0.1 });
    observerRef.current.observe(node);
  }, [loadMore]);

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowAuthModal(true)} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* 브랜드 히어로 */}
      {brand && (
        <>
          <div className="brand-hero">
            {brand.imgPath
              ? <img className="brand-hero-img" src={brand.imgPath} alt={brand.brandNm} />
              : <div className="brand-hero-placeholder" />
            }
            <div className="brand-hero-overlay">
              <h1 className="brand-hero-name">{brand.brandNm}</h1>
              {brand.brandLocation && (
                <p className="brand-hero-meta">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {brand.brandLocation}
                </p>
              )}
              {brand.brandNum && (
                <p className="brand-hero-meta">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  {brand.brandNum}
                </p>
              )}
            </div>
          </div>

          {/* 소개글 */}
          {brand.brandDc && (
            <div className="brand-intro">
              <div className="brand-intro-divider" />
              <p className="brand-intro-desc">{brand.brandDc}</p>
            </div>
          )}
        </>
      )}

      {/* 상품 목록 */}
      <div className="brand-products-section">
        {/* 카테고리 필터 */}
        <div className="brand-category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              className={`brand-category-tab ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading && products.length === 0 ? (
          <div className="brand-empty"><p>상품을 불러오는 중...</p></div>
        ) : products.length === 0 ? (
          <div className="brand-empty"><p>등록된 상품이 없습니다.</p></div>
        ) : (
          <>
            <div className="shop-grid">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWished={wishlistedIds.includes(product.id)}
                />
              ))}
            </div>
            {hasMore && <div ref={sentinelRef} style={{ height: '40px' }} />}
          </>
        )}
      </div>
    </div>
  );
}

export default BrandPage;
