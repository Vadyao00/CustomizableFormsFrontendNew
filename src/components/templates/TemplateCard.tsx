import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  IconButton,
  Tooltip,
  CardActionArea
} from '@mui/material';
import { 
  Comment as CommentIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Template } from '../../types';
import * as commentsApi from '../../api/comments';
import LikeButton from '../likes/LikeButton';

interface TemplateCardProps {
  template: Template;
  onLike?: (templateId: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onLike }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [commentsCount, setCommentsCount] = useState(0);
  
  useEffect(() => {
    const fetchCommentsCount = async () => {
      try {
        const comments = await commentsApi.getTemplateComments(template.id);
        setCommentsCount(comments.length);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    
    fetchCommentsCount();
  }, [template.id]);
  
  const handleCardClick = () => {
    navigate(`/templates/${template.id}`);
  };
  
  const handleLikeToggle = () => {
    if (onLike) {
      onLike(template.id);
    }
  };
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={handleCardClick}>
        {template.imageUrl && (
          <CardMedia
            component="img"
            height="140"
            image={template.imageUrl}
            alt={template.title}
          />
        )}
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {template.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1
          }}>
            {template.description}
          </Typography>
          
          <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
            {Array.isArray(template.tags) && template.tags.slice(0, 3).map(tag => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/tags/${tag}/templates`);
                }}
              />
            ))}
            {Array.isArray(template.tags) && template.tags.length > 3 && (
              <Chip 
                label={`+${template.tags.length - 3}`} 
                size="small" 
                variant="outlined"
              />
            )}
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {dayjs(template.createdAt).format('MMM D, YYYY')}
            </Typography>
            
            <Typography variant="caption" color="text.secondary">
              {t('by')} {template.creator.name}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1}>
        <Box display="flex" alignItems="center">
          <LikeButton 
            templateId={template.id}
            onLikeToggle={handleLikeToggle}
          />
          
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            <Tooltip title={t('tooltip.comments')}>
              <IconButton size="small">
                <CommentIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              {commentsCount}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center">
          <Tooltip title={t('tooltip.forms')}>
            <IconButton size="small">
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {template.formsCount}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default TemplateCard;