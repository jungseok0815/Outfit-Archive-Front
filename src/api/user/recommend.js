import api from '../api';

// GET /api/usr/recommend/products?limit={n} → List<RecommendProductDto>
// RecommendProductDto: { productId, productNm, productCode, productPrice, category, brandNm, orderCount, reason }
export const RecommendProducts = (limit = 12) => {
    return api.get('/api/usr/recommend/products', { params: { limit } });
}
