import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import { Answer, QuestionType } from '../../types';
import { useTranslation } from 'react-i18next';

interface FormAnswerViewProps {
  answer: Answer;
}

const FormAnswerView: React.FC<FormAnswerViewProps> = ({ answer }) => {
  const { t } = useTranslation();
  
  const renderAnswerValue = () => {
    if (!answer.question) return null;
    
    switch (answer.question.type) {
      case QuestionType.SingleLineString:
      case QuestionType.MultiLineText:
        return (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {answer.stringValue || t('common.noAnswer')}
          </Typography>
        );
      case QuestionType.Integer:
        return (
          <Typography variant="body1">
            {answer.integerValue !== null ? answer.integerValue : t('common.noAnswer')}
          </Typography>
        );
      case QuestionType.Checkbox:
        return (
          <Chip 
            label={answer.booleanValue ? t('common.yes') : t('common.no')}
            color={answer.booleanValue ? 'success' : 'default'}
          />
        );
      default:
        return null;
    }
  };

  if (!answer.question) return null;

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold">
        {answer.question.title}
      </Typography>
      
      {answer.question.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {answer.question.description}
        </Typography>
      )}
      
      <Divider sx={{ my: 1 }} />
      
      <Box mt={1}>
        {renderAnswerValue()}
      </Box>
    </Paper>
  );
};

export default FormAnswerView;