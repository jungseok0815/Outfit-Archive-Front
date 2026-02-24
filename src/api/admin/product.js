import api from '../api';

export const ListProduct = (keyword) =>{
    if(keyword === null || keyword === undefined || keyword === '') return api.get(`/api/admin/product/list`)
    return api.get(`/api/admin/product/list?keyword=${keyword}`)
}

export const InsertProduct = (insertForm) => {
    return api.post("/api/admin/product/insert", insertForm,{
        headers : {
            'Content-Type': 'multipart/form-data'
        }
    }
)
}

export const UpdateProduct = (updateForm) =>{
    return api.put("/api/admin/product/update", updateForm, {
        headers: {
            'Content-Type': 'multipart/form-data'
          }
    }
)
}

export const DeleteProduct = (productNo) =>{
    return api.delete(`/api/admin/product/delete?id=${productNo}`)
}
