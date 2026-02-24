import api from '../api';

export const ListOrder = (keyword) =>{
    if(keyword === null || keyword === undefined || keyword === '') return api.get(`/api/admin/order/list`)
    return api.get(`/api/admin/order/list?keyword=${keyword}`)
}

export const UpdateOrderStatus = (statusForm) =>{
    return api.put("/api/admin/order/status", statusForm)
}

export const DeleteOrder = (orderId) =>{
    return api.delete(`/api/admin/order/delete?id=${orderId}`)
}
