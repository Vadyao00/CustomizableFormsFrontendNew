import api from './axios';
import { 
  Template, 
  TemplateForCreationDto, 
  TemplateForUpdateDto,
  Question,
  QuestionForCreationDto,
  QuestionForUpdateDto
} from '../types';

export const getTemplates = (): Promise<Template[]> => {
  return api.get('/templates').then(response => response.data);
};

export const getPopularTemplates = (count: number): Promise<Template[]> => {
  return api.get(`/templates/popular/${count}`).then(response => response.data);
};

export const getRecentTemplates = (count: number): Promise<Template[]> => {
  return api.get(`/templates/recent/${count}`).then(response => response.data);
};

export const searchTemplates = (searchTerm: string): Promise<Template[]> => {
  return api.get(`/templates/search?searchTerm=${searchTerm}`).then(response => response.data);
};

export const getTemplate = (id: string): Promise<Template> => {
  return api.get(`/templates/${id}`).then(response => response.data);
};

export const getTemplateQuestions = (templateId: string): Promise<Question[]> => {
  return api.get(`/templates/${templateId}/questions`).then(response => response.data);
};

export const getUserTemplates = (): Promise<Template[]> => {
  return api.get('/templates/my').then(response => response.data);
};

export const getAccessibleTemplates = (): Promise<Template[]> => {
  return api.get('/templates/accessible').then(response => response.data);
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