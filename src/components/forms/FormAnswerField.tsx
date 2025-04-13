import React from 'react';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Box
} from '@mui/material';
import { Question, QuestionType } from '../../types';

interface FormAnswerFieldProps {
  question: Question;
  value: string | number | boolean | null;
  onChange: (questionId: string, value: string | number | boolean | null) => void;
  error?: string;
  readonly?: boolean;
}

const FormAnswerField: React.FC<FormAnswerFieldProps> = ({
  question,
  value,
  onChange,
  error,
  readonly = false
}) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(question.id, e.target.value);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : null;
    onChange(question.id, value);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(question.id, e.target.checked);
  };

  const renderField = () => {
    switch (question.type) {
      case QuestionType.SingleLineString:
        return (
          <TextField
            fullWidth
            label={question.title}
            value={value || ''}
            onChange={handleTextChange}
            error={!!error}
            helperText={error}
            disabled={readonly}
            variant="outlined"
            margin="normal"
          />
        );
      case QuestionType.MultiLineText:
        return (
          <TextField
            fullWidth
            label={question.title}
            value={value || ''}
            onChange={handleTextChange}
            error={!!error}
            helperText={error}
            multiline
            rows={4}
            disabled={readonly}
            variant="outlined"
            margin="normal"
          />
        );
      case QuestionType.Integer:
        return (
          <TextField
            fullWidth
            label={question.title}
            type="number"
            inputProps={{ min: 0 }}
            value={value === null ? '' : value}
            onChange={handleNumberChange}
            error={!!error}
            helperText={error}
            disabled={readonly}
            variant="outlined"
            margin="normal"
          />
        );
      case QuestionType.Checkbox:
        return (
          <Box mt={2} mb={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!value}
                  onChange={handleCheckboxChange}
                  disabled={readonly}
                />
              }
              label={question.title}
            />
            {error && <FormHelperText error>{error}</FormHelperText>}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box mb={2}>
      {question.description && (
        <FormHelperText sx={{ mb: 1 }}>
          {question.description}
        </FormHelperText>
      )}
      {renderField()}
    </Box>
  );
};

export default FormAnswerField;