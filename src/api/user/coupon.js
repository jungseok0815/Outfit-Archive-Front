import api from '../api';

// POST /api/usr/coupon/issue?code=XXXX
export const IssueCoupon = (code) => {
    return api.post('/api/usr/coupon/issue', null, { params: { code } });
};

// GET /api/usr/coupon
// 응답: [{ userCouponId, couponName, couponCode, discountType, discountValue, minOrderPrice, maxDiscountPrice, isUsed, issuedAt, expiredAt }]
export const GetMyCoupons = () => {
    return api.get('/api/usr/coupon');
};
