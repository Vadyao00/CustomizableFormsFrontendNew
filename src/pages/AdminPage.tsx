import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { User, MetaData } from '../types';
import * as adminApi from '../api/admin';
import UserList from '../components/admin/UserList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`admin-tabpanel-${index}`}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metaData, setMetaData] = useState<MetaData>({
    CurrentPage: 1,
    TotalPages: 1,
    PageSize: 10,
    TotalCount: 0,
    HasPrevious: false,
    HasNext: false
  });
  
  const fetchUsers = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const result = await adminApi.getAllUsers(pageNumber, 10);
      setUsers(result.users);
      setMetaData(result.metaData);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(t('admin.fetchError'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers(1);
  }, []);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handlePageChange = (event: unknown, newPage: number) => {
    fetchUsers(newPage + 1);
  };
  
  const handleBlockUser = async (userId: string) => {
    try {
      await adminApi.blockUser(userId);
      
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, status: 'Blocked' }
            : user
        )
      );
    } catch (err) {
      console.error('Error blocking user:', err);
      setError(t('admin.blockError'));
    }
  };
  
  const handleUnblockUser = async (userId: string) => {
    try {
      await adminApi.unblockUser(userId);
      
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, status: 'Active' }
            : user
        )
      );
    } catch (err) {
      console.error('Error unblocking user:', err);
      setError(t('admin.unblockError'));
    }
  };
  
  const handleAddAdminRole = async (userId: string) => {
    try {
      await adminApi.addAdminRole(userId);
      
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, roles: [...(user.roles || []), 'Admin'] }
            : user
        )
      );
    } catch (err) {
      console.error('Error adding admin role:', err);
      setError(t('admin.roleError'));
    }
  };
  
  const handleRemoveAdminRole = async (userId: string) => {
    try {
      await adminApi.removeAdminRole(userId);
      
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, roles: (user.roles || []).filter(role => role !== 'Admin') }
            : user
        )
      );
    } catch (err) {
      console.error('Error removing admin role:', err);
      setError(t('admin.roleError'));
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    try {
      await adminApi.deleteUser(userId);
      
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      if (users.length === 1 && metaData.CurrentPage > 1) {
        fetchUsers(metaData.CurrentPage - 1);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(t('admin.deleteError'));
    }
  };
  
  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('admin.title')}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
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
          <Tab label={t('admin.users')} />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <UserList
            users={users}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onAddAdminRole={handleAddAdminRole}
            onRemoveAdminRole={handleRemoveAdminRole}
            onDeleteUser={handleDeleteUser}
            page={metaData.CurrentPage - 1}
            totalCount={metaData.TotalCount}
            onPageChange={handlePageChange}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminPage;