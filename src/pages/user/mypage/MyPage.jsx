import React, { useState } from "react";
import Navbar from "../../../components/user/header/Header";
import AuthModal from "../auth/AuthPage";
import PostCreateModal from "./PostCreateModal";
import PostDetailPanel from "./PostDetailPanel";
import ProductCard from "../../../components/user/card/ProductCard";
import { useAuth } from "../../../store/context/UserContext";
import "../../../App.css";
import "./MyPage.css";

const dummyPosts = [
  { id: 1, images: ["https://via.placeholder.com/400/FF6B6B/ffffff", "https://via.placeholder.com/400/E74C3C/ffffff", "https://via.placeholder.com/400/C0392B/ffffff"], likes: 124, comments: 8 },
  { id: 2, images: ["https://via.placeholder.com/400/4ECDC4/ffffff"], likes: 89, comments: 5 },
  { id: 3, images: ["https://via.placeholder.com/400/45B7D1/ffffff", "https://via.placeholder.com/400/2980B9/ffffff"], likes: 234, comments: 12 },
  { id: 4, images: ["https://via.placeholder.com/400/96CEB4/ffffff"], likes: 56, comments: 3 },
  { id: 5, images: ["https://via.placeholder.com/400/FFEAA7/ffffff", "https://via.placeholder.com/400/F39C12/ffffff", "https://via.placeholder.com/400/E67E22/ffffff"], likes: 178, comments: 9 },
  { id: 6, images: ["https://via.placeholder.com/400/DDA0DD/ffffff"], likes: 67, comments: 4 },
  { id: 7, images: ["https://via.placeholder.com/400/98D8C8/ffffff", "https://via.placeholder.com/400/1ABC9C/ffffff"], likes: 312, comments: 21 },
  { id: 8, images: ["https://via.placeholder.com/400/F7DC6F/ffffff"], likes: 45, comments: 2 },
  { id: 9, images: ["https://via.placeholder.com/400/BB8FCE/ffffff", "https://via.placeholder.com/400/8E44AD/ffffff"], likes: 198, comments: 14 },
];

const dummyPostProducts = [
  {
    postId: 1,
    postImage: "https://via.placeholder.com/400/FF6B6B/ffffff",
    date: "2025.02.10",
    totalPurchases: 17,
    earnedPoints: 1700,
    products: [
      { id: 1, image: "https://via.placeholder.com/100/222222", brand: "Nike", name: "Air Force 1 '07 Low White", price: "139,000", purchases: 12 },
      { id: 2, image: "https://via.placeholder.com/100/333333", brand: "Levi's", name: "501 Original Fit Jeans", price: "89,000", purchases: 5 },
    ],
  },
  {
    postId: 3,
    postImage: "https://via.placeholder.com/400/45B7D1/ffffff",
    date: "2025.02.05",
    totalPurchases: 24,
    earnedPoints: 2400,
    products: [
      { id: 3, image: "https://via.placeholder.com/100/444444", brand: "New Balance", name: "993 Made in USA Grey", price: "259,000", purchases: 15 },
      { id: 4, image: "https://via.placeholder.com/100/555555", brand: "Stussy", name: "Basic Logo Hoodie Black", price: "169,000", purchases: 6 },
      { id: 5, image: "https://via.placeholder.com/100/666666", brand: "Carhartt WIP", name: "OG Active Jacket", price: "289,000", purchases: 3 },
    ],
  },
  {
    postId: 5,
    postImage: "https://via.placeholder.com/400/FFEAA7/ffffff",
    date: "2025.01.28",
    totalPurchases: 8,
    earnedPoints: 800,
    products: [
      { id: 6, image: "https://via.placeholder.com/100/777777", brand: "Acne Studios", name: "Face Patch Beanie", price: "180,000", purchases: 8 },
    ],
  },
  {
    postId: 7,
    postImage: "https://via.placeholder.com/400/98D8C8/ffffff",
    date: "2025.01.20",
    totalPurchases: 31,
    earnedPoints: 3100,
    products: [
      { id: 7, image: "https://via.placeholder.com/100/888888", brand: "Adidas", name: "Samba OG Cloud White", price: "129,000", purchases: 22 },
      { id: 8, image: "https://via.placeholder.com/100/999999", brand: "Maison Kitsune", name: "Fox Head Patch T-Shirt", price: "145,000", purchases: 9 },
    ],
  },
];

const dummyPointUsage = [
  { id: 1, date: "2025.02.09", description: "Nike Air Force 1 '07 할인 적용", amount: -1200, category: "상품 구매" },
  { id: 2, date: "2025.02.04", description: "시즌 한정 이벤트 응모", amount: -300, category: "이벤트" },
  { id: 3, date: "2025.01.30", description: "Adidas Samba OG 할인 적용", amount: -600, category: "상품 구매" },
  { id: 4, date: "2025.01.22", description: "프리미엄 스타일링 리포트 열람", amount: -200, category: "콘텐츠" },
  { id: 5, date: "2025.01.15", description: "럭키드로우 참여", amount: -200, category: "이벤트" },
];

