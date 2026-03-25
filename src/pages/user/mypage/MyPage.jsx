import { useState, useEffect, useRef } from "react";
import ConfirmModal from "../../../components/common/Modal/ConfirmModal";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/user/header/Header";
import AuthModal from "../auth/AuthPage";
import PostCreateModal from "./PostCreateModal";
import PostDetailPanel from "./PostDetailPanel";
import ProfileEditModal from "./ProfileEditModal";
import FollowListModal from "./FollowListModal";
import ReviewWriteModal from "./ReviewWriteModal";
import { useAuth } from "../../../store/context/UserContext";
import { ListMyPost, ListPost, DeletePost } from '../../../api/user/post';
import { GetFollowCount, CheckFollow, Follow, Unfollow } from '../../../api/user/follow';
import { UpdateProfileImg, GetUserProfile } from '../../../api/user/auth';
import { GetPoint, GetPointHistory } from '../../../api/user/point';
import { ListMyOrder } from '../../../api/user/order';
import { ListWishlist, ToggleWishlist } from '../../../api/user/wishlist';
import { IssueCoupon, GetMyCoupons } from '../../../api/user/coupon';
import "../../../App.css";
import "./MyPage.css";

function MyPage() {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followModalType, setFollowModalType] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [pointHistory, setPointHistory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponIssuing, setCouponIssuing] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState(new Set());
  const [confirmTarget, setConfirmTarget] = useState(null);

  // 본인 페이지 여부
  const isOwnPage = !paramUserId || (user && String(user.id) === String(paramUserId));
  const pageUserId = isOwnPage ? user?.id : paramUserId;

  const mapPosts = (all) => all.map(p => ({
    id: p.id,
    userId: p.userId,
    user: p.userNm,
    avatar: p.profileImgNm || null,
    images: p.images?.length > 0
      ? p.images.map(img => img.imgPath)
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
      .catch(() => {});
  };

  const loadUserPosts = (userNm) => {
    ListPost('', 0, 100)
      .then(res => {
        const all = res.data.content || [];
        const filtered = all.filter(p => p.userNm === userNm);
        setPosts(mapPosts(filtered));
      })
      .catch(() => {});
  };

  const loadOrders = () => {
    ListMyOrder(0, 50)
      .then(res => setOrders(res.data.content || []))
      .catch(() => {});
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (loadedTabs.has(tab)) return;
    setLoadedTabs(prev => new Set([...prev, tab]));

    if (tab === 'orders') {
      loadOrders();
    } else if (tab === 'points') {
      GetPoint()
        .then(res => setCurrentPoint(res.data.point))
        .catch(() => {});
      GetPointHistory(0, 20)
        .then(res => setPointHistory(res.data.content || []))
        .catch(() => {});
    } else if (tab === 'wishlist') {
      ListWishlist(0, 50)
        .then(res => setWishlist(res.data.content || []))
        .catch(() => {});
    } else if (tab === 'coupons') {
      GetMyCoupons()
        .then(res => setCoupons(res.data || []))
        .catch(() => {});
    }
  };

  const loadCoupons = () => {
    GetMyCoupons()
      .then(res => setCoupons(res.data || []))
      .catch(() => {});
  };

  const handleCouponIssue = () => {
    if (!couponCode.trim()) { toast.error('쿠폰 코드를 입력해주세요.'); return; }
    setCouponIssuing(true);
    IssueCoupon(couponCode.trim())
      .then(() => {
        toast.success('쿠폰이 등록되었습니다.');
        setCouponCode('');
        loadCoupons();
      })
      .catch((e) => {
        const msg = e.response?.data?.msg || '쿠폰 등록에 실패했습니다.';
        toast.error(msg);
      })
      .finally(() => setCouponIssuing(false));
  };

  const isReviewEligible = (order) => {
    if (order.status !== 'DELIVERED') return false;
    if (order.reviewWritten) return false;
    if (!order.deliveredDate) return false;
    const delivered = new Date(order.deliveredDate);
    const twoWeeksLater = new Date(delivered.getTime() + 14 * 24 * 60 * 60 * 1000);
    return new Date() <= twoWeeksLater;
  };

  const handleDelete = (postId) => {
    setConfirmTarget(postId);
  };

  const handleConfirmDelete = () => {
    DeletePost(confirmTarget)
      .then(() => {
        setConfirmTarget(null);
        setSelectedPost(null);
        loadMyPosts();
      })
      .catch(e => {
        setConfirmTarget(null);
        const msg = e.response?.data?.msg || '삭제에 실패했습니다.';
        toast.error(msg);
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
    setIsFollowing(false);
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
        .catch(() => {});
    }

    // 팔로우 여부 확인 (다른 유저 페이지이고 로그인된 경우)
    if (!isOwnPage && paramUserId && user) {
      CheckFollow(paramUserId)
        .then(res => setIsFollowing(res.data.following))
        .catch(() => {});
    }

    // 탭 로드 상태 초기화
    setLoadedTabs(new Set());
  }, [user, paramUserId]);

  const handleProfileImgChange = (e) => {
    const file = e.target.files[0];
    if (!file || !user?.id) return;
    UpdateProfileImg(user.id, file)
      .then(res => {
        login({ ...user, profileImgNm: res.data.profileImgNm });
      })
      .catch(() => toast.error('프로필 이미지 변경에 실패했습니다.'));
    e.target.value = '';
  };

  const handleFollowToggle = () => {
    if (!user) { setShowAuthModal(true); return; }
    const action = isFollowing ? Unfollow : Follow;
    action(paramUserId)
      .then(() => {
        setIsFollowing(prev => !prev);
        setFollowCount(prev => ({
          ...prev,
          followerCount: isFollowing ? prev.followerCount - 1 : prev.followerCount + 1,
        }));
      })
      .catch(() => {});
  };

  const currentProfile = isOwnPage ? user : profileUser;
  const displayName = currentProfile?.userNm || "";
  const avatarSrc = currentProfile?.profileImgNm || null;

  return (
    <div className="app">
      <ConfirmModal
        isOpen={confirmTarget !== null}
        message="정말 삭제하시겠습니까?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />
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
          isOwnPage={isOwnPage}
        />
      )}
      {reviewOrder && (
        <ReviewWriteModal
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSuccess={loadOrders}
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
            {isOwnPage
              ? <button className="mypage-edit-btn" onClick={() => setShowProfileEditModal(true)}>프로필 편집</button>
              : user && (
                <button
                  className={`mypage-follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? '팔로잉' : '팔로우'}
                </button>
              )
            }
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
        <button className={`mypage-tab ${activeTab === "posts" ? "active" : ""}`} onClick={() => handleTabChange("posts")}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
          </svg>
          게시물
        </button>
        {isOwnPage && (
          <button className={`mypage-tab ${activeTab === "orders" ? "active" : ""}`} onClick={() => handleTabChange("orders")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 7h-3V6a4 4 0 00-8 0v1H5a1 1 0 00-1 1v11a3 3 0 003 3h10a3 3 0 003-3V8a1 1 0 00-1-1zm-9-1a2 2 0 014 0v1h-4V6zm8 13a1 1 0 01-1 1H7a1 1 0 01-1-1V9h2v1a1 1 0 002 0V9h4v1a1 1 0 002 0V9h2v10z"/>
            </svg>
            구매내역
          </button>
        )}
        {isOwnPage && (
          <button className={`mypage-tab ${activeTab === "points" ? "active" : ""}`} onClick={() => handleTabChange("points")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.5v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.65c.1 1.7 1.36 2.66 2.85 2.97V19h1.72v-1.67c1.52-.29 2.72-1.16 2.72-2.74 0-2.22-1.86-2.97-3.63-3.45z" />
            </svg>
            포인트현황
          </button>
        )}
        {isOwnPage && (
          <button className={`mypage-tab ${activeTab === "wishlist" ? "active" : ""}`} onClick={() => handleTabChange("wishlist")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            관심상품
          </button>
        )}
        {isOwnPage && (
          <button className={`mypage-tab ${activeTab === "coupons" ? "active" : ""}`} onClick={() => handleTabChange("coupons")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
            </svg>
            쿠폰
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

      {/* 구매내역 탭 */}
      {activeTab === "orders" && (
        <div className="mypage-orders">
          {orders.length === 0 ? (
            <p className="mypage-orders-empty">구매 내역이 없습니다.</p>
          ) : (
            orders.map((order) => {
              const statusMap = {
                PAYMENT_COMPLETE: { label: "결제완료", cls: "status-paid" },
                SHIPPING: { label: "배송중", cls: "status-shipping" },
                DELIVERED: { label: "배송완료", cls: "status-delivered" },
                CANCELLED: { label: "취소", cls: "status-cancelled" },
              };
              const { label, cls } = statusMap[order.status] || { label: order.status, cls: "" };
              return (
                <div key={order.orderId} className="mypage-order-item">
                  <div className="mypage-order-header">
                    <span className="mypage-order-date">{order.orderDate?.substring(0, 10)}</span>
                    <span className={`mypage-order-status ${cls}`}>{label}</span>
                  </div>
                  <div className="mypage-order-body">
                    {order.productImgPath ? (
                      <img
                        className="mypage-order-img"
                        src={order.productImgPath}
                        alt={order.productNm}
                      />
                    ) : (
                      <div className="mypage-order-img mypage-order-img-empty" />
                    )}
                    <div className="mypage-order-info">
                      {order.brandNm && <span className="mypage-order-brand">{order.brandNm}</span>}
                      <span className="mypage-order-product">{order.productNm}</span>
                      <span className="mypage-order-qty">수량 {order.quantity}개</span>
                    </div>
                    <strong className="mypage-order-price">{order.totalPrice?.toLocaleString()}원</strong>
                  </div>
                  {order.status === 'SHIPPING' && order.trackingNumber && (
                    <div className="mypage-order-tracking">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" />
                        <rect x="9" y="11" width="14" height="10" rx="2" />
                        <circle cx="12" cy="16" r="1" />
                        <circle cx="20" cy="16" r="1" />
                      </svg>
                      <span className="mypage-order-tracking-label">송장번호</span>
                      <span className="mypage-order-tracking-number">{order.trackingNumber}</span>
                    </div>
                  )}
                  {(order.recipientName || order.shippingAddress) && (
                    <div className="mypage-order-shipping">
                      {order.recipientName && <span>{order.recipientName} {order.recipientPhone}</span>}
                      {order.shippingAddress && <span>{order.shippingAddress}</span>}
                    </div>
                  )}
                  {order.status === 'DELIVERED' && (
                    <div className="mypage-order-review">
                      {order.reviewWritten ? (
                        <span className="mypage-review-done-badge">작성 완료</span>
                      ) : isReviewEligible(order) ? (
                        <button
                          className="mypage-review-btn"
                          onClick={() => setReviewOrder(order)}
                        >
                          후기 작성
                        </button>
                      ) : (
                        <span className="mypage-review-expired">작성 기간 만료</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
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

      {/* 관심상품 탭 */}
      {activeTab === "wishlist" && (
        <div className="mypage-wishlist">
          {wishlist.length === 0 ? (
            <p className="mypage-orders-empty">관심 등록한 상품이 없습니다.</p>
          ) : (
            <div className="mypage-wishlist-grid">
              {wishlist.map((item) => (
                <div key={item.wishlistId} className="mypage-wishlist-item">
                  <div
                    className="mypage-wishlist-img-wrap"
                    onClick={() => navigate(`/shop/${item.productId}`)}
                  >
                    {item.imgPath ? (
                      <img src={item.imgPath} alt={item.productNm} />
                    ) : (
                      <div className="mypage-wishlist-img-empty" />
                    )}
                  </div>
                  <div className="mypage-wishlist-info" onClick={() => navigate(`/shop/${item.productId}`)}>
                    <span className="mypage-wishlist-brand">{item.brandNm}</span>
                    <p className="mypage-wishlist-name">{item.productNm}</p>
                    <span className="mypage-wishlist-price">{item.productPrice?.toLocaleString()}원</span>
                  </div>
                  <button
                    className="mypage-wishlist-remove"
                    onClick={() => {
                      ToggleWishlist(item.productId)
                        .then(() => setWishlist(prev => prev.filter(p => p.wishlistId !== item.wishlistId)))
                        .catch(() => {});
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" strokeWidth="2">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 쿠폰 탭 */}
      {activeTab === "coupons" && (
        <div className="mypage-coupons">
          {/* 쿠폰 코드 등록 */}
          <div className="mypage-coupon-issue">
            <h4 className="mypage-coupon-issue-title">쿠폰 코드 등록</h4>
            <div className="mypage-coupon-issue-row">
              <input
                className="mypage-coupon-input"
                type="text"
                placeholder="쿠폰 코드를 입력하세요"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleCouponIssue()}
              />
              <button
                className="mypage-coupon-issue-btn"
                onClick={handleCouponIssue}
                disabled={couponIssuing}
              >
                {couponIssuing ? '등록 중...' : '등록'}
              </button>
            </div>
          </div>

          {/* 보유 쿠폰 목록 */}
          <div className="mypage-coupon-list">
            <h4 className="mypage-coupon-list-title">보유 쿠폰 ({coupons.length})</h4>
            {coupons.length === 0 ? (
              <p className="mypage-coupon-empty">보유한 쿠폰이 없습니다.</p>
            ) : (
              coupons.map((c) => (
                <div key={c.userCouponId} className="mypage-coupon-card">
                  <div className="mypage-coupon-card-left">
                    <span className="mypage-coupon-card-name">{c.couponName}</span>
                    <span className="mypage-coupon-card-code">{c.couponCode}</span>
                    <span className="mypage-coupon-card-min">{c.minOrderPrice.toLocaleString()}원 이상 구매 시</span>
                    <span className="mypage-coupon-card-expire">
                      ~{c.expiredAt?.substring(0, 10)} 까지
                    </span>
                  </div>
                  <div className="mypage-coupon-card-right">
                    <span className="mypage-coupon-card-discount">
                      {c.discountType === 'FIXED'
                        ? `${c.discountValue.toLocaleString()}원`
                        : `${c.discountValue}%`}
                    </span>
                    <span className="mypage-coupon-card-discount-label">할인</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage;
