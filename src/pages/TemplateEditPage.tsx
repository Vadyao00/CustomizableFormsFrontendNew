import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  MenuItem
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Template, TemplateForUpdateDto, Question, QuestionForCreationDto, QuestionType } from '../types';
import * as templatesApi from '../api/templates';
import * as tagsApi from '../api/tags';
import QuestionList from '../components/questions/QuestionList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`template-edit-tabpanel-${index}`}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const TemplateEditPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [template, setTemplate] = useState<Template | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchTemplateData = async () => {
      try {
        setLoading(true);
        
        const [templateData, questionsData] = await Promise.all([
          templatesApi.getTemplate(id),
          templatesApi.getTemplateQuestions(id)
        ]);
        
        setTemplate(templateData);
        setQuestions(questionsData);
        
        if (templateData.tags) {
          setTags(templateData.tags);
        }
        
        // TODO: Fetch and set allowed users if template is not public
        
        setError(null);
      } catch (err) {
        console.error('Error fetching template data:', err);
        setError(t('templates.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplateData();
  }, [id, t]);
  
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
      title: template?.title || '',
      description: template?.description || '',
      topic: template?.topic || '',
      imageUrl: template?.imageUrl || '',
      isPublic: template?.isPublic || false
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!id) return;
      
      try {
        setSaving(true);
        
        const templateDto: TemplateForUpdateDto = {
          ...values,
          tags,
          allowedUserEmails: allowedUsers
        };
        
        await templatesApi.updateTemplate(id, templateDto);
        navigate(`/templates/${id}`);
      } catch (err) {
        console.error('Error updating template:', err);
        setError(t('templates.updateError'));
      } finally {
        setSaving(false);
      }
    }
  });
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
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
  
  const handleAddQuestion = async (question: QuestionForCreationDto) => {
    if (!id) return;
    
    try {
      const newQuestion = await templatesApi.addQuestion(id, question);
      setQuestions([...questions, newQuestion]);
    } catch (err) {
      console.error('Error adding question:', err);
      setError(t('questions.addError'));
    }
  };
  
  const handleUpdateQuestion = async (questionId: string, question: any) => {
    if (!id) return;
    
    try {
      await templatesApi.updateQuestion(id, questionId, question);
      
      setQuestions(questions.map(q => 
        q.id === questionId ? { ...q, ...question } : q
      ));
    } catch (err) {
      console.error('Error updating question:', err);
      setError(t('questions.updateError'));
    }
  };
  
  const handleDeleteQuestion = async (questionId: string) => {
    if (!id) return;
    
    try {
      await templatesApi.deleteQuestion(id, questionId);
      
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      console.error('Error deleting question:', err);
      setError(t('questions.deleteError'));
    }
  };
  
  const handleReorderQuestions = async (questionIds: string[]) => {
    if (!id) return;
    
    try {
      await templatesApi.reorderQuestions(id, questionIds);
    } catch (err) {
      console.error('Error reordering questions:', err);
      setError(t('questions.reorderError'));
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!template && !loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || t('templates.notFound')}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('templates.edit')}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t('templates.settings')} />
          <Tab label={t('questions.title')} />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
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
                    disabled={saving}
                  >
                    {saving ? (
                      <CircularProgress size={24} />
                    ) : (
                      t('templates.save')
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <QuestionList
            questions={questions}
            templateId={id!}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onReorderQuestions={handleReorderQuestions}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default TemplateEditPage;