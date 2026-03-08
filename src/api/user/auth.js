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

// 프로필 이미지 수정
export const UpdateProfileImg = (id, file) => {
    const fd = new FormData();
    fd.append('id', id);
    fd.append('profileImg', file);
    return api.put("/api/usr/profile-img", fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}
