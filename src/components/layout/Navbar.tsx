import React, { useState, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  InputBase,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Switch,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Description as DescriptionIcon,
  Create as CreateIcon,
  Assignment as AssignmentIcon,
  SupervisorAccount as AdminIcon,
  Brightness4 as ThemeIcon,
  Translate as TranslateIcon,
  AccountCircle,
  Person as PersonIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { updateUser } from '../../api/admin';
import { UserPreferencesDto } from '../../types';

const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState, logout, isAdmin } = useAuth();
  const { themeMode, toggleTheme } = useAppTheme();
  const { language, changeLanguage } = useLanguage();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    const savedTheme = localStorage.getItem('theme') ?? '';
    const savedLanguage = localStorage.getItem('language') ?? '';

    const userPreferences: UserPreferencesDto = {
      prefLang: savedLanguage,
      prefTheme: savedTheme,
    };
    try {
      await updateUser(userPreferences);
    } catch (error) {
      console.error('Error while updating user:', error);
    }

    logout();
    handleMenuClose();
    navigate('/');
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/search?q=${searchTerm}`);
      setSearchTerm('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleLanguageChange = () => {
    changeLanguage(language === 'en' ? 'ru' : 'en');
  };
  
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem button onClick={() => { navigate('/'); setDrawerOpen(false); }}>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary={t('nav.home')} />
        </ListItem>
        <ListItem button onClick={() => { navigate('/templates'); setDrawerOpen(false); }}>
          <ListItemIcon><DescriptionIcon /></ListItemIcon>
          <ListItemText primary={t('nav.templates')} />
        </ListItem>
        
        {authState.isAuthenticated && (
          <>
            <ListItem button onClick={() => { navigate('/templates/my'); setDrawerOpen(false); }}>
              <ListItemIcon><CreateIcon /></ListItemIcon>
              <ListItemText primary={t('nav.myTemplates')} />
            </ListItem>
            <ListItem button onClick={() => { navigate('/forms/my'); setDrawerOpen(false); }}>
              <ListItemIcon><AssignmentIcon /></ListItemIcon>
              <ListItemText primary={t('nav.myForms')} />
            </ListItem>
          </>
        )}
        
        {isAdmin() && (
          <ListItem button onClick={() => { navigate('/admin'); setDrawerOpen(false); }}>
            <ListItemIcon><AdminIcon /></ListItemIcon>
            <ListItemText primary={t('nav.admin')} />
          </ListItem>
        )}
      </List>
      
      <Divider />
      
      <List>
        <ListItem>
          <ListItemIcon><ThemeIcon /></ListItemIcon>
          <ListItemText primary={themeMode === 'dark' ? t('theme.dark') : t('theme.light')} />
          <Switch
            checked={themeMode === 'dark'}
            onChange={toggleTheme}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><TranslateIcon /></ListItemIcon>
          <ListItemText primary={language === 'en' ? 'English' : 'Русский'} />
          <Switch
            checked={language === 'ru'}
            onChange={handleLanguageChange}
          />
        </ListItem>
      </List>
      
      {isMobile && !authState.isAuthenticated && (
        <>
          <Divider />
          <List>
            <ListItem button onClick={() => { navigate('/login'); setDrawerOpen(false); }}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary={t('auth.login')} />
            </ListItem>
            <ListItem button onClick={() => { navigate('/register'); setDrawerOpen(false); }}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary={t('auth.register')} />
            </ListItem>
          </List>
        </>
      )}
      
      {isMobile && authState.isAuthenticated && (
        <>
          <Divider />
          <List>
            <ListItem button onClick={() => { handleLogout(); setDrawerOpen(false); }}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary={t('auth.logout')} />
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );
  
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              display: { xs: 'block', sm: 'block' }, 
              cursor: 'pointer',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
            onClick={() => navigate('/')}
          >
            {t('app.title')}
          </Typography>
          
          <SearchWrapper sx={{ 
            flexGrow: 1,
            maxWidth: { xs: '40%', sm: '60%', md: 'auto' } 
          }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder={t('search.placeholder')}
              inputProps={{ 'aria-label': 'search' }}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleSearch}
            />
          </SearchWrapper>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {!authState.isAuthenticated ? (
              <>
                <Button color="inherit" onClick={() => navigate('/login')}>{t('auth.login')}</Button>
                <Button color="inherit" onClick={() => navigate('/register')}>{t('auth.register')}</Button>
              </>
            ) : (
              <>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {authState.user?.name?.charAt(0)}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleLogout}>{t('auth.logout')}</MenuItem>
                </Menu>
              </>
            )}
          </Box>
          
          {isMobile && authState.isAuthenticated && (
            <IconButton
              size="medium"
              edge="end"
              color="inherit"
              onClick={handleDrawerToggle}
            >
              <Avatar sx={{ width: 28, height: 28 }}>
                {authState.user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;