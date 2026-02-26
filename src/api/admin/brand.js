import api from '../api';

// GET /api/admin/brand/list → Spring Page<ResponseBrandDto>
// ResponseBrandDto: { id, brandNm, brandNum, brandLocation, brandDc, brandImg: { id, imgPath, imgNm, imgOriginNm } }
export const ListBrand = (keyword = '', page = 0, size = 100) => {
    return api.get('/api/admin/brand/list', { params: { keyword, page, size } });
}

export const InsertBrand = (insertForm) => {
    return api.post("/api/admin/brand/insert", insertForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export const UpdateBrand = (updateForm) => {
    return api.put("/api/admin/brand/update", updateForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export const DeleteBrand = (brandId) => {
    return api.delete('/api/admin/brand/delete', { params: { id: brandId } });
}
