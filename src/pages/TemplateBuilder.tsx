import React, { useState, useMemo } from 'react';
import {
    Plus, Trash2, Save, ArrowLeft, GripVertical, BookOpen, Target,
    BarChart3, AlertCircle, Settings, ChevronDown, ChevronUp
} from 'lucide-react';

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
      ${size === 'sm' ? 'px-3 py-2 text-sm min-h-[36px]' : size === 'lg' ? 'px-8 py-4 text-lg min-h-[56px]' : 'px-6 py-3 min-h-[44px]'}
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
      w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-base bg-white min-h-[52px]
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
      w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-base resize-none bg-white
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
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-base bg-white text-left min-h-[52px]
                   focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 
                   transition-all duration-300 flex items-center justify-between hover:border-gray-400 touch-manipulation"
            >
                <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedOption ? selectedOption.props.children : placeholder}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
        className="px-4 py-4 text-base hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl touch-manipulation min-h-[52px] flex items-center"
    >
        {children}
    </div>
);

const Label = ({ children, className = "", ...props }) => (
    <label className={`block text-sm font-bold text-gray-800 mb-3 ${className}`} {...props}>
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
    type: 'mcq' | 'true-false' | 'short-answer' | 'long-answer' | 'fill-blanks' | 'paragraph';
    instruction: string;
    numberingStyle: 'numeric' | 'alphabetic' | 'roman';
    questionsCount: number;
    marksPerQuestion: number;
}

