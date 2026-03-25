import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { ListProduct } from '../../../api/user/product';
import { AdminListProductReview, AdminDeleteReview } from '../../../api/admin/review';
import { toast } from 'react-toastify';
import ConfirmModal from '../../../components/common/Modal/ConfirmModal';
import './ReviewManagement.css';

const CATEGORY_KOR = {
  TOP: '상의', BOTTOM: '하의', OUTER: '아우터',
  DRESS: '원피스', SHOES: '신발', BAG: '가방',
};

const PRODUCT_PAGE_SIZE = 10;
const REVIEW_PAGE_SIZE = 10;

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const Stars = ({ rating, size = 14 }) => (
  <span className="review-stars">
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#f5a623' : '#e0e0e0', fontSize: size }}>★</span>
    ))}
  </span>
);

// 리뷰 상세 패널
const ReviewPanel = ({ productId, canDelete }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const load = useCallback((p) => {
    setLoading(true);
    AdminListProductReview(productId, p, REVIEW_PAGE_SIZE)
      .then(res => {
        const data = res.data;
        setReviews(data.content || []);
        setTotalElements(data.totalElements || 0);
        setTotalPages(data.totalPages || 0);
        setPage(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  const handleDelete = (reviewId) => {
    setConfirmTarget(reviewId);
  };

  const handleConfirmDelete = () => {
    AdminDeleteReview(confirmTarget)
      .then(() => {
        toast.success('리뷰가 삭제되었습니다.');
        setConfirmTarget(null);
        load(page);
      })
      .catch(() => {
        toast.error('삭제에 실패했습니다.');
        setConfirmTarget(null);
      });
  };

  useEffect(() => { load(0); }, [load]);

  if (loading) return <div className="review-panel-empty">불러오는 중...</div>;

  if (totalElements === 0) return (
    <div className="review-panel-empty">아직 등록된 리뷰가 없습니다.</div>
  );

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(0, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="review-panel">
      <ConfirmModal
        isOpen={confirmTarget !== null}
        message="이 리뷰를 삭제하시겠습니까?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />
      {/* 요약 */}
      <div className="review-panel-summary">
        <div className="review-panel-avg-box">
          <div className="review-panel-score">{avgRating.toFixed(1)}</div>
          <Stars rating={Math.round(avgRating)} size={22} />
          <div className="review-panel-total-count">총 {totalElements}개 리뷰</div>
        </div>

        <div className="review-panel-dist">
          {distribution.map(({ star, count }) => (
            <div key={star} className="review-panel-dist-row">
              <span className="review-panel-dist-label">{star}점</span>
              <div className="review-panel-dist-bar-wrap">
                <div
                  className="review-panel-dist-bar"
                  style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                />
              </div>
              <span className="review-panel-dist-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="review-panel-list">
        {reviews.map(review => (
          <div key={review.id} className="review-panel-item">
            <div className="review-panel-item-header">
              <span className="review-panel-item-user">{review.userNm}</span>
              <Stars rating={review.rating} size={13} />
              <span className="review-panel-item-date">
                {formatDate(review.createdDate || review.createdAt)}
              </span>
              {canDelete && (
                <button
                  className="review-panel-delete-btn"
                  onClick={() => handleDelete(review.id)}
                  title="리뷰 삭제"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="review-panel-item-content">{review.content}</p>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="review-panel-pagination">
          <button className="rpg-btn" disabled={page === 0} onClick={() => load(page - 1)}>
            <ChevronLeft size={14} />
          </button>
          {getPageNumbers().map(i => (
            <button
              key={i}
              className={`rpg-btn ${page === i ? 'active' : ''}`}
              onClick={() => load(i)}
            >
              {i + 1}
            </button>
          ))}
          <button className="rpg-btn" disabled={page === totalPages - 1} onClick={() => load(page + 1)}>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

// 메인 컴포넌트
const ReviewManagement = ({ user }) => {
  const isSuperAdmin = user?.adminRole === 'SUPER_ADMIN';
  const isPartner = user?.adminRole === 'PARTNER';
  const partnerBrandId = isPartner ? user?.brandId : null;

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const debounceRef = useRef(null);

  const totalPages = Math.ceil(totalProducts / PRODUCT_PAGE_SIZE);

  const loadProducts = useCallback((keyword, page) => {
    setLoading(true);
    ListProduct(keyword, null, page, PRODUCT_PAGE_SIZE, partnerBrandId)
      .then(res => {
        setProducts(res.data.content || []);
        setTotalProducts(res.data.totalElements || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [partnerBrandId]);

  useEffect(() => {
    loadProducts(searchTerm, currentPage);
  }, [searchTerm, currentPage, loadProducts]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(val);
      setCurrentPage(0);
      setSelectedProductId(null);
    }, 400);
  };

  const handleRowClick = (productId) => {
    setSelectedProductId(prev => prev === productId ? null : productId);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(0, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="review-mgmt">
      {/* 툴바 */}
      <div className="review-mgmt-toolbar">
        <div className="review-mgmt-search-box">
          <Search className="review-mgmt-search-icon" size={16} />
          <input
            type="text"
            className="review-mgmt-search-input"
            placeholder="상품명, 브랜드 검색"
            value={inputValue}
            onChange={handleSearchChange}
          />
        </div>
        <span className="review-mgmt-count">전체 상품 {totalProducts}개</span>
      </div>

      {/* 상품 테이블 */}
      <div className="review-mgmt-table-wrap">
        <table className="review-mgmt-table">
          <thead>
            <tr>
              <th>상품</th>
              <th>브랜드</th>
              <th>카테고리</th>
              <th>가격</th>
              <th>리뷰</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="review-mgmt-empty">불러오는 중...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="review-mgmt-empty">검색 결과가 없습니다.</td>
              </tr>
            ) : (
              products.map(product => (
                <React.Fragment key={product.id}>
                  <tr
                    className={`review-mgmt-row ${selectedProductId === product.id ? 'selected' : ''}`}
                    onClick={() => handleRowClick(product.id)}
                  >
                    <td>
                      <div className="review-mgmt-product-cell">
                        {product.images?.[0]?.imgPath ? (
                          <img
                            src={product.images[0].imgPath}
                            alt={product.productNm}
                            className="review-mgmt-product-img"
                          />
                        ) : (
                          <div className="review-mgmt-product-img-placeholder" />
                        )}
                        <span className="review-mgmt-product-name">{product.productNm}</span>
                      </div>
                    </td>
                    <td>{product.brandNm}</td>
                    <td>
                      <span className="review-mgmt-badge">
                        {CATEGORY_KOR[product.category] || product.category}
                      </span>
                    </td>
                    <td>{product.productPrice?.toLocaleString()}원</td>
                    <td>
                      <button className="review-mgmt-toggle-btn">
                        {selectedProductId === product.id
                          ? <ChevronUp size={16} />
                          : <ChevronDown size={16} />
                        }
                        <span>{selectedProductId === product.id ? '접기' : '보기'}</span>
                      </button>
                    </td>
                  </tr>
                  {selectedProductId === product.id && (
                    <tr className="review-mgmt-detail-row">
                      <td colSpan={5}>
                        <ReviewPanel productId={product.id} canDelete={isSuperAdmin} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="review-mgmt-pagination">
          <button
            className="rpg-btn"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          {getPageNumbers().map(i => (
            <button
              key={i}
              className={`rpg-btn ${currentPage === i ? 'active' : ''}`}
              onClick={() => setCurrentPage(i)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="rpg-btn"
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
