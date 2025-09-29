// src/pages/PapersPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, FileText, MoreVertical, Edit, Trash2, Download, 
  Eye, Calendar, User, BookOpen, FileDigit, Loader2 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import TeacherSidebar from '@/components/TeacherSidebar';

interface Paper {
  id: string;
  title: string;
  description: string;
  subject: string;
  class: string;
  totalQuestions: number;
  totalMarks: number;
  sections: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isPublic: boolean;
  status: 'draft' | 'published' | 'archived';
}

const PapersPage = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Mock data
  useEffect(() => {
    const mockPapers: Paper[] = [
      {
        id: '1',
        title: 'Mathematics Final Exam 2024',
        description: 'Comprehensive mathematics examination covering algebra, geometry, and calculus with multiple choice and problem-solving questions',
        subject: 'Mathematics',
        class: '10th Grade',
        totalQuestions: 25,
        totalMarks: 100,
        sections: 4,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        createdBy: 'John Smith',
        isPublic: true,
        status: 'published'
      },
      {
        id: '2',
        title: 'Science Midterm Assessment',
        description: 'Physics and chemistry concepts evaluation with practical applications',
        subject: 'Science',
        class: '9th Grade',
        totalQuestions: 20,
        totalMarks: 80,
        sections: 3,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18',
        createdBy: 'Sarah Johnson',
        isPublic: false,
        status: 'published'
      },
      {
        id: '3',
        title: 'English Literature Test',
        description: 'Reading comprehension and grammar assessment with essay writing',
        subject: 'English',
        class: '11th Grade',
        totalQuestions: 30,
        totalMarks: 100,
        sections: 5,
        createdAt: '2024-01-08',
        updatedAt: '2024-01-12',
        createdBy: 'Mike Wilson',
        isPublic: true,
        status: 'published'
      },
      {
        id: '4',
        title: 'History Final Paper',
        description: 'World history examination with timeline and essay questions',
        subject: 'History',
        class: '8th Grade',
        totalQuestions: 18,
        totalMarks: 75,
        sections: 3,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-10',
        createdBy: 'Emma Davis',
        isPublic: true,
        status: 'draft'
      },
      {
        id: '5',
        title: 'Computer Science Quiz',
        description: 'Programming fundamentals and computer concepts assessment',
        subject: 'Computer Science',
        class: '12th Grade',
        totalQuestions: 15,
        totalMarks: 60,
        sections: 2,
        createdAt: '2024-01-03',
        updatedAt: '2024-01-08',
        createdBy: 'Alex Brown',
        isPublic: false,
        status: 'published'
      },
      {
        id: '6',
        title: 'Physics Practical Exam',
        description: 'Laboratory-based physics concepts and calculations',
        subject: 'Physics',
        class: '11th Grade',
        totalQuestions: 12,
        totalMarks: 50,
        sections: 2,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-06',
        createdBy: 'Robert Taylor',
        isPublic: true,
        status: 'archived'
      },
      {
        id: '7',
        title: 'Chemistry Semester Test',
        description: 'Organic and inorganic chemistry concepts with equations',
        subject: 'Chemistry',
        class: '10th Grade',
        totalQuestions: 22,
        totalMarks: 85,
        sections: 4,
        createdAt: '2023-12-28',
        updatedAt: '2024-01-04',
        createdBy: 'Lisa Anderson',
        isPublic: true,
        status: 'published'
      },
      {
        id: '8',
        title: 'Biology Assessment',
        description: 'Life sciences and biological systems examination',
        subject: 'Biology',
        class: '9th Grade',
        totalQuestions: 28,
        totalMarks: 95,
        sections: 4,
        createdAt: '2023-12-25',
        updatedAt: '2024-01-02',
        createdBy: 'James Miller',
        isPublic: false,
        status: 'draft'
      }
    ];

    // Simulate API call delay
    setTimeout(() => {
      setPapers(mockPapers);
      setIsLoading(false);
    }, 1500);
  }, []);

  // Filter papers based on search term
  const filteredPapers = papers.filter(paper =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPapers = filteredPapers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);

  const handleCreateNew = () => {
    navigate('/teacher/create');
  };

  const handleEditPaper = (id: string) => {
    navigate(`/teacher/paper-builder/${id}`);
  };

  const handleDeletePaper = async (id: string) => {
    setDeletingId(id);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPapers(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  };

  const handleDownloadPaper = (paper: Paper) => {
    // Simulate download
    console.log('Downloading paper:', paper.title);
    // In real implementation, this would trigger PDF generation/download
  };

  const handlePreviewPaper = (paper: Paper) => {
    // Open paper preview
    console.log('Previewing paper:', paper.title);
    // In real implementation, this would open a preview modal
  };

  const handleDuplicatePaper = (paper: Paper) => {
    const newPaper = {
      ...paper,
      id: Date.now().toString(),
      title: `${paper.title} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'draft' as const
    };
    setPapers(prev => [...prev, newPaper]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400 border-green-400/30';
      case 'draft': return 'text-yellow-400 border-yellow-400/30';
      case 'archived': return 'text-gray-400 border-gray-400/30';
      default: return 'text-slate-400 border-slate-400/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Published';
      case 'draft': return 'Draft';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  // Loading animation
  if (isLoading) {
    return (
      <GlassmorphismLayout>
        <div className="flex">
          <TeacherSidebar />
          <div className="flex-1 ml-0 lg:ml-0 min-h-screen p-0">
            <div className="container mx-auto p-4">
              {/* Header Skeleton */}
              <div className="glassmorphism-strong rounded-2xl p-6 mb-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-slate-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>

              {/* Search Skeleton */}
              <div className="glassmorphism-strong rounded-xl p-4 mb-6">
                <div className="animate-pulse">
                  <div className="h-10 bg-slate-700 rounded"></div>
                </div>
              </div>

              {/* Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <Card key={index} className="bg-slate-900 border-white/30 rounded-xl overflow-hidden">
                    <div className="animate-pulse">
                      <div className="h-32 bg-slate-800"></div>
                      <div className="p-3 border-t border-white/20 bg-slate-800/50">
                        <div className="flex justify-between">
                          <div className="h-4 bg-slate-700 rounded w-16"></div>
                          <div className="h-4 bg-slate-700 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="h-4 bg-slate-700 rounded mb-2"></div>
                        <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                        <div className="flex justify-between mt-3">
                          <div className="h-3 bg-slate-700 rounded w-20"></div>
                          <div className="h-6 bg-slate-700 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
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
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Exam Papers</h1>
                  <p className="text-slate-200/90">
                    Manage and organize your examination papers
                  </p>
                </div>
                <Button
                  onClick={handleCreateNew}
                  className="emerald-gradient"
                >
                  <Plus size={20} className="mr-2" />
                  Create New Paper
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="glassmorphism-strong rounded-xl p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search papers by title, subject, or class..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="glass-input pl-10"
                />
              </div>
            </div>

            {/* Papers Grid */}
            {currentPapers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                  {currentPapers.map((paper) => (
                    <Card key={paper.id} className="relative group overflow-hidden rounded-xl border border-white/30 hover:border-emerald-400/40 transition-all bg-slate-900">
                      {/* Header with Status */}
                      <div className="h-32 w-full flex items-center justify-center relative overflow-hidden bg-slate-800">
                        <div className="text-6xl text-slate-400">
                          <FileText />
                        </div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge variant="outline" className={`text-xs ${getStatusColor(paper.status)}`}>
                            {getStatusText(paper.status)}
                          </Badge>
                        </div>
                        
                        {/* Title overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm font-bold p-2">
                          <p className="line-clamp-1">{paper.title}</p>
                        </div>
                      </div>

                      {/* Info with icons */}
                      <div className="flex items-center justify-between p-3 border-t border-white/20 bg-slate-800/50">
                        <div className="flex items-center gap-2 text-slate-200 text-xs">
                          <FileDigit size={16} />
                          <span>{paper.totalQuestions} Qs</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-200 text-xs">
                          <BookOpen size={16} />
                          <span>{paper.totalMarks} Marks</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-200 text-xs">
                          <span>{paper.sections} Sections</span>
                        </div>
                      </div>

                      {/* Description and Details */}
                      <div className="p-3">
                        <p className="text-slate-300 text-sm line-clamp-2 mb-3">
                          {paper.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <BookOpen size={12} />
                            <span>{paper.subject}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <User size={12} />
                            <span>{paper.class}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-xs">
                            <Calendar size={12} className="inline mr-1" />
                            Updated {new Date(paper.updatedAt).toLocaleDateString()}
                          </span>
                          {paper.isPublic ? (
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
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-slate-200 text-sm line-clamp-3 mb-4">
                          {paper.description}
                        </p>
                        
                        <div className="flex gap-2 flex-wrap justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewPaper(paper)}
                            className="p-2 rounded-full bg-blue-500 hover:bg-blue-400 text-white"
                            title="Preview"
                          >
                            <Eye size={16} />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPaper(paper.id)}
                            className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPaper(paper)}
                            className="p-2 rounded-full bg-purple-500 hover:bg-purple-400 text-white"
                            title="Download"
                          >
                            <Download size={16} />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicatePaper(paper)}
                            className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-400 text-white"
                            title="Duplicate"
                          >
                            <FileText size={16} />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePaper(paper.id)}
                            disabled={deletingId === paper.id}
                            className="p-2 rounded-full bg-red-500 hover:bg-red-400 text-white"
                            title="Delete"
                          >
                            {deletingId === paper.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="glassmorphism-strong rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="text-slate-300 text-sm">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPapers.length)} of {filteredPapers.length} papers
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="text-slate-300 border-white/20 hover:bg-white/10"
                        >
                          Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {[...Array(totalPages)].map((_, index) => (
                            <Button
                              key={index + 1}
                              variant={currentPage === index + 1 ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(index + 1)}
                              className={currentPage === index + 1 ? "emerald-gradient" : "text-slate-300 border-white/20 hover:bg-white/10"}
                            >
                              {index + 1}
                            </Button>
                          ))}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="text-slate-300 border-white/20 hover:bg-white/10"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="glassmorphism-strong rounded-xl p-12 text-center">
                <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl text-white mb-2">
                  {searchTerm ? 'No papers found' : 'No papers yet'}
                </h3>
                <p className="text-slate-300/80 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Get started by creating your first paper'
                  }
                </p>
                <Button onClick={handleCreateNew} className="emerald-gradient">
                  <Plus size={20} className="mr-2" />
                  Create Paper
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassmorphismLayout>
  );
};

export default PapersPage;