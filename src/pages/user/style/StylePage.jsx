import React, { useState, useEffect, useMemo } from "react";
import Navbar from '../../../components/user/header/Header';
import AuthModal from '../auth/AuthPage';
import StyleCard from '../../../components/user/card/StyleCard';
import { ListPost } from '../../../api/user/post';
import "../../../App.css";
import "./StylePage.css";

const IMG_BASE = 'http://localhost:8080/api/img/get?imgNm=';

const tags = ["전체", "캐주얼", "스트릿", "미니멀", "빈티지", "스포티", "포멀"];

function StylePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState("전체");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    ListPost('', 0, 50)
      .then(res => {
        const items = res.data.content || [];
        setPosts(items.map(p => ({
          id: p.id,
          user: p.userNm,
          avatar: null,
          image: p.images?.length > 0 ? `${IMG_BASE}${p.images[0].imgNm}` : '',
          title: p.title,
          content: p.content || '',
          likes: p.likeCount,
          comments: p.commentCount,
        })));
      })
      .catch(e => console.error('스타일 피드 조회 실패:', e))
      .finally(() => setLoading(false));
  }, []);

  const filteredCards = useMemo(() => {
    if (selectedTag === "전체") return posts;
    return posts.filter(card =>
      card.title?.includes(selectedTag) || card.content?.includes(selectedTag)
    );
  }, [posts, selectedTag]);

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
      {loading ? (
        <div className="style-empty"><p>스타일을 불러오는 중...</p></div>
      ) : (
        <div className="style-grid">
          {filteredCards.map((card) => (
            <StyleCard key={card.id} card={card} />
          ))}
        </div>
      )}

      {!loading && filteredCards.length === 0 && (
        <div className="style-empty">
          <p>해당 태그의 스타일이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default StylePage;
