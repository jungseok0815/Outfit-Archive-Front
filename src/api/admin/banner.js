import api from '../api';

export const ListBanner = () => api.get('/api/admin/banner/list');

export const InsertBanner = (data) => api.post('/api/admin/banner/insert', data);

export const UpdateBanner = (data) => api.put('/api/admin/banner/update', data);

export const DeleteBanner = (id) => api.delete('/api/admin/banner/delete', { params: { id } });
