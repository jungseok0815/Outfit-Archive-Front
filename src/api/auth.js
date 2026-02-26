import api from './api';

// 사용자/관리자 공통 로그인 - JWT 쿠키 발급
// 응답: { id, userId, userNm, userAge, authName: "ROLE_USER" | "ROLE_ADMIN" }
export const postLogin = (loginForm) => {
    return api.post("/api/usr/login", loginForm);
}

// 회원가입 - POST /api/usr/join
export const postJoin = (joinForm) => {
    return api.post("/api/usr/join", joinForm);
}

export const AdminJoin = (joinForm) => {
    return api.post("/api/admin/auth/join", joinForm);
}
