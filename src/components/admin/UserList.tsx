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
  Button,
  Tooltip,
  Chip,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TablePagination,
  Checkbox,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  SupervisorAccount as AdminIcon,
  PersonOutline as UserIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface UserListProps {
  users: User[];
  onBlockUser: (userId: string) => Promise<void>;
  onUnblockUser: (userId: string) => Promise<void>;
  onAddAdminRole: (userId: string) => Promise<void>;
  onRemoveAdminRole: (userId: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

const UserList: React.FC<UserListProps> = ({
  users,
  onBlockUser,
  onUnblockUser,
  onAddAdminRole,
  onRemoveAdminRole,
  onDeleteUser
}) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    for (const userId of selectedUserIds) {
      await onDeleteUser(userId);
    }
    setDeleteDialogOpen(false);
    setSelectedUserIds([]);
  };

  const isCurrentUser = (userId: string) => {
    return authState.user?.id === userId;
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allUserIds = users
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map(user => user.id);
      setSelectedUserIds(allUserIds);
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleRowSelect = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const isSelected = (userId: string) => selectedUserIds.includes(userId);

  const handleBlockUsers = async () => {
    for (const userId of selectedUserIds) {
      await onBlockUser(userId);
    }
    setSelectedUserIds([]);
  };

  const handleUnblockUsers = async () => {
    for (const userId of selectedUserIds) {
      await onUnblockUser(userId);
    }
    setSelectedUserIds([]);
  };

  const handleAddAdminRoles = async () => {
    for (const userId of selectedUserIds) {
      await onAddAdminRole(userId);
    }
    setSelectedUserIds([]);
  };

  const handleRemoveAdminRoles = async () => {
    for (const userId of selectedUserIds) {
      await onRemoveAdminRole(userId);
    }
    setSelectedUserIds([]);
  };

  if (users.length === 0) {
    return (
      <Typography color="text.secondary" align="center" py={4}>
        {t('admin.noUsers')}
      </Typography>
    );
  }

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
          {t('admin.users')} {selectedUserIds.length > 0 && `(${selectedUserIds.length} ${t('admin.selected')})`}
        </Typography>
        
        <Box>
          <Tooltip title={t('admin.block')}>
            <span>
              <IconButton 
                color="default" 
                onClick={handleBlockUsers}
                disabled={selectedUserIds.length === 0}
              >
                <BlockIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title={t('admin.unblock')}>
            <span>
              <IconButton 
                color="default" 
                onClick={handleUnblockUsers}
                disabled={selectedUserIds.length === 0}
              >
                <UnblockIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title={t('admin.addAdmin')}>
            <span>
              <IconButton 
                color="default" 
                onClick={handleAddAdminRoles}
                disabled={selectedUserIds.length === 0}
              >
                <AdminIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title={t('admin.removeAdmin')}>
            <span>
              <IconButton 
                color="default" 
                onClick={handleRemoveAdminRoles}
                disabled={selectedUserIds.length === 0}
              >
                <AdminIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title={t('admin.delete')}>
            <span>
              <IconButton 
                color="error" 
                onClick={handleDeleteClick}
                disabled={selectedUserIds.length === 0}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Toolbar>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedUserIds.length > 0 && selectedUserIds.length === Math.min(rowsPerPage, users.length)}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>{t('user.name')}</TableCell>
              <TableCell>{t('user.email')}</TableCell>
              <TableCell>{t('user.status')}</TableCell>
              <TableCell>{t('user.roles')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => {
                const isItemSelected = isSelected(user.id);
                const isDisabled = isCurrentUser(user.id);
                
                return (
                  <TableRow 
                    key={user.id}
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => handleRowSelect(user.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status === 'Active' ? t('user.active') : t('user.blocked')}
                        color={user.status === 'Active' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.roles?.map((role) => (
                        <Chip
                          key={role}
                          label={role}
                          color={role === 'Admin' ? 'primary' : 'default'}
                          size="small"
                          icon={role === 'Admin' ? <AdminIcon /> : <UserIcon />}
                          sx={{ mr: 0.5 }}
                        />
                      ))}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={t('table.rowsPerPage')}
      />
      
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('admin.deleteUserConfirm')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('admin.deleteUserWarning')}
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

export default UserList;