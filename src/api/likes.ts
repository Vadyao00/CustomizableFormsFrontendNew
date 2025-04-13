import api from './axios';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('AccessToken')}`
  }
});

export const getLikesCount = (templateId: string): Promise<number> => {
  return api.get(`/templates/${templateId}/likes/count`).then(response => response.data);
};

export const getLikeStatus = (templateId: string): Promise<boolean> => {
  return api.get(
    `/templates/${templateId}/likes/status`,
    getAuthHeader()
  ).then(response => response.data);
};

export const likeTemplate = (templateId: string): Promise<void> => {
  return api.post(
    `/templates/${templateId}/likes`,
    {},
    getAuthHeader()
  );
};

export const unlikeTemplate = (templateId: string): Promise<void> => {
  return api.delete(
    `/templates/${templateId}/likes`,
    getAuthHeader()
  );
};