const dummySaved = [
  { id: 1, image: "https://via.placeholder.com/300/222222", brand: "Nike", name: "Air Force 1 '07 Low White", price: "139,000" },
  { id: 2, image: "https://via.placeholder.com/300/333333", brand: "Adidas", name: "Samba OG Cloud White", price: "129,000" },
  { id: 3, image: "https://via.placeholder.com/300/444444", brand: "New Balance", name: "993 Made in USA Grey", price: "259,000" },
  { id: 4, image: "https://via.placeholder.com/300/555555", brand: "Stussy", name: "Basic Logo Hoodie Black", price: "169,000" },
  { id: 5, image: "https://via.placeholder.com/300/666666", brand: "Carhartt WIP", name: "OG Active Jacket", price: "289,000" },
  { id: 6, image: "https://via.placeholder.com/300/777777", brand: "Acne Studios", name: "Face Patch Beanie", price: "180,000" },
];

function MyPage() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);

  // TODO: 로그인 구현 후 아래 주석 해제
  // if (!user) {
  //   return (
  //     <div className="app">
  //       <Navbar onLoginClick={() => setShowAuthModal(true)} />
  //       {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
  //       <div className="mypage-login-prompt">
  //         <h2>로그인이 필요합니다</h2>
  //         <p>마이페이지를 이용하려면 로그인해주세요.</p>
  //         <button className="mypage-login-btn" onClick={() => setShowAuthModal(true)}>
  //           로그인
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  const displayName = user ? user.userNm : "Guest";

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowAuthModal(true)} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showPostModal && <PostCreateModal onClose={() => setShowPostModal(false)} />}
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
              <strong>12</strong> <span>게시물</span>
            </div>
            <div className="mypage-stat">
              <strong>234</strong> <span>팔로워</span>
            </div>
            <div className="mypage-stat">
              <strong>56</strong> <span>팔로잉</span>
            </div>
          </div>
          <p className="mypage-bio">
            패션을 사랑하는 사람 | Outfit Archive
          </p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mypage-tabs">
        <button
          className={`mypage-tab ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
          </svg>
          게시물
        </button>
        <button
          className={`mypage-tab ${activeTab === "saved" ? "active" : ""}`}
          onClick={() => setActiveTab("saved")}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.536A.5.5 0 014 22.143V3a1 1 0 011-1z" />
          </svg>
          저장됨
        </button>
        <button
          className={`mypage-tab ${activeTab === "points" ? "active" : ""}`}
          onClick={() => setActiveTab("points")}
        >
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
          {dummyPosts.map((post) => (
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

      {/* 저장됨 탭 */}
      {activeTab === "saved" && (
        <div className="mypage-saved-grid">
          {dummySaved.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* 포인트현황 탭 */}
      {activeTab === "points" && (
        <div className="mypage-points">
          {/* 상단 요약 카드 2개 */}
          <div className="mypage-points-cards">
            {/* 게시물 포인트 현황 */}
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
                <div className="mypage-points-card-row">
                  <span>구매 유도 건수</span>
                  <strong>80건</strong>
                </div>
                <div className="mypage-points-card-row">
                  <span>이번 달 적립</span>
                  <strong className="earn">+2,100 P</strong>
                </div>
                <div className="mypage-points-card-row">
                  <span>태그 상품 수</span>
                  <strong>8개</strong>
                </div>
              </div>
            </div>

            {/* 포인트 사용현황 */}
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
                <div className="mypage-points-card-row">
                  <span>총 사용</span>
                  <strong className="spend">-2,500 P</strong>
                </div>
                <div className="mypage-points-card-row">
                  <span>상품 구매 사용</span>
                  <strong className="spend">-1,800 P</strong>
                </div>
                <div className="mypage-points-card-row">
                  <span>이벤트 사용</span>
                  <strong className="spend">-700 P</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 게시물별 상품 현황 */}
          <div className="mypage-post-products">
            <h3 className="mypage-post-products-title">내 게시물 상품 현황</h3>
            {dummyPostProducts.map((post) => (
              <div key={post.postId} className="mypage-post-card">
                <div className="mypage-post-card-header">
                  <img className="mypage-post-card-thumb" src={post.postImage} alt={`게시물 ${post.postId}`} />
                  <div className="mypage-post-card-info">
                    <span className="mypage-post-card-name">게시물 #{post.postId}</span>
                    <span className="mypage-post-card-date">{post.date}</span>
                  </div>
                  <div className="mypage-post-card-stats">
                    <span className="mypage-post-card-purchases">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 11V3H8v6H2v12h20V11h-6zm-6-6h4v14h-4V5zm-6 8h4v6H4v-6zm16 6h-4v-8h4v8z" />
                      </svg>
                      {post.totalPurchases}건 구매
                    </span>
                    <span className="mypage-post-card-earned">+{post.earnedPoints.toLocaleString()} P</span>
                  </div>
                </div>
                <div className="mypage-post-card-products">
                  {post.products.map((product) => (
                    <div key={product.id} className="mypage-post-product-row">
                      <img className="mypage-post-product-img" src={product.image} alt={product.name} />
                      <div className="mypage-post-product-info">
                        <span className="mypage-post-product-brand">{product.brand}</span>
                        <span className="mypage-post-product-name">{product.name}</span>
                        <span className="mypage-post-product-price">₩{product.price}</span>
                      </div>
                      <div className="mypage-post-product-purchase">
                        <strong>{product.purchases}명</strong>
                        <span>구매</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 포인트 사용현황 */}
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
