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
  Visibility as ViewIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Template, MetaData } from '../types';
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
  const [metaData, setMetaData] = useState<MetaData>({
    CurrentPage: 1,
    TotalPages: 1,
    PageSize: 10,
    TotalCount: 0,
    HasPrevious: false,
    HasNext: false
  });
  
  const fetchTemplates = async (pageNumber = 1) => {
    try {
      setLoading(true);
      let result;
      
      switch (tabValue) {
        case 0:
          result = await templatesApi.getUserTemplates(pageNumber, 4);
          break;
        case 1:
          result = await templatesApi.getUserPublicTemplates(pageNumber, 4);
          break;
        case 2:
          result = await templatesApi.getUserPrivateTemplates(pageNumber, 4);
          break;
        default:
          result = await templatesApi.getUserTemplates(pageNumber, 4);
      }
      
      setTemplates(result.templates);
      setMetaData(result.metaData);
      setError(null);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(t('templates.fetchError'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTemplates();
  }, [tabValue]);
  
  useEffect(() => {
    setSelectedTemplateIds([]);
  }, [tabValue]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handlePageChange = (event: unknown, newPage: number) => {
    fetchTemplates(newPage + 1);
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
      
      if (templates.length === selectedTemplateIds.length && metaData.CurrentPage > 1) {
        fetchTemplates(metaData.CurrentPage - 1);
      } else {
        fetchTemplates(metaData.CurrentPage);
      }
      
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
      setSelectedTemplateIds(templates.map(template => template.id));
    } else {
      setSelectedTemplateIds([]);
    }
  };
  
  const isSelected = (templateId: string) => selectedTemplateIds.includes(templateId);
  
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
                    indeterminate={selectedTemplateIds.length > 0 && selectedTemplateIds.length < templates.length}
                    size="small"
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {t('templates.selectAll')}
                  </Typography>
                </Box>
              </Grid>
              
              {templates.map((template) => (
                <Grid item key={template.id} xs={12}>
                  <Paper sx={{ p:1 }}>
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
          {templates.length === 0 ? (
            <Alert severity="info">
              {t('templates.noPublicTemplates')}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box px={2} py={1} display="flex" alignItems="center" sx={{ borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
                  <Checkbox
                    checked={selectedTemplateIds.length > 0 && selectedTemplateIds.length === templates.length}
                    onChange={handleSelectAllTemplates}
                    indeterminate={selectedTemplateIds.length > 0 && selectedTemplateIds.length < templates.length}
                    size="small"
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {t('templates.selectAll')}
                  </Typography>
                </Box>
              </Grid>
              
              {templates.map((template) => (
                <Grid item key={template.id} xs={12}>
                  <Paper sx={{ p: 1 }}>
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
          {templates.length === 0 ? (
            <Alert severity="info">
              {t('templates.noPrivateTemplates')}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box px={2} py={1} display="flex" alignItems="center" sx={{ borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
                  <Checkbox
                    checked={selectedTemplateIds.length > 0 && selectedTemplateIds.length === templates.length}
                    onChange={handleSelectAllTemplates}
                    indeterminate={selectedTemplateIds.length > 0 && selectedTemplateIds.length < templates.length}
                    size="small"
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {t('templates.selectAll')}
                  </Typography>
                </Box>
              </Grid>
              
              {templates.map((template) => (
                <Grid item key={template.id} xs={12}>
                  <Paper sx={{ p: 1 }}>
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
              onClick={(e) => handlePageChange(e, metaData.CurrentPage - 2)}
              disabled={!metaData.HasPrevious}
              size="small"
              aria-label="предыдущая страница"
            >
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="body2" sx={{ mx: 2 }}>
              {t('templates.page')} {metaData.CurrentPage} {t('templates.of')} {metaData.TotalPages}
            </Typography>
            <IconButton
              onClick={(e) => handlePageChange(e, metaData.CurrentPage)}
              disabled={!metaData.HasNext}
              size="small"
              aria-label="следующая страница"
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>
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