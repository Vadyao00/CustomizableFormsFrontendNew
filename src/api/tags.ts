import api from './axios';
import { Tag, TagCloudItem } from '../types';
import { Template, MetaData } from '../types';

export const getAllTags = (): Promise<Tag[]> => {
  return api.get('/tags').then(response => response.data);
};

export const searchTags = (searchTerm: string): Promise<Tag[]> => {
  return api.get(`/tags/search?searchTerm=${searchTerm}`).then(response => response.data);
};

export const getTagCloud = (): Promise<TagCloudItem[]> => {
  return api.get('/tags/cloud').then(response => response.data);
};

export const getTemplatesByTag = (
  tagName: string,
  pageNumber: number = 1,
  pageSize: number = 4
): Promise<{ templates: Template[], metaData: MetaData }> => {
  return api.get(`/tags/${tagName}/templates`, {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize
    }
  }).then(response => {
    const paginationHeader = response.headers['x-pagination'];
    const metaData = paginationHeader ? JSON.parse(paginationHeader) : {
      CurrentPage: 1,
      TotalPages: 1,
      PageSize: response.data.length,
      TotalCount: response.data.length,
      HasPrevious: false,
      HasNext: false
    };
    
    return {
      templates: response.data,
      metaData
    };
  });
};