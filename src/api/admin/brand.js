import api from '../api';

export const ListBrand = (keyword) =>{
    if(keyword === null || keyword === undefined || keyword === '') return api.get(`/api/admin/brand/list`)
    return api.get(`/api/admin/brand/list?keyword=${keyword}`)
}

export const InsertBrand = (insertForm) => {
    return api.post("/api/admin/brand/insert", insertForm,{
        headers : {
            'Content-Type': 'multipart/form-data'
        }
    }
)
}

export const UpdateBrand = (updateForm) =>{
    return api.put("/api/admin/brand/update", updateForm, {
        headers: {
            'Content-Type': 'multipart/form-data'
          }
    }
)
}

export const DeleteBrand = (productNo) =>{
    return api.delete(`/api/admin/brand/delete?id=${productNo}`)
}
