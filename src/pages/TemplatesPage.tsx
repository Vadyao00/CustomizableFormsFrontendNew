import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Template, MetaData } from '../types';
import * as templatesApi from '../api/templates';
import TemplateCard from '../components/templates/TemplateCard';
import { useAuth } from '../contexts/AuthContext';

const TemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [topic, setTopic] = useState('all');
  const [metaData, setMetaData] = useState<MetaData>({
    CurrentPage: 1,
    TotalPages: 1,
    PageSize: 8,
    TotalCount: 0,
    HasPrevious: false,
    HasNext: false
  });

  const getSortProperty = (sortOption: string): string => {
    switch (sortOption) {
      case 'newest':
        return 'CreatedAt desc';
      case 'oldest':
        return 'CreatedAt';
      case 'title':
        return 'Title';
      default:
        return 'Title';
    }
  };

  const fetchTemplates = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const sortProperty = getSortProperty(sortBy);
      const result = await templatesApi.getTemplates(
        pageNumber,
        metaData.PageSize,
        topic,
        sortProperty
      );
      
      if (result && result.templates && result.metaData) {
        setTemplates(result.templates);
        setMetaData(result.metaData);
        setError(null);
      } else {
        console.error('Unexpected API response format:', result);
        setTemplates(Array.isArray(result) ? result : []);
        setError(t('templates.fetchError'));
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(t('templates.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sortBy === 'popular') {
      setSortBy('newest');
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [topic, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm}`);
    }
  };

  const handleCreateTemplate = () => {
    navigate('/templates/create');
  };

  const handlePageChange = (newPage: number) => {
    fetchTemplates(newPage);
  };

  if (loading && templates.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          {t('templates.title')}
        </Typography>

        {authState.isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateTemplate}
          >
            {t('templates.create')}
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <Box component="form" onSubmit={handleSearch}>
              <TextField
                fullWidth
                placeholder={t('search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="topic-filter-label">{t('templates.topic')}</InputLabel>
              <Select
                labelId="topic-filter-label"
                value={topic}
                label={t('templates.topic')}
                onChange={(e) => setTopic(e.target.value)}
              >
                <MenuItem value="all">{t('common.all')}</MenuItem>
                <MenuItem value="Education">{t('topics.education')}</MenuItem>
                <MenuItem value="Business">{t('topics.business')}</MenuItem>
                <MenuItem value="Feedback">{t('topics.feedback')}</MenuItem>
                <MenuItem value="Quiz">{t('topics.quiz')}</MenuItem>
                <MenuItem value="Survey">{t('topics.survey')}</MenuItem>
                <MenuItem value="Other">{t('topics.other')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="sort-by-label">{t('common.sortBy')}</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                label={t('common.sortBy')}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">{t('sort.newest')}</MenuItem>
                <MenuItem value="oldest">{t('sort.oldest')}</MenuItem>
                <MenuItem value="title">{t('sort.title')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        {templates.length === 0 ? (
          <Alert severity="info">
            {t('templates.noTemplates')}
          </Alert>
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

export default TemplatesPage;