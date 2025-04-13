import api from './axios';
import { Form, FormForSubmissionDto, FormForUpdateDto, FormResultsAggregation } from '../types';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('AccessToken')}`,
  }
});

export const getUserForms = (): Promise<Form[]> => {
  return api.get('/forms/my', getAuthHeader())
    .then(response => response.data);
};

export const getTemplateForms = (templateId: string): Promise<Form[]> => {
  return api.get(`/forms/template/${templateId}`, getAuthHeader())
    .then(response => response.data);
};

export const getForm = (id: string): Promise<Form> => {
  return api.get(`/forms/${id}`, getAuthHeader())
    .then(response => response.data);
};

export const submitForm = (templateId: string, form: FormForSubmissionDto): Promise<Form> => {
  return api.post(
    `/forms/template/${templateId}`,
    form,
    getAuthHeader()
  ).then(response => response.data);
};

export const updateForm = (id: string, form: FormForUpdateDto): Promise<void> => {
  return api.put(
    `/forms/${id}`,
    form,
    getAuthHeader()
  );
};

export const deleteForm = (id: string): Promise<void> => {
  return api.delete(
    `/forms/${id}`,
    getAuthHeader()
  );
};

export const getFormResults = (templateId: string): Promise<FormResultsAggregation> => {
  return api.get(`/forms/template/${templateId}/results`, getAuthHeader())
    .then(response => response.data);
};