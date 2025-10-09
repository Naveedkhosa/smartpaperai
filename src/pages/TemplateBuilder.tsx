import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Plus, Trash2, Save, ArrowLeft, BookOpen, Target,
    BarChart3, AlertCircle, Settings, ChevronDown, ChevronUp,
    ArrowUp, ArrowDown, Eye, X, Download, Printer, Loader2, FileText
} from 'lucide-react';
import { ApiService } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

// Mobile-First UI Components
const Button = ({ children, onClick, className = "", variant = "default", size = "default", disabled = false, ...props }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
      inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 
      focus:outline-none focus:ring-4 focus:ring-offset-1 active:scale-95 touch-manipulation
      ${variant === 'outline'
                ? 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg'
                : variant === 'ghost'
                    ? 'text-gray-700 hover:bg-gray-100 shadow-none'
                    : variant === 'danger'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl'
                        : variant === 'success'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
            }
      ${size === 'sm' ? 'px-3 py-2 text-sm min-h-[36px]' : size === 'lg' ? 'px-6 py-4 text-lg min-h-[56px]' : 'px-4 py-3 min-h-[44px]'}
      ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${className}
    `}
        {...props}
    >
        {children}
    </button>
);

const Input = ({ className = "", ...props }) => (
    <input
        className={`
      w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base bg-white min-h-[48px]
      focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
      transition-all duration-300 placeholder-gray-400 hover:border-gray-400 touch-manipulation
      ${className}
    `}
        {...props}
    />
);

const Textarea = ({ className = "", rows = 3, ...props }) => (
    <textarea
        rows={rows}
        className={`
      w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base resize-none bg-white
      focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
      transition-all duration-300 placeholder-gray-400 hover:border-gray-400 touch-manipulation
      ${className}
    `}
        {...props}
    />
);

const Card = ({ children, className = "", ...props }) => (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 ${className}`} {...props}>
        {children}
    </div>
);

const Badge = ({ children, className = "", variant = "default" }) => (
    <span className={`
    inline-flex items-center px-2 py-1 rounded-full text-xs font-bold
    ${variant === 'success'
            ? 'bg-emerald-100 text-emerald-800'
            : variant === 'warning'
                ? 'bg-amber-100 text-amber-800'
                : variant === 'danger'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
        } ${className}
  `}>
        {children}
    </span>
);

const Select = ({ children, value, onValueChange, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = React.Children.toArray(children).find(child =>
        child.props.value === value
    );

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base bg-white text-left min-h-[48px]
                   focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 
                   transition-all duration-300 flex items-center justify-between hover:border-gray-400 touch-manipulation"
            >
                <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedOption ? selectedOption.props.children : placeholder}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-auto">
                    {React.Children.map(children, (child) =>
                        React.cloneElement(child, {
                            onClick: () => {
                                onValueChange(child.props.value);
                                setIsOpen(false);
                            }
                        })
                    )}
                </div>
            )}
        </div>
    );
};

const SelectItem = ({ children, value, onClick }) => (
    <div
        onClick={onClick}
        className="px-4 py-3 text-base hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl touch-manipulation min-h-[48px] flex items-center"
    >
        {children}
    </div>
);

const Label = ({ children, className = "", ...props }) => (
    <label className={`block text-sm font-bold text-gray-800 mb-2 ${className}`} {...props}>
        {children}
    </label>
);

// Interfaces
interface Section {
    id: string;
    title: string;
    instruction: string;
    groups: QuestionGroup[];
}

interface QuestionGroup {
    id: string;
    type: 'mcq' | 'true-false' | 'short-answer' | 'long-answer' | 'fill-blanks' | 'paragraph' | 'conditional';
    instruction: string;
    numberingStyle: 'numeric' | 'alphabetic' | 'roman';
    questionsCount: number;
    marksPerQuestion: number;
    optionsCount?: number;
}

