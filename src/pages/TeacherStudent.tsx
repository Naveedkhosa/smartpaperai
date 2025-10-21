import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import TeacherSidebar from '@/components/TeacherSidebar';
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
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
} from "lucide-react";

// API base URL
const API_BASE_URL = "https://apis.babalrukn.com/api";

interface Student {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  registration_no: string;
  father_name: string;
  class_id: number;
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
  registration_no: string;
  father_name: string;
  class_id: string;
  roll_no: string;
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
    registration_no: '',
    father_name: '',
    class_id: '',
    roll_no: ''
  });

  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
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
      return data.data.classes;
    },
    enabled: !!token,
  });

  // Update form when student changes
  useState(() => {
    if (student) {
      setFormData({
        full_name: student.full_name,
        email: student.email,
        phone_number: student.phone_number || '',
        registration_no: student.registration_no,
        father_name: student.father_name,
        class_id: student.class_id.toString(),
        roll_no: ''
      });
    }
  }, [student]);

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async (studentData: StudentFormData) => {
      const response = await fetch(`${API_BASE_URL}/user/students/${student?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: studentData.full_name,
          email: studentData.email,
          phone_number: studentData.phone_number || null,
          father_name: studentData.father_name,
          class_id: parseInt(studentData.class_id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update student');
      }

      return response.json();
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
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.father_name || !formData.class_id) {
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
                Class <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.class_id}
                onValueChange={(value) => updateFormField('class_id', value)}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="glassmorphism-strong border-white/30 custom-scrollbar">
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

            <div className="space-y-2">
              <Label htmlFor="edit_registration_no" className="text-white/80">
                Registration Number
              </Label>
              <Input
                id="edit_registration_no"
                value={formData.registration_no}
                className="glass-input bg-slate-700/50 cursor-not-allowed"
                disabled
                title="Registration number cannot be changed"
              />
              <p className="text-slate-400 text-xs">
                Registration number cannot be modified
              </p>
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

// Students List Page Component
export default function StudentsListPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  // Fetch students
  const { data: studentsResponse, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/user/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      return data;
    },
    enabled: !!token,
  });

  // Fetch classes for filter
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
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
      return data.data.classes;
    },
    enabled: !!token,
  });

  const students: Student[] = studentsResponse?.data?.students || [];

  // Filter students based on search and class
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.registration_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.phone_number && student.phone_number.includes(searchTerm));
    
    const matchesClass = selectedClass === "all" || student.class_id.toString() === selectedClass;
    
    return matchesSearch && matchesClass;
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const response = await fetch(`${API_BASE_URL}/user/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete student');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Success',
        description: 'Student deleted successfully',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="glassmorphism-strong border-white/30 hover:border-emerald-400/30 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Total Students</p>
                    <h3 className="text-2xl font-bold text-white">{students.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Users className="text-emerald-300" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism-strong border-white/30 hover:border-blue-400/30 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Active Classes</p>
                    <h3 className="text-2xl font-bold text-white">
                      {[...new Set(students.map(s => s.class_id))].length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Filter className="text-blue-300" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism-strong border-white/30 hover:border-purple-400/30 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">This Month</p>
                    <h3 className="text-2xl font-bold text-white">
                      {students.filter(s => {
                        const created = new Date(s.created_at);
                        const now = new Date();
                        return created.getMonth() === now.getMonth() && 
                               created.getFullYear() === now.getFullYear();
                      }).length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <UserPlus className="text-purple-300" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism-strong border-white/30 hover:border-orange-400/30 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">With Phone</p>
                    <h3 className="text-2xl font-bold text-white">
                      {students.filter(s => s.phone_number).length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Phone className="text-orange-300" size={24} />
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
                  All Students
                </CardTitle>
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="glass-input pl-10 w-full sm:w-64 focus:ring-2 focus:ring-emerald-400/50"
                    />
                  </div>
                  
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="glass-input w-full sm:w-40 focus:ring-2 focus:ring-emerald-400/50">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent className="glassmorphism-strong border-white/30 custom-scrollbar">
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes?.map((cls: Class) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 transition-colors">
                    <Download className="mr-2" size={16} />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {studentsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-300"></div>
                </div>
              ) : filteredStudents.length > 0 ? (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Student</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Registration No</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Class</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Father's Name</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Phone</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Joined</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
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
                              {student.registration_no}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-slate-300 bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm">
                              {student.class?.name || `Class ${student.class_id}`}
                            </span>
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
                          <td className="py-4 px-4 text-slate-400 text-sm">
                            {new Date(student.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 transition-colors rounded-full w-8 h-8 p-0"
                              >
                                <Eye size={16} />
                              </Button>
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
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto text-slate-400 mb-4" size={48} />
                  <h3 className="text-xl text-white mb-2">No students found</h3>
                  <p className="text-slate-300 mb-6">
                    {searchTerm || selectedClass !== "all" 
                      ? "No students match your search criteria" 
                      : "Get started by adding your first student"}
                  </p>
                  {!searchTerm && selectedClass === "all" && (
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