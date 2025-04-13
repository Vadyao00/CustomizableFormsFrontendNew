import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Pagination
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Template } from '../types';
import * as templatesApi from '../api/templates';
import TemplateCard from '../components/templates/TemplateCard';

const SearchPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const templatesPerPage = 12;
  
  useEffect(() => {
    if (!searchQuery) {
      navigate('/');
      return;
    }
    
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const results = await templatesApi.searchTemplates(searchQuery);
        setTemplates(results);
        setError(null);
      } catch (err) {
        console.error('Error searching templates:', err);
        setError(t('search.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [searchQuery, navigate, t]);
  
  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  const indexOfLastTemplate = page * templatesPerPage;
  const indexOfFirstTemplate = indexOfLastTemplate - templatesPerPage;
  const currentTemplates = templates.slice(indexOfFirstTemplate, indexOfLastTemplate);
  const totalPages = Math.ceil(templates.length / templatesPerPage);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('search.results')}
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {t('search.queryLabel')}: "{searchQuery}"
        </Typography>
        
        <Typography variant="body2">
          {templates.length === 0
            ? t('search.noResults')
            : t('search.foundResults', { count: templates.length })}
        </Typography>
      </Paper>
      
      {templates.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {currentTemplates.map((template) => (
              <Grid item key={template.id} xs={12} sm={6} md={4} lg={3}>
                <TemplateCard template={template} />
              </Grid>
            ))}
          </Grid>
          
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handleChangePage}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {t('search.tryDifferentQuery')}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default SearchPage;