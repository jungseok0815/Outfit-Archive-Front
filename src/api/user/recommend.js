import api from '../api';

// GET /api/recommend/products?limit={n} → 로그인 여부에 따라 인기/콘텐츠 기반 혼합
export const RecommendProducts = (limit = 12) => {
    return api.get('/api/recommend/products', { params: { limit } });
}

// GET /api/recommend/popular?limit={n} → 로그인 여부 무관 인기 상품
export const RecommendPopularProducts = (limit = 8) => {
    return api.get('/api/recommend/popular', { params: { limit } });
}
