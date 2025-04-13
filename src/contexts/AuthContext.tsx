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

const getUserFromToken = (token?: string): { user: User | null, roles: string[] } => {
  try {
    const accessToken = token || getAccessToken();
    if (!accessToken) return { user: null, roles: [] };

    const decoded = jwtDecode<JwtPayload>(accessToken);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      console.warn('Token expired');
      return { user: null, roles: [] };
    }

    if (!decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]) {
      throw new Error('Invalid token structure');
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

    return { user, roles };
  } catch (error) {
    console.error('Token decoding error:', error);
    return { user: null, roles: [] };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const refreshAuthToken = async (): Promise<string> => {
    try {
      const refreshToken = getRefreshToken();
      const accessToken = getAccessToken();
      if (!refreshToken || !accessToken) throw new Error('No tokens available');
      
      const tokens = await authApi.refreshToken({accessToken,refreshToken});
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
    }
  };

  useEffect(() => {
    if (!isMounted) return;

    const checkAuth = async () => {
      try {
        let accessToken = getAccessToken();
        if (!accessToken) {
          setAuthState(defaultAuthState);
          return;
        }

        const decoded = jwtDecode<JwtPayload>(accessToken);
        const currentTime = Date.now() / 1000;
        const tokenExpired = decoded.exp < currentTime;

        if (tokenExpired) {
          try {
            accessToken = await refreshAuthToken();
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            setAuthState(defaultAuthState);
            return;
          }
        }

        const { user, roles } = getUserFromToken(accessToken);
        if (user) {
          setAuthState({ isAuthenticated: true, user, roles });
        } else {
          setAuthState(defaultAuthState);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState(defaultAuthState);
      }
    };

    checkAuth();
  }, [isMounted]);

  const login = async (email: string, password: string) => {
    try {
      const tokens = await authApi.login({ email, password });
      storeTokens(tokens);
      
      const { user, roles } = getUserFromToken(tokens.accessToken);
      
      if (!user) {
        console.error('Token after login:', tokens.accessToken);
        throw new Error('Authentication failed');
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