import api from '../api';

// GET /api/admin/product/list → Spring Page<ResponseProductDto>
// ResponseProductDto: { id, productNm, productCode, productPrice, productQuantity, brandId, brandNm, category, images[] }
// category: TOP | BOTTOM | OUTER | DRESS | SHOES | BAG
export const ListProduct = (keyword = '', page = 0, size = 100) => {
    return api.get('/api/admin/product/list', { params: { keyword, page, size } });
}

export const InsertProduct = (insertForm) => {
    return api.post("/api/admin/product/insert", insertForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export const UpdateProduct = (updateForm) => {
    return api.put("/api/admin/product/update", updateForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export const DeleteProduct = (productId) => {
    return api.delete('/api/admin/product/delete', { params: { id: productId } });
}
