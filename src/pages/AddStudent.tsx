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

// API base URL
const API_BASE_URL = "https://apis.babalrukn.com/api";

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

export default function AddStudent() {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [globalClass, setGlobalClass] = useState("");
  const [rollNoPrefix, setRollNoPrefix] = useState("RN");
  const [studentForms, setStudentForms] = useState<StudentFormData[]>([
    {
      full_name: '',
      email: '',
      phone_number: '',
      registration_no: '',
      father_name: '',
      class_id: '',
      roll_no: ''
    }
  ]);
  const [expandedForms, setExpandedForms] = useState<number[]>([0]);

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
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      return data.data.classes;
    },
    enabled: !!token,
  });

  // Generate registration number
  const generateRegNo = () => {
    const prefix = 'STU';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  // Generate roll number
  const generateRollNo = (index: number) => {
    const number = (index + 1).toString().padStart(2, '0');
    return `${rollNoPrefix}${number}`;
  };

  // Add student mutation
  const addStudentMutation = useMutation({
    mutationFn: async (studentsData: StudentFormData[]) => {
      const response = await fetch(`${API_BASE_URL}/user/students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students: studentsData.map(student => ({
            ...student,
            class_id: parseInt(student.class_id),
            registration_no: student.registration_no || generateRegNo(),
            phone_number: student.phone_number || null
          }))
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add students');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Success',
        description: 'Students added successfully',
        variant: 'success',
      });
      navigate('/teacher/students'); // Navigate back to the list
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
    if (!globalClass) {
      toast({
        title: 'Error',
        description: 'Please select a class for all students',
        variant: 'destructive',
      });
      return;
    }

    const validForms = studentForms.filter(form => 
      form.full_name && form.email && form.father_name
    );

    if (validForms.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields for at least one student',
        variant: 'destructive',
      });
      return;
    }

    const formsWithClassAndRoll = validForms.map((form, index) => ({
      ...form,
      class_id: globalClass,
      roll_no: form.roll_no || generateRollNo(index)
    }));
    addStudentMutation.mutate(formsWithClassAndRoll);
  };

  const addStudentForm = () => {
    const newForm: StudentFormData = {
      full_name: '',
      email: '',
      phone_number: '',
      registration_no: '',
      father_name: '',
      class_id: globalClass,
      roll_no: generateRollNo(studentForms.length)
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

  const handleRollPrefixChange = (value: string) => {
    const prefix = value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
    setRollNoPrefix(prefix || "RN");
    
    setStudentForms(prev => 
      prev.map((form, index) => ({
        ...form,
        roll_no: form.roll_no ? prefix + form.roll_no.slice(2) : generateRollNo(index)
      }))
    );
  };

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
                    <Label htmlFor="global-class" className="text-white/80">
                      Class for All Students *
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roll-prefix" className="text-white/80">
                      Roll Number Prefix (2 Alphabets)
                    </Label>
                    <Input
                      id="roll-prefix"
                      value={rollNoPrefix}
                      onChange={(e) => handleRollPrefixChange(e.target.value)}
                      className="glass-input font-mono text-center"
                      placeholder="RN"
                      maxLength={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Forms - Scrollable Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 pb-4">
              {studentForms.map((form, index) => (
                <Card key={index} className="glassmorphism border-white/20 hover:border-emerald-400/30 transition-all duration-200">
                  <CardContent className="p-0">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-t-lg"
                      onClick={() => toggleFormExpansion(index)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                          <span className="text-white font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{form.full_name || `Student ${index + 1}`}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {studentForms.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); removeStudentForm(index); }} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full w-8 h-8 p-0">
                            <X size={14} />
                          </Button>
                        )}
                        <Button type="button" variant="ghost" size="sm" className="text-slate-400 hover:text-white rounded-full w-8 h-8 p-0">
                          {expandedForms.includes(index) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </Button>
                      </div>
                    </div>
                    {expandedForms.includes(index) && (
                      <div className="p-4 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`full_name_${index}`} className="text-white/80 flex items-center gap-1">Full Name <span className="text-red-400">*</span></Label>
                                <Input id={`full_name_${index}`} value={form.full_name} onChange={(e) => updateStudentForm(index, 'full_name', e.target.value)} className="glass-input" placeholder="Enter full name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`father_name_${index}`} className="text-white/80 flex items-center gap-1">Father's Name <span className="text-red-400">*</span></Label>
                                <Input id={`father_name_${index}`} value={form.father_name} onChange={(e) => updateStudentForm(index, 'father_name', e.target.value)} className="glass-input" placeholder="Enter father's name" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                                <Label htmlFor={`email_${index}`} className="text-white/80 flex items-center gap-1">Email Address <span className="text-red-400">*</span></Label>
                                <Input id={`email_${index}`} type="email" value={form.email} onChange={(e) => updateStudentForm(index, 'email', e.target.value)} className="glass-input" placeholder="Enter email address" required />
                            </div>
                           <div className="space-y-2">
                                <Label htmlFor={`phone_${index}`} className="text-white/80">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                    <Input id={`phone_${index}`} type="tel" value={form.phone_number} onChange={(e) => updateStudentForm(index, 'phone_number', e.target.value)} className="glass-input pl-10" placeholder="Enter phone number" />
                                </div>
                           </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/20 mt-auto">
              <Button type="button" onClick={addStudentForm} className="w-full glassmorphism border-dashed border-white/30 hover:border-emerald-400/50 hover:bg-emerald-400/10" variant="outline" disabled={!globalClass}>
                <Plus className="mr-2 text-emerald-300" size={20} />
                Add Another Student
              </Button>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/teacher/student")} className="border-white/20 text-white hover:bg-white/10">
                  Cancel
                </Button>
                <Button type="submit" disabled={addStudentMutation.isPending || !globalClass} className="emerald-gradient hover:shadow-lg">
                  {addStudentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Students ({studentForms.length})
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

