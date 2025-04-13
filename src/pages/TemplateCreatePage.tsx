import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Divider,
  Grid,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TemplateForCreationDto } from '../types';
import * as templatesApi from '../api/templates';
import * as tagsApi from '../api/tags';

const TemplateCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  
  const validationSchema = Yup.object({
    title: Yup.string()
      .required(t('validation.required'))
      .max(200, t('validation.maxLength', { length: 200 })),
    topic: Yup.string()
      .required(t('validation.required'))
      .max(50, t('validation.maxLength', { length: 50 })),
    description: Yup.string(),
    imageUrl: Yup.string().url(t('validation.url')).nullable(),
    isPublic: Yup.boolean()
  });
  
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      topic: '',
      imageUrl: '',
      isPublic: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        const templateDto: TemplateForCreationDto = {
          ...values,
          tags,
          allowedUserEmails: allowedUsers
        };
        const createdTemplate = await templatesApi.createTemplate(templateDto);
        navigate(`/templates/${createdTemplate.id}`);
      } catch (err) {
        console.error('Error creating template:', err);
        setError(t('templates.createError'));
        setLoading(false);
      }
    }
  });
  
  const handleTagInputChange = async (event: React.SyntheticEvent, value: string) => {
    if (!value) return;
    
    try {
      const result = await tagsApi.searchTags(value);
      setTagSuggestions(result.map(tag => tag.name));
    } catch (err) {
      console.error('Error searching tags:', err);
    }
  };
  
  const handleAddTag = (tag: string) => {
    if (!tag || tags.includes(tag)) return;
    setTags([...tags, tag]);
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleAddAllowedUser = (email: string) => {
    if (!email || allowedUsers.includes(email)) return;
    setAllowedUsers([...allowedUsers, email]);
  };
  
  const handleRemoveAllowedUser = (emailToRemove: string) => {
    setAllowedUsers(allowedUsers.filter(email => email !== emailToRemove));
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('templates.create')}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 4 }}>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label={t('templates.title')}
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label={t('templates.description')}
                value={formik.values.description}
                onChange={formik.handleChange}
                multiline
                rows={4}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="topic"
                name="topic"
                label={t('templates.topic')}
                value={formik.values.topic}
                onChange={formik.handleChange}
                error={formik.touched.topic && Boolean(formik.errors.topic)}
                helperText={formik.touched.topic && formik.errors.topic}
                select
              >
                {[
                  { value: 'Education', label: t('topics.education') },
                  { value: 'Business', label: t('topics.business') },
                  { value: 'Feedback', label: t('topics.feedback') },
                  { value: 'Quiz', label: t('topics.quiz') },
                  { value: 'Survey', label: t('topics.survey') },
                  { value: 'Other', label: t('topics.other') },
                ].map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="imageUrl"
                name="imageUrl"
                label={t('templates.imageUrl')}
                value={formik.values.imageUrl}
                onChange={formik.handleChange}
                error={formik.touched.imageUrl && Boolean(formik.errors.imageUrl)}
                helperText={formik.touched.imageUrl && formik.errors.imageUrl}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    id="isPublic"
                    name="isPublic"
                    checked={formik.values.isPublic}
                    onChange={formik.handleChange}
                  />
                }
                label={t('templates.isPublic')}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {t('templates.tags')}
              </Typography>
              
              <Autocomplete
                freeSolo
                options={tagSuggestions}
                onInputChange={handleTagInputChange}
                renderInput={(params) => (
                  <TextField {...params} label={t('templates.addTag')} fullWidth />
                )}
                onChange={(_, value) => {
                  if (typeof value === 'string') {
                    handleAddTag(value);
                  }
                }}
              />
              
              <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                {tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                  />
                ))}
              </Box>
            </Grid>
            
            {!formik.values.isPublic && (
              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t('templates.allowedUsers')}
                </Typography>
                
                <Autocomplete
                  freeSolo
                  options={[]}
                  renderInput={(params) => (
                    <TextField {...params} label={t('templates.addUser')} fullWidth />
                  )}
                  onChange={(_, value) => {
                    if (typeof value === 'string') {
                      handleAddAllowedUser(value);
                    }
                  }}
                />
                
                <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                  {allowedUsers.map(email => (
                    <Chip
                      key={email}
                      label={email}
                      onDelete={() => handleRemoveAllowedUser(email)}
                    />
                  ))}
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                >
                  {t('common.cancel')}
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    t('templates.create')
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default TemplateCreatePage;