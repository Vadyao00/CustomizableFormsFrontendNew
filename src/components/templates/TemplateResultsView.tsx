import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  LinearProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FormResultsAggregation, QuestionType } from '../../types';
import * as formsApi from '../../api/forms';

interface TemplateResultsViewProps {
  templateId: string;
}

const TemplateResultsView: React.FC<TemplateResultsViewProps> = ({ templateId }) => {
  const { t } = useTranslation();
  const [results, setResults] = useState<FormResultsAggregation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await formsApi.getFormResults(templateId);
        setResults(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching form results:', err);
        setError(t('templates.resultsError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [templateId, t]);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!results) {
    return (
      <Alert severity="info">
        {t('templates.noResults')}
      </Alert>
    );
  }
  
  if (results.totalResponses === 0) {
    return (
      <Alert severity="info">
        {t('templates.noResponses')}
      </Alert>
    );
  }
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('templates.results')}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('templates.summary')}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="body1" mr={1}>
            {t('templates.totalResponses')}:
          </Typography>
          <Chip label={results.totalResponses} color="primary" />
        </Box>
      </Paper>
      
      {results.questionResults.map(question => (
        <Paper key={question.questionId} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {question.questionTitle}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {question.type === QuestionType.Integer && (
            <Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('results.average')}</TableCell>
                      <TableCell>{t('results.min')}</TableCell>
                      <TableCell>{t('results.max')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{question.averageValue?.toFixed(2) || '-'}</TableCell>
                      <TableCell>{question.minValue || '-'}</TableCell>
                      <TableCell>{question.maxValue || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {(question.type === QuestionType.SingleLineString || question.type === QuestionType.MultiLineText) && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {t('results.mostCommonValues')}
              </Typography>
              
              {question.mostCommonValues && question.mostCommonValues.length > 0 ? (
                <List>
                  {question.mostCommonValues.map((item, index) => (
                    <ListItem key={index} divider={index < question.mostCommonValues!.length - 1}>
                      <ListItemText
                        primary={item.value}
                        secondary={`${t('results.occurrences')}: ${item.count}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('results.noData')}
                </Typography>
              )}
            </Box>
          )}
          
          {question.type === QuestionType.Checkbox && (
            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">
                  {t('common.yes')}: {question.trueCount || 0} ({question.truePercentage?.toFixed(1)}%)
                </Typography>
                <Typography variant="body2">
                  {t('common.no')}: {question.falseCount || 0} ({(100 - (question.truePercentage || 0)).toFixed(1)}%)
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={question.truePercentage || 0}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default TemplateResultsView;