import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../../components/user/header/Header";
import AuthModal from "../auth/AuthPage";
import OrderModal from "./OrderModal";
import { GetProduct, ListProductReview } from "../../../api/user/product";
import { RecordProductView } from "../../../api/user/productView";
import { CheckWishlist, ToggleWishlist } from "../../../api/user/wishlist";
import { ListPostByProduct } from "../../../api/user/post";
import PostDetailPanel from "../../user/mypage/PostDetailPanel";
import { useAuth } from "../../../store/context/UserContext";
import "../../../App.css";
import "./ProductDetailPage.css";

const CATEGORY_KOR = {
  TOP: "상의", BOTTOM: "하의", OUTER: "아우터",
  DRESS: "원피스/세트", SHOES: "신발", BAG: "가방",
};

function ProductDetailPage() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!product);
  const [imgIndex, setImgIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [productPosts, setProductPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    if (!product) {
      setLoading(true);
      GetProduct(productId)
        .then((res) => {
          setProduct(res.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [productId, product]);

  useEffect(() => {
    if (productId && user) {
      ListProductReview(productId, 0, 20)
        .then((res) => setReviews(res.data.content || []))
        .catch(() => {});
    }
  }, [productId, user]);

  useEffect(() => {
    if (productId && user) {
      ListPostByProduct(productId, 0, 12)
        .then(res => setProductPosts(res.data.content || []))
        .catch(() => {});
    }
  }, [productId]);

  useEffect(() => {
    if (!user || !productId) return;
    CheckWishlist(productId)
      .then(res => setWishlisted(res.data.wished))
      .catch(() => {});
  }, [user, productId]);

  // 로그인 유저의 상품 조회 기록
  useEffect(() => {
    if (!user || !productId) return;
    RecordProductView(productId).catch(() => {});
  }, [user, productId]);



  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`review-star ${i < rating ? "filled" : ""}`}>★</span>
    ));

  const renderAvgStars = (avg) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`review-star ${i < Math.round(avg) ? "filled" : ""}`}>★</span>
    ));

  if (loading) {
    return (
      <div className="app">
        <Navbar onLoginClick={() => setShowAuthModal(true)} />
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        <div className="detail-loading">상품을 불러오는 중...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="app">
        <Navbar onLoginClick={() => setShowAuthModal(true)} />
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        <div className="detail-loading">상품을 찾을 수 없습니다.</div>
      </div>
    );
  }

  const images = product.images || [];
  const currentImg = images.length > 0 ? images[imgIndex].imgPath : "";

  const handlePrev = () =>
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () =>
    setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const isDiscontinued = product?.hidden === true;

  const handleBuyClick = () => {
    if (!user) { setShowAuthModal(true); return; }
    setShowOrderModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('링크가 복사되었습니다.'))
      .catch(() => toast.error('링크 복사에 실패했습니다.'));
  };


  const handleWishlistClick = () => {
    if (!user) { setShowAuthModal(true); return; }
    ToggleWishlist(product.id)
      .then(res => setWishlisted(res.data.wished))
      .catch(() => {});
  };

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowAuthModal(true)} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showOrderModal && (
        <OrderModal
          product={product}
          selectedSize={selectedSize}
          onClose={() => setShowOrderModal(false)}
        />
      )}

      <div className="detail-container">
        <button className="detail-back" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>

        <div className="detail-content">
          {/* 이미지 캐러셀 */}
          <div className="detail-carousel">
            <div className="detail-carousel-main">
              {currentImg ? (
                <img src={currentImg} alt={product.productNm} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#bcbcbc", fontSize: 14 }}>
                  이미지 없음
                </div>
              )}
            </div>

            {images.length > 1 && (
              <>
                <button className="detail-carousel-btn prev" onClick={handlePrev}>‹</button>
                <button className="detail-carousel-btn next" onClick={handleNext}>›</button>
                <div className="detail-carousel-dots">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      className={`detail-carousel-dot ${i === imgIndex ? "active" : ""}`}
                      onClick={() => setImgIndex(i)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="detail-info">
            {isDiscontinued && (
              <div style={{ background: '#f1f3f5', border: '1px solid #dee2e6', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🚫</span>
                <span style={{ fontSize: '14px', color: '#495057', fontWeight: 500 }}>더 이상 판매하지 않는 상품입니다.</span>
              </div>
            )}
            {/* 브랜드 + 상품명 */}
            <div
              className="detail-brand"
              style={{ cursor: product.brandId ? 'pointer' : 'default' }}
              onClick={() => { if (product.brandId) navigate(`/brand/${product.brandId}`); }}
            >{product.brandNm}</div>
            <h1 className="detail-name">{product.productNm}</h1>
            {product.productEnNm && (
              <p className="detail-name-en">{product.productEnNm}</p>
            )}

            {/* 가격 */}
            <div className="detail-price">
              {product.productPrice?.toLocaleString()}원
            </div>

            {/* 평점 */}
            {reviewCount > 0 && (
              <div className="detail-rating">
                <span className="detail-rating-star-icon">★</span>
                <span className="detail-rating-score">{avgRating.toFixed(1)}</span>
                <span className="detail-rating-count">리뷰 {reviewCount.toLocaleString()}</span>
              </div>
            )}

            {/* 카테고리 태그 */}
            <div className="detail-tags">
              <span className="detail-tag">{typeof product.category === 'object' ? (product.category?.korName || product.category?.name) : (CATEGORY_KOR[product.category] || product.category)}</span>
            </div>

            <div className="detail-divider" />

            {/* 상품 메타 */}
            <div className="detail-meta">
              <div className="detail-meta-row">
                <span className="detail-meta-label">상품코드</span>
                <span className="detail-meta-value">{product.productCode}</span>
              </div>
            </div>

            {/* 사이즈 선택 */}
            {product.sizes?.length > 0 && (
              <div className="detail-size-section">
                <span className="detail-size-label">사이즈</span>
                <div className="detail-size-list">
                  {product.sizes.map(s => (
                    <button
                      key={s.sizeNm}
                      className={`detail-size-btn ${selectedSize?.sizeNm === s.sizeNm ? 'active' : ''} ${s.quantity === 0 ? 'sold-out' : ''}`}
                      onClick={() => s.quantity > 0 && setSelectedSize(s)}
                      disabled={s.quantity === 0}
                    >
                      {s.sizeNm}
                      {s.quantity === 0 && <span className="detail-size-soldout-text">품절</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-divider" />

            {/* 액션 버튼 */}
            <div className="detail-action-bar">
              <button
                className={`detail-icon-btn ${wishlisted ? 'active' : ''}`}
                onClick={handleWishlistClick}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={wishlisted ? "#222" : "none"} stroke="#222" strokeWidth="1.8">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <span>{wishlisted ? '저장됨' : '저장'}</span>
              </button>
              <button className="detail-icon-btn" onClick={handleCopyLink}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.8">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                <span>공유</span>
              </button>
              {(() => {
                const hasSizes = product.sizes?.length > 0;
                const isSoldOut = hasSizes
                  ? product.sizes.every(s => s.quantity === 0)
                  : product.productQuantity === 0;
                return (
                  <button
                    className="detail-buy-btn"
                    onClick={handleBuyClick}
                    disabled={isDiscontinued || isSoldOut || (hasSizes && !selectedSize)}
                  >
                    {isDiscontinued
                      ? "판매 중단"
                      : isSoldOut
                      ? "품절"
                      : hasSizes && !selectedSize
                      ? "사이즈 선택"
                      : "구매하기"}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>

        {selectedPost && (
          <PostDetailPanel
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}

        {/* 상품 후기 */}
        <div className="review-section">
          <div className="review-section-header">
            <h2 className="review-section-title">
              상품 후기 <span className="review-count">{reviewCount}</span>
            </h2>
            {reviewCount > 0 && (
              <div className="review-avg-summary">
                <div className="review-avg-stars">{renderAvgStars(avgRating)}</div>
                <span className="review-avg-score">{avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* 후기 목록 */}
          <div className="review-list">
            {reviews.length === 0 ? (
              <p className="review-empty">아직 후기가 없습니다. 첫 번째 후기를 남겨보세요!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-item-header">
                    <span className="review-item-user">{review.userNm}</span>
                    <div className="review-item-stars">{renderStars(review.rating)}</div>
                    <span className="review-item-date">{formatDate(review.createdAt)}</span>
                  </div>
                  <p className="review-item-content">{review.content}</p>
                  {review.imgPaths && review.imgPaths.length > 0 && (
                    <div className="review-item-images">
                      {review.imgPaths.map((src, i) => (
                        <img key={i} src={src} alt={`후기 이미지 ${i + 1}`} className="review-item-img" />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 이 상품을 담은 게시글 */}
        {productPosts.length > 0 && (
          <div className="product-posts-section">
            <div className="product-posts-header">
              <h2 className="product-posts-title">
                이 상품을 담은 게시글 <span className="product-posts-count">{productPosts.length}</span>
              </h2>
            </div>
            <div className="product-posts-grid">
              {productPosts.map(post => (
                <div
                  key={post.id}
                  className="product-post-card"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="product-post-thumb">
                    {post.images?.length > 0 ? (
                      <img src={post.images[0].imgPath} alt={post.title} />
                    ) : (
                      <div className="product-post-thumb-empty" />
                    )}
                  </div>
                  <div className="product-post-info">
                    <span className="product-post-user">{post.userNm}</span>
                    <p className="product-post-title-text">{post.title}</p>
                    <div className="product-post-meta">
                      <span>♥ {post.likeCount || 0}</span>
                      <span>💬 {post.commentCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;
