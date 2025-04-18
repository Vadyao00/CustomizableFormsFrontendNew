import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_URL = 'https://localhost:7164/api';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface QueuePromise {
  resolve: (value: string | null) => void;
  reject: (reason?: any) => void;
}

const tokenRefreshState: {
  isRefreshing: boolean;
  failedQueue: QueuePromise[];
  processQueue: (error: Error | null, token: string | null) => void;
} = {
  isRefreshing: false,
  failedQueue: [],
  processQueue: (error: Error | null, token: string | null = null) => {
    tokenRefreshState.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    
    tokenRefreshState.failedQueue = [];
  }
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
);

const refreshAuthToken = async (): Promise<AuthTokens> => {
  const refreshToken = localStorage.getItem('refreshToken');
  const accessToken = localStorage.getItem('accessToken');
  
  if (!refreshToken || !accessToken) {
    throw new Error('No tokens available');
  }
  
  const response = await axios.post<AuthTokens>(`${API_URL}/token/refresh`, {
    AccessToken: accessToken,
    RefreshToken: refreshToken
  });
  
  return response.data;
};

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
    if (!originalRequest) {
      return Promise.reject(error);
    }
    
    if (error.response?.status !== 401 || originalRequest._retry) {
      if (error.response?.status === 403) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    originalRequest._retry = true;

    if (tokenRefreshState.isRefreshing) {
      try {
        const token = await new Promise<string | null>((resolve, reject) => {
          tokenRefreshState.failedQueue.push({ resolve, reject });
        });
        if (originalRequest.headers && token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    tokenRefreshState.isRefreshing = true;

    try {
      const tokens = await refreshAuthToken();
      
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
      
      tokenRefreshState.processQueue(null, tokens.accessToken);
      
      return api(originalRequest);
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      const error = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
      tokenRefreshState.processQueue(error, null);
      
      window.location.href = '/login';
      
      return Promise.reject(refreshError);
    } finally {
      tokenRefreshState.isRefreshing = false;
    }
  }
);

export default api;