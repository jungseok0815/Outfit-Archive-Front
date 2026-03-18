import api from '../api';

// GET /api/admin/review/product/{productId} → Spring Page<ResponseReviewDto>
export const AdminListProductReview = (productId, page = 0, size = 10) => {
    return api.get(`/api/admin/review/product/${productId}`, { params: { page, size } });
}

// DELETE /api/admin/review/{reviewId}
export const AdminDeleteReview = (reviewId) => {
    return api.delete(`/api/admin/review/${reviewId}`);
}
