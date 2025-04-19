import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TemplatesPage from './pages/TemplatesPage';
import TemplateDetailsPage from './pages/TemplateDetailsPage';
import TemplateEditPage from './pages/TemplateEditPage';
import TemplateCreatePage from './pages/TemplateCreatePage';
import MyTemplatesPage from './pages/MyTemplatesPage';
import MyFormsPage from './pages/MyFormsPage';
import FormSubmitPage from './pages/FormSubmitPage';
import FormDetailsPage from './pages/FormDetailsPage';
import FormEditPage from './pages/FormEditPage';
import AdminPage from './pages/AdminPage';
import SearchPage from './pages/SearchPage';
import TagTemplatesPage from './pages/TagTemplatesPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import * as signalR from './api/signalR';

const queryClient = new QueryClient();

const App: React.FC = () => {
  useEffect(() => {
    signalR.startConnection();
    
    return () => {
      signalR.stopConnection();
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true }}>
        <AuthProvider>
            <ThemeProvider>
              <LanguageProvider>
                <CssBaseline />
                <Navbar />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/templates" element={<TemplatesPage />} />
                  <Route path="/templates/:id" element={<TemplateDetailsPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/tags/:tagName/templates" element={<TagTemplatesPage />} />
                  
                  <Route
                    path="/templates/create"
                    element={
                      <ProtectedRoute>
                        <TemplateCreatePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/templates/:id/edit"
                    element={
                      <ProtectedRoute>
                        <TemplateEditPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/templates/my"
                    element={
                      <ProtectedRoute>
                        <MyTemplatesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/forms/my"
                    element={
                      <ProtectedRoute>
                        <MyFormsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/templates/:id/submit"
                    element={
                      <ProtectedRoute>
                        <FormSubmitPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/forms/:id"
                    element={
                      <ProtectedRoute>
                        <FormDetailsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/forms/:id/edit"
                    element={
                      <ProtectedRoute>
                        <FormEditPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/admin/*"
                    element={
                      <AdminRoute>
                        <AdminPage />
                      </AdminRoute>
                    }
                  />
                  
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </LanguageProvider>
            </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;