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

// 프로필 수정 (이름, 나이, 비밀번호)
export const UpdateUser = (updateForm) => {
    return api.put("/api/usr/update", updateForm);
}
