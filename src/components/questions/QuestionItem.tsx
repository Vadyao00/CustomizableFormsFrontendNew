import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Collapse
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Question, QuestionType } from '../../types';

interface QuestionItemProps {
  question: Question;
  onEdit: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  isDraggable?: boolean;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  onEdit,
  onDelete,
  isDraggable = false
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(question.id);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(question.id);
    handleMenuClose();
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.SingleLineString:
        return t('questions.types.singleLineString');
      case QuestionType.MultiLineText:
        return t('questions.types.multiLineText');
      case QuestionType.Integer:
        return t('questions.types.integer');
      case QuestionType.Checkbox:
        return t('questions.types.checkbox');
      default:
        return '';
    }
  };

  const getQuestionTypeColor = (type: QuestionType) => {
    switch (type) {
      case QuestionType.SingleLineString:
        return 'primary';
      case QuestionType.MultiLineText:
        return 'secondary';
      case QuestionType.Integer:
        return 'info';
      case QuestionType.Checkbox:
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {isDraggable && (
          <DragIcon
            sx={{
              cursor: 'grab',
              color: 'text.secondary',
              '&:active': { cursor: 'grabbing' }
            }}
          />
        )}

        <Box flexGrow={1}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {question.orderIndex + 1}. {question.title}
            </Typography>

            <Box display="flex" alignItems="center">
              <Chip
                label={getQuestionTypeLabel(question.type)}
                color={getQuestionTypeColor(question.type)}
                size="small"
                sx={{ mr: 1 }}
              />

              {question.description && (
                <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}

              <IconButton
                size="small"
                aria-label="more"
                onClick={handleMenuOpen}
              >
                <MoreIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleEdit}>{t('common.edit')}</MenuItem>
                <MenuItem onClick={handleDelete}>{t('common.delete')}</MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>
      </Box>

      {question.description && (
        <Collapse in={expanded}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {question.description}
          </Typography>
        </Collapse>
      )}

      <Box display="flex" justifyContent="flex-end" mt={1}>
        <Chip
          label={question.showInResults ? t('questions.showInResults') : t('questions.hideInResults')}
          size="small"
          variant={question.showInResults ? 'filled' : 'outlined'}
        />
      </Box>
    </Paper>
  );
};

export default QuestionItem;