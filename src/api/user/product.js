import api from '../api';

// GET /api/usr/product/list → Spring Page<ResponseProductDto>
// ResponseProductDto: { id, productNm, productCode, productPrice, productQuantity, brandId, brandNm, category, images[] }
export const ListProduct = (keyword = '', category = null, page = 0, size = 12) => {
    const params = { keyword, page, size };
    if (category) params.category = category;
    return api.get('/api/usr/product/list', { params });
}

// GET /api/usr/product/get?id={id} → ResponseProductDto
export const GetProduct = (id) => {
    return api.get('/api/usr/product/get', { params: { id } });
}
