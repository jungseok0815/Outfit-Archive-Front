import api from '../api';

export const ListBrand = (keyword) => {
    if (keyword === null) return api.get(`/api/admin/brand/list`);
    return api.get(`/api/admin/brand/list?keyword=${keyword}`);
}

// 사용자용 브랜드 API (비로그인 접근 가능)
export const ListUserBrand = (keyword = '', page = 0, size = 20) =>
    api.get('/api/usr/brand/list', { params: { keyword, page, size } });

export const GetBrand = (id) =>
    api.get(`/api/usr/brand/${id}`);
