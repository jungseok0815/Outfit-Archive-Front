import api from '../api';

// POST /api/usr/payment/confirm
// Body: { paymentKey, orderId, amount }
export const ConfirmPayment = (confirmDto) =>
    api.post('/api/usr/payment/confirm', confirmDto);

// POST /api/usr/payment/direct-complete?orderId={tossOrderId}
// PG 없이 직접 결제 완료 처리 → ResponseUserOrderDto 반환
export const DirectCompleteOrder = (tossOrderId) =>
    api.post('/api/usr/payment/direct-complete', null, { params: { orderId: tossOrderId } });

// POST /api/usr/payment/cancel/{orderId}
export const CancelPayment = (orderId, cancelReason) =>
    api.post(`/api/usr/payment/cancel/${orderId}`, { cancelReason });
