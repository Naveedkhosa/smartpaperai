import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiService } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";

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
import { formatNumber, Icon, Section, Question, QuestionGroup, ApiPaper, ApiSectionGroup, ApiSection, ApiQuestionType, ApiQuestion, ApiQuestionOption, uid } from "./utilities";


// ---------- Modal & Confirm Components ----------
const Modal: React.FC<{ open: boolean; onClose: () => void; title?: string } & React.PropsWithChildren<{}>> = ({
    open,
    onClose,
    title,
    children,
}) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl p-6 border border-gray-200 max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                        <Icon.Close />
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

const Confirm = ({ open, onConfirm, onCancel, message }: any) => (
    <Modal open={open} onClose={onCancel} title="Confirm Action">
        <p className="text-gray-700 mb-6 text-center">{message}</p>
        <div className="flex justify-center space-x-4">
            <button onClick={onCancel} className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition-colors">Cancel</button>
            <button onClick={onConfirm} className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors">Delete</button>
        </div>
    </Modal>
);

// ---------- Sortable Section component ----------
const SortableSection: React.FC<{
    section: ApiSection;
    index: number;
    onEdit: (s: ApiSection) => void;
    onDelete: (id: Number) => void;
    onAddGroup: (sectionId: Number) => void;
    onEditGroup: (sectionId: Number, group: ApiSectionGroup) => void;
    onDeleteGroup: (sectionId: Number, groupId: Number) => void;
    onDuplicateSection: (sectionId: Number) => void;
}> = ({ section, index, onEdit, onDelete, onAddGroup, onEditGroup, onDeleteGroup, onDuplicateSection }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
    const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

    return (
        <div ref={setNodeRef} style={style} className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 cursor-grab" {...attributes} {...listeners}>
                        <div className="text-lg font-bold text-blue-600">{index + 1}.</div>
                        <div className="p-1 text-gray-400 hover:text-gray-600">
                            <Icon.Drag />
                        </div>
                    </div>
                    <div className="flex-1 cursor-pointer" onClick={() => onEdit(section)}>
                        <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                        {section.instructions && <p className="text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: section.instructions.replace(/\$([^$]+)\$/g, '<em>$1</em>') }} />}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDuplicateSection(section.id)}
                        className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-colors"
                        title="Duplicate"
                    >
                        <Icon.Duplicate />
                    </button>
                    <button
                        onClick={() => onEdit(section)}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                        title="Edit"
                    >
                        <Icon.Edit />
                    </button>
                    <button
                        onClick={() => onAddGroup(section.id)}
                        className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                        title="Add Group"
                    >
                        <Icon.Add />
                    </button>
                    <button
                        onClick={() => onDelete(section.id)}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                        title="Delete"
                    >
                        <Icon.Delete />
                    </button>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {section.section_groups.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                        No groups yet. Add a question group to this section.
                    </div>
                ) : (
                    section.section_groups.map((g: ApiSectionGroup, gi) => (
                        <div key={g.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-start gap-3 border border-gray-200">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-green-700">{getGroupTitle(g?.question_type?.slug)}</div>
                                {g.instructions && <div className="text-gray-600 text-sm mt-1" dangerouslySetInnerHTML={{ __html: g.instructions.replace(/\$([^$]+)\$/g, '<em>$1</em>') }} />}
                                <div className="text-gray-500 text-xs mt-2">Questions: {g.questions.length}</div>
                                <div className="text-gray-500 text-xs">Numbering: {g.numbering_style}</div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => onEditGroup(section.id, g)} className="p-1.5 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors" title="Edit Group">
                                    <Icon.Edit />
                                </button>
                                <button onClick={() => onDeleteGroup(section.id, g.id)} className="p-1.5 rounded-md bg-red-100 hover:bg-red-200 text-red-700 transition-colors" title="Delete Group">
                                    <Icon.Delete />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ---------- Helper functions ----------
const getGroupTitle = (type: string) => {
    const titles: Record<string, string> = {
        "mcq": 'Multiple Choice Questions',
        'true-false': 'True / False',
        'fill-in-blanks': 'Fill in the Blanks',
        'short-answer': 'Short Questions',
        'long-answer': 'Long Questions',
        "conditional": 'Conditional Questions',
        'paragraph': 'Paragraph Questions',
    };
    return titles[type] || 'Untitled Group';
};


const convertLocalQuestionToApi = (question: Question, groupId: number): any => {
    const baseQuestion = {
        marks: question.marks || 0,
        order: 0
    };

    switch (question.type) {
        case 'mcq':
        case 'true-false':
            return {
                ...baseQuestion,
                question_text: question.content.questionText,
                options: question.content.choices.map((choice: string, index: number) => ({
                    option_text: choice,
                    is_correct: index === question.content.correctAnswer,
                    order: index
                }))
            };

        case 'fill-in-the-blanks':
            return {
                ...baseQuestion,
                question_text: question.content.questionText,
                correct_answer: question.content.correctAnswer?.toString() || ''
            };

        case 'short-question':
        case 'long-question':
            if (question.content.sub_questions && question.content.sub_questions.length > 0) {
                return {
                    ...baseQuestion,
                    question_text: question.content.questionText,
                    marks: 0, // Main question has no marks, sub-questions have marks
                    sub_questions: question.content.sub_questions.map((subQ: string, index: number) => ({
                        question_text: subQ,
                        marks: question.subQuestionMarks?.[index] || 0,
                        sub_order: index
                    }))
                };
            }
            return {
                ...baseQuestion,
                question_text: question.content.questionText
            };

        case 'conditional':
            return {
                ...baseQuestion,
                question_text: "Conditional Questions",
                sub_questions: question.content.sub_questions.map((condQ: string, index: number) => ({
                    question_text: condQ,
                    marks: question.conditionalQuestionMarks?.[index] || 0,
                    sub_order: index
                }))
            };

        case 'para-question':
            return {
                ...baseQuestion,
                paragraph_text: question.content.paraText,
                marks: 0, // Main paragraph has no marks
                sub_questions: question.content.sub_questions.map((paraQ: string, index: number) => ({
                    question_text: paraQ,
                    marks: question.paraQuestionMarks?.[index] || 0,
                    sub_order: index
                }))
            };

        default:
            return {
                ...baseQuestion,
                question_text: question.content.questionText
            };
    }
};

// ---------- Forms ----------
const SectionForm: React.FC<{
    open: boolean;
    onClose: () => void;
    editing?: ApiSection | null;
    handleCreateSection: (data: { title: string; instructions: string; order: number }) => Promise<void>;
    handleUpdateSection: (id: number, data: { title: string; instructions: string, order: number }) => Promise<void>;
}> = ({ open, onClose, editing, handleCreateSection, handleUpdateSection }) => {
    const [title, setTitle] = useState(editing?.title || '');
    const [instruction, setInstruction] = useState(editing?.instructions || '');


    useEffect(() => {
        setTitle(editing?.title || '');
        setInstruction(editing?.instructions || '');
    }, [editing]);



    const handleSectionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const sectionData = {
            title: title.trim(),
            instructions: instruction.trim(),
            order: 0
        };

        if (editing) {
            await handleUpdateSection(editing.id, sectionData);
        } else {
            await handleCreateSection(sectionData);
        }

        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} title={editing ? 'Edit Section' : 'Create New Section'}>
            <form onSubmit={handleSectionSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={title} placeholder="Enter Section Title" onChange={(e) => { setTitle(e.target.value) }} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (optional)</label>
                    <textarea onChange={(e) => { setInstruction(e.target.value) }} className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter Section Instructions..." value={instruction} ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                    >
                        {editing ? 'Save Changes' : 'Add Section'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const GroupForm: React.FC<{
    open: boolean;
    onClose: () => void;
    types: ApiQuestionType[];
    handleAddOrEditGroup: (data: any, editingId?: number) => Promise<void>;
    sectionTitle?: string;
    editing?: ApiSectionGroup | null;
}> = ({ open, onClose, types, handleAddOrEditGroup, sectionTitle, editing }) => {
    const [type, setType] = useState(editing?.question_type_id);
    const [instruction, setInstruction] = useState(editing?.instructions || '');
    const [logic, setLogic] = useState(editing?.logic || 'OR');
    const [numberingStyle, setNumberingStyle] = useState<'numeric' | 'roman' | 'alphabetic'>(editing?.numbering_style || 'numeric');

    useEffect(() => {
        setType(editing?.question_type_id);
        setInstruction(editing?.instructions || '');
        setLogic(editing?.logic || 'OR');
        setNumberingStyle(editing?.numbering_style || 'numeric');
    }, [editing]);



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!type) return;
        handleAddOrEditGroup({
            question_type_id: type,
            instructions: instruction.trim(),
            logic: logic || 'OR',
            numbering_style: numberingStyle,
            order: 0
        }, editing?.id);
    };

    return (
        <Modal open={open} onClose={onClose} title={editing ? 'Edit Group' : `Add Group to ${sectionTitle || ''}`}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(parseInt(e.target.value))}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {types?.map((qtype) => (
                            <option key={qtype?.id} value={qtype?.id}>{qtype?.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Numbering Style</label>
                    <select
                        value={numberingStyle}
                        onChange={(e) => setNumberingStyle(e.target.value as 'numeric' | 'roman' | 'alphabetic')}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="numeric">Numeric (1, 2, 3)</option>
                        <option value="roman">Roman (I, II, III)</option>
                        <option value="alphabetic">Alphabetic (A, B, C)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (optional)</label>
                    <textarea
                    value={instruction}
                        onChange={(e) => { setInstruction(e.target.value) }}
                        className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter group Instructions..."
                    ></textarea>

                </div>


                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors">Cancel</button>
                    <button type="submit" className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">{editing ? 'Save Changes' : 'Add Group'}</button>
                </div>
            </form>
        </Modal>
    );
};


// Local helper type for sub-question form rows
interface SubFormItem {
  id?: number;
  question_text: string;
  correct_answer?: string | null;
  marks: number;
  sub_order: number;
}

const QuestionForm: React.FC<{ 
  open: boolean;
  onClose: () => void;
  onSubmit: (question: ApiQuestion, editingId?: number) => void;
  type: ApiQuestionType;
  editing?: ApiQuestion | null;
}> = ({ open, onClose, onSubmit, type, editing }) => {
  // small id generator for client-only temporary ids (negative to avoid clash with server ids)
  const generateTempId = () => -Date.now() - Math.floor(Math.random() * 1000);

  // Main fields
  const [questionText, setQuestionText] = useState<string>(editing?.question_text ?? '');
  const [paragraphText, setParagraphText] = useState<string>(editing?.paragraph_text ?? '');
  const [marks, setMarks] = useState<number>(editing?.marks ?? 0);
  const [order, setOrder] = useState<number>(editing?.order ?? 0);

  // Options for MCQ / True-False
  const [choices, setChoices] = useState<Array<{ id?: number; option_text: string; is_correct: boolean; order: number }>>(() => {
    if (editing?.options && editing.options.length > 0) {
      return editing.options.map((o) => ({ id: o.id, option_text: o.option_text, is_correct: !!o.is_correct, order: o.order }));
    }
    return [
      { id: undefined, option_text: '', is_correct: false, order: 0 },
      { id: undefined, option_text: '', is_correct: false, order: 1 },
    ];
  });

  // Fill-in-the-blank answer
  const [fillAnswer, setFillAnswer] = useState<string>(editing?.correct_answer ?? '');

  // Sub-questions used by short/long/paragraph/conditional
  const [subQuestions, setSubQuestions] = useState<SubFormItem[]>(() => {
    if (editing?.sub_questions && editing.sub_questions.length > 0) {
      return editing.sub_questions.map((s, idx) => ({
        id: s.id,
        question_text: s.question_text ?? '',
        correct_answer: s.correct_answer ?? null,
        marks: s.marks ?? 0,
        sub_order: s.sub_order ?? idx,
      }));
    }
    return [];
  });

  // whether sub-questions UI is visible for short/long
  const [showSubQuestions, setShowSubQuestions] = useState<boolean>(subQuestions.length > 0);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // sync editing -> form when modal opens or editing changes
  useEffect(() => {
    setQuestionText(editing?.question_text ?? '');
    setParagraphText(editing?.paragraph_text ?? '');
    setMarks(editing?.marks ?? 0);
    setOrder(editing?.order ?? 0);
    setFillAnswer(editing?.correct_answer ?? '');

    if (editing?.options && editing.options.length > 0) {
      setChoices(editing.options.map((o) => ({ id: o.id, option_text: o.option_text, is_correct: !!o.is_correct, order: o.order })));
    } else {
      setChoices([{ id: undefined, option_text: '', is_correct: false, order: 0 }, { id: undefined, option_text: '', is_correct: false, order: 1 }]);
    }

    if (editing?.sub_questions && editing.sub_questions.length > 0) {
      setSubQuestions(editing.sub_questions.map((s, idx) => ({ id: s.id, question_text: s.question_text ?? '', correct_answer: s.correct_answer ?? null, marks: s.marks ?? 0, sub_order: s.sub_order ?? idx })));
      setShowSubQuestions(true);
    } else {
      setSubQuestions([]);
      setShowSubQuestions(false);
    }

    setErrors({});
  }, [editing, open]);

  const reset = () => {
    setQuestionText('');
    setParagraphText('');
    setMarks(0);
    setOrder(0);
    setChoices([{ id: undefined, option_text: '', is_correct: false, order: 0 }, { id: undefined, option_text: '', is_correct: false, order: 1 }]);
    setFillAnswer('');
    setSubQuestions([]);
    setShowSubQuestions(false);
    setErrors({});
  };

  // ---------- Validation ----------
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const slug = type.slug;

    // For mcq/true-false/fill-in-blanks: question_text required
    if ((slug === 'mcq' || slug === 'true-false' || slug === 'fill-in-blanks') && !questionText.trim()) {
      newErrors.question_text = 'Question text is required.';
    }

    // MCQ
    if (slug === 'mcq') {
      if (!choices || choices.length < 2) newErrors.choices = 'At least two choices are required.';
      choices.forEach((c, idx) => {
        if (!c.option_text.trim()) newErrors[`choice-${idx}`] = `Choice ${idx + 1} text is required.`;
      });
      const correctCount = choices.filter((c) => c.is_correct).length;
      if (correctCount !== 1) newErrors.choices_correct = 'Exactly one choice must be marked correct.';
      if (marks <= 0) newErrors.marks = 'Marks must be greater than 0.';
    }

    // True/False
    if (slug === 'true-false') {
      const correctCount = choices.filter((c) => c.is_correct).length;
      if (correctCount !== 1) newErrors.choices_correct = 'Exactly one answer (True/False) must be marked correct.';
      if (marks <= 0) newErrors.marks = 'Marks must be greater than 0.';
    }

    // Fill-in-blanks
    if (slug === 'fill-in-blanks') {
      if (!fillAnswer.trim()) newErrors.correct_answer = 'Correct answer is required for fill in the blanks.';
      if (marks <= 0) newErrors.marks = 'Marks must be greater than 0.';
    }

    // Short/Long answer (sub-questions optional)
    if (slug === 'short-answer' || slug === 'long-answer') {
      if (!showSubQuestions && !questionText.trim()) {
        newErrors.question_text = 'Question text is required when no sub-questions are added.';
      }

      if (showSubQuestions) {
        if (!subQuestions || subQuestions.length === 0) {
          newErrors.sub_questions = 'Add at least one sub-question or disable sub-questions.';
        }
        subQuestions.forEach((s, idx) => {
          if (!s.question_text.trim()) newErrors[`sub-${idx}`] = `Sub-question ${idx + 1} text is required.`;
          if (s.marks <= 0) newErrors[`sub-mark-${idx}`] = `Sub-question ${idx + 1} marks must be greater than 0.`;
        });
      } else {
        if (marks <= 0) newErrors.marks = 'Marks must be greater than 0.';
      }
    }

    // Paragraph (paragraph_text required and sub-questions required)
    if (slug === 'paragraph') {
      if (!paragraphText.trim()) newErrors.paragraph_text = 'Paragraph text is required.';
      if (!subQuestions || subQuestions.length === 0) newErrors.sub_questions = 'At least one paragraph question is required.';
      subQuestions.forEach((s, idx) => {
        if (!s.question_text.trim()) newErrors[`para-${idx}`] = `Paragraph question ${idx + 1} text is required.`;
        if (s.marks <= 0) newErrors[`para-mark-${idx}`] = `Paragraph question ${idx + 1} marks must be greater than 0.`;
      });
    }

    // Conditional: required, min 2
    if (slug === 'conditional') {
      if (!subQuestions || subQuestions.length < 2) newErrors.sub_questions = 'Conditional questions require at least 2 sub-questions.';
      subQuestions.forEach((s, idx) => {
        if (!s.question_text.trim()) newErrors[`cond-${idx}`] = `Conditional question ${idx + 1} text is required.`;
        if (s.marks <= 0) newErrors[`cond-mark-${idx}`] = `Conditional question ${idx + 1} marks must be greater than 0.`;
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- Dynamic handlers ----------
  // Choices
  const updateChoice = (index: number, value: string) => setChoices((prev) => prev.map((c, i) => (i === index ? { ...c, option_text: value } : c)));
  const toggleChoiceCorrect = (index: number) => setChoices((prev) => prev.map((c, i) => ({ ...c, is_correct: i === index })));
  const addChoice = () => setChoices((prev) => [...prev, { id: undefined, option_text: '', is_correct: false, order: prev.length }]);
  const removeChoice = (index: number) => setChoices((prev) => prev.filter((_, i) => i !== index).map((c, idx) => ({ ...c, order: idx })));

  // Sub-questions
  const addSubQuestion = () => setSubQuestions((prev) => [...prev, { id: undefined, question_text: '', correct_answer: null, marks: 0, sub_order: prev.length }]);
  const updateSubQuestionText = (index: number, value: string) => setSubQuestions((prev) => prev.map((s, i) => (i === index ? { ...s, question_text: value } : s)));
  const updateSubQuestionMarks = (index: number, value: number) => setSubQuestions((prev) => prev.map((s, i) => (i === index ? { ...s, marks: value } : s)));
  const removeSubQuestion = (index: number) => setSubQuestions((prev) => prev.filter((_, i) => i !== index).map((s, idx) => ({ ...s, sub_order: idx })));

  // ---------- Submit ----------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const slug = type.slug;

    // Build options payload
    let optionsPayload: ApiQuestionOption[] = [];
    if (slug === 'mcq') {
      optionsPayload = choices.map((c, idx) => ({
        id: c.id ?? generateTempId(),
        paper_question_id: editing?.id ?? generateTempId(),
        option_text: c.option_text,
        is_correct: !!c.is_correct,
        order: idx,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }

    if (slug === 'true-false') {
      const correctIndex = choices.findIndex((c) => c.is_correct);
      optionsPayload = [
        {
          id: choices[0]?.id ?? generateTempId(),
          paper_question_id: editing?.id ?? generateTempId(),
          option_text: 'True',
          is_correct: correctIndex === 0,
          order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: choices[1]?.id ?? generateTempId(),
          paper_question_id: editing?.id ?? generateTempId(),
          option_text: 'False',
          is_correct: correctIndex === 1,
          order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    }

    // Build sub_questions payload (as ApiQuestion array)
    const subQuestionsPayload: ApiQuestion[] = (subQuestions || []).map((s, idx) => ({
      id: s.id ?? generateTempId(),
      section_group_id: editing?.section_group_id ?? 0,
      parent_question_id: editing?.id ?? null,
      question_text: s.question_text ?? null,
      paragraph_text: null,
      correct_answer: s.correct_answer ?? null,
      marks: s.marks ?? 0,
      order: editing?.order ?? 0,
      sub_order: idx,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      options: [],
      sub_questions: [],
    }));

    // Parent marks rule: if parent has sub-questions (short/long/paragraph/conditional) then parent marks must be 0
    let parentMarks = marks;
    if ((slug === 'short-answer' || slug === 'long-answer' || slug === 'paragraph' || slug === 'conditional') && subQuestionsPayload.length > 0) {
      parentMarks = 0;
    }

    // Fill-in-blanks correct answer
    const correctAns = slug === 'fill-in-blanks' ? (fillAnswer || null) : null;

    const payload: ApiQuestion = {
      id: editing?.id ?? generateTempId(),
      section_group_id: editing?.section_group_id ?? 0,
      parent_question_id: editing?.parent_question_id ?? null,
      question_text: (slug === 'paragraph') ? null : (questionText || null),
      paragraph_text: (slug === 'paragraph') ? (paragraphText || null) : null,
      correct_answer: correctAns,
      marks: parentMarks,
      order: order ?? 0,
      sub_order: editing?.sub_order ?? 0,
      created_at: editing?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
      options: optionsPayload,
      sub_questions: subQuestionsPayload,
    };

    onSubmit(payload, editing?.id ?? undefined);
    reset();
    onClose();
  };

  // ---------- Render ----------
  return (
    <Modal open={open} onClose={() => { onClose(); reset(); }} title={editing ? 'Edit Question' : 'Add Question'}>
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-auto pr-2">
        {/* Question text (most types) */}
        {(type.slug === 'mcq' || type.slug === 'true-false' || type.slug === 'fill-in-blanks' || type.slug === 'short-answer' || type.slug === 'long-answer') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter question text..."
            />
            {errors.question_text && <p className="text-red-500 text-sm mt-1">{errors.question_text}</p>}
          </div>
        )}

        {/* Marks for simple types */}
        {(type.slug === 'mcq' || type.slug === 'true-false' || type.slug === 'fill-in-blanks') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
            <input type="number" min={0} value={marks} onChange={(e) => setMarks(Number(e.target.value))} className="w-24 p-2 rounded border border-gray-300" />
            {errors.marks && <p className="text-red-500 text-sm mt-1">{errors.marks}</p>}
          </div>
        )}

        {/* MCQ */}
        {type.slug === 'mcq' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Choices</label>
            <div className="space-y-3">
              {choices.map((c, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <textarea value={c.option_text} onChange={(e) => updateChoice(i, e.target.value)} className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={`Choice ${String.fromCharCode(65 + i)}`} />
                    {errors[`choice-${i}`] && <p className="text-red-500 text-sm mt-1">{errors[`choice-${i}`]}</p>}
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                    <input type="radio" checked={c.is_correct} onChange={() => toggleChoiceCorrect(i)} className="text-blue-600 focus:ring-blue-500" />
                    Correct
                  </label>

                  {choices.length > 2 && (
                    <button type="button" onClick={() => removeChoice(i)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors mt-2">
                      <Icon.Delete />
                    </button>
                  )}
                </div>
              ))}

              <div>
                {errors.choices && <p className="text-red-500 text-sm mb-2">{errors.choices}</p>}
                {errors.choices_correct && <p className="text-red-500 text-sm mb-2">{errors.choices_correct}</p>}
                <button type="button" onClick={addChoice} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors">
                  <Icon.Add /> Add Choice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* True/False */}
        {type.slug === 'true-false' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer">
                <input type="radio" checked={choices[0]?.is_correct} onChange={() => toggleChoiceCorrect(0)} className="text-blue-600 focus:ring-blue-500" />
                <span className="text-gray-700">True</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer">
                <input type="radio" checked={choices[1]?.is_correct} onChange={() => toggleChoiceCorrect(1)} className="text-blue-600 focus:ring-blue-500" />
                <span className="text-gray-700">False</span>
              </label>
            </div>
            {errors.choices_correct && <p className="text-red-500 text-sm mt-1">{errors.choices_correct}</p>}
            {errors.marks && <p className="text-red-500 text-sm mt-1">{errors.marks}</p>}
          </div>
        )}

        {/* Fill in the blanks */}
        {type.slug === 'fill-in-blanks' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
            <input value={fillAnswer} onChange={(e) => setFillAnswer(e.target.value)} className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter correct answer..." />
            {errors.correct_answer && <p className="text-red-500 text-sm mt-1">{errors.correct_answer}</p>}
          </div>
        )}

        {/* Short / Long answer (sub-questions optional) */}
        {(type.slug === 'short-answer' || type.slug === 'long-answer') && (
          <div>
            {!showSubQuestions && (
              <div className="flex flex-col items-start mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                <input type="number" min={0} value={marks} onChange={(e) => setMarks(Number(e.target.value))} className="w-24 p-2 rounded border border-gray-300" />
                {errors.marks && <p className="text-red-500 text-sm mt-1">{errors.marks}</p>}
              </div>
            )}

            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Sub Questions (optional)</label>
              <button
                type="button"
                onClick={() => { addSubQuestion(); setShowSubQuestions(true); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors text-sm"
              >
                <Icon.Add /> Add Sub-question
              </button>
            </div>

            {showSubQuestions && (
              <div className="space-y-3">
                {subQuestions.map((s, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <textarea value={s.question_text} onChange={(e) => updateSubQuestionText(i, e.target.value)} className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={`Sub-question ${i + 1}`} />
                      {errors[`sub-${i}`] && <p className="text-red-500 text-sm mt-1">{errors[`sub-${i}`]}</p>}
                    </div>
                    <div className="flex flex-col items-center ml-2">
                      <label className="block text-xs text-gray-700">Marks</label>
                      <input type="number" min={0} value={s.marks} onChange={(e) => updateSubQuestionMarks(i, Number(e.target.value))} className="w-16 p-1 rounded border border-gray-300" />
                      {errors[`sub-mark-${i}`] && <p className="text-red-500 text-sm mt-1">{errors[`sub-mark-${i}`]}</p>}
                    </div>
                    {subQuestions.length > 1 && (
                      <button type="button" onClick={() => removeSubQuestion(i)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors mt-2">
                        <Icon.Delete />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {errors.sub_questions && <p className="text-red-500 text-sm mt-1">{errors.sub_questions}</p>}
          </div>
        )}

        {/* Conditional (min 2 sub-questions) */}
        {type.slug === 'conditional' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conditional Questions (minimum 2)</label>
            <div className="space-y-3">
              {subQuestions.map((s, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <textarea value={s.question_text} onChange={(e) => updateSubQuestionText(i, e.target.value)} className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={`Conditional question ${i + 1}`} />
                    {errors[`cond-${i}`] && <p className="text-red-500 text-sm mt-1">{errors[`cond-${i}`]}</p>}
                  </div>
                  <div className="flex flex-col items-center ml-2">
                    <label className="block text-xs text-gray-700">Marks</label>
                    <input type="number" min={0} value={s.marks} onChange={(e) => updateSubQuestionMarks(i, Number(e.target.value))} className="w-16 p-1 rounded border border-gray-300" />
                    {errors[`cond-mark-${i}`] && <p className="text-red-500 text-sm mt-1">{errors[`cond-mark-${i}`]}</p>}
                  </div>
                  {subQuestions.length > 1 && (
                    <button type="button" onClick={() => removeSubQuestion(i)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors mt-2">
                      <Icon.Delete />
                    </button>
                  )}
                </div>
              ))}

              <div>
                <button type="button" onClick={addSubQuestion} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors">
                  <Icon.Add /> Add Conditional Question
                </button>
              </div>
            </div>
            {errors.sub_questions && <p className="text-red-500 text-sm mt-1">{errors.sub_questions}</p>}
          </div>
        )}

        {/* Paragraph */}
        {type.slug === 'paragraph' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph Text</label>
              <textarea value={paragraphText} onChange={(e) => setParagraphText(e.target.value)} className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter the paragraph text..." />
              {errors.paragraph_text && <p className="text-red-500 text-sm mt-1">{errors.paragraph_text}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Questions based on the paragraph</label>
              <div className="space-y-3">
                {subQuestions.map((s, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <textarea value={s.question_text} onChange={(e) => updateSubQuestionText(i, e.target.value)} placeholder={`Question ${i + 1}`} className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      {errors[`para-${i}`] && <p className="text-red-500 text-sm mt-1">{errors[`para-${i}`]}</p>}
                    </div>

                    <div className="flex flex-col items-center ml-2">
                      <label className="block text-xs text-gray-700">Marks</label>
                      <input type="number" min={0} value={s.marks} onChange={(e) => updateSubQuestionMarks(i, Number(e.target.value))} className="w-16 p-1 rounded border border-gray-300" />
                      {errors[`para-mark-${i}`] && <p className="text-red-500 text-sm mt-1">{errors[`para-mark-${i}`]}</p>}
                    </div>
                    {subQuestions.length > 1 && (
                      <button type="button" onClick={() => removeSubQuestion(i)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors mt-2">
                        <Icon.Delete />
                      </button>
                    )}
                  </div>
                ))}

                <div>
                  <button type="button" onClick={addSubQuestion} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors">
                    <Icon.Add /> Add Question
                  </button>
                </div>
              </div>
            </div>
            {errors.sub_questions && <p className="text-red-500 text-sm mt-1">{errors.sub_questions}</p>}
          </>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={() => { onClose(); reset(); }} className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors">Cancel</button>
          <button type="submit" className="px-5 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-colors">{editing ? 'Save Changes' : 'Add Question'}</button>
        </div>
      </form>
    </Modal>
  );
};

// const QuestionForm: React.FC<{
//     open: boolean;
//     onClose: () => void;
//     onSubmit: (question: ApiQuestion, editingId?: number) => void;
//     type: ApiQuestionType;
//     editing?: ApiQuestion| null;
// }> = ({ open, onClose, onSubmit, type, editing }) => {
    
//     const [questionText, setQuestionText] = useState(editing?.content?.questionText || '');
//     const [choices, setChoices] = useState<string[]>(editing?.content?.choices || ['', '']);
//     const [correctAnswer, setCorrectAnswer] = useState<number>(editing?.content?.correctAnswer ?? 0);
//     const [subQuestions, setSubQuestions] = useState<string[]>(editing?.content?.sub_questions || []);
//     const [subQuestionMarks, setSubQuestionMarks] = useState<number[]>(editing?.subQuestionMarks || []);
//     const [marks, setMarks] = useState<number>(editing?.marks ?? 0);
//     const [paraText, setParaText] = useState(editing?.content?.paraText || '');
//     const [paraQuestions, setParaQuestions] = useState<string[]>(editing?.content?.paraQuestions || []);
//     const [paraQuestionMarks, setParaQuestionMarks] = useState<number[]>(editing?.paraQuestionMarks || []);
//     const [conditionalQuestions, setConditionalQuestions] = useState<string[]>(editing?.content?.conditionalQuestions || []);
//     const [conditionalQuestionMarks, setConditionalQuestionMarks] = useState<number[]>(editing?.conditionalQuestionMarks || []);
//     const [showSubQuestions, setShowSubQuestions] = useState(false);
//     const [errors, setErrors] = useState<Record<string, string>>({});
//     const [activeField, setActiveField] = useState<string | null>(null);

//     useEffect(() => {
//         setQuestionText(editing?.content?.questionText || '');
//         setChoices(editing?.content?.choices || ['', '']);
//         setCorrectAnswer(editing?.content?.correctAnswer ?? 0);
//         setSubQuestions(editing?.content?.sub_questions || []);
//         setSubQuestionMarks(editing?.subQuestionMarks || []);
//         setMarks(editing?.marks ?? 0);
//         setParaText(editing?.content?.paraText || '');
//         setParaQuestions(editing?.content?.paraQuestions || []);
//         setParaQuestionMarks(editing?.paraQuestionMarks || []);
//         setConditionalQuestions(editing?.content?.conditionalQuestions || []);
//         setConditionalQuestionMarks(editing?.conditionalQuestionMarks || []);
//         setShowSubQuestions((editing?.content?.sub_questions?.length || 0) > 0);
//         setErrors({});
//     }, [editing, open]);

//     const reset = () => {
//         setQuestionText('');
//         setChoices(['', '']);
//         setCorrectAnswer(0);
//         setSubQuestions([]);
//         setSubQuestionMarks([]);
//         setMarks(0);
//         setParaText('');
//         setParaQuestions([]);
//         setParaQuestionMarks([]);
//         setConditionalQuestions([]);
//         setConditionalQuestionMarks([]);
//         setShowSubQuestions(false);
//         setErrors({});
//     };



//     const validateForm = () => {
//         const newErrors: Record<string, string> = {};

//         if ((type === 'mcq' || type === 'true-false' || type === 'fill-in-blanks') && !questionText.trim()) {
//             newErrors.questionText = 'Question text is required';
//         }

//         if (type === 'short-answer' || type === 'long-answer') {
//             if (!showSubQuestions && !questionText.trim()) {
//                 newErrors.questionText = 'Question text is required when no sub-questions are added';
//             }

//             if (showSubQuestions) {
//                 subQuestions.forEach((sq, index) => {
//                     if (!sq.trim()) {
//                         newErrors[`subQuestion-${index}`] = 'Sub-question text is required';
//                     }
//                 });

//                 subQuestionMarks.forEach((mark, index) => {
//                     if (mark <= 0) {
//                         newErrors[`subQuestionMark-${index}`] = 'Sub-question marks must be greater than 0';
//                     }
//                 });
//             } else if (marks <= 0) {
//                 newErrors.marks = 'Marks must be greater than 0';
//             }
//         }

//         if (type === 'paragraph') {
//             if (!paraText.trim()) {
//                 newErrors.paraText = 'Paragraph text is required';
//             }

//             paraQuestions.forEach((pq, index) => {
//                 if (!pq.trim()) {
//                     newErrors[`paraQuestion-${index}`] = 'Paragraph question text is required';
//                 }
//             });

//             paraQuestionMarks.forEach((mark, index) => {
//                 if (mark <= 0) {
//                     newErrors[`paraQuestionMark-${index}`] = 'Paragraph question marks must be greater than 0';
//                 }
//             });
//         }

//         if (type === 'conditional') {
//             conditionalQuestions?.forEach((cq, index) => {
//                 if (!cq.trim()) {
//                     newErrors[`conditionalQuestion-${index}`] = 'Conditional question text is required';
//                 }
//             });

//             conditionalQuestionMarks.forEach((mark, index) => {
//                 if (mark <= 0) {
//                     newErrors[`conditionalQuestionMark-${index}`] = 'Conditional question marks must be greater than 0';
//                 }
//             });
//         }

//         if ((type === 'mcq' || type === 'true-false' || type === 'fill-in-blanks') && marks <= 0) {
//             newErrors.marks = 'Marks must be greater than 0';
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!validateForm()) {
//             return;
//         }

//         const content: any = {};
//         if (type !== 'paragraph' && type !== 'conditional') content.questionText = questionText;
//         if (type === 'mcq') {
//             content.choices = choices;
//             content.correctAnswer = correctAnswer;
//         } else if (type === 'true-false') {
//             content.choices = ['True', 'False'];
//             content.correctAnswer = correctAnswer;
//         } else if (type === 'short-answer' || type === 'long-answer') {
//             content.sub_questions = subQuestions.filter(Boolean);
//         } else if (type === 'conditional') {
//             content.conditionalQuestions = conditionalQuestions?.filter(Boolean);
//         } else if (type === 'paragraph') {
//             content.paraText = paraText;
//             content.paraQuestions = paraQuestions.filter(Boolean);
//         }

//         let q: Question = { id: editing?.id || uid('q-'), type, content };
//         if (type === 'short-answer' || type === 'long-answer') {
//             if (showSubQuestions && subQuestions.length > 0) {
//                 q.subQuestionMarks = subQuestionMarks.slice(0, subQuestions.length);
//             } else {
//                 q.marks = marks;
//             }
//         } else if (type === 'paragraph') {
//             q.paraQuestionMarks = paraQuestionMarks.slice(0, paraQuestions.length);
//         } else if (type === 'conditional') {
//             q.conditionalQuestionMarks = conditionalQuestionMarks.slice(0, conditionalQuestions?.length);
//         } else {
//             q.marks = marks;
//         }

//         onSubmit(q, parseInt(editing?.id || '0'));
//         reset();
//         onClose();
//     };

//     const updateChoice = (i: number, v: string) => setChoices((s) => s.map((c, idx) => (idx === i ? v : c)));
//     const addChoice = () => setChoices((s) => [...s, '']);
//     const removeChoice = (i: number) => setChoices((s) => s.filter((_, idx) => idx !== i));

//     const updateSub = (i: number, v: string) => setSubQuestions((s) => s.map((x, idx) => (idx === i ? v : x)));
//     const updateSubMark = (i: number, v: number) => setSubQuestionMarks((marks) => {
//         const arr = [...marks];
//         arr[i] = v;
//         return arr;
//     });
//     const addSub = () => {
//         setSubQuestions((s) => [...s, '']);
//         setSubQuestionMarks((marks) => [...marks, 0]);
//         setShowSubQuestions(true);
//     };
//     const removeSub = (i: number) => {
//         setSubQuestions((s) => s.filter((_, idx) => idx !== i));
//         setSubQuestionMarks((marks) => marks.filter((_, idx) => idx !== i));
//         if (subQuestions.length === 1) {
//             setShowSubQuestions(false);
//         }
//     };

//     const updateParaQ = (i: number, v: string) => setParaQuestions((s) => s.map((x, idx) => (idx === i ? v : x)));
//     const updateParaMark = (i: number, v: number) => setParaQuestionMarks((marks) => {
//         const arr = [...marks];
//         arr[i] = v;
//         return arr;
//     });
//     const addParaQ = () => {
//         setParaQuestions((s) => [...s, '']);
//         setParaQuestionMarks((marks) => [...marks, 0]);
//     };
//     const removeParaQ = (i: number) => {
//         setParaQuestions((s) => s.filter((_, idx) => idx !== i));
//         setParaQuestionMarks((marks) => marks.filter((_, idx) => idx !== i));
//     };

//     const updateCond = (i: number, v: string) => setConditionalQuestions((s) => s.map((x, idx) => (idx === i ? v : x)));
//     const updateCondMark = (i: number, v: number) => setConditionalQuestionMarks((marks) => {
//         const arr = [...marks];
//         arr[i] = v;
//         return arr;
//     });
//     const addCond = () => {
//         setConditionalQuestions((s) => [...s, '']);
//         setConditionalQuestionMarks((marks) => [...marks, 0]);
//     };
//     const removeCond = (i: number) => {
//         setConditionalQuestions((s) => s.filter((_, idx) => idx !== i));
//         setConditionalQuestionMarks((marks) => marks.filter((_, idx) => idx !== i));
//     };

//     return (
//         <Modal open={open} onClose={() => { onClose(); reset(); }} title={editing ? 'Edit Question' : 'Add Question'}>
//             <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-auto pr-2">
//                 {(type === 'mcq' || type === 'true-false' || type === 'fill-in-blanks' || type === 'short-answer' || type === 'long-answer') && (
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
//                         <textarea onChange={(e) => { setQuestionText(e.target.value) }} className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter Section Instructions..." value={questionText} />

//                         {errors.questionText && <p className="text-red-500 text-sm mt-1">{errors.questionText}</p>}
//                         {(type === 'mcq' || type === 'true-false' || type === 'fill-in-blanks') && (
//                             <div className="mt-2">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
//                                 <input
//                                     type="number"
//                                     min={0}
//                                     value={marks}
//                                     onChange={e => setMarks(Number(e.target.value))}
//                                     className="w-24 p-2 rounded border border-gray-300"
//                                 />
//                                 {errors.marks && <p className="text-red-500 text-sm mt-1">{errors.marks}</p>}
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {type === 'mcq' && (
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Choices</label>
//                         <div className="space-y-3">
//                             {choices.map((c, i) => (
//                                 <div key={i} className="flex gap-3 items-start">
//                                     <div className="flex-1">
//                                         <textarea onChange={(e) => { updateChoice(i, e.target.value) }} className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={`Choice ${String.fromCharCode(65 + i)}`}  value={c}/>
//                                     </div>
//                                     <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
//                                         <input
//                                             type="radio"
//                                             checked={correctAnswer === i}
//                                             onChange={() => setCorrectAnswer(i)}
//                                             className="text-blue-600 focus:ring-blue-500"
//                                         />
//                                         Correct
//                                     </label>
//                                     {choices.length > 2 && (
//                                         <button type="button" onClick={() => removeChoice(i)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors mt-2">
//                                             <Icon.Delete />
//                                         </button>
//                                     )}
//                                 </div>
//                             ))}
//                             <button type="button" onClick={addChoice} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors">
//                                 <Icon.Add /> Add Choice
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {type === 'true-false' && (
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
//                         <div className="flex gap-6">
//                             <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer">
//                                 <input type="radio" checked={correctAnswer === 0} onChange={() => setCorrectAnswer(0)} className="text-blue-600 focus:ring-blue-500" />
//                                 <span className="text-gray-700">True</span>
//                             </label>
//                             <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer">
//                                 <input type="radio" checked={correctAnswer === 1} onChange={() => setCorrectAnswer(1)} className="text-blue-600 focus:ring-blue-500" />
//                                 <span className="text-gray-700">False</span>
//                             </label>
//                         </div>
//                     </div>
//                 )}

//                 {(type === 'short-answer' || type === 'long-answer') && (
//                     <div>
//                         {!showSubQuestions && (
//                             <div className="flex flex-col items-start mb-2">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
//                                 <input
//                                     type="number"
//                                     min={0}
//                                     value={marks}
//                                     onChange={e => setMarks(Number(e.target.value))}
//                                     className="w-24 p-2 rounded border border-gray-300"
//                                 />
//                                 {errors.marks && <p className="text-red-500 text-sm mt-1">{errors.marks}</p>}
//                             </div>
//                         )}

//                         <div className="flex justify-between items-center mb-2">
//                             <label className="block text-sm font-medium text-gray-700">Sub Questions (optional)</label>
//                             <button
//                                 type="button"
//                                 onClick={addSub}
//                                 className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors text-sm"
//                             >
//                                 <Icon.Add /> Add Sub-question
//                             </button>
//                         </div>

//                         {showSubQuestions && (
//                             <div className="space-y-3">
//                                 {subQuestions.map((s, i) => (
//                                     <div key={i} className="flex gap-3 items-start">
//                                         <div className="flex-1">
//                                             <textarea onChange={(e) => { updateSub(i, e.target.value) }} className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={`Sub-question ${i + 1}`} value={s}/>

//                                             {errors[`subQuestion-${i}`] && <p className="text-red-500 text-sm mt-1">{errors[`subQuestion-${i}`]}</p>}
//                                         </div>
//                                         <div className="flex flex-col items-center ml-2">
//                                             <label className="block text-xs text-gray-700">Marks</label>
//                                             <input
//                                                 type="number"
//                                                 min={0}
//                                                 value={subQuestionMarks[i] ?? 0}
//                                                 onChange={e => updateSubMark(i, Number(e.target.value))}
//                                                 className="w-16 p-1 rounded border border-gray-300"
//                                             />
//                                             {errors[`subQuestionMark-${i}`] && <p className="text-red-500 text-sm mt-1">{errors[`subQuestionMark-${i}`]}</p>}
//                                         </div>
//                                         {subQuestions.length > 1 && (
//                                             <button type="button" onClick={() => removeSub(i)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors mt-2">
//                                                 <Icon.Delete />
//                                             </button>
//                                         )}
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {type === 'conditional' && (
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Conditional Questions</label>
//                         <div className="space-y-3">
//                             {conditionalQuestions?.map((c, i) => (
//                                 <div key={i} className="flex gap-3 items-start">
//                                     <div className="flex-1">
//                                         <textarea onChange={(e) => { updateCond(i, e.target.value) }} className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={`Conditional question ${i + 1}`} value={c} />

//                                         {errors[`conditionalQuestion-${i}`] && <p className="text-red-500 text-sm mt-1">{errors[`conditionalQuestion-${i}`]}</p>}
//                                     </div>
//                                     <div className="flex flex-col items-center ml-2">
//                                         <label className="block text-xs text-gray-700">Marks</label>
//                                         <input
//                                             type="number"
//                                             min={0}
//                                             value={conditionalQuestionMarks[i] ?? 0}
//                                             onChange={e => updateCondMark(i, Number(e.target.value))}
//                                             className="w-16 p-1 rounded border border-gray-300"
//                                         />
//                                         {errors[`conditionalQuestionMark-${i}`] && <p className="text-red-500 text-sm mt-1">{errors[`conditionalQuestionMark-${i}`]}</p>}
//                                     </div>
//                                     {conditionalQuestions?.length > 1 && (
//                                         <button type="button" onClick={() => removeCond(i)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors mt-2">
//                                             <Icon.Delete />
//                                         </button>
//                                     )}
//                                 </div>
//                             ))}
//                             <button type="button" onClick={addCond} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors">
//                                 <Icon.Add /> Add Conditional Question
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {type === 'paragraph' && (
//                     <>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph Text</label>
//                             <textarea onChange={(e) => { setParaText(e.target.value) }} className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter the paragraph text...">{paraText}</textarea>

//                             {errors.paraText && <p className="text-red-500 text-sm mt-1">{errors.paraText}</p>}
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Questions based on the paragraph</label>
//                             <div className="space-y-3">
//                                 {paraQuestions.map((pq, i) => (
//                                     <div key={i} className="flex gap-3 items-start">
//                                         <div className="flex-1">

//                                             <textarea onChange={(e) => { updateParaQ(i, e.target.value) }} placeholder={`Question ${i + 1}`} className="my-1 w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={pq}/>
//                                             {errors[`paraQuestion-${i}`] && <p className="text-red-500 text-sm mt-1">{errors[`paraQuestion-${i}`]}</p>}
//                                         </div>


//                                         <div className="flex flex-col items-center ml-2">
//                                             <label className="block text-xs text-gray-700">Marks</label>
//                                             <input
//                                                 type="number"
//                                                 min={0}
//                                                 value={paraQuestionMarks[i] ?? 0}
//                                                 onChange={e => updateParaMark(i, Number(e.target.value))}
//                                                 className="w-16 p-1 rounded border border-gray-300"
//                                             />
//                                             {errors[`paraQuestionMark-${i}`] && <p className="text-red-500 text-sm mt-1">{errors[`paraQuestionMark-${i}`]}</p>}
//                                         </div>
//                                         {paraQuestions.length > 1 && (
//                                             <button type="button" onClick={() => removeParaQ(i)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors mt-2">
//                                                 <Icon.Delete />
//                                             </button>
//                                         )}
//                                     </div>
//                                 ))}
//                                 <button type="button" onClick={addParaQ} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors">
//                                     <Icon.Add /> Add Question
//                                 </button>
//                             </div>
//                         </div>
//                     </>
//                 )}

//                 <div className="flex justify-end gap-3 pt-4 border-t">
//                     <button type="button" onClick={() => { onClose(); reset(); }} className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors">Cancel</button>
//                     <button type="submit" className="px-5 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-colors">{editing ? 'Save Changes' : 'Add Question'}</button>
//                 </div>
//             </form>
//         </Modal>
//     );
// };

// ---------- Question Display Components ----------
const MCQQuestion: React.FC<{ question: ApiQuestion; questionNumber: string, numberingStyle?: 'numeric' | 'roman' | 'alphabetic' }> = ({ question, questionNumber, numberingStyle }) => {
    return (
        <div className="mb-4">
            <div className="font-medium mb-3 text-gray-800 flex justify-between items-center">
                <div>
                    <span className="mr-2">{questionNumber}.</span>
                    <span>{question?.question_text}</span>
                </div>
                {typeof question.marks === 'number' && (
                    <span className="text-right text-blue-700 font-bold">{question.marks} marks</span>
                )}
            </div>
            <div className="ml-4 space-y-2">
                {question?.options?.map((choice: ApiQuestionOption, idx: number) => (
                    <div key={idx} className="flex items-start">
                        <span className="mr-2 font-medium text-blue-600 mt-1">
                            {String.fromCharCode(65 + idx)}.
                        </span>
                        <span className="text-gray-700 flex-1">
                            {choice.option_text}
                        </span>
                        {choice.is_correct && (
                            <span className="ml-2 text-green-600 text-sm flex items-center">
                                <Icon.Check /> Correct
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const TrueFalseQuestion: React.FC<{ question: ApiQuestion; questionNumber: string, numberingStyle?: 'numeric' | 'roman' | 'alphabetic' }> = ({ question, questionNumber, numberingStyle }) => {
    return (
        <div className="mb-4">
            <div className="font-medium mb-3 text-gray-800 flex justify-between items-center">
                <div>
                    <span className="mr-2">{questionNumber}. </span>
                    <span>{question?.question_text}</span>
                </div>
                {typeof question.marks === 'number' && (
                    <span className="text-right text-blue-700 font-bold">{question.marks} marks</span>
                )}
            </div>
            <div className="ml-4 space-y-2">
                {question?.options?.map((opt: ApiQuestionOption, oindex) => {
                    return (
                        <>
                            <div className="flex items-center">
                                <span className="mr-2 font-medium text-blue-600">{formatNumber(oindex + 1, 'alphabetic')}</span>
                                <span className="text-gray-700">{opt.option_text}</span>
                                {opt.is_correct && (
                                    <span className="ml-2 text-green-600 text-sm flex items-center">
                                        <Icon.Check /> Correct
                                    </span>
                                )}
                            </div>
                        </>
                    )
                })}

            </div>
        </div>
    );
};

const FillInBlanksQuestion: React.FC<{ question: ApiQuestion; questionNumber: string, numberingStyle?: 'numeric' | 'roman' | 'alphabetic' }> = ({ question, questionNumber, numberingStyle }) => {
    return (
        <div className="mb-4">
            <div className="font-medium text-gray-800 flex justify-between items-center">
                <div>
                    <span className="mr-2">{questionNumber}. </span>
                    <span>{question?.question_text}</span>
                </div>
                {typeof question.marks === 'number' && (
                    <span className="text-right text-blue-700 font-bold">{question.marks} marks</span>
                )}
            </div>
        </div>
    );
};

const ShortLongQuestion: React.FC<{ question: ApiQuestion; questionNumber: string; numberingStyle: 'numeric' | 'roman' | 'alphabetic' }> = ({ question, questionNumber, numberingStyle }) => {

    return (
        <div className="mb-4">
            {question.question_text && (
                <div className="font-medium mb-3 text-gray-800 flex justify-between items-center">
                    <div>
                        <span className="mr-2">{questionNumber}. </span>
                        <span>{question.question_text}</span>
                    </div>
                    {question?.sub_questions?.length == 0 && typeof question.marks === 'number' && (
                        <span className="text-right text-blue-700 font-bold">{question.marks} marks</span>
                    )}
                </div>
            )}
            {question?.sub_questions?.length > 0 && (
                <div className="ml-4">
                    {question?.sub_questions?.map((subQ: ApiQuestion, idx: number) => subQ && (
                        <div key={idx} className="mb-2 text-gray-700 flex justify-between items-center">
                            <div>
                                <span className="mr-2">{formatNumber(idx + 1, numberingStyle)}. </span>
                                <span>{subQ.question_text}</span>
                            </div>

                            <span className="text-right text-blue-700 font-bold">{subQ.marks} marks</span>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ConditionalQuestion: React.FC<{ question: ApiQuestion; questionNumber: string; numberingStyle: 'numeric' | 'roman' | 'alphabetic' }> = ({ question, questionNumber, numberingStyle }) => {
    return (
        <div className="mb-4">
            <div className="font-medium mb-3 text-gray-800 flex justify-between items-center">
                <div>
                    <span className="mr-2">{questionNumber}</span>
                    {question.question_text}
                </div>
            </div>
            <div className="ml-4">
                {question?.sub_questions?.map((condQ: ApiQuestion, idx: number) => (
                    <React.Fragment key={idx}>
                        {idx > 0 && (
                            <div className="text-center my-2">
                                <strong>OR</strong>
                            </div>
                        )}
                        <div className="mb-2 text-gray-700 flex justify-between items-center">
                            <div>
                                <span className="mr-2">{formatNumber(idx + 1, numberingStyle)}. </span>
                                <span>{condQ.question_text}</span>
                            </div>
                            <span className="text-right text-blue-700 font-bold">{condQ?.marks} marks</span>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const ParaQuestion: React.FC<{ question: ApiQuestion; questionNumber: string, numberingStyle: 'numeric' | 'roman' | 'alphabetic' }> = ({ question, questionNumber, numberingStyle }) => {
    return (
        <div className="mb-4">
            <div className="font-medium mb-3 text-gray-800 flex justify-between items-center">
                <div>
                    <span className="mr-2">{questionNumber}.</span>
                    <span>{question?.paragraph_text}</span>
                </div>
            </div>
            <div className="ml-4 space-y-2">
                {question?.sub_questions?.map((pq: ApiQuestion, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="mr-2 font-medium text-blue-600 mt-1">{formatNumber(idx + 1, numberingStyle)}. </span>
                            <span className="text-gray-700 flex-1">{pq?.question_text}</span>
                        </div>
                        <span className="text-right text-blue-700 font-bold">{pq?.marks} marks</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const QuestionDisplay: React.FC<{ question: ApiQuestion; type: ApiQuestionType, questionNumber: string; showOr?: boolean; numberingStyle?: 'numeric' | 'roman' | 'alphabetic' }> = ({ question, type, questionNumber, showOr = false, numberingStyle = 'numeric' }) => {
    switch (type.slug) {
        case 'mcq':
            return <MCQQuestion question={question} questionNumber={questionNumber} numberingStyle={numberingStyle} />;
        case 'true-false':
            return <TrueFalseQuestion question={question} questionNumber={questionNumber} numberingStyle={numberingStyle} />;
        case 'fill-in-blanks':
            return <FillInBlanksQuestion question={question} questionNumber={questionNumber} numberingStyle={numberingStyle} />;
        case 'short-answer':
        case 'long-answer':
            return <ShortLongQuestion question={question} questionNumber={questionNumber} numberingStyle={numberingStyle} />;
        case 'conditional':
            return <ConditionalQuestion question={question} questionNumber={questionNumber} numberingStyle={numberingStyle} />;
        case 'paragraph':
            return <ParaQuestion question={question} questionNumber={questionNumber} numberingStyle={numberingStyle} />;
        default:
            return (
                <div className="mb-4 text-gray-800">
                    <span className="mr-2">{questionNumber}</span>
                    <span>{question.question_text}</span>
                </div>)
    }
};

// ---------- Paper View Component ----------
const PaperView: React.FC<{
    paper: ApiPaper | null;
    onClose: () => void;
    onPrint: () => void;
    onDownloadPDF: () => void;
}> = ({ paper, onClose, onPrint, onDownloadPDF }) => {
    return (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center p-6 border-b no-print">
                    <h1 className="text-3xl font-bold text-center text-gray-800">Paper Preview</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={onDownloadPDF}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                        >
                            <Icon.Download /> Download PDF
                        </button>
                        <button
                            onClick={onPrint}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                        >
                            <Icon.Print /> Print
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
                        >
                            <Icon.Close /> Close
                        </button>
                    </div>
                </div>

                <div className="paper-content p-8 bg-white">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8"> {paper ? paper.title : "Loading..."}</h1>

                    <div className="space-y-8">
                        {paper?.sections.map((section: ApiSection, sIndex) => {
                            let questionCounter = 0;
                            return (
                                <div key={section.id} className="mb-8">
                                    <h2 className="text-xl font-bold mb-2 text-gray-800">
                                        <span>{section.title}</span>
                                    </h2>
                                    {section.instructions && (
                                        <p
                                            className="text-gray-600 mb-4 italic">{section.instructions}</p>
                                    )}
                                    {section?.section_groups?.map((group: ApiSectionGroup) => (
                                        <div key={group.id} className="mb-6 ml-4">
                                            {group.instructions && (
                                                <p
                                                    className="text-gray-600 mb-3">{group.instructions}</p>
                                            )}
                                            <div className="space-y-4 ml-4">
                                                {group?.questions?.map((question: ApiQuestion, qIndex) => {
                                                    questionCounter++;
                                                    const questionNumber = `${questionCounter}`;
                                                    return (
                                                        <div key={question.id} className="mb-4">
                                                            <QuestionDisplay question={question} type={group?.question_type} questionNumber={questionNumber} numberingStyle={group?.numbering_style} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
                        <p>End of Paper</p>
                    </div>
                </div>
            </div>
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .paper-content {
                        padding: 20px;
                        font-size: 14px;
                        line-height: 1.6;
                    }
                    h1 {
                        font-size: 24px;
                        margin-bottom: 30px;
                    }
                    h2 {
                        font-size: 20px;
                        margin-top: 25px;
                        margin-bottom: 15px;
                        page-break-after: avoid;
                    }
                    h3 {
                        font-size: 18px;
                        margin-top: 20px;
                        margin-bottom: 10px;
                        page-break-after: avoid;
                    }
                    .question-break {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
};

// ---------- Main Component ----------
const PaperGeneratorAdvanced: React.FC = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const { id } = useParams();
    const { token } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [paper, setPaper] = useState<ApiPaper | null>(null);
    const [questionTypes, setQuestionTypes] = useState<ApiQuestionType[]>([]);

    // UI states
    const [sectionModalOpen, setSectionModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<ApiSection | null>(null);
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [currentSectionIdForGroup, setCurrentSectionIdForGroup] = useState<number | null>(null);
    const [editingGroup, setEditingGroup] = useState<ApiSectionGroup | null>(null);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [currentTypeForQuestion, setCurrentTypeForQuestion] = useState<ApiQuestionType>({} as ApiQuestionType);
    const [currentSectionIdForQuestion, setCurrentSectionIdForQuestion] = useState<number | null>(null);
    const [currentGroupIdForQuestion, setCurrentGroupIdForQuestion] = useState<number | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<ApiQuestion | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmPayload, setConfirmPayload] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [showRawJson, setShowRawJson] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [paperViewOpen, setPaperViewOpen] = useState(false);

    // drag-n-drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );
    const [activeId, setActiveId] = useState<string | null>(null);

    // Load paper and question types on component mount
    useEffect(() => {
        if (!id || !token) return;

        const loadData = async () => {
            try {
                // Load question types
                const typesResponse = await ApiService.request('/user/question-types', {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (typesResponse?.status) {
                    setQuestionTypes(typesResponse.data.question_types);
                }

                // Load paper data
                const paperResponse = await ApiService.request(`/user/papers/${id}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (paperResponse?.status && paperResponse?.data?.paper) {
                    const paperData = paperResponse.data.paper;
                    setPaper(paperData);
                } else {
                    toast({
                        title: "Error",
                        description: paperResponse.message || "Failed to load paper",
                        variant: "destructive",
                    });
                    console.log("Failed to load paper");
                }
            } catch (error) {
                console.log("error : ", error);
                toast({
                    title: "Error",
                    description: "Failed to load paper data",
                    variant: "destructive",
                });
            }
        };

        loadData();
    }, [id, token, navigate, toast]);

    // ---------- API Functions ----------


    // Section operations
    const handleCreateSection = async (sectionData: any) => {
        try {
            const response = await ApiService.request(`/user/papers/${id}/sections`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(sectionData),
            });

            if (response.status) {
                setPaper(prev => prev ? { ...prev, sections: [...prev.sections, response.data.section] } : prev);
                toast({ title: "Success", description: "Section created successfully" });
            } else {
                throw new Error(response.message || "Failed to create section");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleUpdateSection = async (sectionId: Number, sectionData: any) => {
        try {
            const response = await ApiService.request(`/user/papers/${id}/sections/${sectionId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(sectionData),
            });

            if (response.status) {
                setPaper(prev => prev ? { ...prev, sections: prev.sections.map((sec: ApiSection) => sec.id === sectionId ? response.data.section : sec) } : prev);
                toast({ title: "Success", description: "Section updated successfully" });
            } else {
                throw new Error(response.message || "Failed to update section");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleDeleteSection = async (sectionId: Number) => {
        try {
            const response = await ApiService.request(`/user/papers/${id}/sections/${sectionId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status) {
                //    remove this section from paper
                setPaper(prev => prev ? { ...prev, sections: prev.sections.filter((sec: ApiSection) => sec.id !== sectionId) } : prev);
                toast({ title: "Success", description: "Section deleted successfully" });
            } else {
                throw new Error(response.message || "Failed to delete section");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    // Group operations
    const handleCreateGroup = async (sectionId: Number, groupData: any) => {
        try {
            const response = await ApiService.request(`/user/sections/${sectionId}/groups`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(groupData),
            });

            if (response.status) {
                setPaper(prev => prev ? { ...prev, sections: prev.sections.map((sec: ApiSection) => sec.id === sectionId ? { ...sec, section_groups: [...sec.section_groups, response.data.group] } : sec) } : prev);
                toast({ title: "Success", description: "Group created successfully" });
            } else {
                throw new Error(response.message || "Failed to create group");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleUpdateGroup = async (sectionId: Number, groupId: Number, groupData: any) => {
        try {
            const response = await ApiService.request(`/user/sections/${sectionId}/groups/${groupId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(groupData),
            });

            if (response.status) {
                setPaper(prev => prev ? { ...prev, sections: prev.sections.map((sec: ApiSection) => sec.id === sectionId ? { ...sec, section_groups: sec.section_groups.map((grp: ApiSectionGroup) => grp.id === groupId ? response.data.group : grp) } : sec) } : prev);
                toast({ title: "Success", description: "Group updated successfully" });
            } else {
                throw new Error(response.message || "Failed to update group");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleDeleteGroup = async (sectionId: Number, groupId: Number) => {
        try {
            const response = await ApiService.request(`/user/sections/${sectionId}/groups/${groupId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status) {
                // remove that group from paper
                setPaper(prev => prev ? { ...prev, sections: prev.sections.map((sec: ApiSection) => sec.id === sectionId ? { ...sec, section_groups: sec.section_groups.filter((grp: ApiSectionGroup) => grp.id !== groupId) } : sec) } : prev);
                toast({ title: "Success", description: "Group deleted successfully" });
            } else {
                throw new Error(response.message || "Failed to delete group");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    // Question operations
    const handleCreateQuestion = async (groupId: Number, questionData: any) => {
        try {
            const response = await ApiService.request(`/user/groups/${groupId}/questions`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(questionData),
            });

            if (response.status) {
                // add this question to paper
                setPaper(prev => prev ? { ...prev, sections: prev.sections.map((sec: ApiSection) => ({ ...sec, section_groups: sec.section_groups.map((grp: ApiSectionGroup) => grp.id === groupId ? { ...grp, questions: [...grp.questions, response.data.question] } : grp) })) } : prev);
                toast({ title: "Success", description: "Question created successfully" });
            } else {
                throw new Error(response.message || "Failed to create question");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleUpdateQuestion = async (groupId: Number, questionId: Number, questionData: any) => {
        try {
            const response = await ApiService.request(`/user/groups/${groupId}/questions/${questionId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(questionData),
            });

            if (response.status) {
                //    update this question in paper
                setPaper(prev => prev ? { ...prev, sections: prev.sections.map((sec: ApiSection) => ({ ...sec, section_groups: sec.section_groups.map((grp: ApiSectionGroup) => grp.id === groupId ? { ...grp, questions: grp.questions.map((q: ApiQuestion) => q.id === questionId ? response.data.question : q) } : grp) })) } : prev);
                toast({ title: "Success", description: "Question updated successfully" });
            } else {
                throw new Error(response.message || "Failed to update question");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleDeleteQuestion = async (sectionId: Number, groupId: Number, questionId: Number) => {
        try {
            const response = await ApiService.request(`/user/groups/${groupId}/questions/${questionId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status) {
                setPaper(prev => prev ? { ...prev, sections: prev.sections.map((sec: ApiSection) => sec.id === sectionId ? { ...sec, section_groups: sec.section_groups.map((grp: ApiSectionGroup) => grp.id === groupId ? { ...grp, questions: grp.questions.filter((q: ApiQuestion) => q.id !== questionId) } : grp) } : sec) } : prev);
                toast({ title: "Success", description: "Question deleted successfully" });
            } else {
                throw new Error(response.message || "Failed to delete question");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    // ---------- UI Handlers ----------



    const handleAddOrEditGroup = async (groupData:any, editingId?: number) => {
        if (!currentSectionIdForGroup) return;

        if (editingId) {
            await handleUpdateGroup(currentSectionIdForGroup, editingId, groupData);
        } else {
            await handleCreateGroup(currentSectionIdForGroup, groupData);
        }
        setGroupModalOpen(false);
        setEditingGroup(null);
    };


    const handleAddOrEditQuestion = async (question: ApiQuestion, editingId?: number) => {
        if (!currentGroupIdForQuestion) return;
        if (editingId) {
            await handleUpdateQuestion(currentGroupIdForQuestion, editingId, question);
        } else {
            await handleCreateQuestion(currentGroupIdForQuestion, question);
        }
        setQuestionModalOpen(false);
        setEditingQuestion(null);
    };

    // Duplicate section (local only)
    const handleDuplicateSection = (sectionId: Number) => {
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

    // UI helpers
    const startAddGroup = (sectionId: number) => {
        setCurrentSectionIdForGroup(sectionId);
        setEditingGroup(null);
        setGroupModalOpen(true);
    };

    const startAddQuestion = (sectionId: number, groupId: number, type:ApiQuestionType) => {
        setCurrentSectionIdForQuestion(sectionId);
        setCurrentGroupIdForQuestion(groupId);
        setCurrentTypeForQuestion(type);
        setEditingQuestion(null);
        setQuestionModalOpen(true);
    };

    const openEditSection = (sec: ApiSection) => {
        setEditingSection(sec);
        setSectionModalOpen(true);
    };

    const openEditGroup = (sectionId: number, group: ApiSectionGroup) => {
        setCurrentSectionIdForGroup(sectionId);
        setEditingGroup(group);
        setGroupModalOpen(true);
    };

    const openEditQuestion = (sectionId: number, groupId: number, question: ApiQuestion,type:ApiQuestionType) => {
        setCurrentSectionIdForQuestion(sectionId);
        setCurrentGroupIdForQuestion(groupId);
        setCurrentTypeForQuestion(type);
        setEditingQuestion(question);
        setQuestionModalOpen(true);
    };

    const toggleSectionExpansion = (sectionId: number) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

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

    // DnD handlers
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

    // Export/Import (local only)
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
                    const processed = parsed.map((section: Section) => ({
                        ...section,
                        groups: section.groups.map((group: QuestionGroup) => ({
                            ...group,
                            numberingStyle: group.numberingStyle || 'numeric'
                        }))
                    }));
                    setSections(processed);
                } else {
                    alert('Invalid format');
                }
            } catch (err) {
                alert('Failed to parse JSON');
            }
        };
        reader.readAsText(file);
    };

    // Paper View Functions
    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const paperContent = document.querySelector('.paper-content');
        if (!paperContent) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${paper ? paper.title : "Loading..."}</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #000; padding: 20px; margin: 0; }
                        h1 { text-align: center; font-size: 24px; margin-bottom: 30px; }
                        h2 { font-size: 20px; margin-top: 30px; margin-bottom: 15px; page-break-after: avoid; }
                        h3 { font-size: 18px; margin-top: 25px; margin-bottom: 10px; page-break-after: avoid; }
                        p { margin-bottom: 10px; }
                        .question { margin-bottom: 15px; page-break-inside: avoid; }
                        .math-block { display: block; text-align: center; margin: 10px 0; font-size: 1.2em; background: #f8f9fa; padding: 8px; border-radius: 4px; }
                        .math-inline { background: #e9ecef; padding: 2px 4px; border-radius: 3px; font-family: 'Times New Roman', serif; }
                        @media print {
                            body { padding: 0; }
                            .page-break { page-break-after: always; }
                        }
                    </style>
                </head>
                <body>
                    ${paperContent.innerHTML}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
    };

    // Search helper
    // const filteredSections = sections
    //     .map((sec) => ({ ...sec, groups: sec.groups.filter((g) => g.type.includes(search) || g.instruction?.includes(search) || search === '') }))
    //     .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()) || s.instruction?.toLowerCase().includes(search.toLowerCase()) || s.groups.length > 0 || search === '');

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {paperViewOpen && (
                    <PaperView
                        paper={paper}
                        onClose={() => setPaperViewOpen(false)}
                        onPrint={handlePrint}
                        onDownloadPDF={handleDownloadPDF}
                    />
                )}

                <header className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-700">Advanced Paper Generator</h1>
                            <p className="text-gray-600 mt-1">Create, organize, and manage your exam papers with math support</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Icon.Search />
                                </div>
                                <input
                                    placeholder="Search sections or groups..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <button onClick={() => { setSectionModalOpen(true); setEditingSection(null); }} className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 transition-colors">
                                <Icon.Add /> New Section
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-gray-200">
                        <button onClick={() => setPaperViewOpen(true)} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium flex items-center gap-2 transition-colors">
                            <Icon.Eye /> Paper View
                        </button>
                        <button onClick={() => exportJson()} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center gap-2 transition-colors">
                            <Icon.Export /> Export
                        </button>
                        <label className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium flex items-center gap-2 transition-colors cursor-pointer">
                            <Icon.Import /> Import
                            <input type="file" accept="application/json" onChange={(e) => importJson(e.target.files?.[0] ?? null)} className="hidden" />
                        </label>

                        <button onClick={() => setSections([])} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors">
                            Clear All
                        </button>
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <section className="lg:col-span-3">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3 flex items-center gap-2">
                                <span style={{ color: '#2563eb' }}><Icon.Question /></span> Paper Structure
                            </h2>

                            {paper?.sections.length === 0 ? (
                                <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-xl">
                                    <div className="text-blue-600 mb-3">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-12 w-12 mx-auto"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium">No sections yet</p>
                                    <p className="mt-1">Create your first section to get started</p>
                                    <button onClick={() => { setSectionModalOpen(true); setEditingSection(null); }} className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                                        Create Section
                                    </button>
                                </div>
                            ) : (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                                    <SortableContext items={sections.map((s) => s.id)}>
                                        {paper?.sections.map((sec: ApiSection, i) => {
                                            let question_counter = 0;
                                            return (
                                                <div key={sec.id}>
                                                    <SortableSection
                                                        section={sec}
                                                        index={i}
                                                        onEdit={(s) => openEditSection(s)}
                                                        onDelete={(id) => askConfirm({ type: 'delete-section', payload: { sectionId: id } })}
                                                        onAddGroup={(id) => startAddGroup(id)}
                                                        onEditGroup={(sectionId, group) => openEditGroup(sectionId, group)}
                                                        onDeleteGroup={(sectionId, groupId) => askConfirm({ type: 'delete-group', payload: { sectionId, groupId } })}
                                                        onDuplicateSection={(id) => handleDuplicateSection(id)}
                                                    />

                                                    <div className="mb-6">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h3 className="text-lg font-medium text-gray-800">Groups in {sec.title.replace(/<[^>]*>/g, '')}</h3>
                                                            <button
                                                                onClick={() => toggleSectionExpansion(sec.id)}
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                                            >
                                                                {expandedSections[sec.id] ? (
                                                                    <>
                                                                        <Icon.ChevronUp /> Collapse
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Icon.ChevronDown /> Expand
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>

                                                        {expandedSections[sec.id] && sec?.section_groups?.map((g: ApiSectionGroup) => (
                                                            <div key={g.id} className="bg-gray-50 rounded-xl p-5 mb-5 border border-gray-200">
                                                                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                                                                    <div>
                                                                        <div className="text-md font-bold text-green-700">{getGroupTitle(g.question_type?.slug)}</div>
                                                                        {g.instructions && <div className="text-gray-600 text-sm mt-1" >{g.instructions}</div>}
                                                                        <div className="text-gray-500 text-xs mt-2">Numbering: {g?.numbering_style}</div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button onClick={() => openEditGroup(sec.id, g)} className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors" title="Edit Group">
                                                                            <Icon.Edit />
                                                                        </button>
                                                                        <button onClick={() => askConfirm({ type: 'delete-group', payload: { sectionId: sec.id, groupId: g.id } })} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors" title="Delete Group">
                                                                            <Icon.Delete />
                                                                        </button>
                                                                        <button onClick={() => startAddQuestion(sec.id, g.id, g?.question_type)} className="px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium flex items-center gap-1 transition-colors">
                                                                            <Icon.Add /> Question
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-4 space-y-4">
                                                                    {g.questions.length === 0 ? (
                                                                        <div className="bg-white rounded-lg p-4 text-center text-gray-500 border border-dashed border-gray-300">
                                                                            No questions yet in this group.
                                                                        </div>
                                                                    ) : (
                                                                        g.questions.map((q: ApiQuestion, qIndex) => {
                                                                            question_counter++;
                                                                            return (
                                                                                <div key={q.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                                                                    <div className="flex justify-between items-start mb-3">
                                                                                        <div className="flex-1">
                                                                                            <QuestionDisplay question={q} type={g?.question_type} questionNumber={`${question_counter}`} numberingStyle={g.numbering_style} />
                                                                                        </div>
                                                                                        <div className="flex gap-2 ml-4">
                                                                                            <button onClick={() => openEditQuestion(sec.id, g.id, q,g.question_type)} className="p-1.5 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors" title="Edit Question">
                                                                                                <Icon.Edit />
                                                                                            </button>
                                                                                            <button onClick={() => askConfirm({ type: 'delete-question', payload: { sectionId: sec.id, groupId: g.id, questionId: q.id } })} className="p-1.5 rounded-md bg-red-100 hover:bg-red-200 text-red-700 transition-colors" title="Delete Question">
                                                                                                <Icon.Delete />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Quick Stats
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Sections</span>
                                    <span className="font-medium text-blue-600">{paper?.sections?.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Groups</span>
                                    <span className="font-medium text-green-600">{paper?.sections?.reduce((acc, sec) => acc + sec.section_groups.length, 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Questions</span>
                                    <span className="font-medium text-purple-600">{paper?.sections?.reduce((acc, sec) => acc + sec.section_groups.reduce((acc2, grp) => acc2 + grp.questions.length, 0), 0)}</span>
                                </div>
                            </div>
                        </div>


                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                General Tips
                            </h3>
                            <ul className="text-gray-700 text-sm space-y-3">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Drag sections to reorder them in your paper</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Click section titles to edit them directly</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Use search to quickly find content</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Export your paper to share or backup</span>
                                </li>
                            </ul>
                        </div>

                        {showRawJson && (
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 overflow-hidden">
                                <h3 className="font-semibold text-gray-800 mb-3">Raw JSON Data</h3>
                                <div className="overflow-auto max-h-96 text-xs bg-gray-50 p-3 rounded-lg">
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
                    editing={editingSection}
                    handleCreateSection={handleCreateSection}
                    handleUpdateSection={handleUpdateSection}
                />

                <GroupForm
                    open={groupModalOpen}
                    onClose={() => { setGroupModalOpen(false); setEditingGroup(null); setCurrentSectionIdForGroup(null); }}
                    types={questionTypes}
                    handleAddOrEditGroup={handleAddOrEditGroup}
                    sectionTitle={paper?.sections.find((s: any) => s.id === currentSectionIdForGroup)?.title}
                    editing={editingGroup}
                />

                <QuestionForm
                    open={questionModalOpen}
                    onClose={() => { setQuestionModalOpen(false); setEditingQuestion(null); setCurrentSectionIdForQuestion(null); setCurrentGroupIdForQuestion(null); }}
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
                            ? 'Delete this section and all its groups & questions? This cannot be undone.'
                            : confirmPayload?.type === 'delete-group'
                                ? 'Delete this group and all its questions?'
                                : 'Delete this question?'
                    }
                />
            </div>
        </div>
    );
};

export default PaperGeneratorAdvanced;
