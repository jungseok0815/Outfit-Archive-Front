import api from '../api';

export const GetPoint = () =>
    api.get('/api/usr/point');

export const GetPointHistory = (page = 0, size = 20) =>
    api.get('/api/usr/point/history', { params: { page, size } });
