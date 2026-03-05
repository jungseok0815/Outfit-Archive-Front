import api from '../api';

export const GetFollowCount = (userId) =>
    api.get(`/api/usr/follow/${userId}/count`);
