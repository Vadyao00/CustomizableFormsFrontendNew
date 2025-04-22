import api from './axios';
import { 
  Template, 
  TemplateForCreationDto, 
  TemplateForUpdateDto,
  Question,
  QuestionForCreationDto,
  QuestionForUpdateDto,
  MetaData
} from '../types';

export const getTemplates = (
  pageNumber: number = 1,
  pageSize: number = 8,
  searchTopic: string = '',
  orderBy: string = 'Title'
): Promise<{ templates: Template[], metaData: MetaData }> => {
  return api.get('/templates', {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      searchTopic: searchTopic !== 'all' ? searchTopic : '',
      OrderBy: orderBy
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
export const getPopularTemplates = (count: number): Promise<Template[]> => {
  return api.get(`/templates/popular/${count}`).then(response => response.data);
};

export const getRecentTemplates = (count: number): Promise<Template[]> => {
  return api.get(`/templates/recent/${count}`).then(response => response.data);
};

export const searchTemplates = (
  searchTerm: string, 
  page: number = 1, 
  pageSize: number = 4
): Promise<{ templates: Template[], metaData: MetaData }> => {
  return api.get(
    `/templates/search?searchTerm=${encodeURIComponent(searchTerm)}&pageNumber=${page}&pageSize=${pageSize}`
  ).then(response => {
    const paginationHeader = response.headers['x-pagination'];
    const metaData: MetaData = paginationHeader ? JSON.parse(paginationHeader) : {};
    
    return {
      templates: response.data,
      metaData
    };
  });
};

export const getTemplate = (id: string): Promise<Template> => {
  return api.get(`/templates/${id}`).then(response => response.data);
};

export const getTemplateQuestions = (templateId: string): Promise<Question[]> => {
  return api.get(`/templates/${templateId}/questions`).then(response => response.data);
};

export const getUserTemplates = (
  pageNumber: number = 1, 
  pageSize: number = 4
): Promise<{ templates: Template[], metaData: MetaData }> => {
  return api.get('/templates/my', {
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

export const getUserPublicTemplates = (
  pageNumber: number = 1, 
  pageSize: number = 4
): Promise<{ templates: Template[], metaData: MetaData }> => {
  return api.get('/templates/my-public', {
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

export const getUserPrivateTemplates = (
  pageNumber: number = 1, 
  pageSize: number = 4
): Promise<{ templates: Template[], metaData: MetaData }> => {
  return api.get('/templates/my-private', {
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

export const createTemplate = (template: TemplateForCreationDto): Promise<Template> => {
  return api.post('/templates', template).then(response => response.data);
};

export const updateTemplate = (id: string, template: TemplateForUpdateDto): Promise<void> => {
  return api.put(`/templates/${id}`, template);
};

export const deleteTemplate = (id: string): Promise<void> => {
  return api.delete(`/templates/${id}`);
};

export const addQuestion = (templateId: string, question: QuestionForCreationDto): Promise<Question> => {
  return api.post(
    `/templates/${templateId}/questions`,
    question
  ).then(response => response.data);
};

export const updateQuestion = (templateId: string, questionId: string, question: QuestionForUpdateDto): Promise<void> => {
  return api.put(
    `/templates/${templateId}/questions/${questionId}`,
    question
  );
};

export const deleteQuestion = (templateId: string, questionId: string): Promise<void> => {
  return api.delete(
    `/templates/${templateId}/questions/${questionId}`
  );
};

export const reorderQuestions = (templateId: string, questionIds: string[]): Promise<void> => {
  return api.post(
    `/templates/${templateId}/questions/reorder`,
    questionIds
  );
};

export const uploadImage = (file: File): Promise<{ imageUrl: string}> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(response => response.data);
};