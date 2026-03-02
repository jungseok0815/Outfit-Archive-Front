import api from '../api';

// 일반 사용자 로그인 - JWT 쿠키 발급
// 응답: { id, userId, userNm, userAge, authName: "ROLE_USER" | "ROLE_ADMIN" }
export const postLogin = (loginForm) => {
    return api.post("/api/usr/login", loginForm);
}

// 회원가입
export const postJoin = (joinForm) => {
    return api.post("/api/usr/join", joinForm);
}
