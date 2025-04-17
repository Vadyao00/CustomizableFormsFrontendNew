import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
// Import from hello-pangea/dnd instead of react-beautiful-dnd
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next';
import { Question, QuestionType, QuestionForCreationDto, QuestionForUpdateDto } from '../../types';
import QuestionItem from './QuestionItem';
import QuestionForm from './QuestionForm';
import QuestionEditForm from './QuestionEditForm';

interface QuestionListProps {
  questions: Question[];
  templateId: string;
  onAddQuestion: (question: QuestionForCreationDto) => Promise<void>;
  onUpdateQuestion: (questionId: string, question: QuestionForUpdateDto) => Promise<void>;
  onDeleteQuestion: (questionId: string) => Promise<void>;
  onReorderQuestions: (questionIds: string[]) => Promise<void>;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  templateId,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onReorderQuestions
}) => {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [localQuestions, setLocalQuestions] = useState<Question[]>([]);
  
  // Track if drag operation is in progress to prevent state conflicts
  const isDragging = useRef(false);
  
  // Update local questions when prop changes, but only if not mid-drag
  useEffect(() => {
    if (!isDragging.current) {
      setLocalQuestions(questions);
    }
  }, [questions]);

  const questionCounts = localQuestions.reduce(
    (acc, question) => {
      acc[question.type]++;
      return acc;
    },
    {
      [QuestionType.SingleLineString]: 0,
      [QuestionType.MultiLineText]: 0,
      [QuestionType.Integer]: 0,
      [QuestionType.Checkbox]: 0
    }
  );

  const handleAddQuestion = async (question: QuestionForCreationDto) => {
    await onAddQuestion(question);
    setShowAddForm(false);
  };

  const handleUpdateQuestion = async (questionId: string, question: QuestionForUpdateDto) => {
    await onUpdateQuestion(questionId, question);
    setEditingQuestionId(null);
  };

  // Start tracking drag operation
  const handleDragStart = () => {
    isDragging.current = true;
  };

  // Optimized drag end handler
  const handleDragEnd = (result: any) => {
    // Set dragging to false when operation completes
    isDragging.current = false;
    
    // Return early if no valid destination
    if (!result.destination) return;
    
    // Return early if dropped in the same position
    if (result.destination.index === result.source.index) return;
    
    // Create new array with updated order
    const reorderedQuestions = Array.from(localQuestions);
    const [movedItem] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, movedItem);
    
    // Update orderIndex values to match new positions
    const updatedQuestions = reorderedQuestions.map((question, index) => ({
      ...question,
      orderIndex: index
    }));
    
    // Update local state first for immediate UI feedback
    setLocalQuestions(updatedQuestions);
    
    // Then notify parent component
    const questionIds = updatedQuestions.map(q => q.id);
    onReorderQuestions(questionIds);
  };

  const getEditingQuestion = () => {
    return localQuestions.find(q => q.id === editingQuestionId) || null;
  };

  // Ensure consistent string IDs
  const getStableId = (id: any): string => {
    return String(id).trim();
  };

  // Sort questions by orderIndex for display
  const sortedQuestions = [...localQuestions].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">
          {t('questions.title')} ({localQuestions.length})
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          {t('questions.add')}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {showAddForm && (
        <QuestionForm
          onSubmit={handleAddQuestion}
          onCancel={() => setShowAddForm(false)}
          initialOrderIndex={localQuestions.length}
          questionCounts={questionCounts}
        />
      )}

      {editingQuestionId && (
        <QuestionEditForm
          question={getEditingQuestion()!}
          onSubmit={(question) => handleUpdateQuestion(editingQuestionId, question)}
          onCancel={() => setEditingQuestionId(null)}
        />
      )}

      {localQuestions.length === 0 && !showAddForm ? (
        <Typography color="text.secondary" align="center" py={4}>
          {t('questions.empty')}
        </Typography>
      ) : (
        <DragDropContext 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Droppable droppableId="questions-list" type="QUESTION">
            {(provided) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ minHeight: '50px', position: 'relative' }}
              >
                {sortedQuestions.map((question, index) => {
                  const stableId = getStableId(question.id);
                  return (
                    <Draggable
                      key={stableId}
                      draggableId={stableId}
                      index={index}
                      isDragDisabled={!!editingQuestionId}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            marginBottom: '8px'
                          }}
                        >
                          <QuestionItem
                            question={question}
                            onEdit={setEditingQuestionId}
                            onDelete={onDeleteQuestion}
                            isDraggable
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Box>
  );
};

export default QuestionList;