import React, { useState, useEffect, useMemo } from "react";
import Navbar from '../../../components/user/header/Header';
import AuthModal from '../auth/AuthPage';
import StyleCard from '../../../components/user/card/StyleCard';
import PostDetailPanel from '../mypage/PostDetailPanel';
import { ListPost } from '../../../api/user/post';
import "../../../App.css";
import "./StylePage.css";

function StylePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    setLoading(true);
    ListPost('', 0, 50)
      .then(res => {
        const items = res.data.content || [];
        setPosts(items.map(p => ({
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
        })));
      })
      .catch(e => console.error('스타일 피드 조회 실패:', e))
      .finally(() => setLoading(false));
  }, []);

  const filteredCards = useMemo(() => {
    if (!searchTerm.trim()) return posts;
    const keyword = searchTerm.trim().toLowerCase();
    return posts.filter(card =>
      card.title?.toLowerCase().includes(keyword) ||
      card.content?.toLowerCase().includes(keyword) ||
      card.user?.toLowerCase().includes(keyword)
    );
  }, [posts, searchTerm]);

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
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="style-search-clear" onClick={() => setSearchTerm("")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 스타일 카드 그리드 */}
      {loading ? (
        <div className="style-empty"><p>스타일을 불러오는 중...</p></div>
      ) : (
        <div className="style-grid">
          {filteredCards.map((card) => (
            <StyleCard key={card.id} card={card} onClick={() => setSelectedPost(card)} />
          ))}
        </div>
      )}

      {!loading && filteredCards.length === 0 && (
        <div className="style-empty">
          <p>{searchTerm ? `"${searchTerm}" 검색 결과가 없습니다.` : '스타일이 없습니다.'}</p>
        </div>
      )}
    </div>
  );
}

export default StylePage;
