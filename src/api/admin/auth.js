import api from '../api';

// 관리자 전용 로그인
// 요청: { memberId, memberPwd }
// 응답: { id, memberId, memberNm, adminRole }
export const postAdminLogin = (loginForm) => {
    return api.post("/api/admin/auth/login", loginForm);
}

// 관리자/협력업체 계정 등록
export const AdminJoin = (joinForm) => {
    return api.post("/api/admin/auth/join", joinForm);
}

// 관리자 목록 조회
// 응답: [{ id, memberId, memberNm, adminRole }]
export const ListAdmin = () => {
    return api.get("/api/admin/auth/members");
}


// 관리자 목록 삭제
// 응답: [{ id, memberId, memberNm, adminRole }]
export const deleteAdmin = () => {
    return api.get("/api/admin/auth/delete");
}
