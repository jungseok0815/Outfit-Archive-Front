import api from '../api';

export const ListProduct =  (keyword) =>{
    if(keyword === null) return api.get(`/api/admin/product/list`)
    return api.get(`/api/admin/product/list?keyword=${keyword}`)
    }
