import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import TeacherSidebar from '../components/TeacherSidebar';
import GlassmorphismLayout from "../components/GlassmorphismLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { queryClient } from "../lib/queryClient";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Users,
  UserPlus,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  Phone,
  Hash,
  Mail,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Import the API instance
import api from '../lib/axios';

interface Student {
  id: number;
  roll_number: string;
  full_name: string;
  email: string;
  phone_number?: string;
  father_name: string;
  class_id: number | null;
  class?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Class {
  id: number;
  name: string;
  description: string;
}

interface StudentFormData {
  full_name: string;
  email: string;
  phone_number: string;
  father_name: string;
  class_id: string;
}

interface StudentsStats {
  total: number;
  active: number;
  inactive: number;
  withEmail: number;
  withPhone: number;
}

interface StudentsResponse {
  data: {
    students: {
      data: Student[];
      current_page: number;
      total: number;
      last_page: number;
      per_page: number;
    };
  };
}

interface PaginationInfo {
  current_page: number;
  total: number;
  last_page: number;
  per_page: number;
}

// Edit Student Dialog Component
function EditStudentDialog({ 
  student, 
  open, 
  onOpenChange,
  onSuccess 
}: {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<StudentFormData>({
    full_name: '',
    email: '',
    phone_number: '',
    father_name: '',
    class_id: '',
  });

  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await api.get('/user/classes');
      return response.data.data.classes;
    },
    enabled: !!token,
  });

  // Update form when student changes
  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.full_name,
        email: student.email,
        phone_number: student.phone_number || '',
        father_name: student.father_name,
        class_id: student.class_id ? student.class_id.toString() : '',
      });
    }
  }, [student]);

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async (studentData: StudentFormData) => {
      const updateData: any = {
        full_name: studentData.full_name,
        email: studentData.email,
        father_name: studentData.father_name,
      };

      // Only include phone_number if it's provided
      if (studentData.phone_number) {
        updateData.phone_number = studentData.phone_number;
      }

      // Only include class_id if it's selected (not empty)
      if (studentData.class_id) {
        updateData.class_id = parseInt(studentData.class_id);
      }

      const response = await api.put(`/user/students/${student?.id}`, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      onOpenChange(false);
      onSuccess();
      toast({
        title: 'Success',
        description: 'Student updated successfully',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update student',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.father_name) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    updateStudentMutation.mutate(formData);
  };

  const updateFormField = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glassmorphism-strong border-white/30 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Edit className="text-emerald-300" size={24} />
            Edit Student
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Update student information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_full_name" className="text-white/80 flex items-center gap-1">
                  Full Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="edit_full_name"
                  value={formData.full_name}
                  onChange={(e) => updateFormField('full_name', e.target.value)}
                  className="glass-input focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_father_name" className="text-white/80 flex items-center gap-1">
                  Father's Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="edit_father_name"
                  value={formData.father_name}
                  onChange={(e) => updateFormField('father_name', e.target.value)}
                  className="glass-input focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="Enter father's name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_email" className="text-white/80 flex items-center gap-1">
                  Email Address <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormField('email', e.target.value)}
                  className="glass-input focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_phone" className="text-white/80 flex items-center gap-1">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    id="edit_phone"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => updateFormField('phone_number', e.target.value)}
                    className="glass-input focus:ring-2 focus:ring-emerald-400/50 pl-10"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_class" className="text-white/80 flex items-center gap-1">
                Class
              </Label>
              <Select
                value={formData.class_id}
                onValueChange={(value) => updateFormField('class_id', value)}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select class (optional)" />
                </SelectTrigger>
                <SelectContent className="glassmorphism-strong border-white/30 custom-scrollbar">
                  <SelectItem value="">No Class</SelectItem>
                  {classesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="animate-spin text-emerald-300" size={16} />
                    </div>
                  ) : (
                    classes?.map((classItem: Class) => (
                      <SelectItem key={classItem.id} value={classItem.id.toString()}>
                        {classItem.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-6 border-t border-white/20 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateStudentMutation.isPending}
              className="emerald-gradient hover:shadow-lg transition-all duration-200"
            >
              {updateStudentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Dialog component
const Dialog = ({ open, onOpenChange, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className }: any) => (
  <div className={`bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 w-full shadow-2xl border ${className}`}>
    {children}
  </div>
);

const DialogHeader = ({ children }: any) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle = ({ children }: any) => (
  <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
    {children}
  </h2>
);

const DialogDescription = ({ children, className }: any) => (
  <p className={`text-slate-300 text-sm ${className}`}>{children}</p>
);

const DialogFooter = ({ children }: any) => (
  <div className="flex justify-end gap-2">{children}</div>
);

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Students List Page Component
export default function StudentsListPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Debounced search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Build query parameters for API call
  const buildQueryParams = () => {
    const params: any = {
      page: currentPage,
      per_page: pageSize
    };
    
    if (debouncedSearchTerm) {
      params.search = debouncedSearchTerm;
    }
    
    if (selectedClass !== "all") {
      if (selectedClass === "unassigned") {
        params.unassigned = true;
      } else {
        params.class_id = selectedClass;
      }
    }
    
    if (activeStatus !== "all") {
      if (activeStatus === "active") {
        params.assigned = true;
      } else if (activeStatus === "inactive") {
        params.unassigned = true;
      }
    }
    
    return params;
  };

  // Fetch students with filters and pagination
  const { 
    data: studentsResponse, 
    isLoading: studentsLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['students', debouncedSearchTerm, selectedClass, activeStatus, currentPage, pageSize],
    queryFn: async () => {
      const params = buildQueryParams();
      const response = await api.get('/user/students', { params });
      return response.data;
    },
    enabled: !!token,
  });

  // Fetch ALL students for dashboard stats (without pagination)
  const { data: allStudentsResponse } = useQuery({
    queryKey: ['all-students-stats'],
    queryFn: async () => {
      const response = await api.get('/user/students', { 
        params: { per_page: 10000 } // Large number to get all students
      });
      return response.data;
    },
    enabled: !!token,
  });

  // Fetch classes for filter
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await api.get('/user/classes');
      return response.data.data.classes;
    },
    enabled: !!token,
  });

  // Get students and pagination info from response
  const getStudentsAndPagination = (response: StudentsResponse) => {
    if (!response?.data?.students) {
      return { students: [], pagination: null };
    }
    
    const students = response.data.students.data || [];
    const pagination: PaginationInfo = {
      current_page: response.data.students.current_page,
      total: response.data.students.total,
      last_page: response.data.students.last_page,
      per_page: response.data.students.per_page
    };
    
    return { students, pagination };
  };

  const { students, pagination } = getStudentsAndPagination(studentsResponse);
  const { students: allStudents } = getStudentsAndPagination(allStudentsResponse);

  // Calculate students statistics from ALL students data
  const calculateStats = (students: Student[]): StudentsStats => {
    const total = students.length;
    const withEmail = students.filter(student => student.email && student.email.length > 0).length;
    const withPhone = students.filter(student => student.phone_number && student.phone_number.length > 0).length;
    
    // Students with class assigned are active, without class are inactive
    const active = students.filter(student => student.class_id !== null).length;
    const inactive = students.filter(student => student.class_id === null).length;

    return {
      total,
      active,
      inactive,
      withEmail,
      withPhone,
    };
  };

  const stats = calculateStats(allStudents);

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const response = await api.delete(`/user/students/${studentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['all-students-stats'] });
      toast({
        title: 'Success',
        description: 'Student deleted successfully',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete student',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteStudent = (studentId: number, studentName: string) => {
    if (window.confirm(`Are you sure you want to delete ${studentName}?`)) {
      deleteStudentMutation.mutate(studentId);
    }
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditStudentDialogOpen(true);
  };

  const handleAddStudent = () => {
    navigate("/teacher/add-student");
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedClass("all");
    setActiveStatus("all");
    setCurrentPage(1);
  };

  // Check if any filter is active
  const hasActiveFilters = searchTerm || selectedClass !== "all" || activeStatus !== "all";

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!pagination) return [];
    
    const pages = [];
    const totalPages = pagination.last_page;
    const current = pagination.current_page;
    
    // Always show first page
    pages.push(1);
    
    // Calculate range around current page
    let start = Math.max(2, current - 1);
    let end = Math.min(totalPages - 1, current + 1);
    
    // Add ellipsis if needed
    if (start > 2) pages.push('...');
    
    // Add pages around current
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed
    if (end < totalPages - 1) pages.push('...');
    
    // Always show last page if there is more than one page
    if (totalPages > 1) pages.push(totalPages);
    
    return pages;
  };

  return (
    <GlassmorphismLayout>
      <div className="flex">
        <TeacherSidebar />
        {/* Main Content */}
        <div className="flex-1 ml-0 lg:ml-0 min-h-screen">
          {/* Header */}
          <div className="glassmorphism-strong rounded-2xl p-6 mb-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate("/teacher")}
                  className="bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                  size="sm"
                >
                  <ArrowLeft size={16} />
                </Button>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    <Users className="text-emerald-300" size={32} />
                    Students Management
                  </h2>
                  <p className="text-slate-200/90 text-sm sm:text-base">
                    Manage and organize your students efficiently
                  </p>
                </div>
              </div>
              <Button
                onClick={handleAddStudent}
                className="emerald-gradient hover:shadow-lg transition-all duration-200"
              >
                <UserPlus className="mr-2" size={20} />
                Add Student
              </Button>
            </div>
          </div>

          {/* Stats Cards - Using ALL students data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Students Card */}
            <Card className="glassmorphism-strong border-white/30 hover:border-emerald-400/30 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Total Students</p>
                    <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
                    <p className="text-slate-400 text-xs mt-1">All registered students</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Users className="text-emerald-300" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Students Card */}
            <Card className="glassmorphism-strong border-white/30 hover:border-blue-400/30 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Active Students</p>
                    <h3 className="text-2xl font-bold text-white">{stats.active}</h3>
                    <p className="text-slate-400 text-xs mt-1">With class assigned</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <UserCheck className="text-blue-300" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inactive Students Card */}
            <Card className="glassmorphism-strong border-white/30 hover:border-orange-400/30 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Inactive Students</p>
                    <h3 className="text-2xl font-bold text-white">{stats.inactive}</h3>
                    <p className="text-slate-400 text-xs mt-1">No class assigned</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <UserX className="text-orange-300" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students with Email Card */}
            <Card className="glassmorphism-strong border-white/30 hover:border-purple-400/30 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">With Email</p>
                    <h3 className="text-2xl font-bold text-white">{stats.withEmail}</h3>
                    <p className="text-slate-400 text-xs mt-1">
                      {stats.total > 0 ? ((stats.withEmail / stats.total) * 100).toFixed(1) : 0}% of total
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Mail className="text-purple-300" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students Table */}
          <Card className="glassmorphism-strong border-white/30">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-white text-xl bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                  {hasActiveFilters ? `Filtered Students (${students.length})` : `All Students (${pagination?.total || 0})`}
                </CardTitle>
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="glass-input pl-10 w-full sm:w-64 focus:ring-2 focus:ring-emerald-400/50"
                      />
                      {studentsLoading && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-300 animate-spin" size={16} />
                      )}
                    </div>
                    
                    {/* Class Filter */}
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="glass-input w-full sm:w-40 focus:ring-2 focus:ring-emerald-400/50">
                        <SelectValue placeholder="All Classes" />
                      </SelectTrigger>
                      <SelectContent className="glassmorphism-strong border-white/30 custom-scrollbar">
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {classes?.map((cls: Class) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Active Status Filter */}
                    <Select value={activeStatus} onValueChange={setActiveStatus}>
                      <SelectTrigger className="glass-input w-full sm:w-40 focus:ring-2 focus:ring-emerald-400/50">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent className="glassmorphism-strong border-white/30">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Reset Filters Button */}
                    {hasActiveFilters && (
                      <Button 
                        variant="outline" 
                        onClick={handleResetFilters}
                        className="border-white/20 text-white hover:bg-white/10 transition-colors"
                        disabled={studentsLoading}
                      >
                        <X className="mr-2" size={16} />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {studentsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <Loader2 className="mx-auto animate-spin text-emerald-300 mb-4" size={32} />
                    <p className="text-slate-300">Loading students...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <Users className="mx-auto text-red-400 mb-4" size={48} />
                  <h3 className="text-xl text-white mb-2">Failed to load students</h3>
                  <p className="text-slate-300 mb-6">
                    {error instanceof Error ? error.message : 'An error occurred while fetching students'}
                  </p>
                  <Button 
                    onClick={() => refetch()}
                    className="emerald-gradient hover:shadow-lg transition-all duration-200"
                  >
                    <Loader2 className="mr-2" size={20} />
                    Retry
                  </Button>
                </div>
              ) : students.length > 0 ? (
                <>
                  <div className="overflow-x-auto custom-scrollbar mb-6">
                    <table className="w-full min-w-[1000px]">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Student</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Roll Number</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Class</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Father's Name</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Phone</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Status</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Joined</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.id} className="border-b border-white/10 hover:bg-white/5 transition-colors group">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/25 transition-shadow">
                                  <span className="text-white font-semibold text-sm">
                                    {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-white font-medium">{student.full_name}</div>
                                  <div className="text-slate-400 text-sm">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-slate-300 font-mono text-sm bg-slate-700/50 px-2 py-1 rounded">
                                {student.roll_number}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              {student.class ? (
                                <span className="text-slate-300 bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm">
                                  {student.class.name}
                                </span>
                              ) : (
                                <span className="text-slate-500 bg-slate-700/50 px-2 py-1 rounded text-sm">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-slate-300">{student.father_name}</td>
                            <td className="py-4 px-4">
                              {student.phone_number ? (
                                <div className="flex items-center gap-2 text-slate-300">
                                  <Phone size={14} className="text-emerald-400" />
                                  {student.phone_number}
                                </div>
                              ) : (
                                <span className="text-slate-500 text-sm">Not provided</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {student.class_id ? (
                                <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 px-2 py-1 rounded text-sm">
                                  <UserCheck size={14} />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-sm">
                                  <UserX size={14} />
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-slate-400 text-sm">
                              {new Date(student.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditStudent(student)}
                                  className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 transition-colors rounded-full w-8 h-8 p-0"
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteStudent(student.id, student.full_name)}
                                  disabled={deleteStudentMutation.isPending}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors rounded-full w-8 h-8 p-0"
                                >
                                  {deleteStudentMutation.isPending ? (
                                    <Loader2 className="animate-spin" size={16} />
                                  ) : (
                                    <Trash2 size={16} />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/20">
                      <div className="text-slate-300 text-sm">
                        Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} entries
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Page Size Selector */}
                        <Select
                          value={pageSize.toString()}
                          onValueChange={(value) => handlePageSizeChange(parseInt(value))}
                        >
                          <SelectTrigger className="glass-input w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glassmorphism-strong border-white/30">
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Pagination Controls */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                            className="border-white/20 text-white hover:bg-white/10 transition-colors"
                          >
                            <ChevronLeft size={16} />
                          </Button>

                          {getPageNumbers().map((page, index) => (
                            <Button
                              key={index}
                              variant={page === pagination.current_page ? "default" : "outline"}
                              size="sm"
                              onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                              disabled={page === '...'}
                              className={
                                page === pagination.current_page 
                                  ? "emerald-gradient text-white" 
                                  : "border-white/20 text-white hover:bg-white/10 transition-colors"
                              }
                            >
                              {page}
                            </Button>
                          ))}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                            className="border-white/20 text-white hover:bg-white/10 transition-colors"
                          >
                            <ChevronRight size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto text-slate-400 mb-4" size={48} />
                  <h3 className="text-xl text-white mb-2">No students found</h3>
                  <p className="text-slate-300 mb-6">
                    {hasActiveFilters 
                      ? "No students match your search criteria" 
                      : "Get started by adding your first student"}
                  </p>
                  {!hasActiveFilters && (
                    <Button 
                      onClick={handleAddStudent}
                      className="emerald-gradient hover:shadow-lg transition-all duration-200"
                    >
                      <UserPlus className="mr-2" size={20} />
                      Add Student
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Student Dialog */}
          <EditStudentDialog
            student={selectedStudent}
            open={isEditStudentDialogOpen}
            onOpenChange={setIsEditStudentDialogOpen}
            onSuccess={() => {
              // Success handled in the dialog
            }}
          />

          {/* Custom Scrollbar Styles */}
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(16, 185, 129, 0.5);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(16, 185, 129, 0.7);
            }
          `}</style>
        </div>
      </div>
    </GlassmorphismLayout>
  );
}