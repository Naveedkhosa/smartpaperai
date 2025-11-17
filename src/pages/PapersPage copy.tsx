import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, FileText, Edit, Trash2, Download, 
  Eye, Calendar, BookOpen, FileDigit, Loader2, Copy
} from 'lucide-react';
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import TeacherSidebar from '@/components/TeacherSidebar';
import { useNavigate } from "react-router-dom";
import { ApiService } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";

interface Paper {
  id: string;
  title: string;
  user_id: number;
  class_id: number;
  subject_id: number;
  created_by: string;
  uploaded_paper_file: string | null;
  data_source: string | null;
  duration: number;
  total_marks: number;
  created_at: string;
  updated_at: string;
  sections: any[];
  student_class?: {
    id: number;
    name: string;
  };
  subject?: {
    id: number;
    name: string;
  };
}

const PapersPage = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Debug function to check token
  const checkToken = () => {
    const token = localStorage.getItem('smartpaper_token');
    const user = localStorage.getItem('smartpaper_user');
    
    console.log('🔑 Token from localStorage:', token);
    console.log('👤 User from localStorage:', user);
    
    if (!token) {
      console.error('❌ No token found in localStorage');
      return false;
    }
    
    return true;
  };

  // Fetch papers from API
  const fetchPapers = async () => {
    try {
      setIsLoading(true);
      
      // Check if token exists
      if (!checkToken()) {
        console.log('Redirecting to login...');
        navigate('/login');
        return;
      }

      console.log('📡 Fetching papers from API...');
      
      const response = await papersApi.getAll();
      
      console.log('📦 API Response:', response);
      
      if (response.status && response.data && response.data.papers) {
        setPapers(response.data.papers);
        console.log(`✅ Loaded ${response.data.papers.length} papers`);
      } else {
        console.error('❌ Invalid API response format:', response);
        // Fallback to mock data for development
        setPapers(getMockPapers());
      }
    } catch (error) {
      console.error('❌ Error fetching papers:', error);
      // Fallback to mock data if API fails
      setPapers(getMockPapers());
    } finally {
      setIsLoading(false);
    }
  };

  // Delete paper
  const handleDeletePaper = async (id: string) => {
    try {
      setDeletingId(id);
      
      const response = await papersApi.delete(id);
      
      if (response.status) {
        setPapers(prev => prev.filter(p => p.id !== id));
        console.log('✅ Paper deleted successfully');
      } else {
        throw new Error('Failed to delete paper');
      }
    } catch (error) {
      console.error('❌ Error deleting paper:', error);
      // Fallback: remove from local state even if API fails
      setPapers(prev => prev.filter(p => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  // Mock data fallback
  const getMockPapers = (): Paper[] => [
    {
      id: '1',
      title: 'Mathematics Final Exam 2024',
      user_id: 1,
      class_id: 1,
      subject_id: 1,
      created_by: 'manual',
      uploaded_paper_file: null,
      data_source: 'personal',
      duration: 120,
      total_marks: 100,
      created_at: '2024-01-15T00:00:00.000000Z',
      updated_at: '2024-01-20T00:00:00.000000Z',
      sections: [],
      student_class: { id: 1, name: '10th Grade' },
      subject: { id: 1, name: 'Mathematics' }
    },
    {
      id: '2',
      title: 'Science Midterm Assessment',
      user_id: 1,
      class_id: 2,
      subject_id: 2,
      created_by: 'manual',
      uploaded_paper_file: null,
      data_source: 'personal',
      duration: 90,
      total_marks: 80,
      created_at: '2024-01-10T00:00:00.000000Z',
      updated_at: '2024-01-18T00:00:00.000000Z',
      sections: [],
      student_class: { id: 2, name: '9th Grade' },
      subject: { id: 2, name: 'Science' }
    },
    {
      id: '3',
      title: 'English Literature Test',
      user_id: 1,
      class_id: 3,
      subject_id: 3,
      created_by: 'manual',
      uploaded_paper_file: null,
      data_source: 'personal',
      duration: 120,
      total_marks: 100,
      created_at: '2024-01-08T00:00:00.000000Z',
      updated_at: '2024-01-12T00:00:00.000000Z',
      sections: [],
      student_class: { id: 3, name: '11th Grade' },
      subject: { id: 3, name: 'English' }
    }
  ];

  const handleDuplicatePaper = (paper: Paper) => {
    const newPaper = {
      ...paper,
      id: Date.now().toString(),
      title: `${paper.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setPapers(prev => [...prev, newPaper]);
  };

  const getTotalQuestions = (paper: Paper) => {
    if (!paper.sections || paper.sections.length === 0) return 0;
    
    let totalQuestions = 0;
    paper.sections.forEach(section => {
      if (section.section_groups) {
        section.section_groups.forEach((group: any) => {
          if (group.questions) {
            totalQuestions += group.questions.length;
          }
        });
      }
    });
    return totalQuestions;
  };

  const getSubjectColor = (subjectName: string) => {
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
    return colors[subjectName] || 'from-slate-500 to-slate-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const filteredPapers = papers.filter(paper =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (paper.subject?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (paper.student_class?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPapers = filteredPapers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);

  // Enhanced Loading Animation Component
  const LoadingAnimation = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 md:p-8 mb-6 border border-white/10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded-lg w-1/3"></div>
            <div className="h-4 bg-white/10 rounded-lg w-1/2"></div>
            <div className="flex gap-4 mt-4">
              <div className="h-4 bg-white/10 rounded-lg w-24"></div>
              <div className="h-4 bg-white/10 rounded-lg w-24"></div>
            </div>
          </div>
        </div>

        {/* Search Skeleton */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/10">
          <div className="h-12 bg-white/10 rounded-xl animate-pulse"></div>
        </div>

        {/* Papers Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
              <div className="animate-pulse">
                {/* Header Gradient */}
                <div className="h-32 bg-gradient-to-br from-slate-600 to-slate-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
                
                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Title */}
                  <div className="h-6 bg-white/10 rounded w-3/4"></div>
                  
                  {/* Description */}
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded w-full"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="h-4 bg-white/10 rounded w-16"></div>
                    <div className="w-px h-6 bg-white/10"></div>
                    <div className="h-4 bg-white/10 rounded w-16"></div>
                    <div className="w-px h-6 bg-white/10"></div>
                    <div className="h-4 bg-white/10 rounded w-16"></div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-white/10 rounded w-20"></div>
                    <div className="h-6 bg-white/10 rounded w-16"></div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="h-10 bg-white/10 rounded-lg"></div>
                    <div className="h-10 bg-white/10 rounded-lg"></div>
                    <div className="h-10 bg-white/10 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <GlassmorphismLayout>
        <div className="flex">
          <TeacherSidebar />
          <LoadingAnimation />
        </div>
      </GlassmorphismLayout>
    );
  }

  return (
  <GlassmorphismLayout>
            <div className="flex">
                <TeacherSidebar />
                <div className="flex-1 ml-0 lg:ml-0 min-h-screen p-0">
                    <div className="container mx-auto">
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
                      {papers.length} Active
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
                      <div className={`h-32 bg-gradient-to-br ${getSubjectColor(paper.subject?.name || 'Default')} relative overflow-hidden`}>
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
                          {paper.data_source === 'personal' ? 'Manually created paper' : 'Uploaded paper'} • {paper.duration} minutes
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2 text-slate-300">
                            <FileDigit size={16} className="text-emerald-400" />
                            <span className="text-sm font-medium">{getTotalQuestions(paper)} Qs</span>
                          </div>
                          <div className="w-px h-6 bg-white/10"></div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <BookOpen size={16} className="text-blue-400" />
                            <span className="text-sm font-medium">{paper.total_marks} Marks</span>
                          </div>
                          <div className="w-px h-6 bg-white/10"></div>
                          <div className="text-slate-300 text-sm font-medium">
                            {paper.sections?.length || 0} Sections
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-white/10 rounded-full text-slate-300">
                              {paper.subject?.name || 'Unknown Subject'}
                            </span>
                            <span className="text-slate-400">
                              {paper.student_class?.name || 'Unknown Class'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <span className="text-slate-400 text-xs flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(paper.updated_at)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            paper.created_by === 'manual' 
                              ? 'bg-emerald-500/20 text-emerald-300' 
                              : 'bg-slate-500/20 text-slate-300'
                          }`}>
                            {paper.created_by === 'manual' ? 'Manual' : 'Uploaded'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <button
                            onClick={() => navigate(`/teacher/papers/${paper.id}`)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all text-sm"
                            title="Preview"
                          >
                            <Eye size={16} />
                            <span className="hidden sm:inline">View</span>
                          </button>
                          
                          <button
                            onClick={() => navigate(`/teacher/paper-builder/${paper.id}`)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-all text-sm"
                            title="Edit"
                          >
                            <Edit size={16} />
                            <span className="hidden sm:inline">Builder</span>
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
                                onClick={() => handleDuplicatePaper(paper?.id)}
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