// Mobile-Optimized Collapsible Question Group Component
const QuestionGroupComponent = ({ group, groupIndex, onUpdate, onDelete }) => {
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
        }
    };

    const currentType = groupTypes[group.type];
    const totalMarks = group.questionsCount * group.marksPerQuestion;

    return (
        <Card className="mb-4 overflow-hidden">
            {/* Mobile-Optimized Collapsed Header */}
            <div
                className="p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between gap-3">
                    {/* Left Side - Group Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                            {groupIndex + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Question Type and Count - Mobile First */}
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg flex-shrink-0">{currentType.icon}</span>
                                <span className="font-semibold text-gray-900 text-sm truncate">{currentType.label}</span>
                            </div>

                            {/* Question Count Display - Simplified */}
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <span className="font-medium">{group.questionsCount}</span>
                                <span className="text-xs">questions</span>
                                <span className="mx-1 text-gray-400">•</span>
                                <span className="font-medium text-gray-900">{totalMarks} marks</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 min-h-[36px] w-9"
                        >
                            <Trash2 size={16} />
                        </Button>
                        <div className="text-gray-400 p-1">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Content - Mobile Optimized */}
            {isExpanded && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="space-y-6">
                        {/* Configuration - Mobile Stack */}
                        <div className="space-y-4">
                            <div>
                                <Label className="flex items-center gap-2">
                                    <Settings size={16} className="text-blue-600" />
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
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="flex items-center gap-2">
                                        <BarChart3 size={16} className="text-green-600" />
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
                                        <Target size={16} className="text-purple-600" />
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
                                <AlertCircle size={16} className="text-orange-600" />
                                Instructions (Optional)
                            </Label>
                            <Textarea
                                value={group.instruction}
                                onChange={(e) => onUpdate({ ...group, instruction: e.target.value })}
                                placeholder="Add specific instructions for this group..."
                                rows={3}
                            />
                        </div>

                        {/* Additional Settings - Mobile Stack */}
                        <div className="space-y-4">
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

                            {/* Total Display */}
                            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                                <div className="text-2xl font-bold text-blue-600 mb-1">{totalMarks}</div>
                                <div className="text-sm text-blue-700 font-medium">Total Marks</div>
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

// Mobile-Optimized Section Component
const SectionComponent = ({ section, index, onEdit, onDelete, onAddGroup, addSection }) => {
    const sectionStats = useMemo(() => {
        const totalQuestions = section.groups.reduce((sum, group) => sum + group.questionsCount, 0);
        const totalMarks = section.groups.reduce((sum, group) => sum + (group.questionsCount * group.marksPerQuestion), 0);
        return { totalQuestions, totalMarks };
    }, [section.groups]);

    return (
        <Card className="mb-6 overflow-hidden">
            {/* Mobile-First Section Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                <div className="space-y-4">
                    {/* Section Number and Drag Handle */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-lg flex items-center justify-center shadow-md">
                            {index + 1}
                        </div>
                        <div className="p-2 text-gray-400 hover:text-gray-600 cursor-grab rounded-lg hover:bg-white/50 transition-colors touch-manipulation">
                            <GripVertical size={20} />
                        </div>
                        <div className="flex-1">
                            <Badge variant="default" className="text-xs">
                                Section {index + 1}
                            </Badge>
                        </div>
                    </div>

                    {/* Section Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <Label className="flex items-center gap-2">
                                <BookOpen size={16} className="text-blue-600" />
                                Section Title
                            </Label>
                            <Input
                                value={section.title}
                                onChange={(e) => onEdit({ ...section, title: e.target.value })}
                                placeholder="e.g., Section A"
                                className="text-lg font-semibold"
                            />
                        </div>

                        <div>
                            <Label className="flex items-center gap-2">
                                <AlertCircle size={16} className="text-green-600" />
                                Instructions
                            </Label>
                            <Textarea
                                value={section.instruction}
                                onChange={(e) => onEdit({ ...section, instruction: e.target.value })}
                                placeholder="Enter instructions for this section..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Mobile Actions and Stats */}
                    <div className="space-y-3">
                        {/* Action Buttons - Full Width on Mobile */}
                        <div className="flex gap-2">
                            <Button
                                onClick={addSection}
                                variant="success"
                                className="w-full shadow-lg"
                            >
                                <Plus size={18} className="mr-2" />
                                Add Section
                            </Button>
                            <Button
                                onClick={() => onDelete(section.id)}
                                variant="danger"
                                className="shadow-md px-4"
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>

                        {/* Stats - Mobile Grid */}
                        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                            <div className="text-xs text-gray-600 mb-2 font-semibold text-center">Section Summary</div>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <div className="font-bold text-blue-600 text-lg">{section.groups.length}</div>
                                    <div className="text-xs text-gray-500">Groups</div>
                                </div>
                                <div>
                                    <div className="font-bold text-green-600 text-lg">{sectionStats.totalQuestions}</div>
                                    <div className="text-xs text-gray-500">Questions</div>
                                </div>
                                <div>
                                    <div className="font-bold text-purple-600 text-lg">{sectionStats.totalMarks}</div>
                                    <div className="text-xs text-gray-500">Marks</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Groups Section */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Target size={18} className="text-indigo-600" />
                        <Label className="text-lg mb-0 font-bold">Groups</Label>
                        <Badge variant="default" className="text-xs">
                            {section.groups.length}
                        </Badge>
                    </div>

                    <Button
                        onClick={() => onAddGroup(section.id)}
                        size="sm"
                        className="shadow-md"
                    >
                        <Plus size={14} className="mr-1" />
                        Add
                    </Button>
                </div>

                {section.groups.length === 0 ? (
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-300">
                        <div className="p-4 bg-white rounded-2xl shadow-md w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Plus size={32} className="text-gray-400" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-2">No groups yet</h4>
                        <p className="text-gray-600 mb-4 text-sm">
                            Add question groups to define different types of questions.
                        </p>
                        <Button
                            onClick={() => onAddGroup(section.id)}
                            className="shadow-lg"
                        >
                            <Plus size={18} className="mr-2" />
                            Add First Group
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {section.groups.map((group, groupIndex) => (
                            <QuestionGroupComponent
                                key={group.id}
                                group={group}
                                groupIndex={groupIndex}
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
                            />
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};

const TemplateBuilder = () => {
    const [sections, setSections] = useState([
        {
            id: '1',
            title: 'Section A',
            instruction: 'Answer all questions in this section',
            groups: []
        }
    ]);

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

    const addSection = () => {
        const newSection = {
            id: Date.now().toString(),
            title: `Section ${String.fromCharCode(65 + sections.length)}`,
            instruction: 'Answer all questions in this section',
            groups: []
        };
        setSections(prev => [...prev, newSection]);
    };

    const deleteSection = (sectionId) => {
        if (sections.length <= 1) return;
        setSections(prev => prev.filter(sec => sec.id !== sectionId));
    };

    const updateSection = (updatedSection) => {
        setSections(prev => prev.map(sec =>
            sec.id === updatedSection.id ? updatedSection : sec
        ));
    };

    const addQuestionGroup = (sectionId) => {
        const group = {
            id: Date.now().toString(),
            type: 'mcq',
            instruction: '',
            numberingStyle: 'numeric',
            questionsCount: 5,
            marksPerQuestion: 2
        };

        setSections(prev => prev.map(sec =>
            sec.id === sectionId
                ? { ...sec, groups: [...sec.groups, group] }
                : sec
        ));
    };

    const saveTemplate = () => {
        const templateData = {
            sections,
            totals,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log('Saving template:', templateData);
        alert('Template saved successfully!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <div className="max-w-4xl mx-auto p-4">
                {/* Mobile-First Header */}
                <Card className="mb-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" size="sm">
                                    <ArrowLeft size={18} className="mr-2" />
                                    Back
                                </Button>
                                <div className="flex-1">
                                    <h1 className="text-xl font-bold">Create Template</h1>
                                    <p className="text-blue-100 text-sm">Design your exam structure</p>
                                </div>
                            </div>

                            <Button
                                onClick={saveTemplate}
                                className="w-full bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                            >
                                <Save size={18} className="mr-2" />
                                Save Template
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Stats Grid */}
                    <div className="p-4 bg-white">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                <div className="text-2xl font-bold text-blue-600 mb-1">{sections.length}</div>
                                <div className="text-blue-700 font-semibold text-sm">Sections</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                                <div className="text-2xl font-bold text-green-600 mb-1">{totals.totalGroups}</div>
                                <div className="text-green-700 font-semibold text-sm">Groups</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                <div className="text-2xl font-bold text-purple-600 mb-1">{totals.totalQuestions}</div>
                                <div className="text-purple-700 font-semibold text-sm">Questions</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                                <div className="text-2xl font-bold text-orange-600 mb-1">{totals.totalMarks}</div>
                                <div className="text-orange-700 font-semibold text-sm">Marks</div>
                            </div>
                        </div>
                    </div>
                </Card>


                {/* Main Content */}
                {sections.length === 0 ? (
                    <Card className="text-center py-12">
                        <div className="max-w-xs mx-auto">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg">
                                <Plus size={40} className="text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Create?</h3>
                            <p className="text-gray-600 mb-4 text-sm">
                                Start building your exam template with sections and question groups.
                            </p>
                            <Button
                                onClick={addSection}
                                className="w-full shadow-lg"
                            >
                                <Plus size={18} className="mr-2" />
                                Create First Section
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {sections.map((section, index) => (
                            <SectionComponent
                                key={section.id}
                                section={section}
                                index={index}
                                onEdit={updateSection}
                                onDelete={deleteSection}
                                onAddGroup={addQuestionGroup}
                                addSection={addSection}
                            />
                        ))}
                    </div>
                )}

                {/* Bottom Save Button */}
                {sections.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Save Your Template?</h3>
                                <p className="text-gray-600">
                                    Your template contains {sections.length} section{sections.length !== 1 ? 's' : ''} with {totals.totalQuestions} questions totaling {totals.totalMarks} marks.
                                </p>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Button onClick={saveTemplate} variant="primary" size="lg" className="min-w-[200px]">
                                    <Save className="w-5 h-5 mr-2" />
                                    Save Template
                                </Button>


                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateBuilder;