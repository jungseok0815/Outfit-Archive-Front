import api from '../api';

export const InsertProuct = (insertForm) => {
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

export const DelteProduct = (productNo) =>{
    return api.delete(`/api/admin/product/delete?id=${productNo}`)
}
