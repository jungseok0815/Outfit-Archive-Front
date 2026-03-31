import api from '../api';

// POST /api/usr/product/view/{productId} → 상품 조회 기록
export const RecordProductView = (productId) => api.post(`/api/usr/product/view/${productId}`);
