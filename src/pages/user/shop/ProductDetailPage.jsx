import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../../components/user/header/Header";
import AuthModal from "../auth/AuthPage";
import OrderModal from "./OrderModal";
import { GetProduct, ListProductReview } from "../../../api/user/product";
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

  const handleBuyClick = () => {
    if (!user) { setShowAuthModal(true); return; }
    setShowOrderModal(true);
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
            <div
              className="detail-brand"
              style={{ cursor: product.brandId ? 'pointer' : 'default' }}
              onClick={() => { if (product.brandId) navigate(`/brand/${product.brandId}`); }}
            >{product.brandNm}</div>
            <h1 className="detail-name">{product.productNm}</h1>
            <div className="detail-price">
              {product.productPrice?.toLocaleString()}원
            </div>

            {reviewCount > 0 && (
              <div className="detail-rating">
                <div className="detail-rating-stars">
                  {renderAvgStars(avgRating)}
                </div>
                <span className="detail-rating-score">{avgRating.toFixed(1)}</span>
                <span className="detail-rating-count">({reviewCount}개 리뷰)</span>
              </div>
            )}

            <div className="detail-divider" />

            <div className="detail-meta">
              <div className="detail-meta-row">
                <span className="detail-meta-label">카테고리</span>
                <span className="detail-category-badge">
                  {CATEGORY_KOR[product.category] || product.category}
                </span>
              </div>
              <div className="detail-meta-row">
                <span className="detail-meta-label">상품코드</span>
                <span className="detail-meta-value">{product.productCode}</span>
              </div>
              <div className="detail-meta-row">
                <span className="detail-meta-label">재고</span>
                <span className="detail-meta-value">
                  {product.productQuantity}개
                </span>
              </div>
            </div>

            <div className="detail-buy-wrap">
              <div className="detail-buy-row">
                <button
                  className="detail-buy-btn"
                  onClick={handleBuyClick}
                  disabled={product.productQuantity === 0}
                >
                  {product.productQuantity === 0 ? "품절" : "구매하기"}
                </button>
                <button
                  className={`detail-wishlist-btn ${wishlisted ? 'active' : ''}`}
                  onClick={handleWishlistClick}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "#e74c3c" : "none"} stroke={wishlisted ? "#e74c3c" : "#222"} strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>
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
