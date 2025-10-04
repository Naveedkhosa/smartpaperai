import React, { useState, useEffect } from 'react';
import {
  Search, Plus, FileText, Edit, Trash2, Download,
  Eye, Calendar, BookOpen, FileDigit, Loader2, Copy,
  Clock, Award, MoreVertical, Grid, List, Filter
} from 'lucide-react';
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import TeacherSidebar from '@/components/TeacherSidebar';
import { useNavigate } from "react-router-dom";
import { ApiService } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_BASE_URL = 'https://apis.babalrukn.com/api';

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

interface ClassItem {
  id: number;
  name: string;
  description?: string;
}

interface SubjectItem {
  id: number;
  name: string;
  description?: string;
  class_id: number;
}

const PapersPage = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    classId: '',
    subjectId: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useAuth();

  // Fix: Create ApiService instance with proper base path
 





  const fetchClasses = async () => {
   
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/user/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const data = await response.json();
      if (data.status && data.data && data.data.classes) {
        setClasses(data.data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch classes',
        variant: 'destructive',
      });
    }
  };

  const fetchSubjects = async (classId: string) => {
   
    if (!token || !classId) {
      setSubjects([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/classes/${classId}/subjects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }

      const data = await response.json();
      setSubjects(data.data.class?.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch subjects',
        variant: 'destructive',
      });
    }
  };

  const fetchPapers = async () => {
    try {
      setIsLoading(true);
    
    
      console.log('📡 Fetching papers from API...');
    
      // Fix: Use the correct API endpoint structure
       const response = await ApiService.request(`/user/papers`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
              });
      
    
      console.log('📦 API Response:', response);
    
      if (response.status && response.data && response.data.papers) {
        setPapers(response.data.papers);
        console.log(`✅ Loaded ${response.data.papers.length} papers`);
      } else {
        console.error('❌ Invalid API response format:', response);
        toast({
          title: 'Error',
          description: 'Failed to load papers',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching papers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch papers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePaper = async () => {
    if (!editingPaper || !formData.title || !formData.duration || !formData.classId || !formData.subjectId) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        title: formData.title,
        duration: parseInt(formData.duration),
        class_id: parseInt(formData.classId),
        subject_id: parseInt(formData.subjectId),
      };

      // Fix: Use static method with correct endpoint
      const response = await ApiService.put(`/user/papers/${editingPaper.id}`, payload);
    
      if (response.status) {
        await fetchPapers();
        setIsEditDialogOpen(false);
        setEditingPaper(null);
        toast({
          title: 'Success',
          description: 'Paper updated successfully',
        });
      } else {
        throw new Error(response.message || 'Failed to update paper');
      }
    } catch (error) {
      console.error('❌ Error updating paper:', error);
      toast({
        title: 'Error',
        description: 'Failed to update paper',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePaper = async (id: string) => {
    try {
      setDeletingId(id);
    
      // Fix: Use static method with correct endpoint
      const response = await ApiService.delete(`/user/papers/${id}`);
    
      if (response.status) {
        setPapers(prev => prev.filter(p => p.id !== id));
        toast({
          title: 'Success',
          description: 'Paper deleted successfully',
        });
      } else {
        throw new Error(response.message || 'Failed to delete paper');
      }
    } catch (error) {
      console.error('❌ Error deleting paper:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete paper',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setActiveDropdown(null);
    }
  };

  const openEditDialog = (paper: Paper) => {
    setEditingPaper(paper);
    setFormData({
      title: paper.title,
      duration: paper.duration.toString(),
      classId: paper.class_id.toString(),
      subjectId: paper.subject_id.toString(),
    });
    fetchSubjects(paper.class_id.toString());
    setIsEditDialogOpen(true);
    setActiveDropdown(null);
  };

  const handleClassChange = (value: string) => {
    setFormData(prev => ({ ...prev, classId: value, subjectId: '' }));
    if (value) {
      fetchSubjects(value);
    } else {
      setSubjects([]);
    }
  };

  const handleDuplicatePaper = async (paper: Paper) => {
    try {
      // Create a copy of the paper with modified title
      const duplicatePayload = {
        title: `${paper.title} (Copy)`,
        class_id: paper.class_id,
        subject_id: paper.subject_id,
        duration: paper.duration,
        created_by: 'manual',
        data_source: 'personal'
      };

      const response = await ApiService.post('/user/papers', duplicatePayload);
    
      if (response.status) {
        await fetchPapers();
        toast({
          title: 'Success',
          description: 'Paper duplicated successfully',
        });
      } else {
        throw new Error('Failed to duplicate paper');
      }
    } catch (error) {
      console.error('❌ Error duplicating paper:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate paper',
        variant: 'destructive',
      });
    } finally {
      setActiveDropdown(null);
    }
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
      'Mathematics': 'bg-blue-500',
      'Science': 'bg-green-500',
      'English': 'bg-purple-500',
      'History': 'bg-amber-500',
      'Computer Science': 'bg-cyan-500',
      'Physics': 'bg-violet-500',
      'Chemistry': 'bg-rose-500',
      'Biology': 'bg-teal-500',
      'Geography': 'bg-orange-500'
    };
    return colors[subjectName] || 'bg-slate-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    fetchClasses();
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

  const LoadingAnimation = () => (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 mb-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
                <div className="h-8 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
              <div className="animate-pulse">
                <div className="h-2 bg-gradient-to-r from-slate-600 to-slate-700"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-white/10 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-12 bg-white/10 rounded"></div>
                    <div className="h-12 bg-white/10 rounded"></div>
                    <div className="h-12 bg-white/10 rounded"></div>
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
        <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Exam Papers</h1>
                  <p className="text-slate-300">Manage and organize your examination papers</p>
                </div>
                <button
                  onClick={() => navigate('/teacher/create')}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Create New Paper
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-300 mb-1">Total Papers</p>
                      <p className="text-2xl font-bold text-white">{papers.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="text-blue-400" size={24} />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-300 mb-1">Active Papers</p>
                      <p className="text-2xl font-bold text-white">{papers.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="text-green-400" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-300 mb-1">Total Questions</p>
                      <p className="text-2xl font-bold text-white">
                        {papers.reduce((sum, p) => sum + getTotalQuestions(p), 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <FileDigit className="text-purple-400" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-300 mb-1">Total Marks</p>
                      <p className="text-2xl font-bold text-white">
                        {papers.reduce((sum, p) => sum + p.total_marks, 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Award className="text-amber-400" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and View Toggle */}
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by paper title, subject, or class..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex bg-white/10 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white/20 shadow-sm' : ''}`}
                    >
                      <Grid size={18} className={viewMode === 'grid' ? 'text-emerald-400' : 'text-slate-400'} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-white/20 shadow-sm' : ''}`}
                    >
                      <List size={18} className={viewMode === 'list' ? 'text-emerald-400' : 'text-slate-400'} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Papers Display */}
            {currentPapers.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6' : 'space-y-4 mb-6'}>
                  {currentPapers.map((paper) => (
                    viewMode === 'grid' ? (
                      <div key={paper.id} className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 hover:border-white/20 transition-all overflow-hidden group">
                        <div className={`h-2 ${getSubjectColor(paper.subject?.name || 'Default')}`}></div>
                        
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1 pr-2">
                              {paper.title}
                            </h3>
                            <div className="relative">
                              <button
                                onClick={() => setActiveDropdown(activeDropdown === paper.id ? null : paper.id)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              >
                                <MoreVertical size={18} className="text-slate-300" />
                              </button>
                              
                              {activeDropdown === paper.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-white/20 z-10">
                                  <button
                                    onClick={() => navigate(`/teacher/papers/${paper.id}`)}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2 first:rounded-t-lg"
                                  >
                                    <Eye size={16} className="text-blue-400" />
                                    Preview
                                  </button>
                                  <button
                                    onClick={() => navigate(`/teacher/paper-builder/${paper.id}`)}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                                  >
                                    <Edit size={16} className="text-green-400" />
                                    Edit Builder
                                  </button>
                                  <button
                                    onClick={() => openEditDialog(paper)}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                                  >
                                    <Edit size={16} className="text-amber-400" />
                                    Edit Details
                                  </button>
                                  <button
                                    onClick={() => alert(`Downloading: ${paper.title}`)}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                                  >
                                    <Download size={16} className="text-purple-400" />
                                    Download
                                  </button>
                                  <button
                                    onClick={() => handleDuplicatePaper(paper)}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                                  >
                                    <Copy size={16} className="text-cyan-400" />
                                    Duplicate
                                  </button>
                                  <button
                                    onClick={() => handleDeletePaper(paper.id)}
                                    disabled={deletingId === paper.id}
                                    className="w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-red-500/10 flex items-center gap-2 last:rounded-b-lg disabled:opacity-50"
                                  >
                                    {deletingId === paper.id ? (
                                      <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                      <Trash2 size={16} />
                                    )}
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getSubjectColor(paper.subject?.name || 'Default')}`}>
                                {paper.subject?.name || 'No Subject'}
                              </span>
                              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-slate-300">
                                {paper.student_class?.name || 'No Class'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-white/10">
                            <div className="text-center">
                              <p className="text-xs text-slate-400 mb-1">Duration</p>
                              <p className="text-sm font-semibold text-white flex items-center justify-center gap-1">
                                <Clock size={14} />
                                {paper.duration}m
                              </p>
                            </div>
                            <div className="text-center border-x border-white/10">
                              <p className="text-xs text-slate-400 mb-1">Questions</p>
                              <p className="text-sm font-semibold text-white">{getTotalQuestions(paper)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-slate-400 mb-1">Marks</p>
                              <p className="text-sm font-semibold text-white">{paper.total_marks}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(paper.updated_at)}
                            </span>
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full font-medium">
                              Active
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => navigate(`/teacher/papers/${paper.id}`)}
                              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <Eye size={16} />
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/teacher/paper-builder/${paper.id}`)}
                              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <Edit size={16} />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div key={paper.id} className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 hover:border-white/20 transition-all p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 h-12 ${getSubjectColor(paper.subject?.name || 'Default')} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <FileText className="text-white" size={24} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-white mb-1 truncate">{paper.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-slate-300 flex-wrap">
                                <span className="flex items-center gap-1 font-medium">{paper.subject?.name || 'No Subject'}</span>
                                <span>•</span>
                                <span>{paper.student_class?.name || 'No Class'}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {paper.duration} min
                                </span>
                                <span>•</span>
                                <span>{getTotalQuestions(paper)} Questions</span>
                                <span>•</span>
                                <span>{paper.total_marks} Marks</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">{formatDate(paper.updated_at)}</span>
                            <button
                              onClick={() => navigate(`/teacher/papers/${paper.id}`)}
                              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/teacher/paper-builder/${paper.id}`)}
                              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium transition-colors"
                            >
                              Edit
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => setActiveDropdown(activeDropdown === paper.id ? null : paper.id)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              >
                                <MoreVertical size={18} className="text-slate-300" />
                              </button>
                              
                              {activeDropdown === paper.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-white/20 z-10">
                                  <button
                                    onClick={() => openEditDialog(paper)}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2 first:rounded-t-lg"
                                  >
                                    <Edit size={16} className="text-amber-400" />
                                    Edit Details
                                  </button>
                                  <button
                                    onClick={() => alert(`Downloading: ${paper.title}`)}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                                  >
                                    <Download size={16} className="text-purple-400" />
                                    Download
                                  </button>
                                  <button
                                    onClick={() => handleDuplicatePaper(paper)}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                                  >
                                    <Copy size={16} className="text-cyan-400" />
                                    Duplicate
                                  </button>
                                  <button
                                    onClick={() => handleDeletePaper(paper.id)}
                                    disabled={deletingId === paper.id}
                                    className="w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-red-500/10 flex items-center gap-2 last:rounded-b-lg disabled:opacity-50"
                                  >
                                    {deletingId === paper.id ? (
                                      <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                      <Trash2 size={16} />
                                    )}
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-slate-300 text-sm">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPapers.length)} of {filteredPapers.length} papers
                      </div>
                    
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Previous
                        </button>
                      
                        <div className="flex items-center gap-1">
                          {[...Array(totalPages)].map((_, index) => (
                            <button
                              key={index + 1}
                              onClick={() => setCurrentPage(index + 1)}
                              className={`w-10 h-10 rounded-lg transition-all text-sm font-medium ${
                                currentPage === index + 1
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
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
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 text-center border border-white/10">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                    <FileText size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {searchTerm ? 'No papers found' : 'No papers yet'}
                  </h3>
                  <p className="text-slate-300">
                    {searchTerm
                      ? 'Try adjusting your search terms to find what you are looking for'
                      : 'Get started by creating your first examination paper'
                    }
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => navigate('/teacher/create')}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2 mt-4"
                    >
                      <Plus size={20} />
                      Create Your First Paper
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="bg-slate-800 border-white/20 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Paper</DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Update the basic details of your paper
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-slate-300">Paper Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="Enter paper title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration" className="text-slate-300">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="Enter duration"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="class" className="text-slate-300">Class *</Label>
                    <Select value={formData.classId} onValueChange={handleClassChange}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20 text-white">
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subject" className="text-slate-300">Subject *</Label>
                    <Select value={formData.subjectId} onValueChange={(v) => setFormData({ ...formData, subjectId: v })} disabled={!formData.classId}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20 text-white">
                        {subjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id.toString()}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingPaper(null);
                    }}
                    className="border-white/20 text-slate-300 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdatePaper} 
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </GlassmorphismLayout>
  );
};

export default PapersPage;