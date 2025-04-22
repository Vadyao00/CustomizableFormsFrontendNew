import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  useTheme,
  Stack,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import { Template, Question, QuestionType, Form, MetaData } from '../types';
import * as templatesApi from '../api/templates';
import * as formsApi from '../api/forms';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from '../components/comments/CommentSection';
import FormList from '../components/forms/FormList';
import TemplateResultsView from '../components/templates/TemplateResultsView';
import LikeButton from '../components/likes/LikeButton';
import * as signalR from '../api/signalR';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`template-tabpanel-${index}`}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const TemplateDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState, isAdmin } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [forms, setForms] = useState<Form[]>([]);
  const [formsLoading, setFormsLoading] = useState(true);
  
  const [formsPage, setFormsPage] = useState(0);
  const [formsMetaData, setFormsMetaData] = useState<MetaData | null>(null);
  const pageSize = 5;
  
  useEffect(() => {
    if (!id) return;
    
    const fetchTemplateDetails = async () => {
      try {
        setLoading(true);
        
        const [templateData, questionsData] = await Promise.all([
          templatesApi.getTemplate(id),
          templatesApi.getTemplateQuestions(id)
        ]);
        
        setTemplate(templateData);
        setQuestions(questionsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching template details:', err);
        setError(t('templates.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplateDetails();
  }, [id, t]);
  
  const canEditTemplate = () => {
    if (!template || !authState.isAuthenticated) return false;
    return template.creator.id === authState.user?.id || isAdmin();
  };

  const fetchForms = async (currentPage: number) => {
    if (!template || !id) return;
    
    try {
      setFormsLoading(true);
      const result = await formsApi.getTemplateForms(id, currentPage, pageSize);
      setForms(result.data);
      setFormsMetaData(result.metaData);
    } catch (err) {
      console.error('Error fetching forms:', err);
      setError(t('forms.fetchError'));
    } finally {
      setFormsLoading(false);
    }
  };

  useEffect(() => {
    if (template && canEditTemplate()) {
      fetchForms(formsPage);
    }
  }, [template, formsPage, t]);

  const handleFormsPageChange = (event: unknown, newPage: number) => {
    setFormsPage(newPage);
  };

  useEffect(() => {
    if (!id) return;
    
    let isComponentMounted = true;
  
    const setupSignalR = async () => {
      try {
        const connected = await signalR.startConnection();
        
        if (connected && isComponentMounted) {
          await signalR.joinTemplateGroup(id);
        }
      } catch (error) {
        console.error('Error setting up SignalR:', error);
      }
    };
    
    setupSignalR();
    
    return () => {
      isComponentMounted = false;
      if (id) {
        signalR.leaveTemplateGroup(id).catch(err => {
          console.error('Error leaving template group:', err);
        });
      }
    };
  }, [id]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleEditTemplate = () => {
    if (id) {
      navigate(`/templates/${id}/edit`);
    }
  };
  
  const handleDeleteTemplate = async () => {
    if (!id) return;
    
    try {
      await templatesApi.deleteTemplate(id);
      navigate('/templates');
    } catch (err) {
      console.error('Error deleting template:', err);
      setError(t('templates.deleteError'));
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const handleSubmitForm = () => {
    if (!id) return;
    
    if (authState.isAuthenticated) {
      navigate(`/templates/${id}/submit`);
    } else {
      navigate('/login');
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !template) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || t('templates.notFound')}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } 
            }}>
              {template.title}
            </Typography>
            
            <Box 
              display="flex" 
              alignItems="center" 
              gap={1} 
              mb={2}
              sx={{ 
                flexWrap: { xs: 'nowrap', sm: 'wrap' },
                overflowX: { xs: 'auto', sm: 'visible' },
                pb: { xs: 1, sm: 0 }
              }}
            >
              <Chip label={template.topic} color="primary" />
              
              {template.tags.slice(0, isMobile ? 2 : 3).map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  onClick={() => navigate(`/tags/${tag}/templates`)}
                />
              ))}
              
              {template.tags.length > (isMobile ? 2 : 3) && (
                <Tooltip title={template.tags.slice(isMobile ? 2 : 3).join(', ')}>
                  <Chip
                    label={`+${template.tags.length - (isMobile ? 2 : 3)}`}
                    variant="outlined"
                    color="default"
                    size={isMobile ? "small" : "medium"}
                  />
                </Tooltip>
              )}
              
              <Chip
                label={template.isPublic ? t('templates.public') : t('templates.private')}
                color={template.isPublic ? 'success' : 'default'}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
              />
            </Box>
            
            <Box 
              display="flex" 
              alignItems="center" 
              gap={2} 
              mb={3}
              sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 1, sm: 2 } }}
            >
              <LikeButton 
                templateId={id!} 
                size={isMobile ? "small" : "medium"}
              />
              
              <Box display="flex" alignItems="center" gap={0.5}>
                <Avatar
                  sx={{ width: 24, height: 24 }}
                  alt={template.creator.name}
                >
                  {template.creator.name.charAt(0)}
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {template.creator.name}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {dayjs(template.createdAt).format('DD.MM.YYYY')}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Stack 
              direction={isMobile ? "column" : "row"} 
              spacing={1}
              sx={{ mb: 2 }}
            >
              {canEditTemplate() && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditTemplate}
                    fullWidth={isMobile}
                    size={isMobile ? "small" : "medium"}
                  >
                    {t('common.edit')}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    fullWidth={isMobile}
                    size={isMobile ? "small" : "medium"}
                  >
                    {t('common.delete')}
                  </Button>
                </>
              )}
              
              <Button
                variant="contained"
                startIcon={<AssignmentIcon />}
                onClick={handleSubmitForm}
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
              >
                {t('forms.submit')}
              </Button>
            </Stack>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        {template.description && (
          <Box sx={{ mt: 2 }}>
            <ReactMarkdown>
              {template.description}
            </ReactMarkdown>
          </Box>
        )}
        
        {template.imageUrl && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <img
              src={template.imageUrl}
              alt={template.title}
              style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
            />
          </Box>
        )}
      </Paper>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t('questions.title')} />
          {canEditTemplate() && <Tab label={t('templates.results')} />}
          {canEditTemplate() && <Tab label={t('forms.title')} />}
        </Tabs>
        
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <TabPanel value={tabValue} index={0}>
            {questions.length === 0 ? (
              <Typography color="text.secondary" align="center">
                {t('questions.empty')}
              </Typography>
            ) : (
              <Box>
                {questions.map((question) => (
                  <Paper key={question.id} sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      {question.orderIndex + 1}. {question.title}
                    </Typography>
                    
                    {question.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {question.description}
                      </Typography>
                    )}
                    
                    <Box 
                      display="flex" 
                      justifyContent="space-between" 
                      alignItems="center" 
                      mt={1}
                      sx={{ 
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 1, sm: 0 }
                      }}
                    >
                      <Chip
                        label={t(`questions.types.${QuestionType[question.type].toLowerCase()}`)}
                        size="small"
                      />
                      
                      {question.showInResults && (
                        <Chip
                          label={t('questions.showInResults')}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </TabPanel>
          
          {canEditTemplate() && (
            <TabPanel value={tabValue} index={1}>
              <TemplateResultsView templateId={id!} />
            </TabPanel>
          )}
          
          {canEditTemplate() && (
            <TabPanel value={tabValue} index={2}>
              {formsLoading ? (
                <CircularProgress />
              ) : (
                <FormList
                  forms={forms}
                  showUserInfo
                  showTemplateInfo={false}
                  page={formsPage}
                  totalCount={formsMetaData?.TotalCount || 0}
                  onPageChange={handleFormsPageChange}
                />
              )}
            </TabPanel>
          )}
        </Box>
      </Paper>
      
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <CommentSection templateId={id!} />
      </Paper>
      
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('templates.deleteConfirm')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('templates.deleteWarning')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteTemplate} color="error" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>  
      </Dialog>
    </Container>
  );
};

export default TemplateDetailsPage;