import React, { useState } from "react";
import Navbar from '../../../components/user/header/Header';
import AuthModal from '../../auth/AuthPage';
import StyleCard from '../../../components/user/card/StyleCard';
import "../../../App.css";
import "./StylePage.css";

function StylePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState("전체");

  const tags = ["전체", "캐주얼", "스트릿", "미니멀", "빈티지", "스포티", "포멀"];

  const styleCards = [
    { id: 1, user: "min_style", avatar: "https://via.placeholder.com/40/FF6B6B", image: "https://via.placeholder.com/500/FF6B6B", title: "봄 데일리 캐주얼 코디", tag: "캐주얼", likes: 234, comments: 18 },
    { id: 2, user: "street_king", avatar: "https://via.placeholder.com/40/4ECDC4", image: "https://via.placeholder.com/500/4ECDC4", title: "오버사이즈 스트릿 레이어드", tag: "스트릿", likes: 512, comments: 45 },
    { id: 3, user: "simple_look", avatar: "https://via.placeholder.com/40/45B7D1", image: "https://via.placeholder.com/500/45B7D1", title: "올 화이트 미니멀 코디", tag: "미니멀", likes: 389, comments: 27 },
    { id: 4, user: "retro_vibe", avatar: "https://via.placeholder.com/40/FFA07A", image: "https://via.placeholder.com/500/FFA07A", title: "90s 빈티지 무드 셋업", tag: "빈티지", likes: 178, comments: 12 },
    { id: 5, user: "fit_daily", avatar: "https://via.placeholder.com/40/98D8C8", image: "https://via.placeholder.com/500/98D8C8", title: "헬스장 투 카페 스포티룩", tag: "스포티", likes: 445, comments: 33 },
    { id: 6, user: "office_chic", avatar: "https://via.placeholder.com/40/F7B731", image: "https://via.placeholder.com/500/F7B731", title: "비즈니스 캐주얼 가이드", tag: "포멀", likes: 267, comments: 21 },
    { id: 7, user: "daily_ootd", avatar: "https://via.placeholder.com/40/5F27CD", image: "https://via.placeholder.com/500/5F27CD", title: "데님 온 데님 챌린지", tag: "캐주얼", likes: 623, comments: 56 },
    { id: 8, user: "hype_seoul", avatar: "https://via.placeholder.com/40/00D2D3", image: "https://via.placeholder.com/500/00D2D3", title: "서울 스트릿 스냅 모음", tag: "스트릿", likes: 891, comments: 72 },
    { id: 9, user: "mono_lover", avatar: "https://via.placeholder.com/40/E056A0", image: "https://via.placeholder.com/500/E056A0", title: "블랙 앤 화이트 무드보드", tag: "미니멀", likes: 334, comments: 24 },
    { id: 10, user: "thrift_master", avatar: "https://via.placeholder.com/40/7B68EE", image: "https://via.placeholder.com/500/7B68EE", title: "구제샵 하울 & 스타일링", tag: "빈티지", likes: 198, comments: 15 },
    { id: 11, user: "run_fit", avatar: "https://via.placeholder.com/40/20B2AA", image: "https://via.placeholder.com/500/20B2AA", title: "러닝 크루 데일리 웨어", tag: "스포티", likes: 276, comments: 19 },
    { id: 12, user: "suit_up", avatar: "https://via.placeholder.com/40/FF8C00", image: "https://via.placeholder.com/500/FF8C00", title: "여름 린넨 수트 코디", tag: "포멀", likes: 412, comments: 38 },
  ];

  const filteredCards = selectedTag === "전체"
    ? styleCards
    : styleCards.filter((card) => card.tag === selectedTag);

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowAuthModal(true)} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* 페이지 헤더 */}
      <div className="style-header">
        <h1 className="style-page-title">Style</h1>
        <p className="style-page-subtitle">다양한 코디와 스타일을 탐색하세요</p>
      </div>

      {/* 태그 필터 */}
      <div className="style-tags">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`style-tag ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 스타일 카드 그리드 */}
      <div className="style-grid">
        {filteredCards.map((card) => (
          <StyleCard key={card.id} card={card} />
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="style-empty">
          <p>해당 태그의 스타일이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default StylePage;
