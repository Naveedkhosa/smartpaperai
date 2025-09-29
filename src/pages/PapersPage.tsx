import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, FileText, Edit, Trash2, Download, 
  Eye, Calendar, BookOpen, FileDigit, Loader2, Copy
} from 'lucide-react';
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import TeacherSidebar from '@/components/TeacherSidebar';
import TeacherHeader from '@/components/TeacherHeader';
import { useNavigate } from "react-router-dom";


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
}

const PapersPage = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();


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
        isPublic: true
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
        isPublic: false
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
        isPublic: true
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
        isPublic: true
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
        isPublic: false
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
        isPublic: true
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
        isPublic: true
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
        isPublic: false
      },
      {
        id: '9',
        title: 'Geography World Study',
        description: 'Comprehensive study of continents, climate, and cultures',
        subject: 'Geography',
        class: '7th Grade',
        totalQuestions: 20,
        totalMarks: 70,
        sections: 3,
        createdAt: '2023-12-20',
        updatedAt: '2023-12-28',
        createdBy: 'Nina Patel',
        isPublic: true
      }
    ];

    setTimeout(() => {
      setPapers(mockPapers);
      setIsLoading(false);
    }, 1200);
  }, []);

  const filteredPapers = papers.filter(paper =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPapers = filteredPapers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);

  const handleDeletePaper = async (id: string) => {
    setDeletingId(id);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPapers(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  };

  const handleDuplicatePaper = (paper: Paper) => {
    const newPaper = {
      ...paper,
      id: Date.now().toString(),
      title: `${paper.title} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setPapers(prev => [...prev, newPaper]);
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Mathematics': 'from-blue-500 to-indigo-600',
      'Science': 'from-green-500 to-emerald-600',
      'English': 'from-purple-500 to-pink-600',
      'History': 'from-amber-500 to-orange-600',
      'Computer Science': 'from-cyan-500 to-blue-600',
      'Physics': 'from-violet-500 to-purple-600',
      'Chemistry': 'from-rose-500 to-red-600',
      'Biology': 'from-teal-500 to-green-600',
      'Geography': 'from-orange-500 to-amber-600'
    };
    return colors[subject] || 'from-slate-500 to-slate-600';
  };

  if (isLoading) {
    return (
        <GlassmorphismLayout>
               <div className="flex">
                 <TeacherSidebar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 md:p-8 mb-6 border border-white/10">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/10 rounded-lg w-1/3"></div>
              <div className="h-4 bg-white/10 rounded-lg w-1/2"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-40 bg-white/10"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-full"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 md:p-8 mb-6 border border-white/10 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Exam Papers
              </h1>
              <p className="text-slate-300 text-base md:text-lg">
                Create, manage, and organize your examination papers
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-400 pt-2">
                <span className="flex items-center gap-2">
                  <FileText size={16} />
                  {papers.length} Total Papers
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen size={16} />
                  {papers.filter(p => p.isPublic).length} Public
                </span>
              </div>
            </div>
            <button
  onClick={() => navigate('/teacher/create')}
  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
>
  <Plus size={20} />
  Create New Paper
</button>

          </div>
        </div>

        {/* Search */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search papers by title, subject, or class..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Papers Grid */}
        {currentPapers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {currentPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="group bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:transform hover:scale-[1.02]"
                >
                  {/* Header with Gradient */}
                  <div className={`h-32 bg-gradient-to-br ${getSubjectColor(paper.subject)} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative h-full flex items-center justify-center">
                      <FileText size={48} className="text-white/90" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="text-white font-semibold text-lg line-clamp-1">
                        {paper.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    {/* Description */}
                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
                      {paper.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-slate-300">
                        <FileDigit size={16} className="text-emerald-400" />
                        <span className="text-sm font-medium">{paper.totalQuestions} Qs</span>
                      </div>
                      <div className="w-px h-6 bg-white/10"></div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <BookOpen size={16} className="text-blue-400" />
                        <span className="text-sm font-medium">{paper.totalMarks} Marks</span>
                      </div>
                      <div className="w-px h-6 bg-white/10"></div>
                      <div className="text-slate-300 text-sm font-medium">
                        {paper.sections} Sections
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-slate-300">
                          {paper.subject}
                        </span>
                        <span className="text-slate-400">
                          {paper.class}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(paper.updatedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        paper.isPublic 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-slate-500/20 text-slate-300'
                      }`}>
                        {paper.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <button
                        onClick={() => alert(`Previewing: ${paper.title}`)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all text-sm"
                        title="Preview"
                      >
                        <Eye size={16} />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      
                      <button
                        onClick={() => alert(`Editing: ${paper.title}`)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-all text-sm"
                        title="Edit"
                      >
                        <Edit size={16} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      
                      <div className="relative group/more">
                        <button
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-500/20 hover:bg-slate-500/30 text-slate-300 rounded-lg transition-all text-sm"
                        >
                          <span>More</span>
                        </button>
                        
                        {/* Dropdown */}
                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 border border-white/20 rounded-xl shadow-2xl opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all z-10">
                          <button
                            onClick={() => alert(`Downloading: ${paper.title}`)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:bg-white/10 transition-colors first:rounded-t-xl"
                          >
                            <Download size={16} className="text-purple-400" />
                            <span className="text-sm">Download</span>
                          </button>
                          <button
                            onClick={() => handleDuplicatePaper(paper)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:bg-white/10 transition-colors"
                          >
                            <Copy size={16} className="text-amber-400" />
                            <span className="text-sm">Duplicate</span>
                          </button>
                          <button
                            onClick={() => handleDeletePaper(paper.id)}
                            disabled={deletingId === paper.id}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-300 hover:bg-red-500/10 transition-colors last:rounded-b-xl disabled:opacity-50"
                          >
                            {deletingId === paper.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                            <span className="text-sm">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-slate-300 text-sm">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPapers.length)} of {filteredPapers.length} papers
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`w-10 h-10 rounded-lg transition-all ${
                            currentPage === index + 1
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 md:p-16 text-center border border-white/10">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                <FileText size={40} className="text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {searchTerm ? 'No papers found' : 'No papers yet'}
              </h3>
              <p className="text-slate-400 text-lg">
                {searchTerm 
                  ? 'Try adjusting your search terms to find what you\'re looking for' 
                  : 'Get started by creating your first examination paper'
                }
              </p>
              {!searchTerm && (
                <button
                 onClick={() => navigate('/teacher/create')}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 mx-auto mt-6"
                >
                  <Plus size={20} />
                  Create Your First Paper
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
     </GlassmorphismLayout>
  );
};

export default PapersPage;