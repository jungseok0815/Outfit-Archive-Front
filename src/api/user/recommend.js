import api from '../api';

// GET /api/recommend/products?limit={n} → 비로그인: 인기 상품 / 로그인: 조회 기록 기반
export const RecommendProducts = (limit = 12) => {
    return api.get('/api/recommend/products', { params: { limit } });
}

// GET /api/recommend/ai?limit={n}&page={p} → 벡터(CLIP) 기반 AI 추천, 관련도 순 페이지네이션
export const RecommendAiProducts = (limit = 12, page = 0) => {
    return api.get('/api/recommend/ai', { params: { limit, page } });
}

// GET /api/recommend/popular?limit={n} → 로그인 여부 무관 인기 상품
export const RecommendPopularProducts = (limit = 8) => {
    return api.get('/api/recommend/popular', { params: { limit } });
}

// GET /api/usr/product/similar?productId={id}&limit={n} → 벡터(CLIP) 코사인 유사도 기반 유사 상품
export const GetSimilarProducts = (productId, limit = 8) => {
    return api.get('/api/usr/product/similar', { params: { productId, limit } });
}
