import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Tab,
  Tabs
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Form } from '../types';
import * as formsApi from '../api/forms';
import FormList from '../components/forms/FormList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`forms-tabpanel-${index}`}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const MyFormsPage: React.FC = () => {
  const { t } = useTranslation();
  
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    const fetchMyForms = async () => {
      try {
        setLoading(true);
        const data = await formsApi.getUserForms();
        setForms(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching my forms:', err);
        setError(t('forms.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyForms();
  }, [t]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleDeleteClick = (formId: string) => {
    setFormToDelete(formId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!formToDelete) return;
    
    try {
      await formsApi.deleteForm(formToDelete);
      
      setForms(prevForms => 
        prevForms.filter(form => form.id !== formToDelete)
      );
      
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    } catch (err) {
      console.error('Error deleting form:', err);
      setError(t('forms.deleteError'));
    }
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
      <Typography variant="h4" component="h1" gutterBottom>
        {t('forms.my')}
      </Typography>
      
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
          <Tab label={t('forms.submittedByMe')} />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {forms.length === 0 ? (
            <Alert severity="info">
              {t('forms.noSubmittedForms')}
            </Alert>
          ) : (
            <FormList
              forms={forms}
              showTemplateInfo
              showUserInfo={false}
              onDeleteForm={handleDeleteClick}
            />
          )}
        </TabPanel>
      </Paper>
      
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('forms.deleteConfirm')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('forms.deleteWarning')}
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

export default MyFormsPage;