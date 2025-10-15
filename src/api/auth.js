import api from './api';

export const postLogin = (loginForm) => {
    console.log(loginForm)
    return api.post("/api/auth/login", loginForm)
}

export const postJoin = (joinForm) =>{
    console.log(joinForm)
    return api.post("/api/usr/insert", joinForm)    
}