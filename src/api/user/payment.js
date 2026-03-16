import api from '../api';

// POST /api/usr/payment/confirm
// Body: { paymentKey, orderId, amount }
export const ConfirmPayment = (confirmDto) =>
    api.post('/api/usr/payment/confirm', confirmDto);

// POST /api/usr/payment/cancel/{orderId}
export const CancelPayment = (orderId, cancelReason) =>
    api.post(`/api/usr/payment/cancel/${orderId}`, { cancelReason });
