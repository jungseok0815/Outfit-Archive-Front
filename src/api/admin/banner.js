import api from '../api';

export const ListBanner = () => api.get('/api/admin/banner/list');

export const InsertBanner = (data, image) => {
    const form = new FormData();
    form.append('title', data.title);
    form.append('highlight', data.highlight || '');
    form.append('description', data.description || '');
    form.append('buttonText', data.buttonText || '');
    form.append('sortOrder', data.sortOrder);
    form.append('active', data.active);
    if (image) form.append('image', image);
    return api.post('/api/admin/banner/insert', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const UpdateBanner = (data, image) => {
    const form = new FormData();
    form.append('id', data.id);
    form.append('title', data.title);
    form.append('highlight', data.highlight || '');
    form.append('description', data.description || '');
    form.append('buttonText', data.buttonText || '');
    form.append('sortOrder', data.sortOrder);
    form.append('active', data.active);
    if (image) form.append('image', image);
    return api.put('/api/admin/banner/update', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const DeleteBanner = (id) => api.delete('/api/admin/banner/delete', { params: { id } });
