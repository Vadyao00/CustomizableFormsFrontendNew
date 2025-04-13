import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Form } from '../types';
import * as formsApi from '../api/forms';
import { useAuth } from '../contexts/AuthContext';
import FormAnswerView from '../components/forms/FormAnswerView';

const FormDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState, isAdmin } = useAuth();
  
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchForm = async () => {
      try {
        setLoading(true);
        const formData = await formsApi.getForm(id);
        setForm(formData);
        setError(null);
      } catch (err) {
        console.error('Error fetching form:', err);
        setError(t('forms.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchForm();
  }, [id, t]);
  
  const handleEdit = () => {
    if (id) {
      navigate(`/forms/${id}/edit`);
    }
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await formsApi.deleteForm(id);
      navigate('/forms/my');
    } catch (err) {
      console.error('Error deleting form:', err);
      setError(t('forms.deleteError'));
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const canModifyForm = () => {
    if (!form || !authState.isAuthenticated) return false;
    
    return (
      form.user.id === authState.user?.id ||
      form.template.creator.id === authState.user?.id ||
      isAdmin()
    );
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !form) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || t('forms.notFound')}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        {t('common.back')}
      </Button>
      
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {form.template.title}
            </Typography>
            
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                {t('forms.submittedBy')}: {form.user.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {t('forms.submittedAt')}: {dayjs(form.submittedAt).format('DD.MM.YYYY HH:mm')}
              </Typography>
            </Box>
          </Box>
          
          {canModifyForm() && (
            <Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ mr: 1 }}
              >
                {t('common.edit')}
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                {t('common.delete')}
              </Button>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" gutterBottom>
          {t('forms.answers')}
        </Typography>
        
        {form.answers.length === 0 ? (
          <Alert severity="info">
            {t('forms.noAnswers')}
          </Alert>
        ) : (
          form.answers
            .sort((a, b) => {
              if (!a.question || !b.question) return 0;
              return a.question.orderIndex - b.question.orderIndex;
            })
            .map(answer => (
              <FormAnswerView key={answer.id} answer={answer} />
            ))
        )}
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
          <Button onClick={handleDelete} color="error" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FormDetailsPage;