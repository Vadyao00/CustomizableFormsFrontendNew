import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, FormForUpdateDto, AnswerForUpdateDto } from '../types';
import * as formsApi from '../api/forms';
import FormAnswerField from '../components/forms/FormAnswerField';

const FormEditPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number | boolean | null>>({});
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchForm = async () => {
      try {
        setLoading(true);
        const formData = await formsApi.getForm(id);
        setForm(formData);
        
        const initialAnswers: Record<string, string | number | boolean | null> = {};
        formData.answers.forEach(answer => {
          if (answer.stringValue !== null && answer.stringValue !== undefined) {
            initialAnswers[answer.questionId] = answer.stringValue;
          } else if (answer.integerValue !== null && answer.integerValue !== undefined) {
            initialAnswers[answer.questionId] = answer.integerValue;
          } else if (answer.booleanValue !== null && answer.booleanValue !== undefined) {
            initialAnswers[answer.questionId] = answer.booleanValue;
          }
        });
        setAnswers(initialAnswers);
        
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
  
  const handleAnswerChange = (questionId: string, value: string | number | boolean | null) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const handleSave = async () => {
    if (!id || !form) return;
    
    try {
      setSaving(true);
      
      const formAnswers: AnswerForUpdateDto[] = form.answers.map(answer => {
        const answerDto: AnswerForUpdateDto = {
          id: answer.id
        };
        
        const value = answers[answer.questionId];
        
        if (answer.question) {
          switch (answer.question.type) {
            case 0:
            case 1:
              answerDto.stringValue = value as string;
              break;
            case 2:
              answerDto.integerValue = value as number;
              break;
            case 3:
              answerDto.booleanValue = value as boolean;
              break;
          }
        }
        
        return answerDto;
      });
      
      const formData: FormForUpdateDto = {
        answers: formAnswers
      };
      
      await formsApi.updateForm(id, formData);
      
      navigate(`/forms/${id}`);
    } catch (err) {
      console.error('Error updating form:', err);
      setError(t('forms.updateError'));
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    setCancelDialogOpen(true);
  };
  
  const handleBack = () => {
    navigate(-1);
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
      
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('forms.edit')}
        </Typography>
        
        <Typography variant="h5" gutterBottom>
          {form.template.title}
        </Typography>
        
        {form.template.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {form.template.description}
          </Typography>
        )}
        
        <Divider sx={{ my: 3 }} />
        
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
              <FormAnswerField
                key={answer.id}
                question={answer.question!}
                value={answers[answer.questionId]}
                onChange={handleAnswerChange}
              />
            ))
        )}
        
        <Box display="flex" justifyContent="flex-end" pt={3} gap={2}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <CircularProgress size={24} />
            ) : (
              t('common.save')
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default FormEditPage;