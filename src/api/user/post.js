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

export const DeletePost = (id) => {
    return api.delete('/api/usr/post/delete', { params: { id } });
}

// POST /api/usr/post/like/toggle?postId={id} → { liked: boolean, likeCount: number }
export const ToggleLike = (postId) => {
    return api.post('/api/usr/post/like/toggle', null, { params: { postId } });
}

// GET /api/usr/post/comment/list?postId={id}
export const ListComment = (postId, page = 0, size = 10) => {
    return api.get('/api/usr/post/comment/list', { params: { postId, page, size } });
}

// POST /api/usr/post/comment/insert - Body: { postId, content }
export const InsertComment = (commentDto) => {
    return api.post('/api/usr/post/comment/insert', commentDto);
}
