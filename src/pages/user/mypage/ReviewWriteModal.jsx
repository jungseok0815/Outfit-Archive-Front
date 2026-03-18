import React, { useState } from "react";
import { InsertProductReview } from "../../../api/user/product";
import "./ReviewWriteModal.css";
import { toast } from "react-toastify";

function ReviewWriteModal({ order, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      toast.warn("별점을 선택해주세요.");
      return;
    }
    if (!content.trim()) {
      toast.warn("후기 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    InsertProductReview({
      orderId: order.orderId,
      content: content.trim(),
      rating,
    })
      .then(() => {
        onSuccess?.();
        onClose();
      })
      .catch((e) => {
        const msg = e.response?.data?.msg || "후기 등록에 실패했습니다.";
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h3>후기 작성</h3>
          <button className="review-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="review-modal-product">
          {order.brandNm && <span className="review-modal-brand">{order.brandNm}</span>}
          <span className="review-modal-product-name">{order.productNm}</span>
        </div>

        <div className="review-modal-rating">
          <span className="review-modal-rating-label">별점</span>
          <div className="review-modal-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`review-modal-star ${star <= (hoverRating || rating) ? "filled" : ""}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <textarea
          className="review-modal-textarea"
          placeholder="상품에 대한 솔직한 후기를 남겨주세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={5}
        />
        <div className="review-modal-char-count">{content.length}/1000</div>

        <button
          className="review-modal-submit"
          onClick={handleSubmit}
          disabled={loading || rating === 0 || !content.trim()}
        >
          {loading ? "등록 중..." : "후기 등록"}
        </button>
      </div>
    </div>
  );
}

export default ReviewWriteModal;
