import React, { useState, useEffect } from "react";
import "./PostDetailPanel.css";

const dummyProducts = [
  { id: 1, image: "https://via.placeholder.com/100/222222", brand: "Nike", name: "Air Force 1 '07 Low White", price: "139,000" },
  { id: 2, image: "https://via.placeholder.com/100/333333", brand: "Levi's", name: "501 Original Fit Jeans", price: "89,000" },
];

const dummyComments = [
  { id: 1, username: "fashionista_kr", text: "너무 멋있어요! 어디서 사셨어요?", time: "2시간 전" },
  { id: 2, username: "style_lover", text: "색 조합 진짜 좋다 👍", time: "3시간 전" },
  { id: 3, username: "daily_ootd", text: "오 이 조합 참고할게요!", time: "5시간 전" },
  { id: 4, username: "sneaker_head", text: "신발 정보 좀 알려주세요~", time: "1일 전" },
];

function PostDetailPanel({ post, onClose }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    setImageIndex(0);
    setShowComments(false);
  }, [post]);

  if (!post) return null;

  const images = post.images || [post.image];
  const hasMultiple = images.length > 1;

  const goPrev = () => setImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () => setImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>✕</button>

        {/* 이미지 캐러셀 */}
        <div className="detail-carousel">
          <img className="detail-image" src={images[imageIndex]} alt={`게시물 ${post.id}`} />
          {hasMultiple && (
            <>
              <button className="detail-arrow detail-arrow-left" onClick={goPrev}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button className="detail-arrow detail-arrow-right" onClick={goNext}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </button>
              <div className="detail-dots">
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={`detail-dot ${i === imageIndex ? "active" : ""}`}
                    onClick={() => setImageIndex(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 통계 (좋아요, 댓글) */}
        <div className="detail-stats">
          <div className="detail-stat-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {post.likes}
          </div>
          <button
            className={`detail-stat-item detail-stat-btn ${showComments ? "active" : ""}`}
            onClick={() => setShowComments(!showComments)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
            </svg>
            {post.comments}
          </button>
        </div>

        {/* 댓글 섹션 */}
        {showComments && (
          <div className="detail-comments">
            <p className="detail-comments-title">댓글</p>
            <div className="detail-comments-list">
              {dummyComments.map((comment) => (
                <div key={comment.id} className="detail-comment">
                  <span className="detail-comment-user">{comment.username}</span>
                  <span className="detail-comment-text">{comment.text}</span>
                  <span className="detail-comment-time">{comment.time}</span>
                </div>
              ))}
            </div>
            <div className="detail-comment-input-wrap">
              <input className="detail-comment-input" type="text" placeholder="댓글 달기..." />
              <button className="detail-comment-submit">게시</button>
            </div>
          </div>
        )}

        {/* 태그된 상품 */}
        <div className="detail-products">
          <p className="detail-products-title">태그된 상품</p>
          {dummyProducts.map((product) => (
            <div key={product.id} className="detail-product-item">
              <img className="detail-product-thumb" src={product.image} alt={product.name} />
              <div className="detail-product-info">
                <span className="detail-product-brand">{product.brand}</span>
                <span className="detail-product-name">{product.name}</span>
                <span className="detail-product-price">₩{product.price}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 캡션 */}
        <div className="detail-caption">
          <p>오늘의 데일리룩 🔥 편하면서도 스타일리시한 조합을 찾았어요. #OOTD #데일리룩 #스트릿패션</p>
        </div>
      </div>
    </div>
  );
}

export default PostDetailPanel;