// Paper Preview Modal Component
const PaperPreviewModal = ({ isOpen, onClose, templateData, sections }) => {
    const [isPrinting, setIsPrinting] = useState(false);
    const [generatedPaper, setGeneratedPaper] = useState(null);

    // Generate random paper data based on template
    useEffect(() => {
        if (isOpen && templateData && sections) {
            generateRandomPaper();
        }
    }, [isOpen, templateData, sections]);

    const generateRandomPaper = () => {
        const randomPaper = {
            id: 'preview-' + Date.now(),
            title: templateData?.name || 'Exam Paper',
            subject: templateData?.subject || { name: 'Mathematics' },
            student_class: templateData?.class || { name: 'Grade 10' },
            duration: 180,
            total_marks: sections.reduce((total, section) => 
                total + section.groups.reduce((secTotal, group) => 
                    secTotal + (group.questionsCount * group.marksPerQuestion), 0
                ), 0
            ),
            sections: sections.map((section, sIndex) => ({
                id: `section-${sIndex}`,
                title: section.title,
                instructions: section.instruction,
                section_groups: section.groups.map((group, gIndex) => ({
                    id: `group-${sIndex}-${gIndex}`,
                    instructions: group.instruction,
                    question_type: { 
                        slug: group.type,
                        name: getQuestionTypeName(group.type)
                    },
                    questions: Array.from({ length: group.questionsCount }, (_, qIndex) => ({
                        id: `question-${sIndex}-${gIndex}-${qIndex}`,
                        question_text: generateRandomQuestion(group.type, qIndex + 1),
                        marks: group.marksPerQuestion,
                        options: group.type === 'mcq' ? 
                            Array.from({ length: group.optionsCount || 4 }, (_, optIndex) => ({
                                id: `opt-${sIndex}-${gIndex}-${qIndex}-${optIndex}`,
                                option_text: generateRandomOption(optIndex)
                            })) : []
                    }))
                }))
            }))
        };
        setGeneratedPaper(randomPaper);
    };

    const getQuestionTypeName = (type) => {
        const typeMap = {
            'mcq': 'Multiple Choice',
            'true-false': 'True/False',
            'short-answer': 'Short Answer',
            'long-answer': 'Long Answer',
            'fill-blanks': 'Fill in the Blanks',
            'paragraph': 'Paragraph',
            'conditional': 'Conditional'
        };
        return typeMap[type] || 'Question';
    };

    const generateRandomQuestion = (type, index) => {
        const questions = {
            'mcq': [
                `What is the result of ${Math.floor(Math.random() * 100) + 1} + ${Math.floor(Math.random() * 100) + 1}?`,
                `Which of the following is a prime number?`,
                `Solve for x: ${Math.floor(Math.random() * 10) + 1}x + ${Math.floor(Math.random() * 10) + 1} = ${Math.floor(Math.random() * 50) + 1}`,
                `What is the capital of ${['France', 'Germany', 'Italy', 'Spain'][Math.floor(Math.random() * 4)]}?`,
                `Which element has the chemical symbol '${['O', 'H', 'C', 'N'][Math.floor(Math.random() * 4)]}'?`
            ],
            'true-false': [
                `The Earth is the largest planet in our solar system.`,
                `Water boils at 100 degrees Celsius at sea level.`,
                `Photosynthesis occurs only during the day.`,
                `The human body has 206 bones.`,
                `Python is a compiled programming language.`
            ],
            'short-answer': [
                `Define Newton's First Law of Motion.`,
                `What is the formula for calculating area of a circle?`,
                `Name the process by which plants make their food.`,
                `What is the capital of Australia?`,
                `Explain the term 'democracy' in one sentence.`
            ],
            'long-answer': [
                `Explain the process of photosynthesis in detail, including all the necessary components and conditions.`,
                `Discuss the causes and effects of World War II, highlighting at least three major consequences.`,
                `Describe the structure and functions of the human heart with a labeled diagram.`,
                `Write a comprehensive essay on the impact of technology on modern education.`,
                `Explain the water cycle in detail with appropriate diagrams and examples.`
            ],
            'fill-blanks': [
                `The process of liquid turning into gas is called __________.`,
                `The capital of Japan is __________.`,
                `The chemical formula for water is __________.`,
                `The largest ocean on Earth is the __________ Ocean.`,
                `The force that pulls objects toward the center of the Earth is called __________.`
            ],
            'paragraph': [
                `Read the following passage carefully and answer the questions that follow: "The Industrial Revolution marked a major turning point in history. Almost every aspect of daily life was influenced in some way..."`,
                `Study the given paragraph and respond to the questions: "Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, but since the 1800s..."`,
                `Analyze the following text: "The Renaissance was a period in European history marking the transition from the Middle Ages to modernity and covering the 15th and 16th centuries..."`
            ],
            'conditional': [
                `Answer any 3 out of the following 5 questions.`,
                `Choose 2 questions from Part A and 3 questions from Part B.`,
                `Attempt any four questions, with at least one from each section.`
            ]
        };
        const typeQuestions = questions[type] || questions['short-answer'];
        return typeQuestions[Math.floor(Math.random() * typeQuestions.length)];
    };

    const generateRandomOption = (index) => {
        const options = [
            `Option ${String.fromCharCode(65 + index)}`,
            `Choice ${String.fromCharCode(65 + index)}`,
            `Alternative ${index + 1}`,
            `Selection ${String.fromCharCode(65 + index)}`,
            `Answer ${index + 1}`
        ];
        return options[Math.floor(Math.random() * options.length)];
    };

    const getQuestionNumber = (sectionIndex, groupIndex, questionIndex) => {
        if (!generatedPaper) return 0;
        let count = 1;
        for (let s = 0; s < sectionIndex; s++) {
            for (let g = 0; g < generatedPaper.sections[s].section_groups.length; g++) {
                count += generatedPaper.sections[s].section_groups[g].questions.length;
            }
        }
        for (let g = 0; g < groupIndex; g++) {
            count += generatedPaper.sections[sectionIndex].section_groups[g].questions.length;
        }
        return count + questionIndex;
    };

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            const printContent = document.getElementById('paper-preview-content');
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Paper Preview</title>
                    <style>
                        body { 
                            font-family: 'Times New Roman', serif; 
                            margin: 0; 
                            padding: 20mm;
                            color: black;
                            background: white;
                        }
                        .print-area { 
                            width: 210mm; 
                            min-height: 297mm; 
                        }
                        .text-center { text-align: center; }
                        .border-b { border-bottom: 1px solid #666; }
                        .border-t { border-top: 1px solid #666; }
                        .mb-6 { margin-bottom: 24px; }
                        .mb-4 { margin-bottom: 16px; }
                        .mb-3 { margin-bottom: 12px; }
                        .mb-2 { margin-bottom: 8px; }
                        .mt-6 { margin-top: 24px; }
                        .pb-4 { padding-bottom: 16px; }
                        .pt-3 { padding-top: 12px; }
                        .p-10 { padding: 40px; }
                        .text-lg { font-size: 18px; }
                        .text-xl { font-size: 20px; }
                        .text-2xl { font-size: 24px; }
                        .text-sm { font-size: 14px; }
                        .text-xs { font-size: 12px; }
                        .font-bold { font-weight: bold; }
                        .font-semibold { font-weight: 600; }
                        .italic { font-style: italic; }
                        .underline { text-decoration: underline; }
                        .grid { display: grid; }
                        .grid-cols-2 { grid-template-columns: 1fr 1fr; }
                        .gap-x-10 { column-gap: 40px; }
                        .gap-y-1 { row-gap: 4px; }
                        .ml-8 { margin-left: 32px; }
                        .mt-2 { margin-top: 8px; }
                        .mr-2 { margin-right: 8px; }
                        .flex { display: flex; }
                        .items-center { align-items: center; }
                        .items-start { align-items: flex-start; }
                        .justify-between { justify-content: space-between; }
                        .leading-snug { line-height: 1.375; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
            setIsPrinting(false);
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl w-full h-full max-h-[95vh] max-w-[95vw] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex-shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <FileText size={20} className="sm:w-6 sm:h-6" />
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold">Paper Preview</h2>
                            <p className="text-blue-100 text-xs sm:text-sm">Randomly generated questions based on your template</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                        
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full text-white"
                        >
                            <X size={18} className="sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-auto p-2 sm:p-4 bg-gray-100">
                    {generatedPaper ? (
                        <div id="paper-preview-content" className="print-area bg-white text-black mx-auto w-full max-w-[800px] min-h-[297mm] shadow-lg p-4 sm:p-8 md:p-10 font-[Times_New_Roman]">
                            {/* Header */}
                            <div className="text-center border-b border-gray-400 pb-4 mb-6">
                                <h1 className="text-xl sm:text-2xl font-bold uppercase">{generatedPaper.title}</h1>
                                <div className="text-sm sm:text-[15px] mt-2 space-y-1 sm:space-y-0">
                                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                                        <span><strong>Subject:</strong> {generatedPaper.subject?.name || "N/A"}</span>
                                        <span><strong>Class:</strong> {generatedPaper.student_class?.name || "N/A"}</span>
                                        <span><strong>Time:</strong> {generatedPaper.duration} Min</span>
                                        <span><strong>Total Marks:</strong> {generatedPaper.total_marks}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            {generatedPaper.sections.map((section: any, sIndex: number) => (
                                <div key={section.id} className="mb-6 sm:mb-8">
                                    <h2 className="text-base sm:text-lg font-bold underline mb-2">
                                        {section.title}
                                    </h2>
                                    {section.instructions && (
                                        <p className="mb-4 text-sm sm:text-[15px] italic">{section.instructions}</p>
                                    )}

                                    {section.section_groups.map((group: any, gIndex: number) => (
                                        <div key={group.id}>
                                            {group.instructions && (
                                                <p className="font-semibold mb-3 text-sm sm:text-base">{group.instructions}</p>
                                            )}

                                            {group.questions.map((question: any, qIndex: number) => {
                                                const qNumber = getQuestionNumber(sIndex, gIndex, qIndex);
                                                return (
                                                    <div key={question.id} className="mb-4">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <p className="text-sm sm:text-[16px] leading-snug flex-1">
                                                                <strong>Q{qNumber}.</strong> {question.question_text}
                                                            </p>
                                                            {question.marks > 0 && (
                                                                <span className="text-xs sm:text-[14px] font-semibold text-gray-700 flex-shrink-0">
                                                                    ({question.marks})
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* MCQs */}
                                                        {group.question_type?.slug === "mcq" && (
                                                            <div className="ml-4 sm:ml-8 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-10 gap-y-1 text-sm sm:text-[15px]">
                                                                {question.options.map((opt: any, i: number) => (
                                                                    <div key={opt.id} className="flex items-center">
                                                                        <span className="font-semibold mr-2">
                                                                            {String.fromCharCode(65 + i)}.
                                                                        </span>
                                                                        <span>{opt.option_text}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {/* Footer */}
                            <div className="text-center border-t border-gray-400 pt-3 mt-6 text-xs sm:text-sm italic">
                                --- End of Paper --- <br />
                                Best of luck to all students!
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mr-3 text-blue-600" />
                            <span className="text-sm sm:text-base">Generating paper preview...</span>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200 bg-white flex-shrink-0 gap-3 sm:gap-0">
                    <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                        This is a preview with randomly generated questions. Actual paper will be generated from your question bank.
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button variant="outline" onClick={onClose} size="sm">
                            Close
                        </Button>
                      
                    </div>
                </div>
            </div>
        </div>
    );
};

// Mobile-Optimized Collapsible Question Group Component
const QuestionGroupComponent = ({ group, groupIndex, sectionGroups, onUpdate, onDelete, onMoveUp, onMoveDown }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const groupTypes = {
        'mcq': {
            label: 'Multiple Choice',
            icon: '📝',
            color: 'blue'
        },
        'true-false': {
            label: 'True/False',
            icon: '✓',
            color: 'green'
        },
        'short-answer': {
            label: 'Short Answer',
            icon: '💭',
            color: 'purple'
        },
        'long-answer': {
            label: 'Long Answer',
            icon: '📄',
            color: 'orange'
        },
        'fill-blanks': {
            label: 'Fill Blanks',
            icon: '___',
            color: 'pink'
        },
        'paragraph': {
            label: 'Paragraph',
            icon: '📖',
            color: 'indigo'
        },
        'conditional':{
            label: 'Conditional',
            icon: 'OR',
            color: 'green'
        }
    };

    const currentType = groupTypes[group.type];
    const totalMarks = group.questionsCount * group.marksPerQuestion;

    return (
        <Card className="mb-4 overflow-hidden">
            {/* Mobile-Optimized Collapsed Header */}
            <div
                className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                    {/* Left Side - Group Info */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {/* Order Controls */}
                        <div className="flex flex-col gap-1">
                            <Button
                                variant="ghost"
                                size="lg"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveUp(groupIndex);
                                }}
                                disabled={groupIndex === 0}
                                className="p-1 min-h-[20px] w-10 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            >
                                <ArrowUp size={12} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveDown(groupIndex);
                                }}
                                disabled={groupIndex === sectionGroups.length - 1}
                                className="p-1 min-h-[20px] w-10 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            >
                                <ArrowDown size={12} />
                            </Button>
                        </div>

                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                            {groupIndex + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Question Type and Count - Mobile First */}
                            <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                <span className="text-base sm:text-lg flex-shrink-0">{currentType.icon}</span>
                                <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{currentType.label}</span>
                            </div>

                            {/* Question Count Display - Simplified */}
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                                <span className="font-medium">{group.questionsCount}</span>
                                <span className="text-xs">Q</span>
                                <span className="mx-1 text-gray-400">•</span>
                                <span className="font-medium text-gray-900">{totalMarks} marks</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 sm:p-2 min-h-[32px] w-9 sm:w-9"
                        >
                            <Trash2 size={14} className="sm:w-7 sm:h-7" />
                        </Button>
                        <div className="text-gray-400 p-1">
                            {isExpanded ? <ChevronUp size={16} className="sm:w-5 sm:h-5" /> : <ChevronDown size={16} className="sm:w-5 sm:h-5" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Content - Mobile Optimized */}
            {isExpanded && (
                <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200">
                    <div className="space-y-4 sm:space-y-6">
                        {/* Configuration - Mobile Stack */}
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <Label className="flex items-center gap-2">
                                    <Settings size={14} className="text-blue-600 sm:w-4 sm:h-4" />
                                    Question Type
                                </Label>
                                <Select
                                    value={group.type}
                                    onValueChange={(value) => onUpdate({ ...group, type: value })}
                                >
                                    <SelectItem value="mcq">📝 Multiple Choice</SelectItem>
                                    <SelectItem value="true-false">✓ True/False</SelectItem>
                                    <SelectItem value="short-answer">💭 Short Answer</SelectItem>
                                    <SelectItem value="long-answer">📄 Long Answer</SelectItem>
                                    <SelectItem value="fill-blanks">___ Fill Blanks</SelectItem>
                                    <SelectItem value="paragraph">📖 Paragraph</SelectItem>
                                    <SelectItem value="conditional">x/y Conditional</SelectItem>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <Label className="flex items-center gap-2">
                                        <BarChart3 size={14} className="text-green-600 sm:w-4 sm:h-4" />
                                        Questions
                                    </Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={group.questionsCount}
                                        onChange={(e) => onUpdate({ ...group, questionsCount: parseInt(e.target.value) || 1 })}
                                        placeholder="5"
                                    />
                                </div>

                                <div>
                                    <Label className="flex items-center gap-2">
                                        <Target size={14} className="text-purple-600 sm:w-4 sm:h-4" />
                                        Marks Each
                                    </Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={group.marksPerQuestion}
                                        onChange={(e) => onUpdate({ ...group, marksPerQuestion: parseInt(e.target.value) || 1 })}
                                        placeholder="2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div>
                            <Label className="flex items-center gap-2">
                                <AlertCircle size={14} className="text-orange-600 sm:w-4 sm:h-4" />
                                Instructions (Optional)
                            </Label>
                            <Textarea
                                value={group.instruction}
                                onChange={(e) => onUpdate({ ...group, instruction: e.target.value })}
                                placeholder="Add specific instructions for this group..."
                                rows={2}
                            />
                        </div>

                        {/* Additional Settings - Mobile Stack */}
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <Label>Numbering Style</Label>
                                <Select
                                    value={group.numberingStyle}
                                    onValueChange={(value) => onUpdate({ ...group, numberingStyle: value })}
                                >
                                    <SelectItem value="numeric">1, 2, 3 (Numeric)</SelectItem>
                                    <SelectItem value="alphabetic">A, B, C (Alphabetic)</SelectItem>
                                    <SelectItem value="roman">I, II, III (Roman)</SelectItem>
                                </Select>
                            </div>

                            {/* Options Count for MCQ */}
                            {group.type === 'mcq' && (
                                <div>
                                    <Label>Number of Options</Label>
                                    <Input
                                        type="number"
                                        min="2"
                                        max="10"
                                        value={group.optionsCount || 4}
                                        onChange={(e) => onUpdate({ ...group, optionsCount: parseInt(e.target.value) || 4 })}
                                        placeholder="4"
                                    />
                                </div>
                            )}

                            {/* Total Display */}
                            <div className="bg-blue-50 rounded-xl p-3 sm:p-4 text-center border border-blue-200">
                                <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">{totalMarks}</div>
                                <div className="text-xs sm:text-sm text-blue-700 font-medium">Total Marks</div>
                                <div className="text-xs text-blue-600 mt-1">
                                    {group.questionsCount} × {group.marksPerQuestion}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

// Mobile-Optimized Section Component with Order Controls
const SectionComponent = ({ section, index, totalSections, onEdit, onDelete, onAddGroup, onMoveUp, onMoveDown }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const sectionStats = useMemo(() => {
        const totalQuestions = section.groups.reduce((sum, group) => sum + group.questionsCount, 0);
        const totalMarks = section.groups.reduce((sum, group) => sum + (group.questionsCount * group.marksPerQuestion), 0);
        return { totalQuestions, totalMarks };
    }, [section.groups]);

    const moveGroupUp = (groupIndex) => {
        if (groupIndex === 0) return;
        const updatedGroups = [...section.groups];
        [updatedGroups[groupIndex - 1], updatedGroups[groupIndex]] = [updatedGroups[groupIndex], updatedGroups[groupIndex - 1]];
        onEdit({ ...section, groups: updatedGroups });
    };

    const moveGroupDown = (groupIndex) => {
        if (groupIndex === section.groups.length - 1) return;
        const updatedGroups = [...section.groups];
        [updatedGroups[groupIndex], updatedGroups[groupIndex + 1]] = [updatedGroups[groupIndex + 1], updatedGroups[groupIndex]];
        onEdit({ ...section, groups: updatedGroups });
    };

    return (
        <Card className="mb-4 sm:mb-6 overflow-hidden">
            {/* Mobile-First Section Header with Order Controls */}
            <div
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 border-b border-gray-200 cursor-pointer hover:bg-blue-100/50 transition-colors touch-manipulation"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                    {/* Left Side - Section Info */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {/* Order Controls */}
                        <div className="flex flex-col gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveUp(index);
                                }}
                                disabled={index === 0}
                                className="p-1 min-h-[20px] w-10 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            >
                                <ArrowUp size={12} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveDown(index);
                                }}
                                disabled={index === totalSections - 1}
                                className="p-1 min-h-[20px] w-10 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            >
                                <ArrowDown size={12} />
                            </Button>
                        </div>

                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-base sm:text-lg flex items-center justify-center shadow-md flex-shrink-0">
                            {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                <Badge variant="default" className="text-xs">
                                    S {index + 1}
                                </Badge>
                                <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">{section.title}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-3 text-xs text-gray-600 flex-wrap">
                                <span>{section.groups.length} groups</span>
                                <span>•</span>
                                <span>{sectionStats.totalQuestions} Q</span>
                                <span>•</span>
                                <span className="text-xs text-gray-600">{sectionStats.totalMarks} marks</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(section.id);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 sm:p-2 min-h-[32px] w-9 sm:w-9"
                        >
                            <Trash2 size={14} className="sm:w-7 sm:h-7" />
                        </Button>
                        <div className="text-gray-400 p-1">
                            {isExpanded ? <ChevronUp size={16} className="sm:w-5 sm:h-5" /> : <ChevronDown size={16} className="sm:w-5 sm:h-5" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="space-y-3 sm:space-y-4">
                    {/* Section Form Fields */}
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                        <div>
                            <Label className="flex items-center gap-2">
                                <BookOpen size={14} className="text-blue-600 sm:w-4 sm:h-4" />
                                Section Title
                            </Label>
                            <Input
                                value={section.title}
                                onChange={(e) => onEdit({ ...section, title: e.target.value })}
                                placeholder="e.g., Section A"
                                className="text-base sm:text-lg font-semibold"
                            />
                        </div>

                        <div>
                            <Label className="flex items-center gap-2">
                                <AlertCircle size={14} className="text-green-600 sm:w-4 sm:h-4" />
                                Instructions
                            </Label>
                            <Textarea
                                value={section.instruction}
                                onChange={(e) => onEdit({ ...section, instruction: e.target.value })}
                                placeholder="Enter instructions for this section..."
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Question Groups Section */}
                    <div className="p-3 sm:p-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-2">
                                <Target size={16} className="text-indigo-600 sm:w-5 sm:h-5" />
                                <Label className="text-base sm:text-lg mb-0 font-bold">Groups</Label>
                                <Badge variant="default" className="text-xs">
                                    {section.groups.length}
                                </Badge>
                            </div>

                            <Button
                                onClick={() => onAddGroup(section.id)}
                                size="sm"
                                className="shadow-md"
                            >
                                <Plus size={12} className="mr-1 sm:w-3 sm:h-3" />
                                Add
                            </Button>
                        </div>

                        {section.groups.length === 0 ? (
                            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-4 sm:p-8 text-center border-2 border-dashed border-gray-300">
                                <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-md w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                                    <Plus size={20} className="sm:w-8 sm:h-8 text-gray-400" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-2">No groups yet</h4>
                                <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                                    Add question groups to define different types of questions.
                                </p>
                                <Button
                                    onClick={() => onAddGroup(section.id)}
                                    className="shadow-lg"
                                >
                                    <Plus size={14} className="mr-2 sm:w-4 sm:h-4" />
                                    Add First Group
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                {section.groups.map((group, groupIndex) => (
                                    <QuestionGroupComponent
                                        key={group.id}
                                        group={group}
                                        groupIndex={groupIndex}
                                        sectionGroups={section.groups}
                                        onUpdate={(updatedGroup) => {
                                            const updatedGroups = section.groups.map(g =>
                                                g.id === group.id ? updatedGroup : g
                                            );
                                            onEdit({ ...section, groups: updatedGroups });
                                        }}
                                        onDelete={() => {
                                            const updatedGroups = section.groups.filter(g => g.id !== group.id);
                                            onEdit({ ...section, groups: updatedGroups });
                                        }}
                                        onMoveUp={moveGroupUp}
                                        onMoveDown={moveGroupDown}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};

const TemplateBuilder = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const templateId = searchParams.get('edit');
    const { token } = useAuth();
    
    const [sections, setSections] = useState<Section[]>([
        {
            id: '1',
            title: 'Section A',
            instruction: 'Answer all questions in this section',
            groups: []
        }
    ]);

    const [templateDetails, setTemplateDetails] = useState({
        name: '',
        class: '',
        subject: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [templateData, setTemplateData] = useState(null);
    const [showViewButton, setShowViewButton] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // Fetch template data if editing
    useEffect(() => {
        if (templateId) {
            fetchTemplateData();
        }
    }, [templateId]);

    const fetchTemplateData = async () => {
        try {
            setIsLoading(true);
            const response = await ApiService.request(`/user/paper-templates/${templateId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status && response.data.paper_template) {
                const template = response.data.paper_template;
                setTemplateData(template);
                
                // Convert API data to local state format
                if (template.sections && template.sections.length > 0) {
                    const convertedSections = template.sections.map((section: any, index: number) => ({
                        id: section.id || `section-${index}`,
                        title: section.title,
                        instruction: section.instruction || '',
                        groups: section.groups.map((group: any, groupIndex: number) => ({
                            id: group.id || `group-${index}-${groupIndex}`,
                            type: mapQuestionType(group.question_type_id),
                            instruction: group.instruction || '',
                            numberingStyle: group.numbering_style,
                            questionsCount: group.questions_count,
                            marksPerQuestion: group.marks_per_question,
                            optionsCount: group.options_count || 4
                        }))
                    }));
                    setSections(convertedSections);
                }
            }
        } catch (error) {
            console.error('Error fetching template:', error);
            alert('Failed to load template data');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to map question type IDs to type strings
    const mapQuestionType = (typeId: string): string => {
        const typeMap: { [key: string]: string } = {
            '1': 'mcq',
            '2': 'true-false',
            '3': 'short-answer',
            '4': 'long-answer',
            '5': 'fill-blanks',
            '6': 'paragraph',
            '7':'conditional'
        };
        return typeMap[typeId] || 'mcq';
    };

    // Helper function to map type strings back to question type IDs
    const mapTypeToId = (type: string): string => {
        const typeMap: { [key: string]: string } = {
            'mcq': '1',
            'true-false': '2',
            'short-answer': '3',
            'long-answer': '4',
            'fill-blanks': '5',
            'paragraph': '6',
            'conditional':'7'
        };
        return typeMap[type] || '1';
    };

    const totals = useMemo(() => {
        const totalQuestions = sections.reduce((total, sec) =>
            total + sec.groups.reduce((secTotal, group) => secTotal + group.questionsCount, 0), 0
        );

        const totalMarks = sections.reduce((total, sec) =>
            total + sec.groups.reduce((secTotal, group) =>
                secTotal + (group.questionsCount * group.marksPerQuestion), 0
            ), 0
        );

        const totalGroups = sections.reduce((total, sec) => total + sec.groups.length, 0);

        return { totalQuestions, totalMarks, totalGroups };
    }, [sections]);

    const handleBackClick = () => {
        navigate('/teacher/templates');
    };

    const addSection = () => {
        const newSection = {
            id: Date.now().toString(),
            title: `Section ${String.fromCharCode(65 + sections.length)}`,
            instruction: 'Answer all questions in this section',
            groups: []
        };
        setSections(prev => [...prev, newSection]);
    };

    const deleteSection = (sectionId: string) => {
        if (sections.length <= 1) return;
        setSections(prev => prev.filter(sec => sec.id !== sectionId));
    };

    const updateSection = (updatedSection: Section) => {
        setSections(prev => prev.map(sec =>
            sec.id === updatedSection.id ? updatedSection : sec
        ));
    };

    const addQuestionGroup = (sectionId: string) => {
        const group = {
            id: Date.now().toString(),
            type: 'mcq' as const,
            instruction: '',
            numberingStyle: 'numeric' as const,
            questionsCount: 5,
            marksPerQuestion: 2,
            optionsCount: 4
        };

        setSections(prev => prev.map(sec =>
            sec.id === sectionId
                ? { ...sec, groups: [...sec.groups, group] }
                : sec
        ));
    };

    // Move section up
    const moveSectionUp = (index: number) => {
        if (index === 0) return;
        const newSections = [...sections];
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
        setSections(newSections);
    };

    // Move section down
    const moveSectionDown = (index: number) => {
        if (index === sections.length - 1) return;
        const newSections = [...sections];
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        setSections(newSections);
    };

    const handlePreviewPaper = () => {
        setShowPreviewModal(true);
    };

    const handleViewPaper = () => {
        if (templateId) {
            navigate(`../teacher/paper-viewer/${templateId}`);
        }
    };

    const saveTemplate = async () => {
        if (!templateId) {
            alert('No template ID found. Please create a template first.');
            return;
        }

        if (sections.length === 0) {
            alert('Please add at least one section to the template.');
            return;
        }

        // Validate all sections have at least one group
        for (const section of sections) {
            if (section.groups.length === 0) {
                alert(`Section "${section.title}" must have at least one question group.`);
                return;
            }
        }

        try {
            setIsSaving(true);

            // Prepare data for API
            const sectionsData = sections.map((section, index) => ({
                title: section.title,
                instruction: section.instruction,
                order: index,
                groups: section.groups.map((group, groupIndex) => ({
                    question_type_id: mapTypeToId(group.type),
                    instruction: group.instruction,
                    numbering_style: group.numberingStyle,
                    questions_count: group.questionsCount,
                    marks_per_question: group.marksPerQuestion,
                    options_count: group.type === 'mcq' ? (group.optionsCount || 4) : null,
                    order: groupIndex
                }))
            }));

            const response = await ApiService.request(`/user/paper-templates/${templateId}/sections`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    sections: sectionsData
                }),
            });

            if (response.status) {
                alert('Template saved successfully!');
                setShowViewButton(true);
                fetchTemplateData();
            } else {
                throw new Error(response.message || 'Failed to save template');
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert(`Failed to save template: ${error?.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <div className="max-w-4xl mx-auto p-3 sm:p-4">
                {/* Mobile-First Header */}
                <Card className="mb-4 sm:mb-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 sm:p-4">
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center justify-between gap-2 sm:gap-3">
                                <Button
                                    variant="outline"
                                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                                    size="sm"
                                    onClick={handleBackClick}
                                    disabled={isSaving}
                                >
                                    <ArrowLeft size={16} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Back</span>
                                </Button>

                                <div className="flex items-center gap-1 sm:gap-2">
                                    {/* Preview Button - Only show after saving */}
                                    {showViewButton && templateId && (
                                        <Button
                                            onClick={handlePreviewPaper}
                                            className="bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-lg"
                                            size="sm"
                                        >
                                            <Eye size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
                                            <span className="hidden sm:inline">Preview</span>
                                        </Button>
                                    )}
                                    
                                    <Button
                                        onClick={saveTemplate}
                                        disabled={isSaving}
                                        className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                                        size="sm"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600 mr-1 sm:mr-2"></div>
                                                <span className="hidden sm:inline">Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
                                                <span className="hidden sm:inline">Save</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                                <div className="flex-1">
                                    <h1 className="text-lg sm:text-xl font-bold">
                                        {templateId ? 'Edit Template' : 'Create Template'}
                                    </h1>
                                    <p className="text-blue-100 text-xs sm:text-sm">Design your exam structure</p>
                                </div>
                                {templateData && (
                                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                                        <p className="text-blue-100 text-xs sm:text-sm">Class: {templateData.class?.name}</p> 
                                        <p className="text-blue-100 text-xs sm:text-sm">Subject: {templateData.subject?.name}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Stats Grid */}
                    <div className="p-3 sm:p-4 bg-white">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-0">
                            <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                                <div className="text-xs sm:text-sm font-bold text-blue-600">{sections.length} Sections</div>
                            </div>
                            <div className="text-center p-2 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                                <div className="text-xs sm:text-sm font-bold text-green-600">{totals.totalGroups} Groups</div>
                            </div>
                            <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                                <div className="text-xs sm:text-sm font-bold text-purple-600">{totals.totalQuestions} Questions</div>
                            </div>
                            <div className="text-center p-2 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                                <div className="text-xs sm:text-sm font-bold text-orange-600">{totals.totalMarks} Marks</div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Add Section Button - Above Sections */}
                <div className="mb-4 sm:mb-6">
                    <Button
                        onClick={addSection}
                        variant="success"
                        className="w-full shadow-lg"
                        disabled={isSaving}
                    >
                        <Plus size={16} className="mr-2 sm:w-4 sm:h-4" />
                        Add Section
                    </Button>
                </div>

                {/* Order Instructions */}
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 text-center">
                    <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
                        <ArrowUp size={16} className="sm:w-5 sm:h-5" />
                        <ArrowDown size={16} className="sm:w-5 sm:h-5" />
                        <span className="font-semibold text-sm sm:text-base">Use Arrows to Reorder</span>
                    </div>
                    <p className="text-blue-600 text-xs sm:text-sm">
                        Use the up/down arrows to change the order of sections and groups
                    </p>
                </div>

                {/* Main Content */}
                {sections.length === 0 ? (
                    <Card className="text-center py-8 sm:py-12">
                        <div className="max-w-xs mx-auto">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg">
                                <Plus size={24} className="sm:w-10 sm:h-10 text-blue-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Ready to Create?</h3>
                            <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                                Start building your exam template with sections and question groups.
                            </p>
                            <Button
                                onClick={addSection}
                                className="w-full shadow-lg"
                                disabled={isSaving}
                            >
                                <Plus size={16} className="mr-2 sm:w-4 sm:h-4" />
                                Create First Section
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        {sections.map((section, index) => (
                            <SectionComponent
                                key={section.id}
                                section={section}
                                index={index}
                                totalSections={sections.length}
                                onEdit={updateSection}
                                onDelete={deleteSection}
                                onAddGroup={addQuestionGroup}
                                onMoveUp={moveSectionUp}
                                onMoveDown={moveSectionDown}
                            />
                        ))}
                    </div>
                )}

                {/* Bottom Save Button with View Option */}
                {sections.length > 0 && (
                    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
                        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                            <div className="text-center">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                                    {showViewButton ? 'Template Saved Successfully!' : 'Ready to Save Your Template?'}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Your template contains {sections.length} section{sections.length !== 1 ? 's' : ''} with {totals.totalQuestions} questions totaling {totals.totalMarks} marks.
                                </p>
                            </div>

                            <div className="flex flex-row gap-2 sm:flex-row items-center space-y-0 sm:space-y-0 sm:space-x-4">
                                {/* Preview Paper Button - Bottom Section */}
                                {showViewButton && templateId && (
                                    <Button 
                                        onClick={handlePreviewPaper}
                                        variant="outline" 
                                        size="lg" 
                                        className="w-full sm:w-auto min-w-[100px] border-blue-600 text-blue-600 hover:bg-blue-50"
                                    >
                                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                        Preview
                                    </Button>
                                )}
                                
                                <Button 
                                    onClick={saveTemplate} 
                                    variant="primary" 
                                    size="lg" 
                                    className="w-full sm:w-auto min-w-[100px]"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                            {showViewButton ? 'Update' : 'Save'}
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Preview Paper Info */}
                            {showViewButton && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-3 sm:p-4 border border-green-200 text-center max-w-md">
                                    <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                                        <Eye size={16} className="sm:w-5 sm:h-5" />
                                        <span className="font-semibold text-sm sm:text-base">Paper Ready to Preview</span>
                                    </div>
                                    <p className="text-green-600 text-xs sm:text-sm">
                                        Click "Preview Paper" to see randomly generated questions based on your template specifications.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Paper Preview Modal */}
                <PaperPreviewModal 
                    isOpen={showPreviewModal}
                    onClose={() => setShowPreviewModal(false)}
                    templateData={templateData}
                    sections={sections}
                />
            </div>
        </div>
    );
};

export default TemplateBuilder;