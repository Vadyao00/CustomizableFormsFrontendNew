import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Template, Question, FormForSubmissionDto, AnswerForCreationDto } from '../types';
import * as templatesApi from '../api/templates';
import * as formsApi from '../api/forms';
import FormAnswerField from '../components/forms/FormAnswerField';

const FormSubmitPage: React.FC = () => {
  const { t } = useTranslation();
  const { id: templateId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | boolean | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (!templateId) return;
    
    const fetchTemplateData = async () => {
      try {
        setLoading(true);
        
        const [templateData, questionsData] = await Promise.all([
          templatesApi.getTemplate(templateId),
          templatesApi.getTemplateQuestions(templateId)
        ]);
        
        setTemplate(templateData);
        
        const sortedQuestions = [...questionsData].sort((a, b) => a.orderIndex - b.orderIndex);
        setQuestions(sortedQuestions);
        
        const initialAnswers: Record<string, string | number | boolean | null> = {};
        sortedQuestions.forEach(question => {
          initialAnswers[question.id] = null;
        });
        setAnswers(initialAnswers);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching template data:', err);
        setError(t('forms.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplateData();
  }, [templateId, t]);
  
  const handleAnswerChange = (questionId: string, value: string | number | boolean | null) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };
  
  const validateCurrentStep = () => {
    if (!questions.length) return true;
    
    const questionsPerStep = 5;
    const startIdx = activeStep * questionsPerStep;
    const endIdx = Math.min(startIdx + questionsPerStep, questions.length);
    const currentQuestions = questions.slice(startIdx, endIdx);
    
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    currentQuestions.forEach(question => {
      const value = answers[question.id];
      
      if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        newErrors[question.id] = t('validation.required');
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleNext = () => {
    if (validateCurrentStep()) {
      const questionsPerStep = 5;
      const maxSteps = Math.ceil(questions.length / questionsPerStep);
      
      if (activeStep < maxSteps - 1) {
        setActiveStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };
  
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  const handleSubmit = async () => {
    if (!templateId) return;
    
    try {
      setSubmitting(true);
      
      const formAnswers: AnswerForCreationDto[] = Object.entries(answers).map(([questionId, value]) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) throw new Error(`Question ${questionId} not found`);
        
        const answer: AnswerForCreationDto = {
          questionId
        };
        
        switch (question.type) {
          case 0:
          case 1:
            answer.stringValue = value as string;
            break;
          case 2:
            answer.integerValue = value as number;
            break;
          case 3:
            answer.booleanValue = value as boolean;
            break;
        }
        
        return answer;
      });
      
      const formData: FormForSubmissionDto = {
        answers: formAnswers
      };
      const submittedForm = await formsApi.submitForm(templateId, formData);
      
      navigate(`/forms/${submittedForm.id}`);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(t('forms.submitError'));
    } finally {
      setSubmitting(false);
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || t('templates.notFound')}
        </Alert>
      </Container>
    );
  }
  
  const questionsPerStep = 5;
  const steps = Array.from({ length: Math.ceil(questions.length / questionsPerStep) }, (_, i) => 
    `${t('forms.step')} ${i + 1}`
  );
  
  const startIdx = activeStep * questionsPerStep;
  const endIdx = Math.min(startIdx + questionsPerStep, questions.length);
  const currentQuestions = questions.slice(startIdx, endIdx);
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {template.title}
        </Typography>
        
        {template.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {template.description}
          </Typography>
        )}
        
        <Divider sx={{ mb: 3 }} />
        
        {questions.length > 0 && (
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
        
        {currentQuestions.length === 0 ? (
          <Alert severity="info">
            {t('questions.empty')}
          </Alert>
        ) : (
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              {currentQuestions.map((question) => (
                <FormAnswerField
                  key={question.id}
                  question={question}
                  value={answers[question.id]}
                  onChange={handleAnswerChange}
                  error={errors[question.id]}
                />
              ))}
            </CardContent>
          </Card>
        )}
        
        <Box display="flex" justifyContent="space-between" pt={2}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            {t('common.back')}
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={submitting || currentQuestions.length === 0}
          >
            {submitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              t('forms.submit')
            ) : (
              t('common.next')
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default FormSubmitPage;