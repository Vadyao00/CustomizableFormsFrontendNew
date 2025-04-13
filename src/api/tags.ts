import api from './axios';
import { Tag, TagCloudItem } from '../types';
import { Template } from '../types';

export const getAllTags = (): Promise<Tag[]> => {
  return api.get('/tags').then(response => response.data);
};

export const searchTags = (searchTerm: string): Promise<Tag[]> => {
  return api.get(`/tags/search?searchTerm=${searchTerm}`).then(response => response.data);
};

export const getTagCloud = (): Promise<TagCloudItem[]> => {
  return api.get('/tags/cloud').then(response => response.data);
};

export const getTemplatesByTag = (tagName: string): Promise<Template[]> => {
  return api.get(`/tags/${tagName}/templates`).then(response => response.data);
};