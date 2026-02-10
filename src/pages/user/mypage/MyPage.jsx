import React, { useState } from "react";
import Navbar from "../../../components/user/header/Header";
import AuthModal from "../../auth/AuthPage";
import ProductCard from "../../../components/user/card/ProductCard";
import { useAuth } from "../../../store/context/UserContext";
import "../../../App.css";
import "./MyPage.css";

const dummyPosts = [
  { id: 1, image: "https://via.placeholder.com/400/FF6B6B/ffffff", likes: 124, comments: 8 },
  { id: 2, image: "https://via.placeholder.com/400/4ECDC4/ffffff", likes: 89, comments: 5 },
  { id: 3, image: "https://via.placeholder.com/400/45B7D1/ffffff", likes: 234, comments: 12 },
  { id: 4, image: "https://via.placeholder.com/400/96CEB4/ffffff", likes: 56, comments: 3 },
  { id: 5, image: "https://via.placeholder.com/400/FFEAA7/ffffff", likes: 178, comments: 9 },
  { id: 6, image: "https://via.placeholder.com/400/DDA0DD/ffffff", likes: 67, comments: 4 },
  { id: 7, image: "https://via.placeholder.com/400/98D8C8/ffffff", likes: 312, comments: 21 },
  { id: 8, image: "https://via.placeholder.com/400/F7DC6F/ffffff", likes: 45, comments: 2 },
  { id: 9, image: "https://via.placeholder.com/400/BB8FCE/ffffff", likes: 198, comments: 14 },
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
  const [activeTab, setActiveTab] = useState("posts");

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

      {/* 프로필 헤더 */}
      <div className="mypage-profile">
        <img
          className="mypage-avatar"
          src="https://via.placeholder.com/80/d5d5d5/999999?text=ME"
          alt="프로필"
        />
        <div className="mypage-info">
          <h2 className="mypage-username">{displayName}</h2>
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
          <button className="mypage-edit-btn">프로필 편집</button>
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
      </div>

      {/* 게시물 탭 */}
      {activeTab === "posts" && (
        <div className="mypage-grid">
          {dummyPosts.map((post) => (
            <div key={post.id} className="mypage-grid-item">
              <img src={post.image} alt={`게시물 ${post.id}`} />
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
    </div>
  );
}

export default MyPage;
