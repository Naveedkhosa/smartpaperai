// pages/PaperViewPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Edit3,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  X,
  GripVertical,
  Printer,
  Download,
  LinkIcon,
  ArrowLeft,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Question {
  id: string;
  type: "mcq" | "short" | "long" | "paragraph";
  question: string;
  options?: string[];
  marks: number;
}

interface PaperData {
  id: string;
  title: string;
  schoolName: string;
  category: "Midterm" | "Final" | "Quiz";
  date: string;
  subject: string;
  class: string;
  totalMarks: number;
  timeAllowed: string;
  instructions: string;
  questions: Question[];
}

// Sample data for demonstration
const samplePaper: PaperData = {
  id: "1",
  title: "Mathematics Annual Examination 2023",
  schoolName: "Springfield High School",
  category: "Final",
  date: "2023-10-15",
  subject: "Mathematics",
  class: "10th Grade",
  totalMarks: 100,
  timeAllowed: "3 hours",
  instructions: "Answer all questions. Show all your work for full marks. Calculators are allowed.",
  questions: [
    {
      id: "1",
      type: "mcq",
      question: "What is the value of π?",
      options: ["3.14", "3.1416", "3.142", "3.14159"],
      marks: 1,
    },
    {
      id: "2",
      type: "mcq",
      question: "Solve for x: 2x + 5 = 15",
      options: ["x = 5", "x = 10", "x = 7.5", "x = 2.5"],
      marks: 1,
    },
    {
      id: "3",
      type: "short",
      question: "Differentiate between rational and irrational numbers with examples.",
      marks: 5,
    },
    {
      id: "4",
      type: "short",
      question: "Find the derivative of f(x) = 3x² + 2x - 5",
      marks: 3,
    },
    {
      id: "5",
      type: "long",
      question: "Prove the Pythagorean theorem and explain its applications.",
      marks: 10,
    },
    {
      id: "6",
      type: "paragraph",
      question: "Read the following passage and answer the questions that follow: 'The concept of derivatives is fundamental to calculus...'",
      marks: 15,
    },
  ],
};

// Sortable Question Component
function SortableQuestion({ question, index, isEditing, updateQuestion, deleteQuestion, moveQuestion }: {
  question: Question;
  index: number;
  isEditing: boolean;
  updateQuestion: (id: string, field: string, value: string | string[] | number) => void;
  deleteQuestion: (id: string) => void;
  moveQuestion: (id: string, direction: 'up' | 'down') => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glassmorphism p-4 rounded-lg mb-3 relative group"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
        <div className="flex items-start space-x-2 flex-1 w-full">
          {isEditing && (
            <div className="flex flex-row sm:flex-col space-y-0 sm:space-y-1 space-x-1 sm:space-x-0 mt-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 cursor-pointer opacity-70"
                onClick={() => moveQuestion(question.id, 'up')}
                disabled={index === 0}
              >
                <ChevronUp size={12} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 cursor-pointer opacity-70"
                onClick={() => moveQuestion(question.id, 'down')}
                disabled={index === -1}
              >
                <ChevronDown size={12} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 cursor-move opacity-70"
                {...attributes}
                {...listeners}
              >
                <GripVertical size={12} />
              </Button>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <span className="text-white font-semibold mr-2 whitespace-nowrap">
                Q{index + 1}.
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(question.id, "question", e.target.value)
                  }
                  className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full"
                />
              ) : (
                <span className="text-white break-words">{question.question}</span>
              )}
            </div>
            {question.type === "mcq" && question.options && (
              <div className="mt-2 ml-0 sm:ml-6 space-y-1">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center">
                    <span className="text-white/80 mr-2 whitespace-nowrap">
                      {String.fromCharCode(65 + optIndex)}.
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...question.options!];
                          newOptions[optIndex] = e.target.value;
                          updateQuestion(question.id, "options", newOptions);
                        }}
                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full text-sm"
                      />
                    ) : (
                      <span className="text-white/80 text-sm break-words">{option}</span>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/20 mt-2"
                    onClick={() => {
                      const newOptions = [...question.options!, "New Option"];
                      updateQuestion(question.id, "options", newOptions);
                    }}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Option
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-1 ml-0 sm:ml-2">
          {isEditing ? (
            <div className="flex items-center">
              <span className="text-white/80 text-sm mr-2 whitespace-nowrap">Marks:</span>
              <input
                type="number"
                value={question.marks}
                onChange={(e) =>
                  updateQuestion(question.id, "marks", parseInt(e.target.value) || 0)
                }
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-16 text-sm"
              />
            </div>
          ) : (
            <span className="text-emerald-300 text-sm whitespace-nowrap">
              {question.marks} mark{question.marks !== 1 ? "s" : ""}
            </span>
          )}
          {isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-400/20"
              onClick={() => deleteQuestion(question.id)}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>
      {isEditing && (
        <div className="flex justify-end mt-2 space-x-2">

        </div>
      )}
    </div>
  );
}

