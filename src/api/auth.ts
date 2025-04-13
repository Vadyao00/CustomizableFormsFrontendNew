import api from './axios';
import { 
  UserForRegistrationDto, 
  UserForAuthenticationDto,
  AuthResponseDto
} from '../types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const register = async (userData: UserForRegistrationDto): Promise<AuthTokens> => {
  try {
    const response = await api.post<AuthResponseDto>('/authentication', userData);
    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (userData: UserForAuthenticationDto): Promise<AuthTokens> => {
  try {
    const response = await api.post<AuthResponseDto>(
      '/authentication/login', 
      userData
    );
    
    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const refreshToken = async (tokens: {accessToken: string, refreshToken: string}): Promise<AuthTokens> => {
  try {
    const response = await api.post<AuthResponseDto>(
      '/token/refresh',
      { 
        AccessToken: tokens.accessToken,
        RefreshToken: tokens.refreshToken
      }
    );
    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken
    };
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
};