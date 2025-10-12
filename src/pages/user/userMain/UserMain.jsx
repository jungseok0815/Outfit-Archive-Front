
import React, { useState, useEffect } from "react";
import axios from 'axios';
import Navbar from '../../../components/user/header/Header'; // 상단 네비게이션
import "../../../App.css";
import "./UserMain.css";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [nextIndex, setNextIndex] = useState(0);
  const [direction, setDirection] = useState('next'); // 'next' or 'prev'

  const allFeedItems = [
    {
      id: 1,
      user: "사용자1",
      image: "https://via.placeholder.com/400/FF6B6B",
      title: "오늘의 코디",
      description: "깔끔한 캐주얼 룩",
      likes: 24,
      comments: 5
    },
    {
      id: 2,
      user: "사용자2",
      image: "https://via.placeholder.com/400/4ECDC4",
      title: "가을 스타일",
      description: "따뜻한 느낌의 레이어드 룩",
      likes: 45,
      comments: 12
    },
    {
      id: 3,
      user: "사용자3",
      image: "https://via.placeholder.com/400/45B7D1",
      title: "스트리트 패션",
      description: "힙한 스트리트 무드",
      likes: 38,
      comments: 8
    },
    {
      id: 4,
      user: "사용자4",
      image: "https://via.placeholder.com/400/FFA07A",
      title: "미니멀 룩",
      description: "심플한 데일리 룩",
      likes: 52,
      comments: 15
    },
    {
      id: 5,
      user: "사용자5",
      image: "https://via.placeholder.com/400/98D8C8",
      title: "비즈니스 캐주얼",
      description: "세련된 오피스 룩",
      likes: 67,
      comments: 20
    },
    {
      id: 6,
      user: "사용자6",
      image: "https://via.placeholder.com/400/F7B731",
      title: "빈티지 스타일",
      description: "레트로 감성 가득",
      likes: 31,
      comments: 7
    },
    {
      id: 7,
      user: "사용자7",
      image: "https://via.placeholder.com/400/5F27CD",
      title: "스포티 룩",
      description: "활동적인 스포츠웨어",
      likes: 41,
      comments: 9
    },
    {
      id: 8,
      user: "사용자8",
      image: "https://via.placeholder.com/400/00D2D3",
      title: "데이트 룩",
      description: "로맨틱한 분위기",
      likes: 89,
      comments: 25
    }
  ];

  const visibleCount = 4;
  const currentItems = allFeedItems.slice(currentIndex, currentIndex + visibleCount);
  const nextItems = allFeedItems.slice(nextIndex, nextIndex + visibleCount);

  // 버튼 표시 여부 결정
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < allFeedItems.length - visibleCount;

  useEffect(() => {
    // 컴포넌트 마운트 시 한 번만 실행
    checkAuth();
  }, []); // 빈 배열을 전달하여 최초 1회만 실행

  const handlePrevClick = () => {
    if (isSliding) return; // 슬라이딩 중이면 무시

    const prevIdx = currentIndex - 1;
    const finalPrevIndex = prevIdx < 0 ? allFeedItems.length - 1 : prevIdx;

    setDirection('prev');
    setNextIndex(finalPrevIndex);
    setIsSliding(true);

    setTimeout(() => {
      setCurrentIndex(finalPrevIndex);
      setIsSliding(false);
    }, 600);
  };

  const handleNextClick = () => {
    if (isSliding) return; // 슬라이딩 중이면 무시

    const nextIdx = currentIndex + 1;
    const finalNextIndex = nextIdx >= allFeedItems.length ? 0 : nextIdx;

    setDirection('next');
    setNextIndex(finalNextIndex);
    setIsSliding(true);

    setTimeout(() => {
      setCurrentIndex(finalNextIndex);
      setIsSliding(false);
    }, 600);
  };

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
      <Navbar />

      {/* 검색바 영역 */}
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="검색어를 입력하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* 피드 리스트 영역 */}
      <div className="feed-container">
        {/* 더보기 버튼 */}
        <button className="view-more-button">더보기</button>

        <div className="feed-navigation-wrapper">
          {/* 좌측 버튼 */}
          <button
            onClick={handlePrevClick}
            className={`nav-button nav-button-left ${!canGoPrev ? 'nav-button-hidden' : ''}`}
            disabled={isSliding || !canGoPrev}
          >
            &#8249;
          </button>

          <div className="feed-grid-wrapper">
            <div
              key={`current-${currentIndex}`}
              className={`feed-grid ${isSliding ? (direction === 'next' ? 'slide-out-left' : 'slide-out-right') : ''}`}
            >
              {currentItems.map((item) => (
                <div key={item.id} className="feed-item">
                  <div className="feed-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="feed-content">
                    <div className="feed-user">{item.user}</div>
                    <h3 className="feed-title">{item.title}</h3>
                    <p className="feed-description">{item.description}</p>
                    <div className="feed-stats">
                      <span className="feed-likes">❤️ {item.likes}</span>
                      <span className="feed-comments">💬 {item.comments}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isSliding && (
              <div
                key={`next-${nextIndex}`}
                className={`feed-grid ${direction === 'next' ? 'slide-in-right' : 'slide-in-left'}`}
              >
                {nextItems.map((item) => (
                  <div key={item.id} className="feed-item">
                    <div className="feed-image">
                      <img src={item.image} alt={item.title} />
                    </div>
                    <div className="feed-content">
                      <div className="feed-user">{item.user}</div>
                      <h3 className="feed-title">{item.title}</h3>
                      <p className="feed-description">{item.description}</p>
                      <div className="feed-stats">
                        <span className="feed-likes">❤️ {item.likes}</span>
                        <span className="feed-comments">💬 {item.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 우측 버튼 */}
          <button
            onClick={handleNextClick}
            className={`nav-button nav-button-right ${!canGoNext ? 'nav-button-hidden' : ''}`}
            disabled={isSliding || !canGoNext}
          >
            &#8250;
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;