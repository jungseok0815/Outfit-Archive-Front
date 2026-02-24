import api from '../api';

export const ListBrand =  (keyword) =>{
    if(keyword === null) return api.get(`/api/brand/list`)
    return api.get(`/api/brand/list?keyword=${keyword}`)
    }