export default function PaperViewPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPaper, setEditedPaper] = useState<PaperData>(samplePaper);
  const [expandedSections, setExpandedSections] = useState({
    mcq: true,
    short: true,
    long: true,
    paragraph: true,
  });
  const [isSharing, setIsSharing] = useState(false);
  const navigate = useNavigate();
  const { paperId } = useParams();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // In a real app, you would fetch the paper data based on paperId
  useEffect(() => {
    // Simulate loading paper data
    setEditedPaper(samplePaper);
  }, [paperId]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = editedPaper.questions.findIndex(q => q.id === active.id);
      const newIndex = editedPaper.questions.findIndex(q => q.id === over.id);

      const newQuestions = arrayMove(editedPaper.questions, oldIndex, newIndex);
      setEditedPaper({ ...editedPaper, questions: newQuestions });
    }
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const currentIndex = editedPaper.questions.findIndex(q => q.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= editedPaper.questions.length) return;

    const newQuestions = [...editedPaper.questions];
    [newQuestions[currentIndex], newQuestions[newIndex]] = 
    [newQuestions[newIndex], newQuestions[currentIndex]];

    setEditedPaper({ ...editedPaper, questions: newQuestions });
  };

  const updateQuestion = (id: string, field: string, value: string | string[] | number) => {
    setEditedPaper({
      ...editedPaper,
      questions: editedPaper.questions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      ),
    });
  };

  const deleteQuestion = (id: string) => {
    setEditedPaper({
      ...editedPaper,
      questions: editedPaper.questions.filter((q) => q.id !== id),
    });
  };

  const addQuestion = (type: Question["type"]) => {
    const newQuestion: Question = {
      id: `new-${Date.now()}`,
      type,
      question: "New question",
      marks: 1,
      options: type === "mcq" ? ["Option 1", "Option 2", "Option 3", "Option 4"] : undefined,
    };

    setEditedPaper({
      ...editedPaper,
      questions: [...editedPaper.questions, newQuestion],
    });
  };

  const handleSave = () => {
    // In a real app, you would save the paper to your backend
    console.log("Saving paper:", editedPaper);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPaper(samplePaper);
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    setIsSharing(true);
    navigator.clipboard.writeText(`https://example.com/paper/${editedPaper.id}`);
    setTimeout(() => setIsSharing(false), 2000);
  };

  const renderQuestionSection = (
    type: Question["type"],
    title: string
  ) => {
    const questions = editedPaper.questions.filter((q) => q.type === type);

    return (
      <Card className="glassmorphism-strong border-white/30 mt-6">
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 py-3 cursor-pointer"
          onClick={() => toggleSection(type)}
        >
          <CardTitle className="text-lg font-bold text-white">
            {title} ({questions.length} questions)
          </CardTitle>
          <div className="flex items-center">
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/20"
                onClick={(e) => {
                  e.stopPropagation();
                  addQuestion(type);
                }}
              >
                <Plus size={16} className="mr-1" />
                <span className="hidden sm:inline">Add Question</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6">
              {expandedSections[type] ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </Button>
          </div>
        </CardHeader>
        {expandedSections[type] && (
          <CardContent>
            {questions.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                  {questions.map((question, index) => (
                    <SortableQuestion
                      key={question.id}
                      question={question}
                      index={editedPaper.questions.indexOf(question)}
                      isEditing={isEditing}
                      updateQuestion={updateQuestion}
                      deleteQuestion={deleteQuestion}
                      moveQuestion={moveQuestion}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <p className="text-slate-300/70 text-center py-4">
                No questions added yet.
              </p>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <GlassmorphismLayout>
      <div className="min-h-screen p-3 sm:p-4 w-full">
        {/* Header with navigation and actions */}
        <div className="glassmorphism-strong rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-white hover:bg-white/20 w-full sm:w-auto"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto justify-end">
            {isEditing ? (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                >
                  <X size={16} className="mr-1" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto mt-2 sm:mt-0"
                >
                  <Save size={16} className="mr-1" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto"
              >
                <Edit3 size={16} className="mr-1" />
                Edit Paper
              </Button>
            )}
          </div>
        </div>

        {/* Paper content */}
        <Card className="glassmorphism-strong border-white/30 mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 gap-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPaper.title}
                      onChange={(e) =>
                        setEditedPaper({ ...editedPaper, title: e.target.value })
                      }
                      className="text-2xl font-bold text-white bg-white/10 border border-white/20 rounded px-3 py-1 w-full"
                    />
                  ) : (
                    <CardTitle className="text-2xl font-bold text-white break-words">
                      {editedPaper.title}
                    </CardTitle>
                  )}
                  {isEditing ? (
                    <select
                      value={editedPaper.category}
                      onChange={(e) =>
                        setEditedPaper({ 
                          ...editedPaper, 
                          category: e.target.value as "Midterm" | "Final" | "Quiz" 
                        })
                      }
                      className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full sm:w-auto mt-2 sm:mt-0"
                    >
                      <option value="Midterm">Midterm</option>
                      <option value="Final">Final</option>
                      <option value="Quiz">Quiz</option>
                    </select>
                  ) : (
                    <Badge
                      className={
                        editedPaper.category === "Midterm"
                          ? "bg-amber-500/20 text-amber-300 mt-2 sm:mt-0"
                          : editedPaper.category === "Final"
                          ? "bg-red-500/20 text-red-300 mt-2 sm:mt-0"
                          : "bg-blue-500/20 text-blue-300 mt-2 sm:mt-0"
                      }
                    >
                      {editedPaper.category}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editedPaper.schoolName}
                        onChange={(e) =>
                          setEditedPaper({ ...editedPaper, schoolName: e.target.value })
                        }
                        className="text-slate-300/90 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm w-full"
                        placeholder="School Name"
                      />
                      <input
                        type="text"
                        value={editedPaper.class}
                        onChange={(e) =>
                          setEditedPaper({ ...editedPaper, class: e.target.value })
                        }
                        className="text-slate-300/90 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm w-full mt-2 sm:mt-0"
                        placeholder="Class"
                      />
                      <input
                        type="text"
                        value={editedPaper.subject}
                        onChange={(e) =>
                          setEditedPaper({ ...editedPaper, subject: e.target.value })
                        }
                        className="text-slate-300/90 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm w-full mt-2 sm:mt-0"
                        placeholder="Subject"
                      />
                    </>
                  ) : (
                    <p className="text-slate-300/90 break-words">
                      {editedPaper.schoolName} • {editedPaper.class} • {editedPaper.subject}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right w-full sm:w-auto mt-4 sm:mt-0">
                {isEditing ? (
                  <>
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-slate-300/80 text-sm mr-2">Date:</span>
                      <input
                        type="text"
                        value={editedPaper.date}
                        onChange={(e) =>
                          setEditedPaper({ ...editedPaper, date: e.target.value })
                        }
                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm w-full sm:w-32"
                      />
                    </div>
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-slate-300/80 text-sm mr-2">Total Marks:</span>
                      <input
                        type="number"
                        value={editedPaper.totalMarks}
                        onChange={(e) =>
                          setEditedPaper({ ...editedPaper, totalMarks: parseInt(e.target.value) || 0 })
                        }
                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm w-full sm:w-20"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-slate-300/80 text-sm mr-2">Time:</span>
                      <input
                        type="text"
                        value={editedPaper.timeAllowed}
                        onChange={(e) =>
                          setEditedPaper({ ...editedPaper, timeAllowed: e.target.value })
                        }
                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm w-full sm:w-32"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-slate-300/80 text-sm">Date: {editedPaper.date}</p>
                    <p className="text-slate-300/80 text-sm">
                      Total Marks: {editedPaper.totalMarks}
                    </p>
                    <p className="text-slate-300/80 text-sm">
                      Time Allowed: {editedPaper.timeAllowed}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <h4 className="text-white font-semibold mb-2">Instructions:</h4>
              {isEditing ? (
                <textarea
                  value={editedPaper.instructions}
                  onChange={(e) =>
                    setEditedPaper({ ...editedPaper, instructions: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                  rows={3}
                />
              ) : (
                <p className="text-slate-300/90 whitespace-pre-wrap break-words">
                  {editedPaper.instructions}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions sections */}
        {renderQuestionSection("mcq", "Multiple Choice Questions")}
        {renderQuestionSection("short", "Short Questions")}
        {renderQuestionSection("long", "Long Questions")}
        {renderQuestionSection("paragraph", "Questions from Paragraph")}

        {/* Total marks summary */}
        <Card className="glassmorphism-strong border-white/30 mt-6">
          <CardContent className="py-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">Total Marks</span>
              <span className="text-emerald-300 font-bold">
                {editedPaper.questions.reduce((sum, q) => sum + q.marks, 0)}/
                {editedPaper.totalMarks}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons at the bottom - Only show when not editing */}
        {!isEditing && (
          <div className="glassmorphism-strong rounded-xl p-4 mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              onClick={handleShare}
              variant="ghost"
              className="text-white hover:bg-white/20 w-full sm:w-auto"
              disabled={isSharing}
            >
              {isSharing ? (
                <>Link Copied!</>
              ) : (
                <>
                  <LinkIcon size={16} className="mr-1" />
                  Share with Students
                </>
              )}
            </Button>

            <Button
              onClick={handlePrint}
              variant="ghost"
              className="text-white hover:bg-white/20 w-full sm:w-auto"
            >
              <Printer size={16} className="mr-1" />
              Print
            </Button>

            <Button
              onClick={handlePrint}
              variant="ghost"
              className="text-white hover:bg-white/20 w-full sm:w-auto"
            >
              <Download size={16} className="mr-1" />
              Download PDF
            </Button>
          </div>
        )}
      </div>
    </GlassmorphismLayout>
  );
}