import api from '../api';

// POST /api/usr/order → ResponseUserOrderDto
// Body: { productId, quantity, shippingAddress, recipientName, recipientPhone, usePoint, sizeNm, userCouponId }
export const InsertOrder = (orderForm) =>
    api.post('/api/usr/order', orderForm);

// GET /api/usr/order/my → Spring Page<ResponseUserOrderDto>
// ResponseUserOrderDto: { orderId, productId, productNm, brandNm, quantity, totalPrice, usedPoint, earnedPoint, actualPayment, status, orderDate, deliveredDate, reviewWritten }
// status enum: PAYMENT_COMPLETE | SHIPPING | DELIVERED | CANCELLED
export const ListMyOrder = (page = 0, size = 20) => {
    return api.get('/api/usr/order/my', { params: { page, size } });
}
