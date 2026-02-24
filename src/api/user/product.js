import api from '../api';

export const ListProduct =  (keyword) =>{
    if(keyword === null) return api.get(`/api/product/list`)
    return api.get(`/api/product/list?keyword=${keyword}`)
    }
