import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Chip
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Template, MetaData } from '../types';
import * as tagsApi from '../api/tags';
import TemplateCard from '../components/templates/TemplateCard';

const TagTemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  const { tagName } = useParams<{ tagName: string }>();
  const navigate = useNavigate();
  
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
  
  const fetchTemplatesByTag = async (pageNumber = 1) => {
    if (!tagName) {
      navigate('/');
      return;
    }
    
    try {
      setLoading(true);
      const result = await tagsApi.getTemplatesByTag(tagName, pageNumber, metaData.PageSize);
      
      if (result && result.templates && result.metaData) {
        setTemplates(result.templates);
        setMetaData(result.metaData);
        setError(null);
      } else {
        console.error('Unexpected API response format:', result);
        setTemplates(Array.isArray(result) ? result : []);
        setError(t('tags.fetchError'));
      }
    } catch (err) {
      console.error('Error fetching templates by tag:', err);
      setError(t('tags.fetchError'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTemplatesByTag();
  }, [tagName, navigate, t]);
  
  const handlePageChange = (newPage: number) => {
    fetchTemplatesByTag(newPage);
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
          {t('tags.templates')}
        </Typography>
        
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle1">{t('tags.selectedTag')}:</Typography>
          <Chip label={tagName} color="primary" size="medium" />
        </Box>
        
        <Typography variant="body2" sx={{ mt: 1 }}>
          {metaData.TotalCount === 0
            ? t('tags.noTemplates')
            : t('tags.foundTemplates', { count: metaData.TotalCount })}
        </Typography>
      </Paper>
      
      <Paper sx={{ mb: 4 }}>
        {templates.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              {t('tags.tryDifferentTag')}
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

export default TagTemplatesPage;