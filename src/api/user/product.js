import api from '../api';

// GET /api/usr/product/list → Spring Page<ResponseProductDto>
// ResponseProductDto: { id, productNm, productCode, productPrice, productQuantity, brandId, brandNm, category, images[] }
export const ListProduct = (keyword = '', category = null, page = 0, size = 12) => {
    const params = { keyword, page, size };
    if (category) params.category = category;
    return api.get('/api/usr/product/list', { params });
}

// GET /api/usr/product/get?id={id} → ResponseProductDto
export const GetProduct = (id) => {
    return api.get('/api/usr/product/get', { params: { id } });
}

// GET /api/usr/product/review/list?productId={id}&page=0&size=10 → Spring Page<ReviewDto>
// ReviewDto: { id, productId, userNm, content, rating, createdAt }
export const ListProductReview = (productId, page = 0, size = 10) => {
    return api.get('/api/usr/product/review/list', { params: { productId, page, size } });
}

// POST /api/usr/product/review/insert - Body: { productId, content, rating }
export const InsertProductReview = (reviewDto) => {
    return api.post('/api/usr/product/review/insert', reviewDto);
}
