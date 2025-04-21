import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthState, User } from '../types';
import * as authApi from '../api/auth';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  refreshAuthToken: () => Promise<string>;
}

interface JwtPayload {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[];
  exp: number;
  sub?: string;
  PreferredLanguage?: string;
  PreferredTheme?: string;
}

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  roles: [],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

const getRefreshToken = (): string | null => {
  return localStorage.getItem("refreshToken");
};

const storeTokens = (tokens: authApi.AuthTokens) => {
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return true;
  }
};

const getUserFromToken = (token?: string): { user: User | null, roles: string[], preferredLanguage?: string, preferredTheme?: string } => {
  try {
    const accessToken = token || getAccessToken();
    if (!accessToken) return { user: null, roles: [] };

    const decoded = jwtDecode<JwtPayload>(accessToken);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      console.warn('Token expired');
      return { user: null, roles: [] };
    }

    const roles = Array.isArray(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]) 
      ? decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] 
      : [decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || ''];

    const user: User = {
      id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ?? "",
      name: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
      roles
    };

    const preferredLanguage = decoded["PreferredLanguage"];
    const preferredTheme = decoded["PreferredTheme"];

    return { user, roles, preferredLanguage, preferredTheme };
  } catch (error) {
    console.error('Token decoding error:', error);
    return { user: null, roles: [] };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);
  const [isMounted, setIsMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const checkTokensOnPageLoad = async () => {
      const accessToken = getAccessToken();
      if (isTokenExpired(accessToken)) {
        console.log('Found expired tokens on page load, attempting to refresh');
        try {
          await refreshAuthToken();
        } catch (error) {
          console.error('Token refresh failed on page load, clearing tokens:', error);
          clearTokens();
        }
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTokensOnPageLoad();
      }
    };
    
    checkTokensOnPageLoad();
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      setIsMounted(false);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const refreshAuthToken = async (): Promise<string> => {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (!isRefreshing) {
            clearInterval(checkInterval);
            const currentToken = getAccessToken();
            if (currentToken) {
              resolve(currentToken);
            } else {
              reject(new Error('No token available after refresh'));
            }
          }
        }, 100);
      });
    }

    try {
      setIsRefreshing(true);
      const refreshToken = getRefreshToken();
      const accessToken = getAccessToken();
      if (!refreshToken || !accessToken) throw new Error('No tokens available');
      
      const tokens = await authApi.refreshToken({accessToken, refreshToken});
      storeTokens(tokens);
      
      const { user, roles } = getUserFromToken(tokens.accessToken);
      if (user && isMounted) {
        setAuthState({
          isAuthenticated: true,
          user,
          roles,
        });
      }
      
      return tokens.accessToken;
    } catch (error) {
      console.error('Refresh token failed:', error);
      if (isMounted) setAuthState(defaultAuthState);
      clearTokens();
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isMounted) return;

    const checkAuth = async () => {
      try {
        const accessToken = getAccessToken();
        
        if (accessToken) {
          if (isTokenExpired(accessToken)) {
            try {
              await refreshAuthToken();
              return;
            } catch (error) {
              console.error('Auth token refresh failed during check:', error);
              clearTokens();
              setAuthState(defaultAuthState);
              return;
            }
          }
          
          const { user, roles } = getUserFromToken(accessToken);
          if (user) {
            setAuthState({ isAuthenticated: true, user, roles });
          } else {
            try {
              await refreshAuthToken();
            } catch (error) {
              clearTokens();
              setAuthState(defaultAuthState);
            }
          }
        } else {
          setAuthState(defaultAuthState);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        try {
          await refreshAuthToken();
        } catch (refreshError) {
          clearTokens();
          setAuthState(defaultAuthState);
        }
      }
    };

    checkAuth();
  }, [isMounted]);

  const login = async (email: string, password: string) => {
    try {
      const tokens = await authApi.login({ email, password });
      storeTokens(tokens);
      
      const { user, roles, preferredLanguage, preferredTheme } = getUserFromToken(tokens.accessToken);
      
      if (!user) {
        throw new Error('Authentication failed');
      }
  
      if (preferredLanguage) {
        localStorage.setItem('language', preferredLanguage);
      }
      if (preferredTheme) {
        localStorage.setItem('theme', preferredTheme);
      }
  
      if (isMounted) {
        setAuthState({
          isAuthenticated: true,
          user,
          roles,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      if (isMounted) setAuthState(defaultAuthState);
      clearTokens();
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await authApi.register({ name, email, password });
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    clearTokens();
    if (isMounted) setAuthState(defaultAuthState);
  };

  const isAdmin = () => {
    return authState.roles.includes('Admin');
  };

  return (
    <AuthContext.Provider value={{ 
      authState, 
      login, 
      register, 
      logout, 
      isAdmin,
      refreshAuthToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};