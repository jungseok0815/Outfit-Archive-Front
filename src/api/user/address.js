import api from '../api';

export const ListAddress = () => api.get('/api/usr/address/list');

export const InsertAddress = (dto) => api.post('/api/usr/address/insert', dto);

export const UpdateAddress = (id, dto) => api.put(`/api/usr/address/update/${id}`, dto);

export const DeleteAddress = (id) => api.delete(`/api/usr/address/delete/${id}`);

export const SetDefaultAddress = (id) => api.put(`/api/usr/address/default/${id}`);
