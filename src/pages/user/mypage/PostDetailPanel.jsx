import React, { useState, useEffect } from "react";
import "./PostDetailPanel.css";
import { ListComment, InsertComment } from '../../../api/user/post';

function PostDetailPanel({ post, onClose, onDelete, onEdit }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    setImageIndex(0);
    setShowComments(false);
    setShowProducts(false);
    setComments([]);
    setNewComment("");
  }, [post]);

  useEffect(() => {
    if (showComments && post?.id) {
      ListComment(post.id, 0, 20)
        .then(res => setComments(res.data.content || []))
        .catch(e => console.error('댓글 조회 실패:', e));
    }
  }, [showComments, post?.id]);

  if (!post) return null;

  const images = post.images || [];
  const hasMultiple = images.length > 1;

  const goPrev = () => setImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () => setImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    InsertComment({ postId: post.id, content: newComment.trim() })
      .then(() => {
        return ListComment(post.id, 0, 20);
      })
      .then(res => {
        setComments(res.data.content || []);
        setNewComment("");
      })
      .catch(e => console.error('댓글 등록 실패:', e))
      .finally(() => setSubmittingComment(false));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <button className="detail-close" onClick={onClose}>✕</button>
          <div className="detail-actions">
            {onEdit && (
              <button className="detail-action-btn detail-edit-btn" onClick={() => onEdit(post)}>
                수정
              </button>
            )}
            {onDelete && (
              <button className="detail-action-btn detail-delete-btn" onClick={() => onDelete(post.id)}>
                삭제
              </button>
            )}
          </div>
        </div>

        {/* 이미지 캐러셀 */}
        {images.length > 0 && (
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
                    <button key={i} className={`detail-dot ${i === imageIndex ? "active" : ""}`} onClick={() => setImageIndex(i)} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 제목 */}
        {post.title && (
          <div className="detail-title-wrap">
            <p className="detail-title">{post.title}</p>
          </div>
        )}

        {/* 캡션 */}
        {post.content && (
          <div className="detail-caption">
            <p>{post.content}</p>
          </div>
        )}

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
          {post.products?.length > 0 && (
            <button
              className={`detail-stat-item detail-stat-btn ${showProducts ? "active" : ""}`}
              onClick={() => setShowProducts(!showProducts)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 7h-3V6a4 4 0 00-8 0v1H5a1 1 0 00-1 1v11a3 3 0 003 3h10a3 3 0 003-3V8a1 1 0 00-1-1zm-9-1a2 2 0 014 0v1h-4V6zm8 13a1 1 0 01-1 1H7a1 1 0 01-1-1V9h2v1a1 1 0 002 0V9h4v1a1 1 0 002 0V9h2v10z"/>
              </svg>
              {post.products.length}
            </button>
          )}
        </div>

        {/* 상품 섹션 */}
        {showProducts && post.products?.length > 0 && (
          <div className="detail-products">
            <p className="detail-products-title">착용 상품</p>
            {post.products.map((product) => (
              <div key={product.id} className="detail-product-item">
                <div className="detail-product-thumb" />
                <div className="detail-product-info">
                  <span className="detail-product-brand">{product.brandNm}</span>
                  <span className="detail-product-name">{product.productNm}</span>
                  <span className="detail-product-price">{product.productPrice?.toLocaleString()}원</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 댓글 섹션 */}
        {showComments && (
          <div className="detail-comments">
            <p className="detail-comments-title">댓글</p>
            <div className="detail-comments-list">
              {comments.length === 0 ? (
                <p style={{ color: '#999', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>첫 댓글을 남겨보세요!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="detail-comment">
                    <span className="detail-comment-user">{comment.userNm}</span>
                    <span className="detail-comment-text">{comment.content}</span>
                    <span className="detail-comment-time">{formatDate(comment.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
            <div className="detail-comment-input-wrap">
              <input
                className="detail-comment-input"
                type="text"
                placeholder="댓글 달기..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
              />
              <button
                className="detail-comment-submit"
                onClick={handleCommentSubmit}
                disabled={submittingComment || !newComment.trim()}
              >
                게시
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostDetailPanel;
