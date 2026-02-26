
import React, { useState, useEffect } from "react";
import Navbar from '../../../components/user/header/Header';
import AuthModal from '../auth/AuthPage';
import StyleCard from '../../../components/user/card/StyleCard';
import ProductCard from '../../../components/user/card/ProductCard';
import { ListPost } from '../../../api/user/post';
import { RecommendProducts } from '../../../api/user/recommend';
import "../../../App.css";
import "./UserMain.css";
import "../../../styles/user/Hero.css";

const IMG_BASE = 'http://localhost:8080/api/img/get?imgNm=';

const heroSlides = [
  { title: "Define Your", highlight: "Style", description: "Discover curated fashion that speaks to your identity", button: "Explore Now" },
  { title: "New Season", highlight: "Collection", description: "The latest trends from the world's finest designers", button: "Shop Collection" },
  { title: "Timeless", highlight: "Elegance", description: "Classic pieces that transcend every season", button: "View Lookbook" }
];

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showAllFeed, setShowAllFeed] = useState(false);
  const [feedItems, setFeedItems] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    ListPost('', 0, 12)
      .then(res => {
        const posts = res.data.content || [];
        setFeedItems(posts.map(p => ({
          id: p.id,
          user: p.userNm,
          avatar: null,
          image: p.images?.length > 0 ? `${IMG_BASE}${p.images[0].imgNm}` : '',
          title: p.title,
          tag: '',
          likes: p.likeCount,
          comments: p.commentCount,
        })));
      })
      .catch(e => console.error('피드 조회 실패:', e));

    RecommendProducts(12)
      .then(res => {
        const products = res.data || [];
        setPopularProducts(products.map(p => ({
          id: p.productId,
          image: '',
          brand: p.brandNm,
          name: p.productNm,
          price: p.productPrice?.toLocaleString(),
        })));
      })
      .catch(e => console.error('추천 상품 조회 실패:', e));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const visibleFeed = showAllFeed ? feedItems : feedItems.slice(0, 4);
  const visibleProducts = showAllProducts ? popularProducts : popularProducts.slice(0, 8);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('검색어:', searchQuery);
  };

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowAuthModal(true)} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* 히어로 섹션 */}
      <div className="hero-container">
        <div className="hero-slider">
          {heroSlides.map((slide, index) => (
            <div key={index} className={`hero-slide ${index === heroIndex ? 'active' : ''}`}>
              <h1>{slide.title} <span>{slide.highlight}</span></h1>
              <p>{slide.description}</p>
              <button>{slide.button}</button>
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
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Search styles, brands, looks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* 피드 섹션 타이틀 */}
      <div className="feed-section-title">
        <h2>Style Feed</h2>
        <div className="feed-section-line"></div>
      </div>

      {/* 피드 리스트 영역 */}
      <div className="feed-container">
        <div className="feed-static-grid">
          {visibleFeed.map((item) => (
            <StyleCard key={item.id} card={item} />
          ))}
        </div>
        {!showAllFeed && feedItems.length > 4 && (
          <div className="feed-more">
            <button className="more-button" onClick={() => setShowAllFeed(true)}>더보기</button>
          </div>
        )}
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
            <ProductCard key={product.id} product={product} rank={index + 1} />
          ))}
        </div>
        {!showAllProducts && popularProducts.length > 8 && (
          <div className="popular-more">
            <button className="more-button" onClick={() => setShowAllProducts(true)}>더보기</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
