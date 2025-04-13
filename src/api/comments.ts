import api from './axios';
import { Comment, CommentForCreationDto, CommentForUpdateDto } from '../types';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('AccessToken')}`
  }
});

export const getTemplateComments = (templateId: string): Promise<Comment[]> => {
  return api.get(`/templates/${templateId}/comments`).then(response => response.data);
};

export const addComment = (templateId: string, comment: CommentForCreationDto): Promise<Comment> => {
  return api.post(
    `/templates/${templateId}/comments`,
    comment,
    getAuthHeader()
  ).then(response => response.data);
};

export const updateComment = (templateId: string, commentId: string, comment: CommentForUpdateDto): Promise<void> => {
  return api.put(
    `/templates/${templateId}/comments/${commentId}`,
    comment,
    getAuthHeader()
  );
};

export const deleteComment = (templateId: string, commentId: string): Promise<void> => {
  return api.delete(
    `/templates/${templateId}/comments/${commentId}`,
    getAuthHeader()
  );
};