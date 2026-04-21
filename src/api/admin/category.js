import api from '../api';

// GET /api/admin/category/list → List<ResponseCategoryDto>
// ResponseCategoryDto: { id, name, korName, engName, defaultSizes, active }
export const ListCategory = () => {
    return api.get('/api/admin/category/list');
};

// POST /api/admin/category/insert → { name, korName, engName, defaultSizes }
export const InsertCategory = (dto) => {
    return api.post('/api/admin/category/insert', dto);
};

// PUT /api/admin/category/update → { id, korName, engName, defaultSizes }
export const UpdateCategory = (dto) => {
    return api.put('/api/admin/category/update', dto);
};

// DELETE /api/admin/category/delete?id={id}
export const DeleteCategory = (id) => {
    return api.delete('/api/admin/category/delete', { params: { id } });
};
