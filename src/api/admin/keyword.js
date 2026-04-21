import api from '../api';

// GET /api/admin/keyword/list → List<ResponseKeywordDto>
// ResponseKeywordDto: { id, keyword, category, categoryName, active, createdAt }
export const ListKeyword = () => {
    return api.get('/api/admin/keyword/list');
};

// POST /api/admin/keyword/insert → { keyword, category }
export const InsertKeyword = (dto) => {
    return api.post('/api/admin/keyword/insert', dto);
};

// DELETE /api/admin/keyword/delete?id={id}
export const DeleteKeyword = (id) => {
    return api.delete('/api/admin/keyword/delete', { params: { id } });
};
