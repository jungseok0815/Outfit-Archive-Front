import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from '../../../components/user/header/Header';
import AuthModal from '../auth/AuthPage';
import StyleCard from '../../../components/user/card/StyleCard';
import PostDetailPanel from '../mypage/PostDetailPanel';
import { ListPost, ToggleLike } from '../../../api/user/post';
import { useAuth } from '../../../store/context/UserContext';
import "../../../App.css";
import "./StylePage.css";

const PAGE_SIZE = 12;

function StylePage() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  const debounceRef = useRef(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  const mapPost = (p) => ({
    id: p.id,
    userId: p.userId,
    user: p.userNm,
    avatar: p.profileImgNm || null,
    image: p.images?.length > 0 ? p.images[0].imgPath : '',
    images: p.images?.length > 0 ? p.images.map(img => img.imgPath) : [],
    title: p.title,
    content: p.content || '',
    likes: p.likeCount,
    liked: p.liked || false,
    comments: p.commentCount,
    products: p.products || [],
  });

  // 첫 페이지 로드 (검색어 변경 시 리셋)
  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
    setLoading(true);
    loadingRef.current = true;

    ListPost(searchTerm, 0, PAGE_SIZE)
      .then(res => {
        const data = res.data;
        setPosts((data.content || []).map(mapPost));
        setHasMore(!data.last);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        loadingRef.current = false;
      });
  }, [searchTerm]);

  // 다음 페이지 로드
  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);
    loadingRef.current = true;

    ListPost(searchTerm, nextPage, PAGE_SIZE)
      .then(res => {
        const data = res.data;
        setPosts(prev => [...prev, ...(data.content || []).map(mapPost)]);
        setHasMore(!data.last);
      })
      .catch(() => {})
      .finally(() => {
        loadingRef.current = false;
      });
  }, [page, hasMore, searchTerm]);

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
      setSearchTerm(value);
    }, 400);
  };

  const handleClearSearch = () => {
    setInputValue("");
    setSearchTerm("");
  };

  // 좋아요 토글
  const handleLike = (postId) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    ToggleLike(postId)
      .then(res => {
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, liked: res.data.liked, likes: res.data.likeCount }
            : p
        ));
        if (selectedPost?.id === postId) {
          setSelectedPost(prev => ({
            ...prev,
            liked: res.data.liked,
            likes: res.data.likeCount,
          }));
        }
      })
      .catch(() => {});
  };

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowAuthModal(true)} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {selectedPost && (
        <PostDetailPanel
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* 페이지 헤더 */}
      <div className="style-header">
        <h1 className="style-page-title">Style</h1>
        <p className="style-page-subtitle">다양한 코디와 스타일을 탐색하세요</p>
      </div>

      {/* 검색바 */}
      <div className="style-search-wrap">
        <div className="style-search-bar">
          <svg className="style-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="style-search-input"
            placeholder="제목, 내용, 작성자로 검색"
            value={inputValue}
            onChange={handleInputChange}
          />
          {inputValue && (
            <button className="style-search-clear" onClick={handleClearSearch}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 스타일 카드 그리드 */}
      {loading && posts.length === 0 ? (
        <div className="style-empty"><p>스타일을 불러오는 중...</p></div>
      ) : (
        <>
          <div className="style-grid">
            {posts.map((card) => (
              <StyleCard
                key={card.id}
                card={card}
                onClick={() => setSelectedPost(card)}
                onLike={() => handleLike(card.id)}
              />
            ))}
          </div>

          {/* 무한스크롤 감지 영역 */}
          {hasMore && posts.length > 0 && (
            <div ref={sentinelRef} style={{ height: '40px' }} />
          )}
        </>
      )}

      {!loading && posts.length === 0 && (
        <div className="style-empty">
          <p>{searchTerm ? `"${searchTerm}" 검색 결과가 없습니다.` : '스타일이 없습니다.'}</p>
        </div>
      )}
    </div>
  );
}

export default StylePage;
