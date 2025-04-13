import React, { useState, useEffect } from 'react';
import { 
  IconButton, 
  Typography, 
  Box, 
  Tooltip 
} from '@mui/material';
import { 
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import * as likesApi from '../../api/likes';
import { useLikes } from '../../contexts/LikesContext';

interface LikeButtonProps {
  templateId: string;
  showCount?: boolean;
  size?: 'small' | 'medium' | 'large';
  onLikeToggle?: (liked: boolean) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ 
  templateId, 
  showCount = true, 
  size = 'small',
  onLikeToggle
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { likesCount, likedStatus, updateLikeStatus, initializeTemplate } = useLikes();
  
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    if (!initialized) {
      initializeTemplate(templateId, authState.isAuthenticated);
      setInitialized(true);
    }
  }, [templateId, authState.isAuthenticated, initialized, initializeTemplate]);
  
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!authState.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      const currentLiked = likedStatus[templateId] || false;
      
      if (currentLiked) {
        await likesApi.unlikeTemplate(templateId);
      } else {
        await likesApi.likeTemplate(templateId);
      }
      
      updateLikeStatus(templateId, !currentLiked);
      
      if (onLikeToggle) {
        onLikeToggle(!currentLiked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  const count = likesCount[templateId] || 0;
  const liked = likedStatus[templateId] || false;
  
  return (
    <Box display="flex" alignItems="center">
      <Tooltip title={liked ? t('tooltip.unlike') : t('tooltip.like')}>
        <IconButton 
          size={size} 
          onClick={handleLikeToggle} 
          color={liked ? 'error' : 'default'}
        >
          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </Tooltip>
      
      {showCount && (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
          {count}
        </Typography>
      )}
    </Box>
  );
};

export default LikeButton;