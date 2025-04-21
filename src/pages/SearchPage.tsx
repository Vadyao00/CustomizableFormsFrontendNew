import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Paper,
  IconButton
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Template, MetaData } from '../types';
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
  const [metaData, setMetaData] = useState<MetaData>({
    CurrentPage: 1,
    TotalPages: 1,
    PageSize: 4,
    TotalCount: 0,
    HasPrevious: false,
    HasNext: false
  });
  
  const fetchSearchResults = async (pageNumber = 1) => {
    if (!searchQuery) {
      navigate('/');
      return;
    }
    
    try {
      setLoading(true);
      const result = await templatesApi.searchTemplates(searchQuery, pageNumber, metaData.PageSize);
      
      if (result && result.templates && result.metaData) {
        setTemplates(result.templates);
        setMetaData(result.metaData);
        setError(null);
      } else {
        console.error('Unexpected API response format:', result);
        setTemplates(Array.isArray(result) ? result : []);
        setError(t('search.error'));
      }
    } catch (err) {
      console.error('Error searching templates:', err);
      setError(t('search.error'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSearchResults();
  }, [searchQuery, navigate, t]);
  
  const handlePageChange = (newPage: number) => {
    fetchSearchResults(newPage);
  };
  
  if (loading && templates.length === 0) {
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
          {metaData.TotalCount === 0
            ? t('search.noResults')
            : t('search.foundResults', { count: metaData.TotalCount })}
        </Typography>
      </Paper>
      
      <Paper sx={{ mb: 4 }}>
        {templates.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              {t('search.tryDifferentQuery')}
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ p: 3 }}>
              {templates.map((template) => (
                <Grid item key={template.id} xs={12} sm={6} md={4} lg={3}>
                  <TemplateCard template={template} />
                </Grid>
              ))}
            </Grid>
            
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <IconButton
                  onClick={() => handlePageChange(metaData.CurrentPage - 1)}
                  disabled={!metaData.HasPrevious}
                  size="small"
                  aria-label="previous page"
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Typography variant="body2" sx={{ mx: 2 }}>
                  {t('templates.page')} {metaData.CurrentPage} {t('templates.of')} {metaData.TotalPages}
                </Typography>
                <IconButton
                  onClick={() => handlePageChange(metaData.CurrentPage + 1)}
                  disabled={!metaData.HasNext}
                  size="small"
                  aria-label="next page"
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default SearchPage;