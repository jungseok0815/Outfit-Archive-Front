import api from '../api';

// GET /api/usr/post/list → Spring Page<ResponsePostDto>
// ResponsePostDto: { id, title, content, userNm, images[], likeCount, commentCount, createdAt, updatedAt }
export const ListPost = (keyword = '', page = 0, size = 10) => {
    return api.get('/api/usr/post/list', { params: { keyword, page, size } });
}

export const InsertPost = (insertForm) => {
    return api.post("/api/usr/post/insert", insertForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export const ListMyPost = (page = 0, size = 10) => {
    return api.get('/api/usr/post/my', { params: { page, size } });
}

export const ListUserPost = (userId, page = 0, size = 100) => {
    return api.get(`/api/usr/post/user/${userId}`, { params: { page, size } });
}

export const UpdatePost = (updateForm) => {
    return api.put('/api/usr/post/update', updateForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export const DeletePost = (id) => {
    return api.delete('/api/usr/post/delete', { params: { id } });
}

// POST /api/usr/post/like/toggle?postId={id} → { liked: boolean, likeCount: number }
export const ToggleLike = (postId) => {
    return api.post('/api/usr/post/like/toggle', null, { params: { postId } });
}

// GET /api/usr/post/like/status?postId={id} → { liked: boolean, likeCount: number }
export const GetLikeStatus = (postId) => {
    return api.get('/api/usr/post/like/status', { params: { postId } });
}

// GET /api/usr/post/search?keyword={keyword} → 브랜드명 또는 제목으로 검색 (비로그인 가능)
export const SearchPost = (keyword, page = 0, size = 12) => {
    return api.get('/api/usr/post/search', { params: { keyword, page, size } });
}

// GET /api/usr/post/comment/list?postId={id}
export const ListComment = (postId, page = 0, size = 10) => {
    return api.get('/api/usr/post/comment/list', { params: { postId, page, size } });
}

// POST /api/usr/post/comment/insert - Body: { postId, content }
export const InsertComment = (commentDto) => {
    return api.post('/api/usr/post/comment/insert', commentDto);
}
