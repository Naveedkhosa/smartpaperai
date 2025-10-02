// src/pages/TemplatesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileText, MoreVertical, Edit, Trash2, Download, BookOpen, FileDigit, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import TeacherSidebar from '@/components/TeacherSidebar';

interface Template {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  totalMarks: number;
  sections: number;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

// Select Components (copied from TemplateBuilder for consistency)
const Select = ({ children, value, onValueChange, placeholder = "Select...", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = React.Children.toArray(children).find(child =>
    child.props.value === value
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base bg-white text-left min-h-[52px]
                   focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 
                   transition-all duration-300 flex items-center justify-between hover:border-gray-400 touch-manipulation
                   ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
        disabled={disabled}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption ? selectedOption.props.children : placeholder}
        </span>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
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
    className="px-4 py-3 text-base hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl touch-manipulation min-h-[52px] flex items-center"
  >
    {children}
  </div>
);

const Label = ({ children, className = "", ...props }) => (
  <label className={`block text-sm font-bold text-gray-800 mb-2 ${className}`} {...props}>
    {children}
  </label>
);

const TemplatesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  
  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    class: '',
    subject: ''
  });

  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Class and subject options
  const classOptions = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12'
  ];

  const subjectOptions = {
    'Class 1': ['English', 'Mathematics', 'Science', 'Social Studies'],
    'Class 2': ['English', 'Mathematics', 'Science', 'Social Studies'],
    'Class 3': ['English', 'Mathematics', 'Science', 'Social Studies'],
    'Class 4': ['English', 'Mathematics', 'Science', 'Social Studies'],
    'Class 5': ['English', 'Mathematics', 'Science', 'Social Studies'],
    'Class 6': ['English', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'],
    'Class 7': ['English', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'],
    'Class 8': ['English', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'],
    'Class 9': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
    'Class 10': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
    'Class 11': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English'],
    'Class 12': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English']
  };

  // Mock data
  useEffect(() => {
    const mockTemplates: Template[] = [
      {
        id: '1',
        title: 'Mathematics Final Exam Template',
        description: 'Comprehensive math exam covering algebra, geometry, and calculus with multiple choice and problem-solving questions',
        totalQuestions: 25,
        totalMarks: 100,
        sections: 4,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        isPublic: true
      },
      {
        id: '2',
        title: 'Science Quiz Template',
        description: 'Quick assessment template for physics and chemistry concepts',
        totalQuestions: 15,
        totalMarks: 50,
        sections: 2,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18',
        isPublic: false
      },
      {
        id: '3',
        title: 'English Comprehension Template',
        description: 'Reading comprehension and grammar assessment template',
        totalQuestions: 30,
        totalMarks: 100,
        sections: 3,
        createdAt: '2024-01-08',
        updatedAt: '2024-01-12',
        isPublic: true
      },
      {
        id: '4',
        title: 'History Exam Template',
        description: 'World history examination with essay and short answer questions',
        totalQuestions: 20,
        totalMarks: 80,
        sections: 3,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-10',
        isPublic: true
      }
    ];

    setTimeout(() => {
      setTemplates(mockTemplates);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClassChange = (selectedClass: string) => {
    setNewTemplate(prev => ({
      ...prev,
      class: selectedClass,
      subject: '' // Reset subject when class changes
    }));
    
    // Load subjects based on selected class
    if (subjectOptions[selectedClass]) {
      setAvailableSubjects(subjectOptions[selectedClass]);
    } else {
      setAvailableSubjects([]);
    }
  };

  const handleCreateNew = () => {
    setIsCreatePopupOpen(true);
  };

  const handleSaveNewTemplate = () => {
    if (!newTemplate.name || !newTemplate.class || !newTemplate.subject) {
      alert('Please fill in all fields');
      return;
    }

    // Generate a new template ID
    const newTemplateId = Date.now().toString();
    
    // Navigate to template builder with the new template details
    navigate(`/templates/builder?edit=${newTemplateId}`, {
      state: {
        templateDetails: newTemplate
      }
    });
  };

  const handleClosePopup = () => {
    setIsCreatePopupOpen(false);
    setNewTemplate({
      name: '',
      class: '',
      subject: ''
    });
    setAvailableSubjects([]);
  };

  const handleEditTemplate = (id: string) => {
    navigate(`/templates/builder?edit=${id}`);
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleDuplicateTemplate = (template: Template) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      title: `${template.title} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  if (isLoading) {
    return (
      <GlassmorphismLayout>
        <div className="flex">
          <TeacherSidebar />
          <div className="flex-1 ml-0 lg:ml-0 min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-300"></div>
          </div>
        </div>
      </GlassmorphismLayout>
    );
  }

  return (
    <GlassmorphismLayout>
      <div className="flex">
        <TeacherSidebar />
        <div className="flex-1 ml-0 lg:ml-0 min-h-screen p-0">
          <div className="container mx-auto p-4">
            {/* Header */}
            <div className="glassmorphism-strong rounded-2xl p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Exam Templates</h1>
                  <p className="text-slate-200/90">
                    Create and manage reusable exam templates for your classes
                  </p>
                </div>
                <Button
                  onClick={handleCreateNew}
                  className="emerald-gradient"
                >
                  <Plus size={20} className="mr-2" />
                  New Template
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="glassmorphism-strong rounded-xl p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input pl-10"
                />
              </div>
            </div>

            {/* Create Template Popup */}
            {isCreatePopupOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="glassmorphism-strong rounded-2xl p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Create New Template</h2>
                    <Button
                      variant="ghost"
                      onClick={handleClosePopup}
                      className="text-slate-300 hover:text-white p-2"
                    >
                      <X size={20} />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Template Name</Label>
                      <Input
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter template name"
                        className="glass-input mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Class</Label>
                      <Select
                        value={newTemplate.class}
                        onValueChange={handleClassChange}
                        placeholder="Select Class"
                      >
                        {classOptions.map((classOption) => (
                          <SelectItem key={classOption} value={classOption}>
                            {classOption}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white">Subject</Label>
                      <Select
                        value={newTemplate.subject}
                        onValueChange={(value) => setNewTemplate(prev => ({ ...prev, subject: value }))}
                        placeholder={newTemplate.class ? "Select Subject" : "Select Class First"}
                        disabled={!newTemplate.class}
                      >
                        {availableSubjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={handleClosePopup}
                      className="flex-1 border-slate-400 text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveNewTemplate}
                      disabled={!newTemplate.name || !newTemplate.class || !newTemplate.subject}
                      className="flex-1 emerald-gradient"
                    >
                      Create Template
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Templates Grid */}
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="relative group overflow-hidden rounded-xl border border-white/30 hover:border-emerald-400/40 transition-all bg-slate-900">
                    {/* Header */}
                    <div className="h-32 w-full flex items-center justify-center relative overflow-hidden bg-slate-800">
                      <div className="text-6xl text-slate-400">
                        <FileText />
                      </div>
                      
                      {/* Title overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm font-bold p-2">
                        <p className="line-clamp-1">{template.title}</p>
                      </div>
                    </div>

                    {/* Info with icons */}
                    <div className="flex items-center justify-between p-3 border-t border-white/20 bg-slate-800/50">
                      <div className="flex items-center gap-2 text-slate-200 text-xs">
                        <FileDigit size={16} />
                        <span>{template.totalQuestions} Qs</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-200 text-xs">
                        <BookOpen size={16} />
                        <span>{template.totalMarks} Marks</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-200 text-xs">
                        <span>{template.sections} Sections</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="p-3">
                      <p className="text-slate-300 text-sm line-clamp-2 mb-3">
                        {template.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs">
                          Updated {new Date(template.updatedAt).toLocaleDateString()}
                        </span>
                        {template.isPublic ? (
                          <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs">
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400 border-slate-400/30 text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                      <p className="text-slate-200 text-sm line-clamp-3 mb-4">
                        {template.description}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTemplate(template.id)}
                          className="p-2 rounded-full bg-blue-500 hover:bg-blue-400 text-white"
                        >
                          <Edit size={16} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateTemplate(template)}
                          className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-400 text-white"
                        >
                          <Download size={16} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-2 rounded-full bg-red-500 hover:bg-red-400 text-white"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="glassmorphism-strong rounded-xl p-12 text-center">
                <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl text-white mb-2">No templates found</h3>
                <p className="text-slate-300/80 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Get started by creating your first template'
                  }
                </p>
                <Button onClick={handleCreateNew} className="emerald-gradient">
                  <Plus size={20} className="mr-2" />
                  Create Template
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassmorphismLayout>
  );
};

export default TemplatesPage;