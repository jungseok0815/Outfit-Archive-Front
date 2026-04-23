import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DaumPostcode from "react-daum-postcode";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import PostDetailPanel from "../mypage/PostDetailPanel";
import AuthModal from "../auth/AuthPage";
import { GetProduct, ListProductReview } from "../../../api/user/product";
import { GetSimilarProducts } from "../../../api/user/recommend";
import { RecordProductView } from "../../../api/user/productView";
import { CheckWishlist, ToggleWishlist } from "../../../api/user/wishlist";
import { ListPostByProduct } from "../../../api/user/post";
import { InsertOrder } from "../../../api/user/order";
import { GetPoint } from "../../../api/user/point";
import { GetMyCoupons } from "../../../api/user/coupon";
import { ListAddress, InsertAddress, DeleteAddress, SetDefaultAddress } from "../../../api/user/address";
import { useAuth } from "../../../store/context/UserContext";
import "./ProductDetailModal.css";

const CATEGORY_KOR = {
  TOP: "상의", BOTTOM: "하의", OUTER: "아우터",
  DRESS: "원피스/세트", SHOES: "신발", BAG: "가방",
};

function ProductDetailModal({ productId, product: initialProduct, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── 상품 상태 ──
  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [imgIndex, setImgIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [productPosts, setProductPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);

  // ── 주문 시트 ──
  const [showOrderSheet, setShowOrderSheet] = useState(false);
  const [orderForm, setOrderForm] = useState({ quantity: 1, usePoint: 0 });
  const [availablePoint, setAvailablePoint] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPostcode, setShowPostcode] = useState(false);
  const [addressForm, setAddressForm] = useState({
    recipientName: "", recipientPhone: "", zipCode: "", baseAddress: "", detailAddress: "", isDefault: false,
  });
  const detailRef = useRef(null);

  const resolvedId = productId || initialProduct?.id;

  // ── 상품 데이터 로드 ──
  useEffect(() => {
    setProduct(initialProduct || null);
    setLoading(!initialProduct);
    setImgIndex(0);
    setSelectedSize(null);
    setReviews([]);
    setProductPosts([]);
    setWishlisted(false);
    setShowOrderSheet(false);

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

  useEffect(() => {
    if (!resolvedId) return;
    setSimilarProducts([]);
    GetSimilarProducts(resolvedId, 8)
      .then(res => {
        setSimilarProducts((res.data || []).map(p => ({
          id: p.productId,
          image: p.imgPath || '',
          brand: p.brandNm,
          name: p.productNm,
          price: p.productPrice?.toLocaleString(),
        })));
      })
      .catch(() => {});
  }, [resolvedId]);

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
    const handleKey = (e) => {
      if (e.key === "Escape") {
        if (showOrderSheet) setShowOrderSheet(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, showOrderSheet]);

  // ── 주문 데이터 로드 ──
  const loadOrderData = () => {
    GetPoint().then(res => setAvailablePoint(res.data.point || 0)).catch(() => {});
    GetMyCoupons()
      .then(res => {
        const now = new Date();
        setCoupons((res.data || []).filter(c => !c.isUsed && new Date(c.expiredAt) >= now));
      })
      .catch(() => {});
    ListAddress()
      .then(res => {
        const list = res.data || [];
        setAddresses(list);
        const def = list.find(a => a.isDefault);
        if (def) setSelectedAddressId(def.id);
      })
      .catch(() => {});
  };

  const reloadAddresses = () => {
    ListAddress()
      .then(res => {
        const list = res.data || [];
        setAddresses(list);
        const def = list.find(a => a.isDefault);
        if (def) setSelectedAddressId(def.id);
      })
      .catch(() => {});
  };

  // ── 상품 계산 ──
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;

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

  // ── 주문 계산 ──
  const maxQuantity = selectedSize ? selectedSize.quantity : (product?.productQuantity || 1);
  const totalPrice = (product?.productPrice || 0) * orderForm.quantity;

  const isCouponApplicable = (coupon) => {
    const cats = coupon.targetCategories || [];
    const brandIds = coupon.targetBrandIds || [];
    if (cats.length === 0 && brandIds.length === 0) return true;
    if (cats.length > 0 && cats.includes(product?.category)) return true;
    if (brandIds.length > 0 && brandIds.includes(product?.brandId)) return true;
    return false;
  };

  const couponDiscount = (() => {
    if (!selectedCoupon || totalPrice < (selectedCoupon.minOrderPrice || 0)) return 0;
    if (selectedCoupon.discountType === 'FIXED') return Math.min(selectedCoupon.discountValue, totalPrice);
    const d = Math.floor(totalPrice * selectedCoupon.discountValue / 100);
    return selectedCoupon.maxDiscountPrice ? Math.min(d, selectedCoupon.maxDiscountPrice) : d;
  })();
  const priceAfterCoupon = Math.max(0, totalPrice - couponDiscount);
  const usePoint = Math.min(Number(orderForm.usePoint) || 0, availablePoint, priceAfterCoupon);
  const finalPrice = Math.max(0, priceAfterCoupon - usePoint);

  const formatCouponLabel = (c) => {
    const discount = c.discountType === 'FIXED'
      ? `${c.discountValue.toLocaleString()}원 할인`
      : `${c.discountValue}% 할인${c.maxDiscountPrice ? ` (최대 ${c.maxDiscountPrice.toLocaleString()}원)` : ''}`;
    return `${c.couponName} — ${discount}`;
  };

  // ── 핸들러 ──
  const handleBuyClick = () => {
    if (!user) { setShowAuthModal(true); return; }
    setOrderForm({ quantity: 1, usePoint: 0 });
    setSelectedCoupon(null);
    setOrderError("");
    setShowAddressForm(false);
    loadOrderData();
    setShowOrderSheet(true);
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

  const handleOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
    setOrderError("");
  };

  const handleQuantityChange = (delta) => {
    setOrderForm(prev => ({
      ...prev,
      quantity: Math.max(1, Math.min(maxQuantity, prev.quantity + delta)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddressId) { setOrderError("배송지를 선택해주세요."); return; }
    const addr = addresses.find(a => a.id === selectedAddressId);
    if (!addr) { setOrderError("배송지를 선택해주세요."); return; }

    setSubmitting(true);
    setOrderError("");
    try {
      const res = await InsertOrder({
        productId: product.id,
        quantity: orderForm.quantity,
        recipientName: addr.recipientName,
        recipientPhone: addr.recipientPhone,
        shippingAddress: `[${addr.zipCode}] ${addr.baseAddress} ${addr.detailAddress || ""}`.trim(),
        usePoint,
        sizeNm: selectedSize?.sizeNm || null,
        userCouponId: selectedCoupon?.userCouponId || null,
      });
      const tossPayments = await loadTossPayments(process.env.REACT_APP_TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: String(user.id) });
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: finalPrice },
        orderId: res.data.tossOrderId,
        orderName: product.productNm,
        customerName: addr.recipientName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.message || "";
      if (msg) setOrderError(msg);
      setSubmitting(false);
    }
  };

  // ── 주소 핸들러 ──
  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePostcodeComplete = (data) => {
    setAddressForm(prev => ({
      ...prev,
      zipCode: data.zonecode,
      baseAddress: data.roadAddress || data.jibunAddress,
      detailAddress: "",
    }));
    setShowPostcode(false);
    setTimeout(() => detailRef.current?.focus(), 100);
  };

  const handleAddressSubmit = () => {
    if (!addressForm.recipientName.trim() || !addressForm.recipientPhone.trim() || !addressForm.baseAddress.trim()) return;
    InsertAddress({
      recipientName: addressForm.recipientName.trim(),
      recipientPhone: addressForm.recipientPhone.trim(),
      zipCode: addressForm.zipCode,
      baseAddress: addressForm.baseAddress,
      detailAddress: addressForm.detailAddress.trim(),
      isDefault: addressForm.isDefault,
    })
      .then(() => {
        reloadAddresses();
        setShowAddressForm(false);
        setAddressForm({ recipientName: "", recipientPhone: "", zipCode: "", baseAddress: "", detailAddress: "", isDefault: false });
      })
      .catch(() => {});
  };

  const handleDeleteAddress = (e, id) => {
    e.stopPropagation();
    DeleteAddress(id)
      .then(() => {
        if (selectedAddressId === id) setSelectedAddressId(null);
        reloadAddresses();
      })
      .catch(() => {});
  };

  const handleSetDefault = (e, id) => {
    e.stopPropagation();
    SetDefaultAddress(id).then(reloadAddresses).catch(() => {});
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

        {/* ── 콘텐츠 영역 (바디 + 바텀 시트 포함 블록) ── */}
        <div className="pd-content-area">
        <div className="pd-body">
          {loading ? (
            <div className="pd-empty">상품을 불러오는 중...</div>
          ) : !product ? (
            <div className="pd-empty">상품을 찾을 수 없습니다.</div>
          ) : (
            <>
              {/* 상단: 이미지 + 정보 */}
              <div className="pd-top">

                {/* 이미지 */}
                <div className="pd-img-area">
                  <div className="pd-img-main">
                    {currentImg
                      ? <img src={currentImg} alt={product.productNm} />
                      : <div className="pd-img-empty">이미지 없음</div>}
                    {images.length > 1 && (
                      <>
                        <button className="pd-img-arrow left" onClick={() => setImgIndex(p => p === 0 ? images.length - 1 : p - 1)}>‹</button>
                        <button className="pd-img-arrow right" onClick={() => setImgIndex(p => p === images.length - 1 ? 0 : p + 1)}>›</button>
                        <div className="pd-img-counter">{imgIndex + 1} / {images.length}</div>
                      </>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="pd-thumbs">
                      {images.map((img, i) => (
                        <button key={i} className={`pd-thumb ${i === imgIndex ? "active" : ""}`} onClick={() => setImgIndex(i)}>
                          <img src={img.imgPath} alt={`${i + 1}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="pd-info">
                  {isDiscontinued && <div className="pd-discontinued">판매 중단된 상품입니다.</div>}

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
                    <span className="pd-meta-val">{typeof product.category === 'object' ? (product.category?.korName || product.category?.name) : (CATEGORY_KOR[product.category] || product.category)}</span>
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
                    <div className="pd-buy-row">
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
                      <button className={`pd-icon-btn${wishlisted ? " on" : ""}`} onClick={handleWishlistClick} title={wishlisted ? "저장됨" : "저장"}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "#222" : "none"} stroke="#222" strokeWidth="1.8">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                      </button>
                      <button className="pd-icon-btn" onClick={handleCopyLink} title="공유">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.8">
                          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                      </button>
                    </div>
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
                ) : reviews.map(r => (
                  <div key={r.id} className="pd-review">
                    <div className="pd-review-top">
                      <span className="pd-review-user">{r.userNm}</span>
                      <span className="pd-review-stars">{renderStars(r.rating)}</span>
                      <span className="pd-review-date">{formatDate(r.createdAt)}</span>
                    </div>
                    <p className="pd-review-text">{r.content}</p>
                    {r.imgPaths?.length > 0 && (
                      <div className="pd-review-imgs">
                        {r.imgPaths.map((src, i) => <img key={i} src={src} alt="" className="pd-review-img" />)}
                      </div>
                    )}
                  </div>
                ))}
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
                          {p.image ? <img src={p.image} alt={p.name} /> : <div className="pd-similar-img-empty" />}
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

        {/* ── 주문 바텀 시트 ── */}
        {product && (
          <>
            {/* 시트 열릴 때 바디를 살짝 어둡게 */}
            <div
              className={`pd-sheet-backdrop ${showOrderSheet ? "visible" : ""}`}
              onClick={() => setShowOrderSheet(false)}
            />
            <div className={`pd-order-sheet ${showOrderSheet ? "open" : ""}`}>
              {/* 핸들 */}
              <div className="pd-sheet-header">
                <div className="pd-sheet-handle" />
              </div>

              <div className="pd-sheet-body">
                {/* 상품 요약 */}
                <div className="order-product-summary">
                  <div className="order-product-thumb">
                    {product.images?.length > 0
                      ? <img src={product.images[0].imgPath} alt={product.productNm} />
                      : <div className="order-product-thumb-empty" />}
                  </div>
                  <div className="order-product-info">
                    <span className="order-product-brand">{product.brandNm}</span>
                    <span className="order-product-name">{product.productNm}</span>
                    {product.productEnNm && <span className="order-product-name-en">{product.productEnNm}</span>}
                    {selectedSize && <span className="order-product-size">사이즈: {selectedSize.sizeNm}</span>}
                    <span className="order-product-price">{product.productPrice?.toLocaleString()}원</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="order-form">
                  {/* 수량 */}
                  <div className="order-field">
                    <label className="order-label">수량</label>
                    <div className="order-quantity">
                      <button type="button" className="order-qty-btn" onClick={() => handleQuantityChange(-1)}>−</button>
                      <span className="order-qty-value">{orderForm.quantity}</span>
                      <button type="button" className="order-qty-btn" onClick={() => handleQuantityChange(1)}>+</button>
                      <span className="order-qty-stock">재고 {maxQuantity}개</span>
                    </div>
                  </div>

                  {/* 배송지 */}
                  <div className="order-section">
                    <div className="order-section-header">
                      <span className="order-section-title">배송지</span>
                      <button type="button" className="order-addr-add-btn" onClick={() => setShowAddressForm(v => !v)}>
                        {showAddressForm ? "닫기" : "+ 배송지 추가"}
                      </button>
                    </div>

                    {showAddressForm && (
                      <div className="pd-addr-form">
                        <div className="order-field">
                          <label className="order-label">수령인</label>
                          <input className="order-input" type="text" name="recipientName" placeholder="수령인 이름" value={addressForm.recipientName} onChange={handleAddressFormChange} />
                        </div>
                        <div className="order-field">
                          <label className="order-label">연락처</label>
                          <input className="order-input" type="text" name="recipientPhone" placeholder="010-0000-0000" value={addressForm.recipientPhone} onChange={handleAddressFormChange} />
                        </div>
                        <div className="order-field order-field-address">
                          <label className="order-label">주소</label>
                          <div className="order-address-wrap">
                            <div className="order-address-zip-row">
                              <input className="order-input order-input-zip" type="text" value={addressForm.zipCode} readOnly placeholder="우편번호" />
                              <button type="button" className="order-address-search-btn" onClick={() => setShowPostcode(true)}>주소 검색</button>
                            </div>
                            <input className="order-input" type="text" value={addressForm.baseAddress} readOnly placeholder="기본 주소" />
                            <input className="order-input" type="text" name="detailAddress" placeholder="상세 주소 (동, 호수 등)" value={addressForm.detailAddress} onChange={handleAddressFormChange} ref={detailRef} />
                          </div>
                        </div>
                        <label className="order-addr-default-check">
                          <input type="checkbox" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressFormChange} />
                          기본 배송지로 설정
                        </label>
                        <button type="button" className="pd-addr-save-btn" onClick={handleAddressSubmit}>저장</button>
                      </div>
                    )}

                    {addresses.length === 0 ? (
                      <p className="order-addr-empty">등록된 배송지가 없습니다. 배송지를 추가해주세요.</p>
                    ) : (
                      <div className="order-addr-list">
                        {addresses.map(addr => (
                          <div
                            key={addr.id}
                            className={`order-addr-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                            onClick={() => setSelectedAddressId(addr.id)}
                          >
                            <div className="order-addr-card-radio">
                              <div className={`order-addr-radio-dot ${selectedAddressId === addr.id ? 'on' : ''}`} />
                            </div>
                            <div className="order-addr-card-info">
                              <div className="order-addr-card-top">
                                <span className="order-addr-card-name">{addr.recipientName}</span>
                                <span className="order-addr-card-phone">{addr.recipientPhone}</span>
                                {addr.isDefault && <span className="order-addr-default-badge">기본</span>}
                              </div>
                              <p className="order-addr-card-address">[{addr.zipCode}] {addr.baseAddress} {addr.detailAddress}</p>
                              <div className="order-addr-card-actions">
                                {!addr.isDefault && (
                                  <button type="button" className="order-addr-action-btn" onClick={(e) => handleSetDefault(e, addr.id)}>기본 설정</button>
                                )}
                                <button type="button" className="order-addr-action-btn order-addr-delete-btn" onClick={(e) => handleDeleteAddress(e, addr.id)}>삭제</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 쿠폰 */}
                  <div className="order-field">
                    <label className="order-label">쿠폰</label>
                    <div className="order-coupon-wrap">
                      {(() => {
                        const productCoupons = coupons.filter(isCouponApplicable);
                        if (coupons.length === 0) return <span className="order-point-available">사용 가능한 쿠폰이 없습니다</span>;
                        if (productCoupons.length === 0) return <span className="order-point-available">이 상품에 적용 가능한 쿠폰이 없습니다</span>;
                        return (
                          <>
                            <select
                              className="order-input order-coupon-select"
                              value={selectedCoupon?.userCouponId || ''}
                              onChange={(e) => {
                                const c = productCoupons.find(c => String(c.userCouponId) === e.target.value);
                                setSelectedCoupon(c || null);
                              }}
                            >
                              <option value="">쿠폰 선택 안함</option>
                              {productCoupons.map(c => {
                                const meetsMin = totalPrice >= (c.minOrderPrice || 0);
                                return (
                                  <option key={c.userCouponId} value={c.userCouponId} disabled={!meetsMin}>
                                    {formatCouponLabel(c)}{!meetsMin ? ` (${c.minOrderPrice.toLocaleString()}원 이상)` : ''}
                                  </option>
                                );
                              })}
                            </select>
                            {selectedCoupon && totalPrice < (selectedCoupon.minOrderPrice || 0) && (
                              <p className="order-coupon-warn">최소 주문금액 {selectedCoupon.minOrderPrice.toLocaleString()}원 이상 구매 시 사용 가능합니다.</p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 포인트 */}
                  <div className="order-field">
                    <label className="order-label">포인트</label>
                    <div className="order-point-wrap">
                      <input className="order-input order-point-input" type="number" name="usePoint" value={orderForm.usePoint} onChange={handleOrderFormChange} min={0} max={availablePoint} placeholder="0" />
                      <span className="order-point-available">보유 {availablePoint.toLocaleString()} P</span>
                    </div>
                  </div>

                  {/* 결제 요약 */}
                  <div className="order-summary">
                    <div className="order-summary-row"><span>상품금액</span><span>{totalPrice.toLocaleString()}원</span></div>
                    {couponDiscount > 0 && <div className="order-summary-row discount"><span>쿠폰 할인</span><span>− {couponDiscount.toLocaleString()}원</span></div>}
                    {usePoint > 0 && <div className="order-summary-row discount"><span>포인트 할인</span><span>− {usePoint.toLocaleString()}P</span></div>}
                    <div className="order-summary-row total"><span>최종 결제금액</span><strong>{finalPrice.toLocaleString()}원</strong></div>
                  </div>

                  {orderError && <p className="order-error">{orderError}</p>}
                  <button type="submit" className="order-submit-btn" disabled={submitting}>
                    {submitting ? "처리 중..." : `${finalPrice.toLocaleString()}원 결제하기`}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
        </div> {/* pd-content-area */}
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {selectedPost && <PostDetailPanel post={selectedPost} onClose={() => setSelectedPost(null)} />}

      {showPostcode && (
        <div className="order-postcode-overlay" onClick={() => setShowPostcode(false)}>
          <div className="order-postcode-popup" onClick={e => e.stopPropagation()}>
            <div className="order-postcode-header">
              <span>주소 검색</span>
              <button onClick={() => setShowPostcode(false)}>✕</button>
            </div>
            <DaumPostcode onComplete={handlePostcodeComplete} autoClose={false} />
          </div>
        </div>
      )}
    </>
  );
}

export default ProductDetailModal;
