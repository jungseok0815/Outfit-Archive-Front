import api from '../api';

// GET /api/usr/order/my → Spring Page<ResponseOrderDto>
// ResponseOrderDto: { id, productNm, brandNm, quantity, totalPrice, status, orderDate, shippingAddress, recipientName, recipientPhone }
// status enum: PAYMENT_COMPLETE | SHIPPING | DELIVERED | CANCELLED
export const ListMyOrder = (page = 0, size = 20) => {
    return api.get('/api/usr/order/my', { params: { page, size } });
}
