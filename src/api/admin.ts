import api from './axios';
import { User, UserPreferencesDto, MetaData } from '../types';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('AccessToken')}`
  }
});

export const getAllUsers = (
  pageNumber: number = 1, 
  pageSize: number = 10,
  orderBy: string = 'Name'
): Promise<{ users: User[], metaData: MetaData }> => {
  return api.get(
    '/admin/users', 
    { 
      ...getAuthHeader(),
      params: { 
        PageNumber: pageNumber, 
        PageSize: pageSize, 
        OrderBy: orderBy 
      } 
    }
  )
    .then(response => {
      const paginationHeader = response.headers['x-pagination'];
      const metaData = paginationHeader ? JSON.parse(paginationHeader) : {
        CurrentPage: 1,
        TotalPages: 1,
        PageSize: response.data.length,
        TotalCount: response.data.length,
        HasPrevious: false,
        HasNext: false
      };
      
      const processedUsers = response.data.map((user: User) => ({
        ...user,
        status: user.status?.includes('Blocked') ? 'Blocked' : 'Active'
      }));
      
      return {
        users: processedUsers,
        metaData
      };
    });
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

export const updateUser = async (userPreferences: UserPreferencesDto): Promise<void> => {
  return api.put(
    `/user/update`,
    userPreferences,
    getAuthHeader()
  );
};