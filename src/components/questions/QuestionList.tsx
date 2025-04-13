import React, { useState } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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

  const questionCounts = questions.reduce(
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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      orderIndex: index
    }));

    onReorderQuestions(updatedItems.map(item => item.id));
  };

  const getEditingQuestion = () => {
    return questions.find(q => q.id === editingQuestionId) || null;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">
          {t('questions.title')} ({questions.length})
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
          initialOrderIndex={questions.length}
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

      {questions.length === 0 && !showAddForm ? (
        <Typography color="text.secondary" align="center" py={4}>
          {t('questions.empty')}
        </Typography>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {questions
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((question, index) => (
                    <Draggable
                      key={question.id}
                      draggableId={question.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
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
                  ))}
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