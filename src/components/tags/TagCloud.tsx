import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { TagCloudItem } from '../../types';

interface TagCloudProps {
  tags: TagCloudItem[];
}

const TagCloud: React.FC<TagCloudProps> = ({ tags }) => {
  const navigate = useNavigate();

  const getFontSize = (weight: number) => {
    const sizes = {
      1: 12,
      2: 14,
      3: 16,
      4: 18,
      5: 20
    };
    return `${sizes[weight as keyof typeof sizes] || 12}px`;
  };

  const handleTagClick = (tagName: string) => {
    navigate(`/tags/${tagName}/templates`);
  };

  if (tags.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        Нет доступных тегов
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {tags.map((tag) => (
        <Chip
          key={tag.name}
          label={tag.name}
          onClick={() => handleTagClick(tag.name)}
          sx={{
            fontSize: getFontSize(tag.weight),
            fontWeight: tag.weight > 3 ? 'bold' : 'normal',
          }}
        />
      ))}
    </Box>
  );
};

export default TagCloud;