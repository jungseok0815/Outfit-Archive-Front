
import React, { useState, useEffect } from "react";
import axios from 'axios';
import Navbar from '../../../components/user/header/Header';
import AuthModal from '../auth/AuthPage';
import StyleCard from '../../../components/user/card/StyleCard';
import ProductCard from '../../../components/user/card/ProductCard';
import "../../../App.css";
import "./UserMain.css";
import "../../../styles/user/Hero.css";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showAllFeed, setShowAllFeed] = useState(false);

  const popularProducts = [
    { id: 1, image: "https://via.placeholder.com/300/222222", brand: "Nike", name: "Air Force 1 '07 Low White", price: "139,000" },
    { id: 2, image: "https://via.placeholder.com/300/333333", brand: "Adidas", name: "Samba OG Cloud White", price: "129,000" },
    { id: 3, image: "https://via.placeholder.com/300/444444", brand: "New Balance", name: "993 Made in USA Grey", price: "259,000" },
    { id: 4, image: "https://via.placeholder.com/300/555555", brand: "Nike", name: "Dunk Low Panda", price: "149,000" },
    { id: 5, image: "https://via.placeholder.com/300/666666", brand: "Converse", name: "Chuck 70 High Black", price: "95,000" },
    { id: 6, image: "https://via.placeholder.com/300/777777", brand: "Vans", name: "Old Skool Classic", price: "79,000" },
    { id: 7, image: "https://via.placeholder.com/300/888888", brand: "Asics", name: "Gel-1130 Silver", price: "139,000" },
    { id: 8, image: "https://via.placeholder.com/300/999999", brand: "Nike", name: "Air Max 90 White", price: "169,000" },
    { id: 9, image: "https://via.placeholder.com/300/aaaaaa", brand: "Adidas", name: "Gazelle Bold Cream", price: "139,000" },
    { id: 10, image: "https://via.placeholder.com/300/bbbbbb", brand: "New Balance", name: "530 Silver Navy", price: "119,000" },
    { id: 11, image: "https://via.placeholder.com/300/cccccc", brand: "Nike", name: "Jordan 1 Retro High OG", price: "199,000" },
    { id: 12, image: "https://via.placeholder.com/300/dddddd", brand: "Salomon", name: "XT-6 Black", price: "219,000" },
  ];

  const visibleProducts = showAllProducts ? popularProducts : popularProducts.slice(0, 8);

  const heroSlides = [
    {
      title: "Define Your",
      highlight: "Style",
      description: "Discover curated fashion that speaks to your identity",
      button: "Explore Now"
    },
    {
      title: "New Season",
      highlight: "Collection",
      description: "The latest trends from the world's finest designers",
      button: "Shop Collection"
    },
    {
      title: "Timeless",
      highlight: "Elegance",
      description: "Classic pieces that transcend every season",
      button: "View Lookbook"
    }
  ];

  const allFeedItems = [
    { id: 1, user: "사용자1", avatar: "https://via.placeholder.com/40/FF6B6B", image: "https://via.placeholder.com/400/FF6B6B", title: "오늘의 코디", tag: "캐주얼", likes: 24, comments: 5 },
    { id: 2, user: "사용자2", avatar: "https://via.placeholder.com/40/4ECDC4", image: "https://via.placeholder.com/400/4ECDC4", title: "가을 스타일", tag: "스트릿", likes: 45, comments: 12 },
    { id: 3, user: "사용자3", avatar: "https://via.placeholder.com/40/45B7D1", image: "https://via.placeholder.com/400/45B7D1", title: "스트리트 패션", tag: "스트릿", likes: 38, comments: 8 },
    { id: 4, user: "사용자4", avatar: "https://via.placeholder.com/40/FFA07A", image: "https://via.placeholder.com/400/FFA07A", title: "미니멀 룩", tag: "미니멀", likes: 52, comments: 15 },
    { id: 5, user: "사용자5", avatar: "https://via.placeholder.com/40/98D8C8", image: "https://via.placeholder.com/400/98D8C8", title: "비즈니스 캐주얼", tag: "포멀", likes: 67, comments: 20 },
    { id: 6, user: "사용자6", avatar: "https://via.placeholder.com/40/F7B731", image: "https://via.placeholder.com/400/F7B731", title: "빈티지 스타일", tag: "빈티지", likes: 31, comments: 7 },
    { id: 7, user: "사용자7", avatar: "https://via.placeholder.com/40/5F27CD", image: "https://via.placeholder.com/400/5F27CD", title: "스포티 룩", tag: "스포티", likes: 41, comments: 9 },
    { id: 8, user: "사용자8", avatar: "https://via.placeholder.com/40/00D2D3", image: "https://via.placeholder.com/400/00D2D3", title: "데이트 룩", tag: "캐주얼", likes: 89, comments: 25 },
    { id: 9, user: "사용자9", avatar: "https://via.placeholder.com/40/E056A0", image: "https://via.placeholder.com/400/E056A0", title: "모노톤 코디", tag: "미니멀", likes: 56, comments: 14 },
    { id: 10, user: "사용자10", avatar: "https://via.placeholder.com/40/7B68EE", image: "https://via.placeholder.com/400/7B68EE", title: "유니크 레이어드", tag: "빈티지", likes: 73, comments: 18 },
    { id: 11, user: "사용자11", avatar: "https://via.placeholder.com/40/20B2AA", image: "https://via.placeholder.com/400/20B2AA", title: "여름 바캉스 룩", tag: "캐주얼", likes: 95, comments: 30 },
    { id: 12, user: "사용자12", avatar: "https://via.placeholder.com/40/FF8C00", image: "https://via.placeholder.com/400/FF8C00", title: "워크웨어 스타일", tag: "스트릿", likes: 44, comments: 11 },
  ];

  const visibleFeed = showAllFeed ? allFeedItems : allFeedItems.slice(0, 4);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/validate', {
        withCredentials: true // 쿠키 포함
      });
      if (response.data.authenticated) {
        // 인증 성공 처리
        console.log('인증된 사용자:', response.data);
      }
    } catch (error) {
      // 에러 처리
      console.error('인증 체크 실패:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('검색어:', searchQuery);
    // 여기에 검색 로직 추가
  };

  return (
    <div className="app">
      {/* 상단 네비게이션 */}
      <Navbar onLoginClick={() => setShowAuthModal(true)} />

      {/* 로그인/회원가입 모달 */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* 히어로 섹션 */}
      <div className="hero-container">
        <div className="hero-slider">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === heroIndex ? 'active' : ''}`}
            >
              <h1>{slide.title} <span>{slide.highlight}</span></h1>
              <p>{slide.description}</p>
              <button>{slide.button}</button>
            </div>
          ))}
        </div>

        <button
          className="slider-button prev"
          onClick={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
        >
          &#8249;
        </button>
        <button
          className="slider-button next"
          onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
        >
          &#8250;
        </button>

        <div className="slider-dots">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === heroIndex ? 'active' : ''}`}
              onClick={() => setHeroIndex(index)}
            />
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

        {!showAllFeed && (
          <div className="feed-more">
            <button
              className="more-button"
              onClick={() => setShowAllFeed(true)}
            >
              더보기
            </button>
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

        {!showAllProducts && (
          <div className="popular-more">
            <button
              className="more-button"
              onClick={() => setShowAllProducts(true)}
            >
              더보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
