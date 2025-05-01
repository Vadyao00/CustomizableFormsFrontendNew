import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
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
  
  const isDragging = useRef(false);
  
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

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragEnd = (result: any) => {
    isDragging.current = false;
    
    if (!result.destination) return;
    
    if (result.destination.index === result.source.index) return;
    
    const reorderedQuestions = Array.from(localQuestions);
    const [movedItem] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, movedItem);
    
    const updatedQuestions = reorderedQuestions.map((question, index) => ({
      ...question,
      orderIndex: index
    }));
    
    setLocalQuestions(updatedQuestions);
    
    const questionIds = updatedQuestions.map(q => q.id);
    onReorderQuestions(questionIds);
  };

  const getEditingQuestion = () => {
    return localQuestions.find(q => q.id === editingQuestionId) || null;
  };

  const getStableId = (id: any): string => {
    return String(id).trim();
  };

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