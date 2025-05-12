import React, { useState } from 'react';
import { Box, Typography, Link, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import HelpDialog from '../support/HelpDialog';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        position: 'sticky', 
        top: 'auto',
        bottom: 0,
        width: '100%'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} {t('app.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          <Link 
            component="button" 
            color="inherit" 
            underline="hover"
            onClick={() => setHelpDialogOpen(true)}
          >
            {t('support.createTicket')}
          </Link>
        </Typography>
        
        <HelpDialog
          open={helpDialogOpen}
          onClose={() => setHelpDialogOpen(false)}
          currentPath={location.pathname}
        />
      </Container>
    </Box>
  );
};

export default Footer;