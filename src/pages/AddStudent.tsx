import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from '../components/TeacherSidebar';
import GlassmorphismLayout from "../components/GlassmorphismLayout";
import { Card, CardContent } from "@/components/ui/card";
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
import { queryClient } from "../lib/queryClient";
import {
  Plus,
  Filter,
  UserPlus,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  Phone,
  Hash,
  Users,
} from "lucide-react";

// Import the API instance
import api from '../lib/axios';

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

export default function AddStudent() {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [globalClass, setGlobalClass] = useState("");
  const [studentForms, setStudentForms] = useState<StudentFormData[]>([
    {
      full_name: '',
      email: '',
      phone_number: '',
      father_name: '',
      class_id: ''
    }
  ]);
  const [expandedForms, setExpandedForms] = useState<number[]>([0]);

  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await api.get('/user/classes');
      return response.data.data.classes;
    },
    enabled: !!token,
  });

  // Add students mutation
  const addStudentMutation = useMutation({
    mutationFn: async (studentsData: StudentFormData[]) => {
      const response = await api.post('/user/students', {
        students: studentsData.map(student => ({
          full_name: student.full_name,
          email: student.email,
          phone_number: student.phone_number || null,
          father_name: student.father_name,
          class_id: parseInt(student.class_id)
        }))
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Success',
        description: data.message || 'Students added successfully',
        variant: 'success',
      });
      navigate('/teacher/students');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add students',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate global class
    if (!globalClass) {
      toast({
        title: 'Error',
        description: 'Please select a class for all students',
        variant: 'destructive',
      });
      return;
    }

    // Validate individual forms
    const validForms = studentForms.filter(form => 
      form.full_name.trim() && 
      form.email.trim() && 
      form.father_name.trim() &&
      form.class_id
    );

    if (validForms.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields for at least one student',
        variant: 'destructive',
      });
      return;
    }

    // Check if all forms are valid
    const invalidForms = studentForms.filter(form => 
      !form.full_name.trim() || 
      !form.email.trim() || 
      !form.father_name.trim()
    );

    if (invalidForms.length > 0) {
      toast({
        title: 'Warning',
        description: `${invalidForms.length} student form(s) are incomplete and will not be saved`,
        variant: 'destructive',
      });
    }

    // Submit only valid forms
    addStudentMutation.mutate(validForms);
  };

  const addStudentForm = () => {
    const newForm: StudentFormData = {
      full_name: '',
      email: '',
      phone_number: '',
      father_name: '',
      class_id: globalClass
    };
    setStudentForms(prev => [...prev, newForm]);
    setExpandedForms(prev => [...prev, prev.length]);
  };

  const removeStudentForm = (index: number) => {
    if (studentForms.length === 1) {
      toast({
        title: 'Error',
        description: 'At least one student form is required',
        variant: 'destructive',
      });
      return;
    }
    setStudentForms(prev => prev.filter((_, i) => i !== index));
    setExpandedForms(prev => prev.filter(i => i !== index).map((_, newIndex) => newIndex));
  };

  const updateStudentForm = (index: number, field: keyof StudentFormData, value: string) => {
    setStudentForms(prev => 
      prev.map((form, i) => 
        i === index ? { ...form, [field]: value } : form
      )
    );
  };

  const toggleFormExpansion = (index: number) => {
    setExpandedForms(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };
  
  const handleGlobalClassChange = (value: string) => {
    setGlobalClass(value);
    setStudentForms(prev => 
      prev.map(form => ({ ...form, class_id: value }))
    );
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Check if all required fields are filled for a form
  const isFormValid = (form: StudentFormData) => {
    return form.full_name.trim() && 
           form.email.trim() && 
           form.father_name.trim() &&
           form.class_id &&
           isValidEmail(form.email);
  };

  // Count valid forms
  const validFormsCount = studentForms.filter(isFormValid).length;

  return (
    <GlassmorphismLayout>
      <div className="flex">
        <TeacherSidebar />
        <div className="flex-1 ml-0 lg:ml-0 min-h-screen p-6">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Header */}
            <div className="glassmorphism-strong rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    onClick={() => navigate("/teacher/students")}
                    className="bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                    size="sm"
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                      <Users className="text-emerald-300" size={32} />
                      Add New Students
                    </h2>
                    <p className="text-slate-200/90 text-sm">Fill the details below to add students</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-300 text-sm">
                    Ready to save: <span className="text-emerald-300 font-bold">{validFormsCount}</span> / {studentForms.length}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {studentForms.length - validFormsCount} form(s) need attention
                  </div>
                </div>
              </div>
            </div>

            {/* Global Settings */}
            <Card className="glassmorphism border-emerald-400/30 mb-4">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Filter size={18} className="text-emerald-300" />
                  Global Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="global-class" className="text-white/80 flex items-center gap-1">
                      Class for All Students <span className="text-red-400">*</span>
                    </Label>
                    <Select value={globalClass} onValueChange={handleGlobalClassChange}>
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Select class for all students" />
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
                    {!globalClass && (
                      <p className="text-red-400 text-xs">Please select a class to continue</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-count" className="text-white/80">
                      Number of Students
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="student-count"
                        value={studentForms.length}
                        className="glass-input font-mono text-center bg-slate-700/50"
                        disabled
                      />
                      <Button
                        type="button"
                        onClick={addStudentForm}
                        className="emerald-gradient hover:shadow-lg transition-all duration-200"
                        disabled={!globalClass}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Forms - Scrollable Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 pb-4">
              {studentForms.map((form, index) => {
                const isValid = isFormValid(form);
                return (
                  <Card 
                    key={index} 
                    className={`glassmorphism border-white/20 hover:border-emerald-400/30 transition-all duration-200 ${
                      !isValid ? 'border-orange-400/50' : 'border-emerald-400/30'
                    }`}
                  >
                    <CardContent className="p-0">
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-t-lg"
                        onClick={() => toggleFormExpansion(index)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                            isValid 
                              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' 
                              : 'bg-gradient-to-br from-orange-400 to-orange-600'
                          }`}>
                            <span className="text-white font-semibold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">
                              {form.full_name || `Student ${index + 1}`}
                            </h4>
                            <p className={`text-xs ${
                              isValid ? 'text-emerald-300' : 'text-orange-300'
                            }`}>
                              {isValid ? 'Ready to save' : 'Incomplete form'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {studentForms.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => { e.stopPropagation(); removeStudentForm(index); }} 
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full w-8 h-8 p-0"
                            >
                              <X size={14} />
                            </Button>
                          )}
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-400 hover:text-white rounded-full w-8 h-8 p-0"
                          >
                            {expandedForms.includes(index) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </Button>
                        </div>
                      </div>
                      {expandedForms.includes(index) && (
                        <div className="p-4 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`full_name_${index}`} className="text-white/80 flex items-center gap-1">
                                Full Name <span className="text-red-400">*</span>
                              </Label>
                              <Input 
                                id={`full_name_${index}`} 
                                value={form.full_name} 
                                onChange={(e) => updateStudentForm(index, 'full_name', e.target.value)} 
                                className="glass-input" 
                                placeholder="Enter full name" 
                                required 
                              />
                              {!form.full_name.trim() && (
                                <p className="text-red-400 text-xs">Full name is required</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`father_name_${index}`} className="text-white/80 flex items-center gap-1">
                                Father's Name <span className="text-red-400">*</span>
                              </Label>
                              <Input 
                                id={`father_name_${index}`} 
                                value={form.father_name} 
                                onChange={(e) => updateStudentForm(index, 'father_name', e.target.value)} 
                                className="glass-input" 
                                placeholder="Enter father's name" 
                                required 
                              />
                              {!form.father_name.trim() && (
                                <p className="text-red-400 text-xs">Father's name is required</p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`email_${index}`} className="text-white/80 flex items-center gap-1">
                                Email Address <span className="text-red-400">*</span>
                              </Label>
                              <Input 
                                id={`email_${index}`} 
                                type="email" 
                                value={form.email} 
                                onChange={(e) => updateStudentForm(index, 'email', e.target.value)} 
                                className="glass-input" 
                                placeholder="Enter email address" 
                                required 
                              />
                              {form.email && !isValidEmail(form.email) && (
                                <p className="text-red-400 text-xs">Please enter a valid email address</p>
                              )}
                              {!form.email.trim() && (
                                <p className="text-red-400 text-xs">Email is required</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`phone_${index}`} className="text-white/80">
                                Phone Number
                              </Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                <Input 
                                  id={`phone_${index}`} 
                                  type="tel" 
                                  value={form.phone_number} 
                                  onChange={(e) => updateStudentForm(index, 'phone_number', e.target.value)} 
                                  className="glass-input pl-10" 
                                  placeholder="Enter phone number" 
                                />
                              </div>
                              <p className="text-slate-400 text-xs">Optional field</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`class_${index}`} className="text-white/80 flex items-center gap-1">
                              Class <span className="text-red-400">*</span>
                            </Label>
                            <Select 
                              value={form.class_id} 
                              onValueChange={(value) => updateStudentForm(index, 'class_id', value)}
                            >
                              <SelectTrigger className="glass-input">
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                              <SelectContent className="glassmorphism-strong border-white/30 custom-scrollbar">
                                {classes?.map((classItem: Class) => (
                                  <SelectItem key={classItem.id} value={classItem.id.toString()}>
                                    {classItem.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {!form.class_id && (
                              <p className="text-red-400 text-xs">Class is required</p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/20 mt-auto">
              <Button 
                type="button" 
                onClick={addStudentForm} 
                className="w-full glassmorphism border-dashed border-white/30 hover:border-emerald-400/50 hover:bg-emerald-400/10" 
                variant="outline" 
                disabled={!globalClass}
              >
                <Plus className="mr-2 text-emerald-300" size={20} />
                Add Another Student
              </Button>
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/teacher/students")} 
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addStudentMutation.isPending || validFormsCount === 0} 
                  className="emerald-gradient hover:shadow-lg"
                >
                  {addStudentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Students ({validFormsCount})
                </Button>
              </div>
            </div>
          </form>
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.5); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.7); }
          `}</style>
        </div>
      </div>
    </GlassmorphismLayout>
  );
}