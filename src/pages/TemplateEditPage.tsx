import React, { useState, useEffect, useRef } from 'react';
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
  const [tagInputValue, setTagInputValue] = useState('');
  const [userInputValue, setUserInputValue] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
        
        if (templateData.imageUrl) {
          setPreviewImage(templateData.imageUrl);
        }
        
        if(templateData.allowedUsers){
          setAllowedUsers(templateData.allowedUsers);
        }
        
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
    setTagInputValue(value);
    
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
    setTagInputValue('');
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleAddAllowedUser = (email: string) => {
    if (!email || allowedUsers.includes(email)) return;
    setAllowedUsers([...allowedUsers, email]);
    setUserInputValue('');
  };
  
  const handleRemoveAllowedUser = (emailToRemove: string) => {
    setAllowedUsers(allowedUsers.filter(email => email !== emailToRemove));
  };
  
  const handleTagKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && tagInputValue) {
      event.preventDefault();
      handleAddTag(tagInputValue);
    }
  };
  
  const handleUserKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && userInputValue) {
      event.preventDefault();
      handleAddAllowedUser(userInputValue);
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError(t('templates.imageTypeError'));
      return;
    }
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(t('templates.imageSizeError'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await templatesApi.uploadImage(file);
      formik.setFieldValue('imageUrl', response.imageUrl);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error while uploading image:', err);
      setError(t('templates.imageUploadError'));
    } finally {
      setSaving(false);
    }
  };
  
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemoveImage = () => {
    formik.setFieldValue('imageUrl', '');
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
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
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Button
                        variant="contained"
                        onClick={handleSelectFile}
                        disabled={saving}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        {saving ? t('common.loading') : (t('templates.uploadImage') || 'Загрузить')}
                      </Button>
                    ),
                  }}
                />
                
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {(formik.values.imageUrl || previewImage) && (
                  <Box mt={2} position="relative">
                    <Box 
                      component="img"
                      src={previewImage || formik.values.imageUrl}
                      alt="Предпросмотр"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        borderRadius: 1
                      }}
                    />
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        minWidth: 0,
                        width: 30,
                        height: 30,
                        p: 0
                      }}
                    >
                      ×
                    </Button>
                  </Box>
                )}
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
                  inputValue={tagInputValue}
                  onInputChange={handleTagInputChange}
                  onChange={(_, value) => {
                    if (typeof value === 'string') {
                      handleAddTag(value);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label={t('templates.addTag')} 
                      fullWidth 
                      onKeyDown={handleTagKeyDown}
                    />
                  )}
                  value={null}
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
                    inputValue={userInputValue}
                    onInputChange={(_, value) => setUserInputValue(value)}
                    onChange={(_, value) => {
                      if (typeof value === 'string') {
                        handleAddAllowedUser(value);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label={t('templates.addUser')} 
                        fullWidth 
                        onKeyDown={handleUserKeyDown}
                      />
                    )}
                    value={null}
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