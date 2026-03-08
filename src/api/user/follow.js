import api from '../api';

export const GetFollowCount = (userId) =>
    api.get(`/api/usr/follow/${userId}/count`);

export const GetFollowerList = (userId) =>
    api.get(`/api/usr/follow/${userId}/followers`);

export const GetFollowingList = (userId) =>
    api.get(`/api/usr/follow/${userId}/followings`);
