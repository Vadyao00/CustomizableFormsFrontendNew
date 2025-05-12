import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { createSupportTicket } from '../../api/support';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
  currentPath: string;
  templateTitle?: string;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose, currentPath, templateTitle }) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [summary, setSummary] = useState('');
  const [priority, setPriority] = useState('Average');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!summary.trim()) {
      setError(t('support.summaryRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createSupportTicket({
        summary,
        priority,
        link: window.location.origin + currentPath
      });
      
      setSuccess(true);
      setSummary('');
      setPriority('Average');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Error creating support ticket:', err);
      setError(t('support.errorCreating'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('support.createTicket')}</DialogTitle>
      <DialogContent>
        {success ? (
          <Typography color="success" sx={{ my: 2 }}>
            {t('support.ticketCreated')}
          </Typography>
        ) : (
          <>
            <TextField
              autoFocus
              margin="dense"
              label={t('support.summary')}
              fullWidth
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={loading}
              error={!!error}
              helperText={error}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel>{t('support.priority')}</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="High">{t('support.priority.high')}</MenuItem>
                <MenuItem value="Average">{t('support.priority.average')}</MenuItem>
                <MenuItem value="Low">{t('support.priority.low')}</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {t('support.additionalInfo')}:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>{t('support.reportedBy')}:</strong> {authState.user?.name}
            </Typography>
            {templateTitle && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>{t('support.template')}:</strong> {templateTitle}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <strong>{t('support.pageLink')}:</strong> {window.location.origin + currentPath}
            </Typography>
          </>
        )}
      </DialogContent>
      
      {!success && (
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {t('support.submit')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default HelpDialog;