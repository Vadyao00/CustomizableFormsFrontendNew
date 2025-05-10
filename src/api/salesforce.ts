import api from './axios';
import { SalesforceProfileFormDto, SalesforceProfileInfo } from '../types';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('AccessToken')}`
  }
});

export const createSalesforceProfile = async (profileData: SalesforceProfileFormDto): Promise<any> => {
  return api.post(
    '/salesforce/create-profile',
    profileData,
    getAuthHeader()
  ).then(response => response.data);
};

export const checkSalesforceProfile = async (): Promise<SalesforceProfileInfo> => {
  return api.get(
    '/salesforce/profile-status',
    getAuthHeader()
  ).then(response => response.data);
};

export const getSalesforceProfile = async (): Promise<SalesforceProfileFormDto> => {
  return api.get(
    '/salesforce/profile',
    getAuthHeader()
  ).then(response => response.data);
};

export const updateSalesforceProfile = async (profileData: SalesforceProfileFormDto): Promise<any> => {
  return api.put(
    '/salesforce/profile',
    profileData,
    getAuthHeader()
  ).then(response => response.data);
};