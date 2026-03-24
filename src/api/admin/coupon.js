import api from '../api';

// GET /api/admin/coupon/list
export const ListCoupon = () => {
    return api.get('/api/admin/coupon/list');
};

// POST /api/admin/coupon
export const CreateCoupon = (dto) => {
    return api.post('/api/admin/coupon', dto);
};

// PUT /api/admin/coupon/{id}
export const UpdateCoupon = (id, dto) => {
    return api.put(`/api/admin/coupon/${id}`, dto);
};

// DELETE /api/admin/coupon/{id}
export const DeleteCoupon = (id) => {
    return api.delete(`/api/admin/coupon/${id}`);
};
