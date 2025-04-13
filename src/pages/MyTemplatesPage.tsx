import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  Toolbar,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Template } from '../types';
import * as templatesApi from '../api/templates';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`templates-tabpanel-${index}`}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const MyTemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    const fetchMyTemplates = async () => {
      try {
        setLoading(true);
        const data = await templatesApi.getUserTemplates();
        setTemplates(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching my templates:', err);
        setError(t('templates.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyTemplates();
  }, [t]);
  
  useEffect(() => {
    setSelectedTemplateIds([]);
  }, [tabValue]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleCreateTemplate = () => {
    navigate('/templates/create');
  };
  
  const handleViewTemplate = () => {
    if (selectedTemplateIds.length === 1) {
      navigate(`/templates/${selectedTemplateIds[0]}`);
    }
  };
  
  const handleEditTemplate = () => {
    if (selectedTemplateIds.length === 1) {
      navigate(`/templates/${selectedTemplateIds[0]}/edit`);
    }
  };
  
  const handleDeleteClick = () => {
    if (selectedTemplateIds.length > 0) {
      setDeleteDialogOpen(true);
    }
  };
  
  const handleDeleteConfirm = async () => {
    try {
      for (const templateId of selectedTemplateIds) {
        await templatesApi.deleteTemplate(templateId);
      }
      
      setTemplates(prevTemplates => 
        prevTemplates.filter(template => !selectedTemplateIds.includes(template.id))
      );
      
      setDeleteDialogOpen(false);
      setSelectedTemplateIds([]);
    } catch (err) {
      console.error('Error deleting templates:', err);
      setError(t('templates.deleteError'));
    }
  };
  
  const handleSelectTemplate = (templateId: string) => {
    if (selectedTemplateIds.includes(templateId)) {
      setSelectedTemplateIds(selectedTemplateIds.filter(id => id !== templateId));
    } else {
      setSelectedTemplateIds([...selectedTemplateIds, templateId]);
    }
  };
  
  const handleSelectAllTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      let templatesForCurrentTab: Template[] = [];
      
      switch (tabValue) {
        case 0:
          templatesForCurrentTab = templates;
          break;
        case 1:
          templatesForCurrentTab = templates.filter(template => template.isPublic);
          break;
        case 2:
          templatesForCurrentTab = templates.filter(template => !template.isPublic);
          break;
      }
      
      setSelectedTemplateIds(templatesForCurrentTab.map(template => template.id));
    } else {
      setSelectedTemplateIds([]);
    }
  };
  
  const isSelected = (templateId: string) => selectedTemplateIds.includes(templateId);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  const publicTemplates = templates.filter(template => template.isPublic);
  const privateTemplates = templates.filter(template => !template.isPublic);
  
  const getCurrentTabTemplates = () => {
    switch (tabValue) {
      case 0: return templates;
      case 1: return publicTemplates;
      case 2: return privateTemplates;
      default: return templates;
    }
  };
  
  const currentTemplates = getCurrentTabTemplates();
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          {t('templates.my')}
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTemplate}
        >
          {t('templates.create')}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('templates.all')} />
          <Tab label={t('templates.public')} />
          <Tab label={t('templates.private')} />
        </Tabs>
        
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" component="div">
            {t('templates.templates')} {selectedTemplateIds.length > 0 && `(${selectedTemplateIds.length} ${t('templates.selected')})`}
          </Typography>
          
          <Box>
            <Tooltip title={t('common.view')}>
              <span>
                <IconButton
                  color="default"
                  onClick={handleViewTemplate}
                  disabled={selectedTemplateIds.length !== 1}
                >
                  <ViewIcon />
                </IconButton>
              </span>
            </Tooltip>
            
            <Tooltip title={t('common.edit')}>
              <span>
                <IconButton
                  color="default"
                  onClick={handleEditTemplate}
                  disabled={selectedTemplateIds.length !== 1}
                >
                  <EditIcon />
                </IconButton>
              </span>
            </Tooltip>
            
            <Tooltip title={t('common.delete')}>
              <span>
                <IconButton
                  color="error"
                  onClick={handleDeleteClick}
                  disabled={selectedTemplateIds.length === 0}
                >
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Toolbar>
        
        <TabPanel value={tabValue} index={0}>
          {templates.length === 0 ? (
            <Alert severity="info">
              {t('templates.noTemplates')}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box px={2} py={1} display="flex" alignItems="center" sx={{ borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
                  <Checkbox
                    checked={selectedTemplateIds.length > 0 && selectedTemplateIds.length === templates.length}
                    onChange={handleSelectAllTemplates}
                    size="small"
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {t('templates.selectAll')}
                  </Typography>
                </Box>
              </Grid>
              
              {templates.map((template) => (
                <Grid item key={template.id} xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        checked={isSelected(template.id)}
                        onChange={() => handleSelectTemplate(template.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <Box flex={1}>
                        <Typography variant="h6">{template.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {template.isPublic ? t('templates.public') : t('templates.private')} • 
                          {template.topic} • 
                          {t('templates.createdAt')} {new Date(template.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {publicTemplates.length === 0 ? (
            <Alert severity="info">
              {t('templates.noPublicTemplates')}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box px={2} py={1} display="flex" alignItems="center" sx={{ borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
                  <Checkbox
                    checked={selectedTemplateIds.length > 0 && selectedTemplateIds.length === publicTemplates.length}
                    onChange={handleSelectAllTemplates}
                    size="small"
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {t('templates.selectAll')}
                  </Typography>
                </Box>
              </Grid>
              
              {publicTemplates.map((template) => (
                <Grid item key={template.id} xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        checked={isSelected(template.id)}
                        onChange={() => handleSelectTemplate(template.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <Box flex={1}>
                        <Typography variant="h6">{template.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {template.topic} • 
                          {t('templates.createdAt')} {new Date(template.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {privateTemplates.length === 0 ? (
            <Alert severity="info">
              {t('templates.noPrivateTemplates')}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box px={2} py={1} display="flex" alignItems="center" sx={{ borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
                  <Checkbox
                    checked={selectedTemplateIds.length > 0 && selectedTemplateIds.length === privateTemplates.length}
                    onChange={handleSelectAllTemplates}
                    size="small"
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {t('templates.selectAll')}
                  </Typography>
                </Box>
              </Grid>
              
              {privateTemplates.map((template) => (
                <Grid item key={template.id} xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        checked={isSelected(template.id)}
                        onChange={() => handleSelectTemplate(template.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <Box flex={1}>
                        <Typography variant="h6">{template.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {template.topic} • 
                          {t('templates.createdAt')} {new Date(template.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>
      
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('templates.deleteConfirm')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedTemplateIds.length > 1 
              ? t('templates.deleteMultipleWarning', { count: selectedTemplateIds.length })
              : t('templates.deleteWarning')
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyTemplatesPage;