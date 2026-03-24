import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,  // 쿠키 처리를 위해 필수
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const isAdminRequest = error.config?.url?.includes('/api/admin/');
            const hasUser = isAdminRequest
                ? !!localStorage.getItem('adminUser')
                : !!localStorage.getItem('user');

            // 로그인 상태였을 때만 리다이렉트 (세션 만료 처리)
            // 비로그인 상태에서 인증 필요 API 호출 시엔 그냥 에러 반환
            if (hasUser) {
                localStorage.removeItem('user');
                localStorage.removeItem('adminUser');
                window.location.href = isAdminRequest ? '/admin' : '/';
            }
        }
        return Promise.reject(error);
    }
)

export default api;

