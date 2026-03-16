import api from '../api';

export const GetFollowCount = (userId) =>
    api.get(`/api/usr/follow/${userId}/count`);

export const GetFollowerList = (userId) =>
    api.get(`/api/usr/follow/${userId}/followers`);

export const GetFollowingList = (userId) =>
    api.get(`/api/usr/follow/${userId}/followings`);

export const CheckFollow = (targetId) =>
    api.get(`/api/usr/follow/${targetId}/status`);

export const Follow = (targetId) =>
    api.post(`/api/usr/follow/${targetId}`);

export const Unfollow = (targetId) =>
    api.delete(`/api/usr/follow/${targetId}`);
