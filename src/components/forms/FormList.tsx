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
  TablePagination
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
  onDeleteForm?: (formId: string) => void;
  showTemplateInfo?: boolean;
  showUserInfo?: boolean;
}

const FormList: React.FC<FormListProps> = ({
  forms,
  onDeleteForm,
  showTemplateInfo = true,
  showUserInfo = true
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleViewForm = (formId: string) => {
    navigate(`/forms/${formId}`);
  };

  const handleEditForm = (formId: string) => {
    navigate(`/forms/${formId}/edit`);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (forms.length === 0) {
    return (
      <Typography color="text.secondary" align="center" py={4}>
        {t('forms.empty')}
      </Typography>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {showTemplateInfo && (
                <TableCell>{t('templates.title')}</TableCell>
              )}
              {showUserInfo && (
                <TableCell>{t('user.submittedBy')}</TableCell>
              )}
              <TableCell>{t('forms.submittedAt')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {forms
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((form) => (
                <TableRow key={form.id}>
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
                  
                  <TableCell align="right">
                    <Box>
                      <Tooltip title={t('common.view')}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewForm(form.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={t('common.edit')}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditForm(form.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {onDeleteForm && (
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            onClick={() => onDeleteForm(form.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={forms.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={t('table.rowsPerPage')}
      />
    </Box>
  );
};

export default FormList;