import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import OrderModal from "./OrderModal";
import PostDetailPanel from "../mypage/PostDetailPanel";
import AuthModal from "../auth/AuthPage";
import { GetProduct, ListProduct, ListProductReview } from "../../../api/user/product";
import { RecordProductView } from "../../../api/user/productView";
import { CheckWishlist, ToggleWishlist } from "../../../api/user/wishlist";
import { ListPostByProduct } from "../../../api/user/post";
import { useAuth } from "../../../store/context/UserContext";
import "./ProductDetailModal.css";

const CATEGORY_KOR = {
  TOP: "상의", BOTTOM: "하의", OUTER: "아우터",
  DRESS: "원피스/세트", SHOES: "신발", BAG: "가방",
};

function ProductDetailModal({ productId, product: initialProduct, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [imgIndex, setImgIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [productPosts, setProductPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);

  const resolvedId = productId || initialProduct?.id;

  useEffect(() => {
    setProduct(initialProduct || null);
    setLoading(!initialProduct);
    setImgIndex(0);
    setSelectedSize(null);
    setReviews([]);
    setProductPosts([]);
    setWishlisted(false);

    if (!initialProduct && resolvedId) {
      setLoading(true);
      GetProduct(resolvedId)
        .then(res => setProduct(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [resolvedId]);

  useEffect(() => {
    if (!resolvedId) return;
    ListProductReview(resolvedId, 0, 20)
      .then(res => setReviews(res.data.content || []))
      .catch(() => {});
  }, [resolvedId]);

  useEffect(() => {
    if (!resolvedId) return;
    ListPostByProduct(resolvedId, 0, 12)
      .then(res => setProductPosts(res.data.content || []))
      .catch(() => {});
  }, [resolvedId]);

  // 비슷한 상품 (같은 카테고리, 현재 상품 제외, 최대 8개)
  useEffect(() => {
    if (!product?.category) return;
    ListProduct('', product.category, 0, 9)
      .then(res => {
        const items = (res.data.content || [])
          .filter(p => p.id !== product.id)
          .slice(0, 8)
          .map(p => ({
            id: p.id,
            image: p.images?.length > 0 ? p.images[0].imgPath : '',
            brand: p.brandNm,
            name: p.productNm,
            price: p.productPrice?.toLocaleString(),
            _raw: p,
          }));
        setSimilarProducts(items);
      })
      .catch(() => {});
  }, [product?.id, product?.category]);

  useEffect(() => {
    if (!user || !resolvedId) return;
    CheckWishlist(resolvedId)
      .then(res => setWishlisted(res.data.wished))
      .catch(() => {});
  }, [user, resolvedId]);

  useEffect(() => {
    if (!user || !resolvedId) return;
    RecordProductView(resolvedId).catch(() => {});
  }, [user, resolvedId]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

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
      <span key={i} className={`pd-star ${i < rating ? "on" : ""}`}>★</span>
    ));

  const images = product?.images || [];
  const currentImg = images[imgIndex]?.imgPath || "";
  const isDiscontinued = product?.hidden === true;
  const hasSizes = product?.sizes?.length > 0;
  const isSoldOut = hasSizes
    ? product.sizes.every(s => s.quantity === 0)
    : product?.productQuantity === 0;

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

  const handleCopyLink = () => {
    const url = `${window.location.origin}/shop/${resolvedId}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success('링크가 복사되었습니다.'))
      .catch(() => toast.error('링크 복사에 실패했습니다.'));
  };

  return (
    <>
      <div className="pd-overlay" onClick={onClose} />

      <div className="pd-panel">

        {/* ── 헤더 ── */}
        <div className="pd-header">
          <button className="pd-close" onClick={onClose} aria-label="닫기">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── 바디 ── */}
        <div className="pd-body">
          {loading ? (
            <div className="pd-empty">상품을 불러오는 중...</div>
          ) : !product ? (
            <div className="pd-empty">상품을 찾을 수 없습니다.</div>
          ) : (
            <>
              {/* 상단: 이미지 + 정보 */}
              <div className="pd-top">

                {/* 이미지 영역 */}
                <div className="pd-img-area">
                  {/* 메인 이미지 */}
                  <div className="pd-img-main">
                    {currentImg
                      ? <img src={currentImg} alt={product.productNm} />
                      : <div className="pd-img-empty">이미지 없음</div>
                    }
                    {images.length > 1 && (
                      <>
                        <button
                          className="pd-img-arrow left"
                          onClick={() => setImgIndex(p => p === 0 ? images.length - 1 : p - 1)}
                        >‹</button>
                        <button
                          className="pd-img-arrow right"
                          onClick={() => setImgIndex(p => p === images.length - 1 ? 0 : p + 1)}
                        >›</button>
                        <div className="pd-img-counter">{imgIndex + 1} / {images.length}</div>
                      </>
                    )}
                  </div>

                  {/* 썸네일 스트립 */}
                  {images.length > 1 && (
                    <div className="pd-thumbs">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          className={`pd-thumb ${i === imgIndex ? "active" : ""}`}
                          onClick={() => setImgIndex(i)}
                        >
                          <img src={img.imgPath} alt={`${i + 1}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="pd-info">
                  {isDiscontinued && (
                    <div className="pd-discontinued">판매 중단된 상품입니다.</div>
                  )}

                  <p
                    className="pd-brand"
                    onClick={() => product.brandId && (onClose(), navigate(`/brand/${product.brandId}`))}
                    style={{ cursor: product.brandId ? "pointer" : "default" }}
                  >
                    {product.brandNm}
                  </p>
                  <h2 className="pd-name">{product.productNm}</h2>
                  {product.productEnNm && <p className="pd-name-en">{product.productEnNm}</p>}

                  {reviewCount > 0 && (
                    <div className="pd-rating">
                      <span className="pd-rating-star">★</span>
                      <span className="pd-rating-val">{avgRating.toFixed(1)}</span>
                      <span className="pd-rating-cnt">({reviewCount})</span>
                    </div>
                  )}

                  <div className="pd-price">{product.productPrice?.toLocaleString()}원</div>

                  <div className="pd-divider" />

                  <div className="pd-meta-row">
                    <span className="pd-meta-label">카테고리</span>
                    <span className="pd-meta-val">{CATEGORY_KOR[product.category] || product.category}</span>
                  </div>
                  <div className="pd-meta-row">
                    <span className="pd-meta-label">상품코드</span>
                    <span className="pd-meta-val">{product.productCode}</span>
                  </div>

                  {hasSizes && (
                    <>
                      <div className="pd-divider" />
                      <div className="pd-size-wrap">
                        <span className="pd-size-label">사이즈 선택</span>
                        <div className="pd-size-list">
                          {product.sizes.map(s => (
                            <button
                              key={s.sizeNm}
                              className={`pd-size-btn${selectedSize?.sizeNm === s.sizeNm ? " on" : ""}${s.quantity === 0 ? " out" : ""}`}
                              onClick={() => s.quantity > 0 && setSelectedSize(s)}
                              disabled={s.quantity === 0}
                            >
                              {s.sizeNm}
                              {s.quantity === 0 && <span className="pd-soldout-badge">품절</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pd-divider" />

                  {/* 액션 */}
                  <div className="pd-actions">
                    <div className="pd-icon-btns">
                      <button className={`pd-icon-btn${wishlisted ? " on" : ""}`} onClick={handleWishlistClick}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "#222" : "none"} stroke="#222" strokeWidth="1.8">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>{wishlisted ? "저장됨" : "저장"}</span>
                      </button>
                      <button className="pd-icon-btn" onClick={handleCopyLink}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.8">
                          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                        <span>공유</span>
                      </button>
                    </div>
                    <button
                      className="pd-buy-btn"
                      onClick={handleBuyClick}
                      disabled={isDiscontinued || isSoldOut || (hasSizes && !selectedSize)}
                    >
                      {isDiscontinued ? "판매 중단"
                        : isSoldOut ? "품절"
                        : hasSizes && !selectedSize ? "사이즈를 선택해주세요"
                        : "구매하기"}
                    </button>
                  </div>
                </div>
              </div>

              {/* 후기 */}
              <div className="pd-section">
                <div className="pd-section-head">
                  <h3 className="pd-section-title">상품 후기 <span className="pd-section-cnt">{reviewCount}</span></h3>
                  {reviewCount > 0 && (
                    <div className="pd-avg-wrap">
                      <span className="pd-avg-star">★</span>
                      <span className="pd-avg-score">{avgRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                {reviewCount === 0 ? (
                  <p className="pd-section-empty">아직 후기가 없습니다.</p>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} className="pd-review">
                      <div className="pd-review-top">
                        <span className="pd-review-user">{r.userNm}</span>
                        <span className="pd-review-stars">{renderStars(r.rating)}</span>
                        <span className="pd-review-date">{formatDate(r.createdAt)}</span>
                      </div>
                      <p className="pd-review-text">{r.content}</p>
                      {r.imgPaths?.length > 0 && (
                        <div className="pd-review-imgs">
                          {r.imgPaths.map((src, i) => (
                            <img key={i} src={src} alt="" className="pd-review-img" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* 비슷한 상품 */}
              {similarProducts.length > 0 && (
                <div className="pd-section">
                  <div className="pd-section-head">
                    <h3 className="pd-section-title">비슷한 상품</h3>
                  </div>
                  <div className="pd-similar-grid">
                    {similarProducts.map(p => (
                      <div
                        key={p.id}
                        className="pd-similar-card"
                        onClick={() => {
                          setImgIndex(0);
                          setSelectedSize(null);
                          setSimilarProducts([]);
                          setProduct(null);
                          setLoading(true);
                          GetProduct(p.id)
                            .then(res => setProduct(res.data))
                            .catch(() => {})
                            .finally(() => setLoading(false));
                        }}
                      >
                        <div className="pd-similar-img">
                          {p.image
                            ? <img src={p.image} alt={p.name} />
                            : <div className="pd-similar-img-empty" />}
                        </div>
                        <div className="pd-similar-body">
                          <p className="pd-similar-brand">{p.brand}</p>
                          <p className="pd-similar-name">{p.name}</p>
                          <p className="pd-similar-price">{p.price}원</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 연관 게시글 */}
              {productPosts.length > 0 && (
                <div className="pd-section">
                  <div className="pd-section-head">
                    <h3 className="pd-section-title">이 상품을 담은 게시글 <span className="pd-section-cnt">{productPosts.length}</span></h3>
                  </div>
                  <div className="pd-posts-grid">
                    {productPosts.map(post => (
                      <div key={post.id} className="pd-post-card" onClick={() => setSelectedPost(post)}>
                        <div className="pd-post-img">
                          {post.images?.length > 0
                            ? <img src={post.images[0].imgPath} alt={post.title} />
                            : <div className="pd-post-img-empty" />}
                        </div>
                        <div className="pd-post-body">
                          <p className="pd-post-user">{post.userNm}</p>
                          <p className="pd-post-title">{post.title}</p>
                          <div className="pd-post-meta">
                            <span>♥ {post.likeCount || 0}</span>
                            <span>💬 {post.commentCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showOrderModal && (
        <OrderModal product={product} selectedSize={selectedSize} onClose={() => setShowOrderModal(false)} />
      )}
      {selectedPost && (
        <PostDetailPanel post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  );
}

export default ProductDetailModal;
