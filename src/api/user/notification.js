import api from '../api';

// 알림 목록 조회
export const getNotifications = () => api.get('/api/usr/notification/list');

// 읽지 않은 알림 수
export const getUnreadCount = () => api.get('/api/usr/notification/unread-count');

// 전체 읽음 처리
export const markAllRead = () => api.patch('/api/usr/notification/read-all');

// 단건 읽음 처리
export const markRead = (id) => api.patch(`/api/usr/notification/read/${id}`);

// SSE 구독 (EventSource - 쿠키 인증 자동 포함)
export const subscribeNotification = (onMessage) => {
    const eventSource = new EventSource('/api/usr/notification/subscribe', { withCredentials: true });
    eventSource.addEventListener('notification', (e) => {
        try {
            onMessage(JSON.parse(e.data));
        } catch (_) {}
    });
    eventSource.onerror = () => eventSource.close();
    return eventSource;
};
