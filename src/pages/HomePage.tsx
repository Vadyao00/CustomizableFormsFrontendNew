import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Template, TagCloudItem } from '../types';
import * as templatesApi from '../api/templates';
import * as tagsApi from '../api/tags';
import TemplateCard from '../components/templates/TemplateCard';
import TagCloud from '../components/tags/TagCloud';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [popularTemplates, setPopularTemplates] = useState<Template[]>([]);
  const [recentTemplates, setRecentTemplates] = useState<Template[]>([]);
  const [tagCloud, setTagCloud] = useState<TagCloudItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [popular, recent, tags] = await Promise.all([
          templatesApi.getPopularTemplates(5),
          templatesApi.getRecentTemplates(6),
          tagsApi.getTagCloud(),
        ]);
        
        setPopularTemplates(popular);
        setRecentTemplates(recent);
        setTagCloud(tags);
        setError(null);
      } catch (err) {
        console.error('Error fetching home page data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error" align="center">{error}</Typography>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          {t('app.title')}
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {t('templates.recent')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              {recentTemplates.map(template => (
                <Grid item key={template.id} xs={12} sm={6} md={4}>
                  <TemplateCard template={template} />
                </Grid>
              ))}
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {t('templates.popular')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {popularTemplates.map(template => (
                <Grid item key={template.id} xs={12}>
                  <TemplateCard template={template} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {t('tags.cloud')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TagCloud tags={tagCloud} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;