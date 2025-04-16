import React from 'react';
import {
  Box,
  TextField,
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
import { Question, QuestionForUpdateDto, QuestionType } from '../../types';

interface QuestionEditFormProps {
  question: Question;
  onSubmit: (question: QuestionForUpdateDto) => void;
  onCancel: () => void;
}

const QuestionEditForm: React.FC<QuestionEditFormProps> = ({
  question,
  onSubmit,
  onCancel
}) => {
  const { t } = useTranslation();

  const validationSchema = Yup.object({
    title: Yup.string()
      .required(t('validation.required'))
      .max(500, t('validation.maxLength', { length: 500 })),
    description: Yup.string(),
    showInResults: Yup.boolean()
  });

  const formik = useFormik({
    initialValues: {
      title: question.title,
      description: question.description,
      showInResults: question.showInResults
    },
    validationSchema,
    onSubmit: values => {
      onSubmit(values);
    }
  });

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.SingleLineString:
        return t('questions.types.singlelinestring');
      case QuestionType.MultiLineText:
        return t('questions.types.multilinetext');
      case QuestionType.Integer:
        return t('questions.types.integer');
      case QuestionType.Checkbox:
        return t('questions.types.checkbox');
      default:
        return '';
    }
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {t('questions.edit')}
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
          <Typography variant="body2" color="text.secondary">
            {t('questions.type')}: {getQuestionTypeLabel(question.type)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('questions.typeCannotBeChanged')}
          </Typography>
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

export default QuestionEditForm;