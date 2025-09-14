import React, { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ---------- Types ----------
export interface Question {
  id: string;
  type: string;
  content: any;
}

export interface QuestionGroup {
  id: string;
  type: string;
  instruction: string;
  logic?: string;
  questions: Question[];
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  groups: QuestionGroup[];
}

// ---------- Utilities ----------
const uid = (prefix = '') => `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const LS_KEY = 'paper_generator_v2';

// ---------- Small UI primitives (Modal & Toast) ----------
const Modal: React.FC<{ open: boolean; onClose: () => void; title?: string } & React.PropsWithChildren<{}>> = ({
  open,
  onClose,
  title,
  children,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700">Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const Confirm = ({ open, onConfirm, onCancel, message }: any) => (
  <Modal open={open} onClose={onCancel} title="Confirm">
    <p className="text-gray-700 mb-4">{message}</p>
    <div className="flex justify-end space-x-3">
      <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
      <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white">Delete</button>
    </div>
  </Modal>
);

// ---------- Inline Edit Component ----------
const InlineEdit: React.FC<{
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  placeholder?: string;
}> = ({ value, onSave, className = '', placeholder = 'Click to edit' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-white border border-blue-300 rounded px-2 py-1 ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-blue-50 rounded px-2 py-1 ${className}`}
      title="Click to edit"
    >
      {value || placeholder}
    </span>
  );
};

