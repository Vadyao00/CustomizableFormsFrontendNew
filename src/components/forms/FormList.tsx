import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Checkbox,
  Toolbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Form } from '../../types';

interface FormListProps {
  forms: Form[];
  onDeleteForm?: (formId: string) => Promise<void>;
  showTemplateInfo?: boolean;
  showUserInfo?: boolean;
  page: number;
  totalCount: number;
  onPageChange: (event: unknown, newPage: number) => void;
}

const FormList: React.FC<FormListProps> = ({
  forms,
  onDeleteForm,
  showTemplateInfo = true,
  showUserInfo = true,
  page,
  totalCount,
  onPageChange
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedFormIds, setSelectedFormIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleViewForm = () => {
    if (selectedFormIds.length === 1) {
      navigate(`/forms/${selectedFormIds[0]}`);
    }
  };

  const handleEditForm = () => {
    if (selectedFormIds.length === 1) {
      navigate(`/forms/${selectedFormIds[0]}/edit`);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (onDeleteForm) {
      for (const formId of selectedFormIds) {
        await onDeleteForm(formId);
      }
    }
    setDeleteDialogOpen(false);
    setSelectedFormIds([]);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allFormIds = forms.map(form => form.id);
      setSelectedFormIds(allFormIds);
    } else {
      setSelectedFormIds([]);
    }
  };

  const handleRowSelect = (formId: string) => {
    if (selectedFormIds.includes(formId)) {
      setSelectedFormIds(selectedFormIds.filter(id => id !== formId));
    } else {
      setSelectedFormIds([...selectedFormIds, formId]);
    }
  };

  const isSelected = (formId: string) => selectedFormIds.includes(formId);

  if (forms.length === 0) {
    return (
      <Typography color="text.secondary" align="center" py={4}>
        {t('forms.empty')}
      </Typography>
    );
  }

  const pageSize = 5;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Box>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" component="div">
          {t('forms.title')} {selectedFormIds.length > 0 && `(${selectedFormIds.length} ${t('common.selected')})`}
        </Typography>
        
        <Box>
          <Tooltip title={t('common.view')}>
            <span>
              <IconButton 
                color="default" 
                onClick={handleViewForm}
                disabled={selectedFormIds.length !== 1}
              >
                <ViewIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title={t('common.edit')}>
            <span>
              <IconButton 
                color="default" 
                onClick={handleEditForm}
                disabled={selectedFormIds.length !== 1}
              >
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          {onDeleteForm && (
            <Tooltip title={t('common.delete')}>
              <span>
                <IconButton 
                  color="error" 
                  onClick={handleDeleteClick}
                  disabled={selectedFormIds.length === 0}
                >
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>
      </Toolbar>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedFormIds.length > 0 && selectedFormIds.length === forms.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              {showTemplateInfo && (
                <TableCell>{t('templates.title')}</TableCell>
              )}
              {showUserInfo && (
                <TableCell>{t('user.submittedBy')}</TableCell>
              )}
              <TableCell>{t('forms.submittedAt')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {forms.map((form) => {
              const isItemSelected = isSelected(form.id);
              
              return (
                <TableRow 
                  key={form.id}
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  selected={isItemSelected}
                  onClick={() => handleRowSelect(form.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onChange={() => handleRowSelect(form.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  {showTemplateInfo && (
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {form.template.title}
                      </Typography>
                      {form.template.topic && (
                        <Chip 
                          label={form.template.topic} 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </TableCell>
                  )}
                  
                  {showUserInfo && (
                    <TableCell>{form.user.name}</TableCell>
                  )}
                  
                  <TableCell>
                    {dayjs(form.submittedAt).format('DD.MM.YYYY HH:mm')}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          p: 2
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <IconButton
            onClick={(e) => onPageChange(e, page - 1)}
            disabled={page <= 0}
            size="small"
            aria-label="предыдущая страница"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </IconButton>
          <Typography variant="body2" sx={{ mx: 2 }}>
            {t('admin.page')} {page + 1} {t('admin.of')} {totalPages}
          </Typography>
          <IconButton
            onClick={(e) => onPageChange(e, page + 1)}
            disabled={page >= totalPages - 1}
            size="small"
            aria-label="следующая страница"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </IconButton>
        </Box>
      </Box>
      
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('forms.deleteConfirm')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('forms.deleteWarning')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormList;