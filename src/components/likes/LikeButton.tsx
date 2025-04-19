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

interface LikeButtonProps {
  templateId: string;
  showCount?: boolean;
  size?: 'small' | 'medium' | 'large';
  onLikeToggle?: (liked: boolean, templateId: string) => void;
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
  
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const fetchLikeData = async () => {
      if (!templateId) return;
      
      try {
        const likesCount = await likesApi.getLikesCount(templateId);
        setCount(likesCount);
        
        if (authState.isAuthenticated) {
          const hasLiked = await likesApi.getLikeStatus(templateId);
          setLiked(hasLiked);
        }
      } catch (error) {
        console.error('Error fetching like data:', error);
      }
    };
    
    fetchLikeData();
  }, [templateId, authState.isAuthenticated]);
  
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!authState.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (isProcessing) return;
    
    const newLiked = !liked;
    setLiked(newLiked);
    setCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
    
    setIsProcessing(true);
    
    try {
      if (newLiked) {
        await likesApi.likeTemplate(templateId);
      } else {
        await likesApi.unlikeTemplate(templateId);
      }
      
      if (onLikeToggle) {
        onLikeToggle(newLiked, templateId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setLiked(!newLiked);
      setCount(prev => !newLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Box display="flex" alignItems="center">
      <Tooltip title={liked ? t('tooltip.unlike') : t('tooltip.like')}>
        <span>
          <IconButton 
            size={size} 
            onClick={handleLikeToggle} 
            color={liked ? 'error' : 'default'}
          >
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </span>
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