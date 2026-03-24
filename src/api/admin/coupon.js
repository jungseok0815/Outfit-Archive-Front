import api from '../api';

// POST /api/admin/coupon
// body: { code, name, discountType (FIXED|PERCENT), discountValue, minOrderPrice, maxDiscountPrice, totalQuantity, startAt, endAt }
export const CreateCoupon = (dto) => {
    return api.post('/api/admin/coupon', dto);
};
