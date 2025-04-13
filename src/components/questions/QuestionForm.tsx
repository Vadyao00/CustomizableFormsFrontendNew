import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Typography,
  Divider
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { QuestionType, QuestionForCreationDto } from '../../types';

interface QuestionFormProps {
  onSubmit: (question: QuestionForCreationDto) => void;
  onCancel: () => void;
  initialOrderIndex: number;
  questionCounts: Record<QuestionType, number>;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  onSubmit,
  onCancel,
  initialOrderIndex,
  questionCounts
}) => {
  const { t } = useTranslation();

  const validationSchema = Yup.object({
    title: Yup.string()
      .required(t('validation.required'))
      .max(500, t('validation.maxLength', { length: 500 })),
    type: Yup.number().required(t('validation.required')),
    description: Yup.string(),
    showInResults: Yup.boolean()
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      type: QuestionType.SingleLineString,
      showInResults: true
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        orderIndex: initialOrderIndex
      });
    }
  });

  const isQuestionTypeDisabled = (type: QuestionType) => {
    return questionCounts[type] >= 4;
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('questions.add')}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="title"
            name="title"
            label={t('questions.title')}
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="description"
            name="description"
            label={t('questions.description')}
            value={formik.values.description}
            onChange={formik.handleChange}
            multiline
            rows={3}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="type"
            name="type"
            select
            label={t('questions.type')}
            value={formik.values.type}
            onChange={formik.handleChange}
          >
            <MenuItem 
              value={QuestionType.SingleLineString} 
              disabled={isQuestionTypeDisabled(QuestionType.SingleLineString)}
            >
              {t('questions.types.singleLineString')} 
              {isQuestionTypeDisabled(QuestionType.SingleLineString) && ' (Макс. 4)'}
            </MenuItem>
            <MenuItem 
              value={QuestionType.MultiLineText} 
              disabled={isQuestionTypeDisabled(QuestionType.MultiLineText)}
            >
              {t('questions.types.multiLineText')} 
              {isQuestionTypeDisabled(QuestionType.MultiLineText) && ' (Макс. 4)'}
            </MenuItem>
            <MenuItem 
              value={QuestionType.Integer} 
              disabled={isQuestionTypeDisabled(QuestionType.Integer)}
            >
              {t('questions.types.integer')} 
              {isQuestionTypeDisabled(QuestionType.Integer) && ' (Макс. 4)'}
            </MenuItem>
            <MenuItem 
              value={QuestionType.Checkbox} 
              disabled={isQuestionTypeDisabled(QuestionType.Checkbox)}
            >
              {t('questions.types.checkbox')} 
              {isQuestionTypeDisabled(QuestionType.Checkbox) && ' (Макс. 4)'}
            </MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name="showInResults"
                checked={formik.values.showInResults}
                onChange={formik.handleChange}
              />
            }
            label={t('questions.showInResults')}
          />
        </Grid>

        <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained" type="submit">
            {t('common.save')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuestionForm;