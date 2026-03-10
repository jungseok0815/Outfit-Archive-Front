import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../../components/user/header/Header";
import AuthModal from "../auth/AuthPage";
import { GetProduct } from "../../../api/user/product";
import "../../../App.css";
import "./ProductDetailPage.css";

const IMG_BASE = "http://localhost:8080/api/img/get?imgNm=";

const CATEGORY_KOR = {
  TOP: "상의", BOTTOM: "하의", OUTER: "아우터",
  DRESS: "원피스/세트", SHOES: "신발", BAG: "가방",
};

function ProductDetailPage() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!product);
  const [imgIndex, setImgIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!product) {
      setLoading(true);
      GetProduct(productId)
        .then((res) => {
          setProduct(res.data);
        })
        .catch((e) => console.error("상품 조회 실패:", e))
        .finally(() => setLoading(false));
    }
  }, [productId, product]);

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
  const currentImg =
    images.length > 0
      ? `${IMG_BASE}${images[imgIndex].imgNm}`
      : "";

  const handlePrev = () =>
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () =>
    setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowAuthModal(true)} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

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
            <div className="detail-brand">{product.brandNm}</div>
            <h1 className="detail-name">{product.productNm}</h1>
            <div className="detail-price">
              {product.productPrice?.toLocaleString()}원
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
