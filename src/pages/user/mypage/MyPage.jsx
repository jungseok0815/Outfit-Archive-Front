import React, { useState, useEffect } from "react";
import Navbar from "../../../components/user/header/Header";
import AuthModal from "../auth/AuthPage";
import PostCreateModal from "./PostCreateModal";
import PostDetailPanel from "./PostDetailPanel";
import { useAuth } from "../../../store/context/UserContext";
import { ListPost } from '../../../api/user/post';
import "../../../App.css";
import "./MyPage.css";

const IMG_BASE = 'http://localhost:8080/api/img/get?imgNm=';

const dummyPointUsage = [
  { id: 1, date: "2025.02.09", description: "Nike Air Force 1 '07 할인 적용", amount: -1200, category: "상품 구매" },
  { id: 2, date: "2025.02.04", description: "시즌 한정 이벤트 응모", amount: -300, category: "이벤트" },
  { id: 3, date: "2025.01.30", description: "Adidas Samba OG 할인 적용", amount: -600, category: "상품 구매" },
  { id: 4, date: "2025.01.22", description: "프리미엄 스타일링 리포트 열람", amount: -200, category: "콘텐츠" },
  { id: 5, date: "2025.01.15", description: "럭키드로우 참여", amount: -200, category: "이벤트" },
];

function MyPage() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);

  const loadPosts = () => {
    ListPost('', 0, 100)
      .then(res => {
        const all = res.data.content || [];
        // 현재 로그인 사용자의 게시물만 필터
        const myPosts = user
          ? all.filter(p => p.userNm === user.userNm)
          : all;
        setPosts(myPosts.map(p => ({
          id: p.id,
          images: p.images?.length > 0
            ? p.images.map(img => `${IMG_BASE}${img.imgNm}`)
            : [''],
          likes: p.likeCount,
          comments: p.commentCount,
          title: p.title,
          content: p.content,
          userNm: p.userNm,
        })));
      })
      .catch(e => console.error('게시물 조회 실패:', e));
  };

  useEffect(() => {
    loadPosts();
  }, [user]);

  const displayName = user ? user.userNm : "Guest";

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowAuthModal(true)} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showPostModal && (
        <PostCreateModal
          onClose={() => setShowPostModal(false)}
          onSuccess={loadPosts}
        />
      )}
      {selectedPost && <PostDetailPanel post={selectedPost} onClose={() => setSelectedPost(null)} />}

      {/* 프로필 헤더 */}
      <div className="mypage-profile">
        <img
          className="mypage-avatar"
          src="https://via.placeholder.com/80/d5d5d5/999999?text=ME"
          alt="프로필"
        />
        <div className="mypage-info">
          <div className="mypage-info-header">
            <h2 className="mypage-username">{displayName}</h2>
            <button className="mypage-edit-btn">프로필 편집</button>
          </div>
          <div className="mypage-stats">
            <div className="mypage-stat">
              <strong>{posts.length}</strong> <span>게시물</span>
            </div>
            <div className="mypage-stat">
              <strong>234</strong> <span>팔로워</span>
            </div>
            <div className="mypage-stat">
              <strong>56</strong> <span>팔로잉</span>
            </div>
          </div>
          <p className="mypage-bio">패션을 사랑하는 사람 | Outfit Archive</p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mypage-tabs">
        <button className={`mypage-tab ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
          </svg>
          게시물
        </button>
        <button className={`mypage-tab ${activeTab === "points" ? "active" : ""}`} onClick={() => setActiveTab("points")}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.5v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.65c.1 1.7 1.36 2.66 2.85 2.97V19h1.72v-1.67c1.52-.29 2.72-1.16 2.72-2.74 0-2.22-1.86-2.97-3.63-3.45z" />
          </svg>
          포인트현황
        </button>
      </div>

      {/* 게시물 탭 */}
      {activeTab === "posts" && (
        <div className="mypage-grid">
          <button className="mypage-add-post-btn" onClick={() => setShowPostModal(true)}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>새 게시물</span>
          </button>
          {posts.map((post) => (
            <div key={post.id} className="mypage-grid-item" onClick={() => setSelectedPost(post)}>
              <img src={post.images[0]} alt={`게시물 ${post.id}`} />
              <div className="mypage-grid-overlay">
                <div className="mypage-grid-stat">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {post.likes}
                </div>
                <div className="mypage-grid-stat">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                  </svg>
                  {post.comments}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 포인트현황 탭 */}
      {activeTab === "points" && (
        <div className="mypage-points">
          <div className="mypage-points-cards">
            <div className="mypage-points-card">
              <h4 className="mypage-points-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11V3H8v6H2v12h20V11h-6zm-6-6h4v14h-4V5zm-6 8h4v6H4v-6zm16 6h-4v-8h4v8z" />
                </svg>
                게시물 포인트 현황
              </h4>
              <div className="mypage-points-card-main">
                <span className="mypage-points-card-label">총 적립 포인트</span>
                <strong className="mypage-points-card-value earn">+8,000 P</strong>
              </div>
              <div className="mypage-points-card-rows">
                <div className="mypage-points-card-row"><span>구매 유도 건수</span><strong>80건</strong></div>
                <div className="mypage-points-card-row"><span>이번 달 적립</span><strong className="earn">+2,100 P</strong></div>
                <div className="mypage-points-card-row"><span>태그 상품 수</span><strong>8개</strong></div>
              </div>
            </div>
            <div className="mypage-points-card">
              <h4 className="mypage-points-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.5v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.65c.1 1.7 1.36 2.66 2.85 2.97V19h1.72v-1.67c1.52-.29 2.72-1.16 2.72-2.74 0-2.22-1.86-2.97-3.63-3.45z" />
                </svg>
                포인트 사용현황
              </h4>
              <div className="mypage-points-card-main">
                <span className="mypage-points-card-label">보유 포인트</span>
                <strong className="mypage-points-card-value">5,500 P</strong>
              </div>
              <div className="mypage-points-card-rows">
                <div className="mypage-points-card-row"><span>총 사용</span><strong className="spend">-2,500 P</strong></div>
                <div className="mypage-points-card-row"><span>상품 구매 사용</span><strong className="spend">-1,800 P</strong></div>
                <div className="mypage-points-card-row"><span>이벤트 사용</span><strong className="spend">-700 P</strong></div>
              </div>
            </div>
          </div>

          <div className="mypage-usage-section">
            <h3 className="mypage-usage-title">포인트 사용현황</h3>
            <div className="mypage-usage-list">
              {dummyPointUsage.map((item) => (
                <div key={item.id} className="mypage-usage-item">
                  <div className="mypage-usage-item-left">
                    <span className="mypage-usage-category">{item.category}</span>
                    <span className="mypage-usage-desc">{item.description}</span>
                    <span className="mypage-usage-date">{item.date}</span>
                  </div>
                  <span className="mypage-usage-amount">{item.amount.toLocaleString()} P</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage;
