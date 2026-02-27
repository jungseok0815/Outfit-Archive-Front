import api from '../api';

// GET /api/admin/order/list → Spring Page<ResponseOrderDto>
// ResponseOrderDto: { id, userId, userNm, productNm, quantity, totalPrice, status, orderDate, shippingAddress, recipientName, recipientPhone }
// status enum: PAYMENT_COMPLETE | SHIPPING | DELIVERED | CANCELLED
export const ListOrder = (keyword = '', page = 0, size = 50, brandId = null) => {
    const params = { keyword, page, size };
    if (brandId) params.brandId = brandId;
    return api.get('/api/admin/order/list', { params });
}

// PUT /api/admin/order/status - Body: { id: Long, status: OrderStatus }
export const UpdateOrderStatus = (statusForm) => {
    return api.put("/api/admin/order/status", statusForm);
}

export const DeleteOrder = (orderId) => {
    return api.delete('/api/admin/order/delete', { params: { id: orderId } });
}
