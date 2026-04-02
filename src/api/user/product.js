import api from '../api';

// GET /api/usr/product/list → Spring Page<ResponseProductDto>
// ResponseProductDto: { id, productNm, productCode, productPrice, productQuantity, brandId, brandNm, category, images[] }
export const ListProduct = (keyword = '', category = null, page = 0, size = 12, brandId = null, sortBy = 'popular') => {
    const params = { keyword, page, size, sortBy };
    if (category) params.category = category;
    if (brandId) params.brandId = brandId;
    return api.get('/api/usr/product/list', { params });
}

// GET /api/usr/product/{id} → ResponseProductDto
export const GetProduct = (id) => {
    return api.get(`/api/usr/product/${id}`);
}

// GET /api/usr/review/product/{productId} → Spring Page<ResponseReviewDto>
// ResponseReviewDto: { id, orderId, productId, productNm, userId, userNm, rating, content, createdDate, updatedDate }
export const ListProductReview = (productId, page = 0, size = 10) => {
    return api.get(`/api/usr/review/product/${productId}`, { params: { page, size } });
}

// POST /api/usr/review - Body: { orderId, rating, content }
export const InsertProductReview = (reviewDto) => {
    const formData = new FormData();
    formData.append('orderId', reviewDto.orderId);
    formData.append('rating', reviewDto.rating);
    formData.append('content', reviewDto.content);
    if (reviewDto.images) {
        reviewDto.images.forEach(img => formData.append('images', img));
    }
    return api.post('/api/usr/review', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}
