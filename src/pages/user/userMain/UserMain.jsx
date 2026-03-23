
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from '../../../components/user/header/Header';
import AuthModal from '../auth/AuthPage';
import StyleCard from '../../../components/user/card/StyleCard';
import ProductCard from '../../../components/user/card/ProductCard';
import PostDetailPanel from '../mypage/PostDetailPanel';
import { ListPost, SearchPost, ToggleLike } from '../../../api/user/post';
import { ListProduct } from '../../../api/user/product';
import { GetWishlistProductIds } from '../../../api/user/wishlist';
import { ListBanner } from '../../../api/user/banner';
import { useAuth } from '../../../store/context/UserContext';
import "../../../App.css";
import "./UserMain.css";
import "../../../styles/user/Hero.css";

const DEFAULT_HERO_SLIDES = [
  { title: "Define Your", highlight: "Style", description: "Discover curated fashion that speaks to your identity", buttonText: "Explore Now" },
  { title: "New Season", highlight: "Collection", description: "The latest trends from the world's finest designers", buttonText: "Shop Collection" },
  { title: "Timeless", highlight: "Elegance", description: "Classic pieces that transcend every season", buttonText: "View Lookbook" }
];

function App() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [heroSlides, setHeroSlides] = useState(DEFAULT_HERO_SLIDES);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [feedItems, setFeedItems] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchTab, setSearchTab] = useState("products");

  // 검색 결과
  const [searchProducts, setSearchProducts] = useState([]);
  const [searchPosts, setSearchPosts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const debounceRef = useRef(null);

  const isSearching = searchKeyword.trim().length > 0;

  useEffect(() => {
    ListBanner()
      .then(res => {
        const active = (res.data || []).filter(b => b.active);
        if (active.length > 0) setHeroSlides(active);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    GetWishlistProductIds().then(setWishlistedIds).catch(() => {});
  }, [user]);

  useEffect(() => {
    ListPost('', 0, 12)
      .then(res => {
        const posts = res.data.content || [];
        setFeedItems(posts.map(p => ({
          id: p.id,
          user: p.userNm,
          avatar: null,
          image: p.images?.length > 0 ? p.images[0].imgPath : '',
          title: p.title,
          likes: p.likeCount,
          liked: p.liked || false,
          comments: p.commentCount,
          products: p.products || [],
        })));
      })
      .catch(() => {});

    ListProduct('', null, 0, 12)
      .then(res => {
        const items = res.data.content || [];
        setPopularProducts(items.map(p => ({
          id: p.id,
          image: p.images?.length > 0 ? p.images[0].imgPath : '',
          brand: p.brandNm,
          name: p.productNm,
          price: p.productPrice?.toLocaleString(),
          _raw: p,
        })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 실시간 검색 (debounce 400ms)
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setSearchProducts([]);
      setSearchPosts([]);
      return;
    }

    setSearchLoading(true);
    Promise.all([
      ListProduct(searchKeyword, null, 0, 12),
      SearchPost(searchKeyword, 0, 12),
    ])
      .then(([productRes, postRes]) => {
        setSearchProducts((productRes.data.content || []).map(p => ({
          id: p.id,
          image: p.images?.length > 0 ? p.images[0].imgPath : '',
          brand: p.brandNm,
          name: p.productNm,
          price: p.productPrice?.toLocaleString(),
          _raw: p,
        })));
        setSearchPosts((postRes.data.content || []).map(p => ({
          id: p.id,
          userId: p.userId,
          user: p.userNm,
          avatar: p.profileImgNm || null,
          image: p.images?.length > 0 ? p.images[0].imgPath : '',
          images: p.images?.map(img => img.imgPath) || [],
          title: p.title,
          content: p.content || '',
          likes: p.likeCount,
          liked: p.liked || false,
          comments: p.commentCount,
          products: p.products || [],
        })));
      })
      .catch(() => {})
      .finally(() => setSearchLoading(false));
  }, [searchKeyword]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchKeyword(value);
    }, 400);
  };

  const handleLike = (postId) => {
    if (!user) { setShowAuthModal(true); return; }
    ToggleLike(postId)
      .then(res => {
        setSearchPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, liked: res.data.liked, likes: res.data.likeCount } : p
        ));
      })
      .catch(() => {});
  };

  const visibleFeed = feedItems.slice(0, 4);
  const visibleProducts = popularProducts.slice(0, 8);

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowAuthModal(true)} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {selectedPost && (
        <PostDetailPanel post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      {/* 히어로 섹션 */}
      <div className="hero-container">
        <div className="hero-slider">
          {heroSlides.map((slide, index) => (
            <div key={index} className={`hero-slide ${index === heroIndex ? 'active' : ''}`}>
              <h1>{slide.title} <span>{slide.highlight}</span></h1>
              <p>{slide.description}</p>
              <button>{slide.buttonText}</button>
            </div>
          ))}
        </div>
        <button className="slider-button prev" onClick={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}>&#8249;</button>
        <button className="slider-button next" onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}>&#8250;</button>
        <div className="slider-dots">
          {heroSlides.map((_, index) => (
            <button key={index} className={`dot ${index === heroIndex ? 'active' : ''}`} onClick={() => setHeroIndex(index)} />
          ))}
        </div>
      </div>

      {/* 검색바 영역 */}
      <div className="search-container">
        <div className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Search styles, brands, looks..."
            value={inputValue}
            onChange={handleInputChange}
          />
          {inputValue && (
            <button
              className="search-clear-btn"
              onClick={() => { setInputValue(""); setSearchKeyword(""); }}
            >✕</button>
          )}
        </div>
      </div>

      {/* 검색 결과 */}
      {isSearching ? (
        <div className="search-result-section">
          <div className="search-result-tabs">
            <button
              className={`search-result-tab ${searchTab === "products" ? "active" : ""}`}
              onClick={() => setSearchTab("products")}
            >
              상품 {searchProducts.length > 0 && `(${searchProducts.length})`}
            </button>
            <button
              className={`search-result-tab ${searchTab === "styles" ? "active" : ""}`}
              onClick={() => setSearchTab("styles")}
            >
              스타일 {searchPosts.length > 0 && `(${searchPosts.length})`}
            </button>
          </div>

          {searchLoading ? (
            <div className="search-empty"><p>검색 중...</p></div>
          ) : searchTab === "products" ? (
            searchProducts.length === 0
              ? <div className="search-empty"><p>"{searchKeyword}"에 해당하는 상품이 없습니다.</p></div>
              : <div className="popular-grid">
                  {searchProducts.map(product => (
                    <ProductCard key={product.id} product={product} isWished={wishlistedIds.includes(product.id)} />
                  ))}
                </div>
          ) : (
            searchPosts.length === 0
              ? <div className="search-empty"><p>"{searchKeyword}" 브랜드가 태그된 스타일이 없습니다.</p></div>
              : <div className="feed-static-grid">
                  {searchPosts.map(card => (
                    <StyleCard
                      key={card.id}
                      card={card}
                      onClick={() => setSelectedPost(card)}
                      onLike={() => handleLike(card.id)}
                    />
                  ))}
                </div>
          )}
        </div>
      ) : (
        <>
          {/* 피드 섹션 */}
          <div className="feed-section-title">
            <h2>Style Feed</h2>
            <div className="feed-section-line"></div>
          </div>
          <div className="feed-container">
            <div className="feed-static-grid">
              {visibleFeed.map((item) => (
                <StyleCard key={item.id} card={item} />
              ))}
            </div>
            <div className="feed-more">
              <button className="more-button" onClick={() => navigate('/style')}>더보기</button>
            </div>
          </div>

          {/* 인기 상품 섹션 */}
          <div className="popular-section">
            <div className="popular-header">
              <h2 className="popular-title">Popular</h2>
              <div className="popular-line"></div>
              <p className="popular-subtitle">지금 가장 많이 찾는 상품</p>
            </div>
            <div className="popular-grid">
              {visibleProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} rank={index + 1} isWished={wishlistedIds.includes(product.id)} />
              ))}
            </div>
            <div className="popular-more">
              <button className="more-button" onClick={() => navigate('/shop')}>더보기</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
