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

// 다른 유저 프로필 조회
export const GetUserProfile = (userId) => {
    return api.get(`/api/usr/profile/${userId}`);
}

// 로그아웃 - 서버측 쿠키 삭제 + Redis Refresh Token 삭제
export const Logout = () => {
    return api.post("/api/usr/logout");
}

// 비밀번호 재설정 이메일 발송
export const postForgotPassword = (email) => {
    return api.post("/api/usr/forgot-password", { email });
}

// 비밀번호 재설정 (토큰 + 새 비밀번호)
export const postResetPassword = (token, newPassword) => {
    return api.post("/api/usr/reset-password", { token, newPassword });
}

// 프로필 이미지 수정
export const UpdateProfileImg = (id, file) => {
    const fd = new FormData();
    fd.append('id', id);
    fd.append('profileImg', file);
    return api.put("/api/usr/profile-img", fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}
