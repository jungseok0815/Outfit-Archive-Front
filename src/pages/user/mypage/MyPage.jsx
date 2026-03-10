import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../components/user/header/Header";
import AuthModal from "../auth/AuthPage";
import PostCreateModal from "./PostCreateModal";
import PostDetailPanel from "./PostDetailPanel";
import ProfileEditModal from "./ProfileEditModal";
import FollowListModal from "./FollowListModal";
import { useAuth } from "../../../store/context/UserContext";
import { ListMyPost, ListPost, DeletePost } from '../../../api/user/post';
import { GetFollowCount } from '../../../api/user/follow';
import { UpdateProfileImg, GetUserProfile } from '../../../api/user/auth';
import { GetPoint, GetPointHistory } from '../../../api/user/point';
import "../../../App.css";
import "./MyPage.css";

const IMG_BASE = 'http://localhost:8080/api/img/get?imgNm=';

function MyPage() {
  const { userId: paramUserId } = useParams();
  const { user, login } = useAuth();
  const profileImgInputRef = useRef(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [followCount, setFollowCount] = useState({ followerCount: 0, followingCount: 0 });
  const [followModalType, setFollowModalType] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [pointHistory, setPointHistory] = useState([]);

  // 본인 페이지 여부
  const isOwnPage = !paramUserId || (user && String(user.id) === String(paramUserId));
  const pageUserId = isOwnPage ? user?.id : paramUserId;

  const mapPosts = (all) => all.map(p => ({
    id: p.id,
    images: p.images?.length > 0
      ? p.images.map(img => `${IMG_BASE}${img.imgNm}`)
      : [''],
    rawImages: p.images || [],
    likes: p.likeCount,
    liked: p.liked || false,
    comments: p.commentCount,
    title: p.title,
    content: p.content,
    userNm: p.userNm,
    products: p.products || [],
  }));

  const loadMyPosts = () => {
    ListMyPost(0, 100)
      .then(res => setPosts(mapPosts(res.data.content || [])))
      .catch(e => console.error('게시물 조회 실패:', e));
  };

  const loadUserPosts = (userNm) => {
    ListPost('', 0, 100)
      .then(res => {
        const all = res.data.content || [];
        const filtered = all.filter(p => p.userNm === userNm);
        setPosts(mapPosts(filtered));
      })
      .catch(e => console.error('게시물 조회 실패:', e));
  };

  const handleDelete = (postId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    DeletePost(postId)
      .then(() => {
        setSelectedPost(null);
        loadMyPosts();
      })
      .catch(e => {
        const msg = e.response?.data?.msg || '삭제에 실패했습니다.';
        alert(msg);
      });
  };

  const handleEdit = (post) => {
    setSelectedPost(null);
    setEditingPost(post);
    setShowPostModal(true);
  };

  // 페이지 전환 시 프로필 + 게시물 + 팔로우 수 모두 갱신
  useEffect(() => {
    // 상태 초기화
    setPosts([]);
    setFollowCount({ followerCount: 0, followingCount: 0 });
    setSelectedPost(null);
    setActiveTab("posts");

    if (isOwnPage) {
      setProfileUser(null);
      loadMyPosts();
    } else if (paramUserId) {
      // 프로필 조회 후 해당 유저의 게시물 필터링
      GetUserProfile(paramUserId)
        .then(res => {
          setProfileUser(res.data);
          loadUserPosts(res.data.userNm);
        })
        .catch(() => setProfileUser(null));
    }

    // 팔로우 수 조회
    const targetId = isOwnPage ? user?.id : paramUserId;
    if (targetId) {
      GetFollowCount(targetId)
        .then(res => setFollowCount(res.data))
        .catch(e => console.error('팔로우 수 조회 실패:', e));
    }

    // 포인트 조회 (본인 페이지일 때만)
    if (isOwnPage && user?.id) {
      GetPoint()
        .then(res => setCurrentPoint(res.data.point))
        .catch(e => console.error('포인트 조회 실패:', e));
      GetPointHistory(0, 20)
        .then(res => setPointHistory(res.data.content || []))
        .catch(e => console.error('포인트 내역 조회 실패:', e));
    }
  }, [user, paramUserId]);

  const handleProfileImgChange = (e) => {
    const file = e.target.files[0];
    if (!file || !user?.id) return;
    UpdateProfileImg(user.id, file)
      .then(res => {
        login({ ...user, profileImgNm: res.data.profileImgNm });
      })
      .catch(() => alert('프로필 이미지 변경에 실패했습니다.'));
    e.target.value = '';
  };

  const currentProfile = isOwnPage ? user : profileUser;
  const displayName = currentProfile?.userNm || "";
  const avatarSrc = currentProfile?.profileImgNm ? `${IMG_BASE}${currentProfile.profileImgNm}` : null;

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowAuthModal(true)} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showPostModal && (
        <PostCreateModal
          onClose={() => { setShowPostModal(false); setEditingPost(null); }}
          onSuccess={loadMyPosts}
          editingPost={editingPost}
        />
      )}
      {showProfileEditModal && (
        <ProfileEditModal
          onClose={() => setShowProfileEditModal(false)}
          onSuccess={() => setShowProfileEditModal(false)}
        />
      )}
      {followModalType && (
        <FollowListModal
          userId={pageUserId}
          type={followModalType}
          onClose={() => setFollowModalType(null)}
        />
      )}
      {selectedPost && (
        <PostDetailPanel
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onDelete={isOwnPage ? handleDelete : undefined}
          onEdit={isOwnPage ? handleEdit : undefined}
        />
      )}

      {/* 프로필 헤더 */}
      <div className="mypage-profile">
        {isOwnPage && (
          <input
            type="file"
            accept="image/*"
            ref={profileImgInputRef}
            onChange={handleProfileImgChange}
            style={{ display: 'none' }}
          />
        )}
        <div className={`mypage-avatar-wrap${isOwnPage ? '' : ' mypage-avatar-readonly'}`} onClick={() => isOwnPage && profileImgInputRef.current?.click()}>
          {avatarSrc
            ? <img className="mypage-avatar" src={avatarSrc} alt="프로필" />
            : <div className="mypage-avatar mypage-avatar-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bcbcbc" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
          }
          {isOwnPage && (
            <div className="mypage-avatar-overlay">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          )}
        </div>
        <div className="mypage-info">
          <div className="mypage-info-header">
            <h2 className="mypage-username">{displayName}</h2>
            {isOwnPage && <button className="mypage-edit-btn" onClick={() => setShowProfileEditModal(true)}>프로필 편집</button>}
          </div>
          <div className="mypage-stats">
            <div className="mypage-stat">
              <strong>{posts.length}</strong> <span>게시물</span>
            </div>
            <div className="mypage-stat mypage-stat-clickable" onClick={() => setFollowModalType("follower")}>
              <strong>{followCount.followerCount}</strong> <span>팔로워</span>
            </div>
            <div className="mypage-stat mypage-stat-clickable" onClick={() => setFollowModalType("following")}>
              <strong>{followCount.followingCount}</strong> <span>팔로잉</span>
            </div>
          </div>
          {currentProfile?.bio && <p className="mypage-bio">{currentProfile.bio}</p>}
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
        {isOwnPage && (
          <button className={`mypage-tab ${activeTab === "points" ? "active" : ""}`} onClick={() => setActiveTab("points")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.5v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.65c.1 1.7 1.36 2.66 2.85 2.97V19h1.72v-1.67c1.52-.29 2.72-1.16 2.72-2.74 0-2.22-1.86-2.97-3.63-3.45z" />
            </svg>
            포인트현황
          </button>
        )}
      </div>

      {/* 게시물 탭 */}
      {activeTab === "posts" && (
        <div className="mypage-grid">
          {isOwnPage && (
            <button className="mypage-add-post-btn" onClick={() => setShowPostModal(true)}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>새 게시물</span>
            </button>
          )}
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
                포인트 적립 현황
              </h4>
              <div className="mypage-points-card-main">
                <span className="mypage-points-card-label">총 적립 포인트</span>
                <strong className="mypage-points-card-value earn">
                  +{pointHistory.filter(h => h.type === 'EARN').reduce((sum, h) => sum + h.amount, 0).toLocaleString()} P
                </strong>
              </div>
              <div className="mypage-points-card-rows">
                <div className="mypage-points-card-row">
                  <span>적립 건수</span>
                  <strong>{pointHistory.filter(h => h.type === 'EARN').length}건</strong>
                </div>
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
                <strong className="mypage-points-card-value">{currentPoint.toLocaleString()} P</strong>
              </div>
              <div className="mypage-points-card-rows">
                <div className="mypage-points-card-row">
                  <span>총 사용</span>
                  <strong className="spend">
                    {pointHistory.filter(h => h.type === 'USE').reduce((sum, h) => sum + h.amount, 0).toLocaleString()} P
                  </strong>
                </div>
                <div className="mypage-points-card-row">
                  <span>사용 건수</span>
                  <strong>{pointHistory.filter(h => h.type === 'USE').length}건</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="mypage-usage-section">
            <h3 className="mypage-usage-title">포인트 내역</h3>
            <div className="mypage-usage-list">
              {pointHistory.map((item) => (
                <div key={item.id} className="mypage-usage-item">
                  <div className="mypage-usage-item-left">
                    <span className="mypage-usage-category">{item.type === 'EARN' ? '적립' : '사용'}</span>
                    <span className="mypage-usage-desc">{item.description}</span>
                    <span className="mypage-usage-date">{item.createdAt?.substring(0, 10)}</span>
                  </div>
                  <span className={`mypage-usage-amount ${item.amount > 0 ? 'earn' : ''}`}>
                    {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()} P
                  </span>
                </div>
              ))}
              {pointHistory.length === 0 && (
                <div className="mypage-usage-item">
                  <div className="mypage-usage-item-left">
                    <span className="mypage-usage-desc">포인트 내역이 없습니다.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage;
