import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Divider, 
  Alert, 
  Snackbar, 
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SalesforceProfileFormDto } from '../types';
import { createSalesforceProfile, checkSalesforceProfile, getSalesforceProfile, updateSalesforceProfile } from '../api/salesforce';

const SalesforceProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState<SalesforceProfileFormDto>({
    companyName: '',
    website: '',
    industry: '',
    description: '',
    companyPhone: '',
    
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: ''
  });
  
  useEffect(() => {
    const initializeForm = async () => {
      if (!authState.isAuthenticated) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        const status = await checkSalesforceProfile();
        setProfileExists(status.exists);
        if (status.exists) {
          const profileData = await getSalesforceProfile();
          setFormData(profileData);
        } else {
          const nameParts = authState.user?.name?.split(' ') || ['', ''];
          setFormData(prev => ({
            ...prev,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: authState.user?.email || ''
          }));
        }
      } catch (err: any) {
        setError(err.response?.data?.message || t('salesforce.errorLoading'));
        console.error('Error loading Salesforce profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initializeForm();
  }, [authState.isAuthenticated, authState.user, navigate, t]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      if (profileExists) {
        await updateSalesforceProfile(formData);
        setSuccessMessage(t('salesforce.profileUpdated'));
      } else {
        await createSalesforceProfile(formData);
        setProfileExists(true);
        setSuccessMessage(t('salesforce.profileCreated'));
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('salesforce.errorSaving'));
      console.error('Error saving Salesforce profile:', err);
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
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {profileExists 
            ? t('salesforce.updateProfile') 
            : t('salesforce.createProfile')}
        </Typography>
        
        {profileExists && (
          <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6">
                {t('salesforce.profileStatus')}
              </Typography>
              <Typography variant="body1">
                {t('salesforce.profileExists')}
              </Typography>
            </CardContent>
          </Card>
        )}
        
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          {t('salesforce.formDescription')}
        </Typography>
        
        <Divider sx={{ mb: 4 }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            {t('salesforce.companyInfo')}
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label={t('salesforce.companyName')}
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('salesforce.website')}
                name="website"
                value={formData.website}
                onChange={handleChange}
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('salesforce.industry')}
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('salesforce.companyPhone')}
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleChange}
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('salesforce.description')}
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={submitting}
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" gutterBottom>
            {t('salesforce.contactInfo')}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label={t('salesforce.firstName')}
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label={t('salesforce.lastName')}
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label={t('salesforce.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('salesforce.phone')}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('salesforce.title')}
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={submitting}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {profileExists 
                ? t('salesforce.updateProfile') 
                : t('salesforce.createProfile')}
            </Button>
          </Box>
        </form>
      </Paper>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message={successMessage}
      />
    </Container>
  );
};

export default SalesforceProfilePage;