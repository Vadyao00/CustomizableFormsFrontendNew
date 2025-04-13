import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Template } from '../types';
import * as tagsApi from '../api/tags';
import TemplateCard from '../components/templates/TemplateCard';

const TagTemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  const { tagName } = useParams<{ tagName: string }>();
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const templatesPerPage = 12;
  
  useEffect(() => {
    if (!tagName) {
      navigate('/');
      return;
    }
    
    const fetchTemplatesByTag = async () => {
      try {
        setLoading(true);
        const results = await tagsApi.getTemplatesByTag(tagName);
        setTemplates(results);
        setError(null);
      } catch (err) {
        console.error('Error fetching templates by tag:', err);
        setError(t('tags.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplatesByTag();
  }, [tagName, navigate, t]);
  
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
          {t('tags.templates')}
        </Typography>
        
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle1">{t('tags.selectedTag')}:</Typography>
          <Chip label={tagName} color="primary" size="medium" />
        </Box>
        
        <Typography variant="body2" sx={{ mt: 1 }}>
          {templates.length === 0
            ? t('tags.noTemplates')
            : t('tags.foundTemplates', { count: templates.length })}
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
            {t('tags.tryDifferentTag')}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default TagTemplatesPage;