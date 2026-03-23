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
            localStorage.removeItem('user');
            localStorage.removeItem('adminUser');
            window.location.href = isAdminRequest ? '/admin' : '/';
        }
        return Promise.reject(error);
    }
)

export default api;

