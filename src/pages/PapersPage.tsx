import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, Plus, FileText, Edit, Trash2, Download,
    Eye, Calendar, BookOpen, FileDigit, Loader2, Copy,
    Clock, Award, MoreVertical, Grid, List, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import TeacherSidebar from '@/components/TeacherSidebar';
import { useNavigate } from "react-router-dom";
// Assuming 'api' is your configured axios instance
import api from '../lib/axios'; 
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
import { Card } from '@/components/ui/card';

// --- Interfaces ---
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
    questions_count?: number;
    sections_count?: number;
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

interface PapersResponse {
    status: boolean;
    data: {
        stats: {
            total_papers: number;
            ai_generated_papers: number;
            ai_composed_papers: number;
            manual_papers: number;
        };
        papers: {
            current_page: number;
            data: Paper[];
            from: number;
            last_page: number;
            per_page: number;
            to: number;
            total: number;
        };
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
// --- End Interfaces ---

const PapersPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { token } = useAuth();

    const [papersData, setPapersData] = useState<PapersResponse['data']['papers'] | null>(null);
    const [paperStats, setPaperStats] = useState<PapersResponse['data']['stats'] | null>(null); // New state for stats from API
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [filteredSubjects, setFilteredSubjects] = useState<SubjectItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    
    // Task 2: Removed 'list' and fixed viewMode state initialization
    const [viewMode, setViewMode] = useState<'grid'>('grid'); 
    
    const [formData, setFormData] = useState({
        title: '',
        duration: '',
        classId: '',
        subjectId: ''
    });

    const PAPERS_PER_PAGE = 6; // Task 2: Pagination size

    // --- API Fetching Functions (Using Axios) ---

    const fetchClasses = async () => {
        try {
            const response = await api.get('/user/classes');
            if (response.data?.status) {
                setClasses(response.data.data.classes || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchSubjects = async (classId: string) => {
        try {
            const response = await api.get(`/user/classes/${classId}/subjects`);
            if (response.data?.status) {
                setFilteredSubjects(response.data.data.subjects || response.data.data.class?.subjects || []); 
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setFilteredSubjects([]);
        }
    };

    // Updated function to fetch papers with stats
    const fetchPaginatedPapers = useCallback(async (page: number, search: string) => {
        try {
            setIsLoading(true);
            
            const params = {
                page: page.toString(),
                per_page: PAPERS_PER_PAGE.toString(),
                ...(search && { search: search })
            };

            const response = await api.get('/user/papers', { params });

            if (response.data?.status && response.data.data) {
                // Set both papers data and stats from the API response
                setPapersData(response.data.data.papers);
                setPaperStats(response.data.data.stats);
            } else {
                // Set default empty data
                setPapersData({
                    current_page: 1,
                    data: [],
                    from: 0,
                    last_page: 1,
                    per_page: PAPERS_PER_PAGE,
                    to: 0,
                    total: 0
                });
                setPaperStats({
                    total_papers: 0,
                    ai_generated_papers: 0,
                    ai_composed_papers: 0,
                    manual_papers: 0
                });
            }
        } catch (error) {
            console.error('Error fetching papers:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch papers',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [PAPERS_PER_PAGE, toast]);


    // --- Handlers & Helpers ---

    const handleUpdatePaper = async () => {
        if (!editingPaper || !formData.title || !formData.duration || !formData.classId || !formData.subjectId) {
            toast({
                title: 'Validation Error',
                description: 'Please fill all required fields: Title, Duration, Class, and Subject.',
                variant: 'destructive',
            });
            return;
        }
        
        try {
            const response = await api.put(`/user/papers/${editingPaper.id}`, {
                title: formData.title,
                duration: parseInt(formData.duration),
                class_id: parseInt(formData.classId),
                subject_id: parseInt(formData.subjectId),
            });
            
            if (response.data?.status) {
                // Refresh the current page (which will also refresh stats)
                fetchPaginatedPapers(currentPage, searchTerm);
                setIsEditDialogOpen(false);
                setEditingPaper(null);
                toast({ title: 'Success', description: 'Paper updated successfully' });
            } else {
                throw new Error(response.data?.message || 'Failed to update paper');
            }
        } catch (error) {
            console.error('❌ Error updating paper:', error);
            toast({ title: 'Error', description: 'Failed to update paper', variant: 'destructive' });
        }
    };

    const handleDeletePaper = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this paper?")) return;
        try {
            setDeletingId(id);
            const response = await api.delete(`/user/papers/${id}`);

            if (response.data?.status) {
                // Refresh the current page (which will also refresh stats)
                fetchPaginatedPapers(currentPage, searchTerm);
                toast({ title: 'Success', description: 'Paper deleted successfully' });
            } else {
                throw new Error(response.data?.message || 'Failed to delete paper');
            }
        } catch (error) {
            console.error('❌ Error deleting paper:', error);
            toast({ title: 'Error', description: 'Failed to delete paper', variant: 'destructive' });
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
            setFilteredSubjects([]);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1); // Reset to page 1 on new search
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleDuplicatePaper = async (id: any) => {
        try {
            const response = await api.get(`/user/paper/duplicate/${id}`);

            if (response.data?.status) {
                // Refresh the current page (which will also refresh stats)
                fetchPaginatedPapers(currentPage, searchTerm);
                toast({ title: 'Success', description: 'Paper duplicated successfully' });
            } else {
                throw new Error(response.data?.message || 'Failed to duplicate paper');
            }
        } catch (error) {
            console.error('❌ Error duplicating paper:', error);
            toast({ title: 'Error', description: 'Failed to duplicate paper', variant: 'destructive' });
        } finally {
            setActiveDropdown(null);
        }
    };

    const getTotalQuestions = (paper: Paper) => paper.questions_count || 0;
    
    // UI Helpers (Kept as is)
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

    // --- Effects ---

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        fetchPaginatedPapers(currentPage, searchTerm);
    }, [currentPage, searchTerm, fetchPaginatedPapers]);

    // Task 3: Dropdown Closure Logic (click outside)
    useEffect(() => {
        const closeDropdown = (event: MouseEvent) => {
            // Check if the click occurred outside any dropdown element
            const dropdowns = document.querySelectorAll('.paper-dropdown-menu');
            let isClickInside = false;

            dropdowns.forEach(dropdown => {
                if (dropdown.contains(event.target as Node)) {
                    isClickInside = true;
                }
            });

            // Check if the click occurred on the 'MoreVertical' button itself (to allow it to open)
            const moreButtons = document.querySelectorAll('.more-vertical-button');
            moreButtons.forEach(button => {
                 if (button.contains(event.target as Node)) {
                    isClickInside = true;
                }
            });
            
            if (!isClickInside && activeDropdown) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('click', closeDropdown);
        return () => document.removeEventListener('click', closeDropdown);
    }, [activeDropdown]); // Re-run effect when dropdown state changes

    // --- Data for Paginated View ---
    const papersDataSafe = papersData || { data: [], total: 0, last_page: 1, from: 0, to: 0, per_page: PAPERS_PER_PAGE, current_page: 1 };
    const currentPapers = papersDataSafe.data;
    const totalPages = papersDataSafe.last_page;
    
    // Use stats from API, fallback to defaults if not loaded yet
    const statsSafe = paperStats || {
        total_papers: 0,
        ai_generated_papers: 0,
        ai_composed_papers: 0,
        manual_papers: 0
    };
    
    // --- Render Logic ---

    // Task 3: Enhanced Loading Component
    const LoadingAnimation = () => (
        <div className="flex-1 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Placeholder */}
                <div className="glassmorphism-strong rounded-2xl p-8 mb-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-white/10 rounded w-1/3"></div>
                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    </div>
                </div>
                {/* Stats Cards Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="glassmorphism rounded-xl p-6 border border-white/10">
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-white/10 rounded w-2/3"></div>
                                <div className="h-8 bg-white/10 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Papers Grid Placeholder (Task 2/3) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(PAPERS_PER_PAGE)].map((_, i) => (
                        <Card key={i} className="glassmorphism border-white/10 overflow-hidden">
                            <div className="animate-pulse">
                                <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-700"></div>
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
                        </Card>
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
                <div className="flex-1 min-h-screen p-0">
                    <div className="container mx-auto p-4">
                        
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">Exam Papers</h1>
                                    <p className="text-slate-300">Manage and organize your examination papers</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/teacher/create')}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} />
                                    Create New Paper
                                </button>
                            </div>
                            
                            {/* Stats Cards - Updated with new API stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                {/* Total Papers */}
                                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-300 mb-1">Total Papers</p>
                                            <p className="text-2xl font-bold text-white">{statsSafe.total_papers}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                            <FileText className="text-blue-400" size={24} />
                                        </div>
                                    </div>
                                </div>
                                {/* AI Generated Papers */}
                                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-300 mb-1">AI Generated</p>
                                            <p className="text-2xl font-bold text-white">{statsSafe.ai_generated_papers}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                            <BookOpen className="text-green-400" size={24} />
                                        </div>
                                    </div>
                                </div>
                                {/* AI Composed Papers */}
                                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-300 mb-1">AI Composed</p>
                                            <p className="text-2xl font-bold text-white">{statsSafe.ai_composed_papers}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                            <FileDigit className="text-purple-400" size={24} />
                                        </div>
                                    </div>
                                </div>
                                {/* Manual Composed Papers */}
                                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-300 mb-1">Manual Composed</p>
                                            <p className="text-2xl font-bold text-white">{statsSafe.manual_papers}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                            <Award className="text-amber-400" size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Search and View Toggle (List view removed for Task 2) */}
                            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Search by paper title, subject, or class..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        />
                                        {isLoading && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400 animate-spin" size={20} />}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Papers Display (Task 2: Only Grid) */}
                        {currentPapers.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                    {currentPapers.map((paper) => (
                                        <div key={paper.id} className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 hover:border-white/20 transition-all overflow-hidden group">
                                            <div className={`h-2 ${getSubjectColor(paper.subject?.name || 'Default')}`}></div>

                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1 pr-2">
                                                        {paper.title}
                                                    </h3>
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveDropdown(activeDropdown === paper.id ? null : paper.id)}
                                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors more-vertical-button"
                                                        >
                                                            <MoreVertical size={18} className="text-slate-300" />
                                                        </button>

                                                        {activeDropdown === paper.id && (
                                                            // Task 3: Added class for external click closure
                                                            <div className="paper-dropdown-menu absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-white/20 z-10">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => { setActiveDropdown(null); navigate(`/teacher/papers/${paper.id}`); }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2 first:rounded-t-lg"
                                                                >
                                                                    <Eye size={16} className="text-blue-400" />
                                                                    Preview
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => { setActiveDropdown(null); navigate(`/teacher/paper-builder/${paper.id}`); }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                                                                >
                                                                    <Edit size={16} className="text-green-400" />
                                                                    Edit Builder
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditDialog(paper)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                                                                >
                                                                    <Edit size={16} className="text-amber-400" />
                                                                    Edit Details
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => { setActiveDropdown(null); alert(`Downloading: ${paper.title}`); }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                                                                >
                                                                    <Download size={16} className="text-purple-400" />
                                                                    Download
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDuplicatePaper(paper?.id)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                                                                >
                                                                    <Copy size={16} className="text-cyan-400" />
                                                                    Duplicate
                                                                </button>
                                                                <button
                                                                    type="button"
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
                                                        type="button"
                                                        onClick={() => navigate(`/teacher/papers/${paper.id}`)}
                                                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/teacher/paper-builder/${paper.id}`)}
                                                        className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Edit size={16} />
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="text-slate-300 text-sm">
                                                Showing {papersDataSafe.from}-{papersDataSafe.to} of {papersDataSafe.total} papers
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handlePageChange(papersDataSafe.current_page - 1)}
                                                    disabled={papersDataSafe.current_page === 1}
                                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>

                                                <div className="flex items-center gap-1">
                                                    {[...Array(totalPages)].map((_, index) => (
                                                        <button
                                                            key={index + 1}
                                                            onClick={() => handlePageChange(index + 1)}
                                                            className={`w-10 h-10 rounded-lg transition-all text-sm font-medium ${
                                                                papersDataSafe.current_page === index + 1
                                                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                                                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                                                                }`}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    ))}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handlePageChange(papersDataSafe.current_page + 1)}
                                                    disabled={papersDataSafe.current_page === totalPages}
                                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                                >
                                                    <ChevronRight size={16} />
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
                                            type="button"
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
                                                {filteredSubjects.map((sub) => (
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