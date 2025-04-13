import api from './axios';
import { User } from '../types';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('AccessToken')}`
  }
});

export const getAllUsers = (): Promise<User[]> => {
  return api.get('/admin/users', getAuthHeader())
    .then(response => response.data);
};

export const blockUser = (userId: string): Promise<void> => {
  return api.post(
    `/admin/users/${userId}/block`, 
    {}, 
    getAuthHeader()
  );
};

export const unblockUser = (userId: string): Promise<void> => {
  return api.post(
    `/admin/users/${userId}/unblock`,
    {},
    getAuthHeader()
  );
};

export const addAdminRole = (userId: string): Promise<void> => {
  return api.post(
    `/admin/users/${userId}/add-admin`,
    {},
    getAuthHeader()
  );
};

export const removeAdminRole = (userId: string): Promise<void> => {
  return api.post(
    `/admin/users/${userId}/remove-admin`,
    {},
    getAuthHeader()
  );
};

export const deleteUser = (userId: string): Promise<void> => {
  return api.delete(
    `/admin/users/${userId}`,
    getAuthHeader()
  );
};