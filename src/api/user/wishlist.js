import api from '../api';

// POST /api/usr/wishlist/toggle?productId={productId} → { wished: boolean }
export const ToggleWishlist = (productId) => api.post('/api/usr/wishlist/toggle', null, { params: { productId } });

// GET /api/usr/wishlist/status?productId={productId} → { wished: boolean }
export const CheckWishlist = (productId) => api.get('/api/usr/wishlist/status', { params: { productId } });

// GET /api/usr/wishlist?page=0&size=20 → Page<WishlistResponseDto>
// WishlistResponseDto: { wishlistId, productId, productNm, productPrice, brandNm, imgPath }
export const ListWishlist = (page = 0, size = 20) => api.get('/api/usr/wishlist', { params: { page, size } });
