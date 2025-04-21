import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Tab,
  Tabs
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Form, MetaData } from '../types';
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
  const [tabValue, setTabValue] = useState(0);
  
  const [page, setPage] = useState(0);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const pageSize = 5;
  
  const fetchMyForms = async (currentPage: number) => {
    try {
      setLoading(true);
      const result = await formsApi.getUserForms(currentPage, pageSize);
      setForms(result.data);
      setMetaData(result.metaData);
      setError(null);
    } catch (err) {
      console.error('Error fetching my forms:', err);
      setError(t('forms.fetchError'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMyForms(page);
  }, [page, t]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleDeleteForm = async (formId: string): Promise<void> => {
    try {
      await formsApi.deleteForm(formId);
      
      fetchMyForms(page);
      
      return Promise.resolve();
    } catch (err) {
      console.error('Error deleting form:', err);
      setError(t('forms.deleteError'));
      return Promise.reject(err);
    }
  };
  
  if (loading && page === 0) {
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
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={24} />
            </Box>
          ) : forms.length === 0 ? (
            <Alert severity="info">
              {t('forms.noSubmittedForms')}
            </Alert>
          ) : (
            <FormList
              forms={forms}
              showTemplateInfo
              showUserInfo={false}
              onDeleteForm={handleDeleteForm}
              page={page}
              totalCount={metaData?.TotalCount || 0}
              onPageChange={handlePageChange}
            />
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default MyFormsPage;