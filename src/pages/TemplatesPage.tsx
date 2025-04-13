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
  Pagination
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Template } from '../types';
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
  const [page, setPage] = useState(1);
  const templatesPerPage = 12;

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await templatesApi.getTemplates();
        setTemplates(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError(t('templates.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [t]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm}`);
    }
  };

  const handleCreateTemplate = () => {
    navigate('/templates/create');
  };

  const filteredTemplates = templates.filter(template => {
    if (topic !== 'all' && template.topic !== topic) {
      return false;
    }
    return true;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'popular':
        return b.likesCount - a.likesCount;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const indexOfLastTemplate = page * templatesPerPage;
  const indexOfFirstTemplate = indexOfLastTemplate - templatesPerPage;
  const currentTemplates = sortedTemplates.slice(indexOfFirstTemplate, indexOfLastTemplate);
  const totalPages = Math.ceil(sortedTemplates.length / templatesPerPage);

  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  if (loading) {
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
                <MenuItem value="popular">{t('sort.popular')}</MenuItem>
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

      {currentTemplates.length === 0 ? (
        <Alert severity="info">
          {t('templates.noTemplates')}
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {currentTemplates.map((template) => (
              <Grid item key={template.id} xs={12} sm={6} md={4} lg={3}>
                <TemplateCard template={template} />
              </Grid>
            ))}
          </Grid>

          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handleChangePage}
              color="primary"
              size="large"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default TemplatesPage;