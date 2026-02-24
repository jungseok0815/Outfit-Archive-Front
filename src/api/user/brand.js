import api from '../api';

export const ListBrand =  (keyword) =>{
    if(keyword === null) return api.get(`/api/admin/brand/list`)
    return api.get(`/api/admin/brand/list?keyword=${keyword}`)
    }
