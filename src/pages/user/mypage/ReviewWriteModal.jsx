import React, { useState, useRef } from "react";
import { InsertProductReview } from "../../../api/user/product";
import "./ReviewWriteModal.css";
import { toast } from "react-toastify";

const MAX_IMAGES = 3;

function ReviewWriteModal({ order, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remaining = MAX_IMAGES - images.length;
    if (files.length > remaining) {
      toast.warn(`사진은 최대 ${MAX_IMAGES}장까지 첨부 가능합니다.`);
    }
    const selected = files.slice(0, remaining);
    setImages(prev => [...prev, ...selected]);
    setPreviews(prev => [...prev, ...selected.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

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
      images,
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
          {order.productImgPath && (
            <img className="review-modal-product-img" src={order.productImgPath} alt={order.productNm} />
          )}
          <div className="review-modal-product-info">
            {order.brandNm && <span className="review-modal-brand">{order.brandNm}</span>}
            <span className="review-modal-product-name">{order.productNm}</span>
          </div>
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

        <div className="review-modal-images">
          <div className="review-modal-image-list">
            {previews.map((src, i) => (
              <div className="review-modal-image-item" key={i}>
                <img src={src} alt={`첨부 ${i + 1}`} />
                <button className="review-modal-image-remove" onClick={() => handleRemoveImage(i)}>×</button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button className="review-modal-image-add" onClick={() => fileInputRef.current.click()}>
                <span>+</span>
                <span className="review-modal-image-count">{images.length}/{MAX_IMAGES}</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
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
