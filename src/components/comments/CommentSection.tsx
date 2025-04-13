import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Avatar, 
  IconButton,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  List,
  ListItem
} from '@mui/material';
import { MoreVert as MoreIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Comment, CommentForCreationDto, CommentForUpdateDto } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import * as commentsApi from '../../api/comments';
import * as signalR from '../../api/signalR';

dayjs.extend(relativeTime);

interface CommentSectionProps {
  templateId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ templateId }) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  
  const commentsEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const data = await commentsApi.getTemplateComments(templateId);
        setComments(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [templateId]);
  
  useEffect(() => {
    let isMounted = true;
    
    const setupSignalR = async () => {
      try {
        const connected = await signalR.startConnection();
        
        if (connected && isMounted) {
          await signalR.joinTemplateGroup(templateId);
          
          signalR.onReceiveComment((comment: Comment) => {
            if (isMounted) {
              setComments(prevComments => [...prevComments, comment]);
              scrollToBottom();
            }
          });
          
          signalR.onUpdateComment((comment: Comment) => {
            if (isMounted) {
              setComments(prevComments => 
                prevComments.map(c => c.id === comment.id ? comment : c)
              );
            }
          });
          
          signalR.onDeleteComment((commentId: string) => {
            if (isMounted) {
              setComments(prevComments => 
                prevComments.filter(c => c.id !== commentId)
              );
            }
          });
        }
      } catch (err) {
        console.error('Error setting up SignalR:', err);
      }
    };
    
    setupSignalR();
    
    return () => {
      isMounted = false;
      
      if (templateId) {
        signalR.leaveTemplateGroup(templateId).catch(err => {
          console.error('Error leaving template group in CommentSection:', err);
        });
      }
      
      signalR.removeAllListeners();
    };
  }, [templateId]);
  
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCommentId(null);
  };
  
  const handleEditComment = () => {
    if (!selectedCommentId) return;
    
    const comment = comments.find(c => c.id === selectedCommentId);
    if (comment) {
      setEditingComment(selectedCommentId);
      setEditedContent(comment.content);
    }
    
    handleMenuClose();
  };
  
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditedContent('');
  };
  
  const handleSaveEdit = async () => {
    if (!editingComment || !editedContent.trim()) return;
    
    try {
      const updateDto: CommentForUpdateDto = { content: editedContent };
      await commentsApi.updateComment(templateId, editingComment, updateDto);
      
      setEditingComment(null);
      setEditedContent('');
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment');
    }
  };
  
  const handleDeleteComment = async () => {
    if (!selectedCommentId) return;
    
    try {
      await commentsApi.deleteComment(templateId, selectedCommentId);
      
      handleMenuClose();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };
  
  const handleAddComment = async () => {
    if (!newComment.trim() || !authState.isAuthenticated) return;
    
    try {
      const commentDto: CommentForCreationDto = { content: newComment };
      await commentsApi.addComment(templateId, commentDto);
      
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    }
  };
  
  const canModifyComment = (comment: Comment) => {
    if (!authState.isAuthenticated || !authState.user) return false;
    
    return comment.user.id === authState.user.id || authState.roles.includes('Admin');
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box my={4}>
        <Typography color="error" align="center">{error}</Typography>
      </Box>
    );
  }
  
  return (
    <Box my={4}>
      <Typography variant="h5" gutterBottom>
        {t('templates.comments')} ({comments.length})
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <List>
        {comments.map(comment => (
          <ListItem key={comment.id} alignItems="flex-start" component={Paper} elevation={1} sx={{ mb: 2, p: 2 }}>
            <Box display="flex" width="100%">
              <Avatar sx={{ mr: 2 }}>{comment.user.name.charAt(0)}</Avatar>
              
              <Box flexGrow={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">{comment.user.name}</Typography>
                  
                  <Box display="flex" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(comment.createdAt).fromNow()}
                    </Typography>
                    
                    {canModifyComment(comment) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, comment.id)}
                        >
                          <MoreIcon />
                        </IconButton>
                        
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedCommentId === comment.id}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={handleEditComment}>{t('common.edit')}</MenuItem>
                          <MenuItem onClick={handleDeleteComment}>{t('common.delete')}</MenuItem>
                        </Menu>
                      </>
                    )}
                  </Box>
                </Box>
                
                {editingComment === comment.id ? (
                  <Box mt={1}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                    <Box display="flex" justifyContent="flex-end" mt={1}>
                      <Button 
                        variant="text" 
                        onClick={handleCancelEdit}
                        sx={{ mr: 1 }}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button 
                        variant="contained" 
                        onClick={handleSaveEdit}
                        disabled={!editedContent.trim()}
                      >
                        {t('common.save')}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {comment.content}
                  </Typography>
                )}
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>
      
      <div ref={commentsEndRef} />
      
      {authState.isAuthenticated ? (
        <Box mt={3}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={t('comments.placeholder')}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            variant="outlined"
          />
          <Box display="flex" justifyContent="flex-end" mt={1}>
            <Button 
              variant="contained" 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              {t('comments.add')}
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center" mt={2}>
          {t('auth.login')} {t('auth.or')} {t('auth.register')} {t('comments.toLeaveComment')}
        </Typography>
      )}
    </Box>
  );
};

export default CommentSection;