// ---------- Question Display Component ----------
const QuestionDisplay: React.FC<{
  question: Question;
  questionNumber: number;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ question, questionNumber, onEdit, onDelete }) => {
  const { content, type } = question;

  const renderQuestion = () => {
    switch (type) {
      case 'mcq':
        return (
          <div className="space-y-2">
            <div className="font-medium text-gray-900">
              {questionNumber}. {content.questionText}
            </div>
            <div className="ml-6 space-y-1">
              {content.choices?.map((choice: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="font-medium">({String.fromCharCode(97 + index)})</span>
                  <span>{choice}</span>
                  {content.correctAnswer === index && <span className="text-green-600 text-sm">[Correct]</span>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-2">
            <div className="font-medium text-gray-900">
              {questionNumber}. {content.questionText}
            </div>
            <div className="ml-6 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">(a)</span>
                <span>True</span>
                {content.correctAnswer === 0 && <span className="text-green-600 text-sm">[Correct]</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">(b)</span>
                <span>False</span>
                {content.correctAnswer === 1 && <span className="text-green-600 text-sm">[Correct]</span>}
              </div>
            </div>
          </div>
        );

      case 'fill-in-the-blanks':
        return (
          <div className="font-medium text-gray-900">
            {questionNumber}. {content.questionText}
          </div>
        );

      case 'short-question':
      case 'long-question':
        return (
          <div className="space-y-2">
            {content.questionText && (
              <div className="font-medium text-gray-900">
                {questionNumber}. {content.questionText}
              </div>
            )}
            {content.subQuestions && content.subQuestions.length > 0 && (
              <div className="ml-6 space-y-1">
                {content.subQuestions.map((sub: string, index: number) => (
                  <div key={index} className="text-gray-800">
                    ({String.fromCharCode(97 + index)}) {sub}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'conditional':
        return (
          <div className="space-y-2">
            <div className="font-medium text-gray-900">
              {questionNumber}. Choose any {question.content.logic?.toLowerCase() === 'and' ? 'all' : 'one'} of the following:
            </div>
            <div className="ml-6 space-y-1">
              {content.conditionalQuestions?.map((cq: string, index: number) => (
                <div key={index} className="text-gray-800">
                  ({String.fromCharCode(97 + index)}) {cq}
                </div>
              ))}
            </div>
          </div>
        );

      case 'para-question':
        return (
          <div className="space-y-4">
            <div className="font-medium text-gray-900">
              {questionNumber}. Read the following passage and answer the questions:
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-800 leading-relaxed">{content.paraText}</p>
            </div>
            <div className="ml-6 space-y-2">
              {content.paraQuestions?.map((pq: string, index: number) => (
                <div key={index} className="text-gray-800">
                  ({String.fromCharCode(97 + index)}) {pq}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="font-medium text-gray-900">
            {questionNumber}. {content.questionText || 'Question content'}
          </div>
        );
    }
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="px-2 py-1 text-xs rounded bg-blue-100 hover:bg-blue-200 text-blue-700"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 text-xs rounded bg-red-100 hover:bg-red-200 text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
      {renderQuestion()}
    </div>
  );
};

// ---------- Sortable Section component ----------
const SortableSection: React.FC<{
  section: Section;
  index: number;
  onEdit: (s: Section) => void;
  onDelete: (id: string) => void;
  onAddGroup: (sectionId: string) => void;
  onEditGroup: (sectionId: string, group: QuestionGroup) => void;
  onDeleteGroup: (sectionId: string, groupId: string) => void;
  onDuplicateSection: (sectionId: string) => void;
  onEditQuestion: (sectionId: string, groupId: string, question: Question) => void;
  onDeleteQuestion: (sectionId: string, groupId: string, questionId: string) => void;
  onAddQuestion: (sectionId: string, groupId: string, type: string) => void;
  onUpdateSectionTitle: (sectionId: string, newTitle: string) => void;
}> = ({ 
  section, 
  index, 
  onEdit, 
  onDelete, 
  onAddGroup, 
  onEditGroup, 
  onDeleteGroup, 
  onDuplicateSection,
  onEditQuestion,
  onDeleteQuestion,
  onAddQuestion,
  onUpdateSectionTitle
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

  let questionCounter = 0;

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-lg border border-gray-300 shadow-sm mb-6">
      {/* Section Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex justify-between items-start gap-3">
          <div {...attributes} {...listeners} className="flex items-center gap-3 cursor-grab flex-1">
            <div className="text-lg font-bold text-blue-600">{index + 1}.</div>
            <div className="flex-1">
              <div className="text-center">
                <InlineEdit
                  value={section.title}
                  onSave={(newTitle) => onUpdateSectionTitle(section.id, newTitle)}
                  className="text-xl font-bold text-gray-900 text-center"
                  placeholder="Section Title"
                />
              </div>
              {section.instruction && (
                <p className="text-gray-600 text-sm text-center mt-1">{section.instruction}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => onDuplicateSection(section.id)} className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-sm">
              Duplicate
            </button>
            <button onClick={() => onEdit(section)} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm">
              Edit
            </button>
            <button onClick={() => onAddGroup(section.id)} className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm">
              Add Group
            </button>
            <button onClick={() => onDelete(section.id)} className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="p-4">
        {section.groups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No question groups yet.</p>
            <button 
              onClick={() => onAddGroup(section.id)}
              className="mt-2 px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
            >
              Add Your First Group
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {section.groups.map((group, groupIndex) => (
              <div key={group.id} className="border border-gray-200 rounded-lg bg-gray-50">
                {/* Group Header */}
                <div className="bg-gray-100 px-4 py-3 rounded-t-lg border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <InlineEdit
                        value={getGroupTitle(group.type)}
                        onSave={(newTitle) => {
                          // This could be extended to allow custom group titles
                          console.log('Group title edit:', newTitle);
                        }}
                        className="text-lg font-semibold text-gray-800"
                        placeholder="Group Title"
                      />
                      {group.instruction && (
                        <p className="text-gray-600 text-sm mt-1">{group.instruction}</p>
                      )}
                      {group.logic && (
                        <p className="text-blue-600 text-xs mt-1">Logic: {group.logic}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditGroup(section.id, group)}
                        className="px-3 py-1 text-sm rounded bg-blue-100 hover:bg-blue-200 text-blue-700"
                      >
                        Edit Group
                      </button>
                      <button
                        onClick={() => onAddQuestion(section.id, group.id, group.type)}
                        className="px-3 py-1 text-sm rounded bg-green-100 hover:bg-green-200 text-green-700"
                      >
                        Add Question
                      </button>
                      <button
                        onClick={() => onDeleteGroup(section.id, group.id)}
                        className="px-3 py-1 text-sm rounded bg-red-100 hover:bg-red-200 text-red-700"
                      >
                        Delete Group
                      </button>
                    </div>
                  </div>
                </div>

                {/* Group Questions */}
                <div className="p-4">
                  {group.questions.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>No questions in this group yet.</p>
                      <button 
                        onClick={() => onAddQuestion(section.id, group.id, group.type)}
                        className="mt-2 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        Add Question
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {group.questions.map((question) => {
                        questionCounter++;
                        return (
                          <QuestionDisplay
                            key={question.id}
                            question={question}
                            questionNumber={questionCounter}
                            onEdit={() => onEditQuestion(section.id, group.id, question)}
                            onDelete={() => onDeleteQuestion(section.id, group.id, question.id)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Helper UI for titles ----------
const getGroupTitle = (type: string) => {
  const titles: Record<string, string> = {
    mcq: 'Multiple Choice Questions',
    'true-false': 'True / False Questions',
    'fill-in-the-blanks': 'Fill in the Blanks',
    'short-question': 'Short Questions',
    'long-question': 'Long Questions',
    conditional: 'Conditional Questions',
    'para-question': 'Paragraph Questions',
  };
  return titles[type] || 'Question Group';
};

// ---------- Forms (Section / Group / Question) ----------
const SectionForm: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, instruction: string, editingId?: string) => void;
  editing?: Section | null;
}> = ({ open, onClose, onSubmit, editing }) => {
  const [title, setTitle] = useState(editing?.title || '');
  const [instruction, setInstruction] = useState(editing?.instruction || '');

  useEffect(() => {
    setTitle(editing?.title || '');
    setInstruction(editing?.instruction || '');
  }, [editing]);

  const handle = (e: any) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim(), instruction.trim(), editing?.id);
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Section' : 'Create New Section'}>
      <form onSubmit={handle} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Instructions (optional)</label>
          <textarea 
            value={instruction} 
            onChange={(e) => setInstruction(e.target.value)} 
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
            rows={2} 
          />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">
            {editing ? 'Save' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const GroupForm: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (type: string, instruction: string, logic?: string, editingId?: string) => void;
  sectionTitle?: string;
  editing?: QuestionGroup | null;
}> = ({ open, onClose, onSubmit, sectionTitle, editing }) => {
  const [type, setType] = useState(editing?.type || 'mcq');
  const [instruction, setInstruction] = useState(editing?.instruction || '');
  const [logic, setLogic] = useState(editing?.logic || 'OR');

  useEffect(() => {
    setType(editing?.type || 'mcq');
    setInstruction(editing?.instruction || '');
    setLogic(editing?.logic || 'OR');
  }, [editing]);

  const handle = (e: any) => {
    e.preventDefault();
    onSubmit(type, instruction.trim(), type === 'conditional' ? logic : undefined, editing?.id);
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Group' : `Add Group to ${sectionTitle || ''}`}>
      <form onSubmit={handle} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Question Type</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)} 
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="mcq">Multiple Choice Questions</option>
            <option value="true-false">True/False Questions</option>
            <option value="fill-in-the-blanks">Fill in the Blanks</option>
            <option value="short-question">Short Questions</option>
            <option value="long-question">Long Questions</option>
            <option value="conditional">Conditional Questions</option>
            <option value="para-question">Paragraph Questions</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Instructions (optional)</label>
          <textarea 
            value={instruction} 
            onChange={(e) => setInstruction(e.target.value)} 
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
            rows={2} 
          />
        </div>
        {type === 'conditional' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Logic</label>
            <select 
              value={logic} 
              onChange={(e) => setLogic(e.target.value)} 
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="OR">OR (answer any one)</option>
              <option value="AND">AND (answer all)</option>
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white">
            {editing ? 'Save Group' : 'Add Group'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const QuestionForm: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (question: Question, editingId?: string) => void;
  type: string;
  editing?: Question | null;
}> = ({ open, onClose, onSubmit, type, editing }) => {
  const [questionText, setQuestionText] = useState(editing?.content?.questionText || '');
  const [choices, setChoices] = useState<string[]>(editing?.content?.choices || ['', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number>(editing?.content?.correctAnswer ?? 0);
  const [subQuestions, setSubQuestions] = useState<string[]>(editing?.content?.subQuestions || ['']);
  const [paraText, setParaText] = useState(editing?.content?.paraText || '');
  const [paraQuestions, setParaQuestions] = useState<string[]>(editing?.content?.paraQuestions || ['']);
  const [conditionalQuestions, setConditionalQuestions] = useState<string[]>(editing?.content?.conditionalQuestions || ['']);

  useEffect(() => {
    setQuestionText(editing?.content?.questionText || '');
    setChoices(editing?.content?.choices || ['', '']);
    setCorrectAnswer(editing?.content?.correctAnswer ?? 0);
    setSubQuestions(editing?.content?.subQuestions || ['']);
    setParaText(editing?.content?.paraText || '');
    setParaQuestions(editing?.content?.paraQuestions || ['']);
    setConditionalQuestions(editing?.content?.conditionalQuestions || ['']);
  }, [editing]);

  const reset = () => {
    setQuestionText('');
    setChoices(['', '']);
    setCorrectAnswer(0);
    setSubQuestions(['']);
    setParaText('');
    setParaQuestions(['']);
    setConditionalQuestions(['']);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const content: any = {};
    if (type !== 'para-question' && type !== 'conditional') content.questionText = questionText;
    if (type === 'mcq') {
      content.choices = choices;
      content.correctAnswer = correctAnswer;
    } else if (type === 'true-false') {
      content.choices = ['True', 'False'];
      content.correctAnswer = correctAnswer;
    } else if (type === 'short-question' || type === 'long-question') {
      content.subQuestions = subQuestions.filter(Boolean);
    } else if (type === 'conditional') {
      content.conditionalQuestions = conditionalQuestions.filter(Boolean);
    } else if (type === 'para-question') {
      content.paraText = paraText;
      content.paraQuestions = paraQuestions.filter(Boolean);
    }

    const q: Question = { id: editing?.id || uid('q-'), type, content };
    onSubmit(q, editing?.id);
    reset();
  };

  // choice helpers
  const updateChoice = (i: number, v: string) => setChoices((s) => s.map((c, idx) => (idx === i ? v : c)));
  const addChoice = () => setChoices((s) => [...s, '']);
  const removeChoice = (i: number) => setChoices((s) => s.filter((_, idx) => idx !== i));

  // sub question helpers
  const updateSub = (i: number, v: string) => setSubQuestions((s) => s.map((x, idx) => (idx === i ? v : x)));
  const addSub = () => setSubQuestions((s) => [...s, '']);
  const removeSub = (i: number) => setSubQuestions((s) => s.filter((_, idx) => idx !== i));

  // paragraph helpers
  const updateParaQ = (i: number, v: string) => setParaQuestions((s) => s.map((x, idx) => (idx === i ? v : x)));
  const addParaQ = () => setParaQuestions((s) => [...s, '']);
  const removeParaQ = (i: number) => setParaQuestions((s) => s.filter((_, idx) => idx !== i));

  // conditional helpers
  const updateCond = (i: number, v: string) => setConditionalQuestions((s) => s.map((x, idx) => (idx === i ? v : x)));
  const addCond = () => setConditionalQuestions((s) => [...s, '']);
  const removeCond = (i: number) => setConditionalQuestions((s) => s.filter((_, idx) => idx !== i));

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Question' : 'Add Question'}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-auto pr-2">
        {(type === 'mcq' || type === 'true-false' || type === 'fill-in-the-blanks' || type === 'short-question' || type === 'long-question') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Question Text</label>
            <textarea 
              value={questionText} 
              onChange={(e) => setQuestionText(e.target.value)} 
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
              rows={2} 
              required={type !== 'short-question' && type !== 'long-question'} 
            />
          </div>
        )}

        {type === 'mcq' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Choices</label>
            <div className="space-y-2 mt-2">
              {choices.map((c, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    value={c} 
                    onChange={(e) => updateChoice(i, e.target.value)} 
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    placeholder={`Choice ${String.fromCharCode(65 + i)}`} 
                    required 
                  />
                  <label className="flex items-center gap-1 text-sm">
                    <input type="radio" checked={correctAnswer === i} onChange={() => setCorrectAnswer(i)} /> Correct
                  </label>
                  {choices.length > 2 && (
                    <button type="button" onClick={() => removeChoice(i)} className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addChoice} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white">+ Add Choice</button>
            </div>
          </div>
        )}

        {type === 'true-false' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input type="radio" checked={correctAnswer === 0} onChange={() => setCorrectAnswer(0)} /> True
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={correctAnswer === 1} onChange={() => setCorrectAnswer(1)} /> False
              </label>
            </div>
          </div>
        )}

        {(type === 'short-question' || type === 'long-question') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Sub Questions (optional)</label>
            <div className="space-y-2 mt-2">
              {subQuestions.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input 
                    value={s} 
                    onChange={(e) => updateSub(i, e.target.value)} 
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    placeholder={`Sub-question ${i + 1}`} 
                  />
                  {subQuestions.length > 1 && (
                    <button type="button" onClick={() => removeSub(i)} className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addSub} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white">+ Add Sub-question</button>
            </div>
          </div>
        )}

        {type === 'conditional' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Conditional Questions</label>
            <div className="space-y-2 mt-2">
              {conditionalQuestions.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <input 
                    value={c} 
                    onChange={(e) => updateCond(i, e.target.value)} 
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    placeholder={`Conditional question ${i + 1}`} 
                  />
                  {conditionalQuestions.length > 1 && (
                    <button type="button" onClick={() => removeCond(i)} className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addCond} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white">+ Add Conditional Question</button>
            </div>
          </div>
        )}

        {type === 'para-question' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Paragraph Text</label>
              <textarea 
                value={paraText} 
                onChange={(e) => setParaText(e.target.value)} 
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                rows={4} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Questions based on the paragraph</label>
              <div className="space-y-2 mt-2">
                {paraQuestions.map((pq, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      value={pq} 
                      onChange={(e) => updateParaQ(i, e.target.value)} 
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                      placeholder={`Question ${i + 1}`} 
                    />
                    {paraQuestions.length > 1 && (
                      <button type="button" onClick={() => removeParaQ(i)} className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white">Remove</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addParaQ} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white">+ Add Question</button>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white">
            {editing ? 'Save Question' : 'Add Question'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ---------- Main Component ----------
const PaperGeneratorAdvanced: React.FC = () => {
  const [sections, setSections] = useState<Section[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // UI states
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [currentSectionIdForGroup, setCurrentSectionIdForGroup] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<QuestionGroup | null>(null);

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [currentTypeForQuestion, setCurrentTypeForQuestion] = useState<string>('mcq');
  const [currentSectionIdForQuestion, setCurrentSectionIdForQuestion] = useState<string | null>(null);
  const [currentGroupIdForQuestion, setCurrentGroupIdForQuestion] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState<any>(null);

  const [search, setSearch] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);

  // drag-n-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  // persist
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(sections));
  }, [sections]);

  // ---------- CRUD operations: Section ----------
  const handleAddOrEditSection = (title: string, instruction: string, editingId?: string) => {
    if (editingId) {
      setSections((s) => s.map((sec) => (sec.id === editingId ? { ...sec, title, instruction } : sec)));
      setEditingSection(null);
      setSectionModalOpen(false);
      return;
    }
    const newSec: Section = { id: uid('sec-'), title, instruction, groups: [] };
    setSections((s) => [...s, newSec]);
    setSectionModalOpen(false);
  };

  const handleUpdateSectionTitle = (sectionId: string, newTitle: string) => {
    setSections((s) => s.map((sec) => (sec.id === sectionId ? { ...sec, title: newTitle } : sec)));
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections((s) => s.filter((sec) => sec.id !== sectionId));
  };

  const handleDuplicateSection = (sectionId: string) => {
    const sec = sections.find((x) => x.id === sectionId);
    if (!sec) return;
    const clone: Section = { 
      ...sec, 
      id: uid('sec-'), 
      title: sec.title + ' (copy)', 
      groups: sec.groups.map((g) => ({ 
        ...g, 
        id: uid('g-'), 
        questions: g.questions.map((q) => ({ ...q, id: uid('q-') })) 
      })) 
    };
    setSections((s) => [...s, clone]);
  };

  // ---------- CRUD operations: Group ----------
  const startAddGroup = (sectionId: string) => {
    setCurrentSectionIdForGroup(sectionId);
    setEditingGroup(null);
    setGroupModalOpen(true);
  };

  const handleAddOrEditGroup = (type: string, instruction: string, logic?: string, editingId?: string) => {
    if (!currentSectionIdForGroup) return;
    setSections((s) =>
      s.map((sec) => {
        if (sec.id !== currentSectionIdForGroup) return sec;
        if (editingId) {
          return { ...sec, groups: sec.groups.map((g) => (g.id === editingId ? { ...g, type, instruction, logic } : g)) };
        }
        const newGroup: QuestionGroup = { id: uid('g-'), type, instruction, logic, questions: [] };
        return { ...sec, groups: [...sec.groups, newGroup] };
      })
    );
    setGroupModalOpen(false);
    setEditingGroup(null);
    setCurrentSectionIdForGroup(null);
  };

  const handleDeleteGroup = (sectionId: string, groupId: string) => {
    setSections((s) => s.map((sec) => (sec.id === sectionId ? { ...sec, groups: sec.groups.filter((g) => g.id !== groupId) } : sec)));
  };

  // ---------- CRUD operations: Question ----------
  const startAddQuestion = (sectionId: string, groupId: string, type?: string) => {
    setCurrentSectionIdForQuestion(sectionId);
    setCurrentGroupIdForQuestion(groupId);
    setCurrentTypeForQuestion(type || 'mcq');
    setEditingQuestion(null);
    setQuestionModalOpen(true);
  };

  const handleAddOrEditQuestion = (question: Question, editingId?: string) => {
    if (!currentSectionIdForQuestion || !currentGroupIdForQuestion) return;
    setSections((s) =>
      s.map((sec) => {
        if (sec.id !== currentSectionIdForQuestion) return sec;
        return {
          ...sec,
          groups: sec.groups.map((g) => {
            if (g.id !== currentGroupIdForQuestion) return g;
            if (editingId) {
              return { ...g, questions: g.questions.map((q) => (q.id === editingId ? question : q)) };
            }
            return { ...g, questions: [...g.questions, question] };
          }),
        };
      })
    );
    setQuestionModalOpen(false);
    setEditingQuestion(null);
    setCurrentSectionIdForQuestion(null);
    setCurrentGroupIdForQuestion(null);
  };

  const handleDeleteQuestion = (sectionId: string, groupId: string, questionId: string) => {
    setSections((s) =>
      s.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return { ...sec, groups: sec.groups.map((g) => (g.id === groupId ? { ...g, questions: g.questions.filter((q) => q.id !== questionId) } : g)) };
      })
    );
  };

  // ---------- Edit helpers (open modals with data) ----------
  const openEditSection = (sec: Section) => {
    setEditingSection(sec);
    setSectionModalOpen(true);
  };

  const openEditGroup = (sectionId: string, group: QuestionGroup) => {
    setCurrentSectionIdForGroup(sectionId);
    setEditingGroup(group);
    setGroupModalOpen(true);
  };

  const openEditQuestion = (sectionId: string, groupId: string, question: Question) => {
    setCurrentSectionIdForQuestion(sectionId);
    setCurrentGroupIdForQuestion(groupId);
    setCurrentTypeForQuestion(question.type);
    setEditingQuestion(question);
    setQuestionModalOpen(true);
  };

  // ---------- Confirm wrapper ----------
  const askConfirm = (payload: any) => {
    setConfirmPayload(payload);
    setConfirmOpen(true);
  };
  
  const runConfirmed = () => {
    if (!confirmPayload) return;
    const { type, payload } = confirmPayload;
    if (type === 'delete-section') handleDeleteSection(payload.sectionId);
    if (type === 'delete-group') handleDeleteGroup(payload.sectionId, payload.groupId);
    if (type === 'delete-question') handleDeleteQuestion(payload.sectionId, payload.groupId, payload.questionId);
    setConfirmOpen(false);
    setConfirmPayload(null);
  };

  // ---------- DnD for sections only ----------
  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // ---------- Export / Import ----------
  const exportJson = () => {
    const data = JSON.stringify(sections, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paper.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target?.result));
        if (Array.isArray(parsed)) {
          setSections(parsed);
        } else {
          alert('Invalid format');
        }
      } catch (err) {
        alert('Failed to parse JSON');
      }
    };
    reader.readAsText(file);
  };

  // ---------- Search helper ----------
  const filteredSections = sections
    .map((sec) => ({ 
      ...sec, 
      groups: sec.groups.filter((g) => 
        g.type.includes(search) || 
        g.instruction?.toLowerCase().includes(search.toLowerCase()) || 
        search === ''
      ) 
    }))
    .filter((s) => 
      s.title.toLowerCase().includes(search.toLowerCase()) || 
      s.instruction?.toLowerCase().includes(search.toLowerCase()) || 
      s.groups.length > 0 || 
      search === ''
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">Paper Generator</h1>
              <p className="text-sm text-gray-600 mt-1">Create professional exam papers with ease</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <input 
                placeholder="Search sections/groups..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
              />
              <button 
                onClick={() => { setSectionModalOpen(true); setEditingSection(null); }} 
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                New Section
              </button>
              <button 
                onClick={() => exportJson()} 
                className="px-4 py-2 rounded-md bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Export
              </button>
              <label className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white cursor-pointer">
                Import
                <input 
                  type="file" 
                  accept="application/json" 
                  onChange={(e) => importJson(e.target.files?.[0] ?? null)} 
                  className="hidden" 
                />
              </label>
              <button 
                onClick={() => setShowRawJson((s) => !s)} 
                className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white"
              >
                {showRawJson ? 'Hide JSON' : 'Show JSON'}
              </button>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <section className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Paper Preview</h2>
              </div>
              
              <div className="p-6">
                {sections.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                    <p className="text-gray-600 mb-4">Create your first section to start building your paper</p>
                    <button 
                      onClick={() => { setSectionModalOpen(true); setEditingSection(null); }}
                      className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      Create First Section
                    </button>
                  </div>
                ) : (
                  <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
                    onDragStart={handleDragStart} 
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={sections.map((s) => s.id)}>
                      <div className="space-y-6">
                        {filteredSections.map((sec, i) => (
                          <SortableSection
                            key={sec.id}
                            section={sec}
                            index={i}
                            onEdit={openEditSection}
                            onDelete={(id) => askConfirm({ type: 'delete-section', payload: { sectionId: id } })}
                            onAddGroup={startAddGroup}
                            onEditGroup={openEditGroup}
                            onDeleteGroup={(sectionId, groupId) => askConfirm({ type: 'delete-group', payload: { sectionId, groupId } })}
                            onDuplicateSection={handleDuplicateSection}
                            onEditQuestion={openEditQuestion}
                            onDeleteQuestion={(sectionId, groupId, questionId) => askConfirm({ type: 'delete-question', payload: { sectionId, groupId, questionId } })}
                            onAddQuestion={startAddQuestion}
                            onUpdateSectionTitle={handleUpdateSectionTitle}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => { setSectionModalOpen(true); setEditingSection(null); }} 
                  className="w-full px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  Add Section
                </button>
                <button 
                  onClick={() => { 
                    if (sections.length) { 
                      handleDuplicateSection(sections[0].id); 
                    } 
                  }} 
                  className="w-full px-3 py-2 rounded-md bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                  disabled={sections.length === 0}
                >
                  Duplicate First Section
                </button>
                <button 
                  onClick={() => { 
                    localStorage.removeItem(LS_KEY); 
                    setSections([]); 
                  }} 
                  className="w-full px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Usage Tips</h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Click on section titles to edit them inline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Drag sections to reorder them</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Hover over questions to see edit/delete options</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Use Export/Import to save or share papers</span>
                </li>
              </ul>
            </div>

            {showRawJson && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Raw JSON Data</h3>
                <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-96 text-xs font-mono">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(sections, null, 2)}</pre>
                </div>
              </div>
            )}
          </aside>
        </main>

        {/* Modals & confirmations */}
        <SectionForm 
          open={sectionModalOpen} 
          onClose={() => { setSectionModalOpen(false); setEditingSection(null); }} 
          onSubmit={handleAddOrEditSection} 
          editing={editingSection} 
        />
        
        <GroupForm 
          open={groupModalOpen} 
          onClose={() => { 
            setGroupModalOpen(false); 
            setEditingGroup(null); 
            setCurrentSectionIdForGroup(null); 
          }} 
          onSubmit={handleAddOrEditGroup} 
          sectionTitle={sections.find((s) => s.id === currentSectionIdForGroup)?.title} 
          editing={editingGroup} 
        />
        
        <QuestionForm 
          open={questionModalOpen} 
          onClose={() => { 
            setQuestionModalOpen(false); 
            setEditingQuestion(null); 
            setCurrentSectionIdForQuestion(null); 
            setCurrentGroupIdForQuestion(null); 
          }} 
          onSubmit={handleAddOrEditQuestion} 
          type={currentTypeForQuestion} 
          editing={editingQuestion} 
        />

        <Confirm 
          open={confirmOpen} 
          onConfirm={runConfirmed} 
          onCancel={() => setConfirmOpen(false)} 
          message={
            confirmPayload?.type === 'delete-section'
              ? 'Delete section and all its groups & questions? This cannot be undone.'
              : confirmPayload?.type === 'delete-group'
              ? 'Delete group and its questions? This cannot be undone.'
              : 'Delete this question? This cannot be undone.'
          } 
        />
      </div>
    </div>
  );
};

export default PaperGeneratorAdvanced;