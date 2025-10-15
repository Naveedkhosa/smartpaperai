import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import TeacherSidebar from '@/components/TeacherSidebar';
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
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  Target, 
  Upload, 
  FileText, 
  Download, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  BookOpen, 
  Clock,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  Award,
  Lightbulb,
  TrendingUp,
  Eye,
  Printer,
  Search,
  Loader2
} from "lucide-react";

const ApiService = {
  async request(endpoint, options = {}) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://apis.babalrukn.com/api';
    const url = `${baseURL}${endpoint}`;

    const config = {
      headers: {
        'Authorization': `Bearer ${options.token || ''}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },
};

export default function GradePaper() {
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const [paperData, setPaperData] = useState({
    class_id: "",
    subject_id: "",
    paper_id: "",
  });

  const [gradingSettings, setGradingSettings] = useState({
    method: "conceptual",
    sourceKey: "",
  });

  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load classes
  const { data: classes = [], isLoading: loadingClasses } = useQuery({
    queryKey: ["/user/classes", user?.id],
    queryFn: async () => {
      const response = await ApiService.request('/user/classes', {
        method: "GET",
        token: token,
      });
      return response.data?.classes || [];
    },
    enabled: !!user?.id && !!token,
  });

  // Load subjects when class is selected
  const { data: subjects = [], isLoading: loadingSubjects } = useQuery({
    queryKey: ["/user/classes/subjects", paperData.class_id],
    queryFn: async () => {
      if (!paperData.class_id) return [];
      const response = await ApiService.request(`/user/classes/${paperData.class_id}/subjects`, {
        method: "GET",
        token: token,
      });
      return response.data?.class?.subjects || [];
    },
    enabled: !!paperData.class_id && !!token,
  });

  // Load papers when subject is selected - Updated API integration
  const { data: papers = [], isLoading: loadingPapers } = useQuery({
    queryKey: ["/user/papers", paperData.class_id, paperData.subject_id],
    queryFn: async () => {
      if (!paperData.class_id || !paperData.subject_id) return [];
      
      try {
        const response = await ApiService.request(`/user/papers?class_id=${paperData.class_id}&subject_id=${paperData.subject_id}`, {
          method: "GET",
          token: token,
        });
        
        console.log('Papers API Response:', response);
        
        // Handle different response formats
        if (response.status && response.data) {
          if (response.data.papers && response.data.papers.data) {
            return response.data.papers.data; // Paginated response
          } else if (Array.isArray(response.data.papers)) {
            return response.data.papers; // Direct array
          } else if (Array.isArray(response.data)) {
            return response.data; // Direct data array
          }
        }
        
        return [];
      } catch (error) {
        console.error('Error loading papers:', error);
        toast({
          title: "Error",
          description: "Failed to load papers",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!paperData.class_id && !!paperData.subject_id && !!token,
  });

  // Mock students data - In real app, this would come from API
  const allStudents = [
    { id: "1", name: "John Doe", roll_number: "001" },
    { id: "2", name: "Jane Smith", roll_number: "002" },
    { id: "3", name: "Mike Johnson", roll_number: "003" },
    { id: "4", name: "Sarah Wilson", roll_number: "004" },
    { id: "5", name: "David Brown", roll_number: "005" },
  ];

  const filteredStudents = allStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll_number.includes(searchTerm)
  );

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file), // Create URL for preview
      assignedStudent: null
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (fileToRemove && fileToRemove.url) {
      URL.revokeObjectURL(fileToRemove.url); // Clean up memory
    }
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const assignFilesToStudent = (studentId) => {
    if (!studentId || selectedFiles.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select a student and at least one file",
        variant: "destructive",
      });
      return;
    }

    const student = allStudents.find(s => s.id === studentId);
    setSelectedStudent(student);

    setUploadedFiles(prev =>
      prev.map(file =>
        selectedFiles.includes(file.id)
          ? { ...file, assignedStudent: studentId }
          : file
      )
    );

    setSelectedFiles([]);

    toast({
      title: "Files Assigned",
      description: `${selectedFiles.length} files assigned to ${student.name}`,
    });
  };

  const unassignFile = (fileId) => {
    setUploadedFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? { ...file, assignedStudent: null }
          : file
      )
    );
  };

  const gradePapersMutation = useMutation({
    mutationFn: async (papersData) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Group files by student and create one result per student
          const studentFiles = {};
          papersData.forEach(paper => {
            if (paper.assignedStudent) {
              if (!studentFiles[paper.assignedStudent]) {
                studentFiles[paper.assignedStudent] = [];
              }
              studentFiles[paper.assignedStudent].push(paper);
            }
          });

          const results = Object.entries(studentFiles).map(([studentId, files]) => {
            const student = allStudents.find(s => s.id === studentId);
            const selectedPaper = papers.find(p => p.id === paperData.paper_id);
            const totalMarks = selectedPaper?.total_marks || 100;
            const obtainedMarks = Math.floor(Math.random() * 40) + 60;
            const percentage = (obtainedMarks / totalMarks) * 100;

            return {
              id: studentId,
              studentId: studentId,
              studentName: student?.name || "Unknown Student",
              rollNumber: student?.roll_number || "N/A",
              className: classes.find(c => c.id === paperData.class_id)?.name || "N/A",
              subjectName: subjects.find(s => s.id === paperData.subject_id)?.name || "N/A",
              paperTitle: selectedPaper?.title || "Assessment Paper",
              totalMarks: totalMarks,
              obtainedMarks: obtainedMarks,
              percentage: percentage,
              grade: getGrade(percentage),
              status: "graded",
              feedback: getMockFeedback(percentage, paperData.subject_id),
              suggestions: getMockSuggestions(percentage, paperData.subject_id),
              improvements: getMockImprovements(percentage, paperData.subject_id),
              gradedFiles: files.map(f => f.name),
              gradedAt: new Date().toISOString()
            };
          });

          resolve({
            status: true,
            data: { results }
          });
        }, 2000);
      });
    },
    onSuccess: (data) => {
      if (data.status) {
        setResults(data.data.results);
        setCurrentStep(4);
        toast({
          title: "🎉 Grading Completed",
          description: `Successfully graded ${data.data.results.length} students' papers`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Grading Failed",
        description: error.message || "Failed to grade papers",
        variant: "destructive",
      });
    }
  });

  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  const handleBeginGrading = () => {
    const assignedFiles = uploadedFiles.filter(f => f.assignedStudent);
    if (assignedFiles.length === 0) {
      toast({
        title: "No Files Assigned",
        description: "Please assign files to students before grading",
        variant: "destructive",
      });
      return;
    }
    gradePapersMutation.mutate(assignedFiles);
  };

  const getMockFeedback = (percentage, subjectId) => {
    const subjectName = subjects.find(s => s.id === subjectId)?.name || "the subject";
    if (percentage >= 90) return `Exceptional performance! Your mastery of ${subjectName} is truly outstanding.`;
    if (percentage >= 80) return `Excellent work! You demonstrate comprehensive understanding of ${subjectName} concepts.`;
    if (percentage >= 70) return `Good performance. You have a solid grasp of ${subjectName} fundamentals.`;
    if (percentage >= 60) return `Satisfactory work. Continue practicing ${subjectName} for better results.`;
    return `Needs improvement. Focus on building ${subjectName} foundational knowledge.`;
  };

  const getMockSuggestions = (percentage, subjectId) => {
    const subjectName = subjects.find(s => s.id === subjectId)?.name || "the subject";
    const suggestions = [
      "Review core concepts and definitions regularly",
      `Practice ${subjectName} problems with varying difficulty levels`,
      "Develop better time management strategies for exams",
      "Focus on improving answer presentation and structure",
      "Work on connecting theoretical knowledge with practical applications"
    ];
    return suggestions.slice(0, Math.floor((100 - percentage) / 20) + 1);
  };

  const getMockImprovements = (percentage, subjectId) => {
    const subjectName = subjects.find(s => s.id === subjectId)?.name || "the subject";
    if (percentage >= 80) return [
      `Explore advanced ${subjectName} topics and applications`,
      "Challenge yourself with competitive exam questions",
      "Develop research projects related to course content"
    ];
    if (percentage >= 60) return [
      `Create a structured ${subjectName} study schedule`,
      "Focus on understanding common mistakes and patterns",
      "Participate in group study sessions for better understanding"
    ];
    return [
      `Start with basic ${subjectName} concept revision daily`,
      "Schedule one-on-one tutoring for difficult topics",
      "Use visual aids and mind maps for better retention"
    ];
  };

  // Enhanced Progress Steps with mobile responsive design
  const ProgressSteps = () => {
    const steps = [
      { number: 1, icon: BookOpen, title: "Paper Details", description: "Basic Information" },
      { number: 2, icon: Upload, title: "Upload & Assign", description: "Add Papers" },
      { number: 3, icon: Settings, title: "Grading", description: "Configuration" },
      { number: 4, icon: Award, title: "Results", description: "View Scores" }
    ];

    return (
      <div className="mb-6 md:mb-8 px-2">
        <div className="flex md:flex-row items-center justify-between max-w-6xl mx-auto gap-4 md:gap-6">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <div key={step.number} className="flex items-center w-full md:w-auto md:flex-1">
                {/* Step Circle */}
                <div className={`relative flex flex-col items-center transition-all duration-300 flex-1 md:flex-none ${
                  isActive ? 'scale-105 md:scale-110' : 'scale-100'
                }`}>
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-500 shadow-lg shadow-emerald-500/25' 
                      : isActive
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500 shadow-lg shadow-blue-500/25'
                      : 'bg-slate-700/50 border-slate-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle size={isMobile ? 16 : 20} className="text-white" />
                    ) : (
                      <IconComponent size={isMobile ? 16 : 18} className={
                        isActive ? 'text-white' : 'text-slate-400'
                      } />
                    )}
                  </div>
                  
                  {/* Step Info */}
                  <div className={`mt-2 md:mt-3 text-center transition-all duration-300 flex-1 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-1'
                  }`}>
                    <div className={`text-xs md:text-sm font-semibold ${
                      isActive || isCompleted ? 'text-white' : 'text-slate-400'
                    }`}>
                      {isMobile ? `Step ${step.number}` : step.title}
                    </div>
                    {!isMobile && (
                      <div className="text-xs text-slate-400 mt-1 hidden md:block">
                        {step.description}
                      </div>
                    )}
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 md:-bottom-2 w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  )}
                </div>

                {/* Connector Line - Responsive design */}
                {index < steps.length - 1 && (
                  <div className={`hidden md:block flex-1 mx-2 md:mx-4 relative`}>
                    <div className={`h-1 w-full rounded-full transition-all duration-300 ${
                      currentStep > step.number 
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500 shadow-lg shadow-emerald-500/25' 
                        : 'bg-slate-600'
                    }`} />
                    <div className={`absolute top-1/2 left-0 w-2 h-2 md:w-3 md:h-3 rounded-full transform -translate-y-1/2 transition-all duration-300 ${
                      currentStep > step.number 
                        ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' 
                        : 'bg-slate-500'
                    }`} />
                    <div className={`absolute top-1/2 right-0 w-2 h-2 md:w-3 md:h-3 rounded-full transform -translate-y-1/2 transition-all duration-300 ${
                      currentStep > step.number 
                        ? 'bg-blue-400 shadow-lg shadow-blue-400/50' 
                        : 'bg-slate-500'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // File Preview Component for Task 4
  const FilePreview = ({ file }) => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="w-12 h-16 md:w-16 md:h-20 rounded-lg overflow-hidden border border-slate-600 flex items-center justify-center bg-slate-700/50 flex-shrink-0">
          <img 
            src={file.url} 
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="w-12 h-16 md:w-16 md:h-20 rounded-lg overflow-hidden border border-slate-600 flex flex-col items-center justify-center bg-red-500/20 flex-shrink-0">
          <FileText className="text-red-400 mb-1" size={isMobile ? 16 : 20} />
          <span className="text-[10px] text-red-300 font-medium">PDF</span>
        </div>
      );
    } else {
      return (
        <div className="w-12 h-16 md:w-16 md:h-20 rounded-lg border border-slate-600 flex items-center justify-center bg-slate-700/50 flex-shrink-0">
          <FileText className="text-blue-400" size={isMobile ? 20 : 24} />
        </div>
      );
    }
  };

  // Step 1: Paper Details - Mobile responsive
  const renderStep1 = () => (
    <div className="space-y-6 md:space-y-8 px-0 md:px-2 lg:px-2">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl md:rounded-3xl mb-4 md:mb-6 shadow-lg shadow-blue-500/25">
          <BookOpen className="text-white" size={isMobile ? 24 : 32} />
        </div>
        <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 md:mb-3">
          Select Assessment Paper
        </h2>
        <p className="text-slate-400 text-sm md:text-lg max-w-md mx-auto px-2">
          Choose the class, subject, and paper you want to grade
        </p>
      </div>

      {/* Form Card */}
      <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl shadow-2xl mx-0 md:mx-0">
        <CardContent className="p-4 md:p-8">
          <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-200 text-sm md:text-base font-semibold mb-2 md:mb-3 flex items-center">
                    <Users className="text-purple-400 mr-2" size={isMobile ? 14 : 16} />
                    Select Class
                  </Label>
                  <Select 
                    value={paperData.class_id} 
                    onValueChange={(value) => setPaperData(prev => ({ ...prev, class_id: value, subject_id: "", paper_id: "" }))}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-10 md:h-12 text-sm md:text-lg focus:border-blue-500">
                      <SelectValue placeholder="Choose class..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-white custom-scrollbar max-h-60">
                      {loadingClasses ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center">
                            <Loader2 className="animate-spin mr-2" size={16} />
                            Loading classes...
                          </div>
                        </SelectItem>
                      ) : (
                        classes.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id.toString()}>
                            {classItem.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-200 text-sm md:text-base font-semibold mb-2 md:mb-3 flex items-center">
                    <BookOpen className="text-emerald-400 mr-2" size={isMobile ? 14 : 16} />
                    Select Subject
                  </Label>
                  <Select 
                    value={paperData.subject_id} 
                    onValueChange={(value) => setPaperData(prev => ({ ...prev, subject_id: value, paper_id: "" }))}
                    disabled={!paperData.class_id || loadingSubjects}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-10 md:h-12 text-sm md:text-lg focus:border-blue-500">
                      <SelectValue 
                        placeholder={
                          !paperData.class_id ? "Select class first" : 
                          loadingSubjects ? "Loading subjects..." : "Choose subject..."
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-white custom-scrollbar max-h-60">
                      {loadingSubjects ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center">
                            <Loader2 className="animate-spin mr-2" size={16} />
                            Loading subjects...
                          </div>
                        </SelectItem>
                      ) : (
                        subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <Label className="text-slate-200 text-sm md:text-base font-semibold mb-2 md:mb-3 flex items-center">
                  <FileText className="text-blue-400 mr-2" size={isMobile ? 14 : 16} />
                  Select Paper
                </Label>
                <Select 
                  value={paperData.paper_id} 
                  onValueChange={(value) => setPaperData(prev => ({ ...prev, paper_id: value }))}
                  disabled={!paperData.subject_id || loadingPapers}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-10 md:h-12 text-sm md:text-lg focus:border-blue-500">
                    <SelectValue 
                      placeholder={
                        !paperData.subject_id ? "Select subject first" : 
                        loadingPapers ? "Loading papers..." : "Choose paper..."
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 text-white custom-scrollbar max-h-60">
                    {loadingPapers ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center">
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Loading papers...
                        </div>
                      </SelectItem>
                    ) : papers.length > 0 ? (
                      papers.map((paper) => (
                        <SelectItem key={paper.id} value={paper.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{paper.title}</span>
                            <span className="text-xs text-slate-400">
                              {paper.total_marks} marks • {paper.duration} mins
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-papers" disabled>
                        No papers available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Info Card */}
              <Card className="bg-gradient-to-br from-slate-700/50 to-slate-800/30 border-slate-600/50">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="text-blue-400" size={isMobile ? 16 : 20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm md:text-base mb-1 md:mb-2">Paper Selection</h4>
                      <p className="text-slate-400 text-xs md:text-sm">
                        Choose from your existing assessment papers. The system will use the selected paper's answer key and grading criteria.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center px-2">
        <Button
          onClick={() => setCurrentStep(2)}
          disabled={!paperData.class_id || !paperData.subject_id || !paperData.paper_id}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 md:px-12 py-4 md:py-6 text-base md:text-lg font-semibold rounded-xl md:rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform hover:scale-105 w-full md:w-auto"
        >
          Continue to Upload
          <ChevronRight size={20} className="ml-2 md:ml-3" />
        </Button>
      </div>
    </div>
  );

  // Step 2: File Upload with Student Assignment - Mobile responsive
  const renderStep2 = () => {
    // Calculate assigned files count per student for Task 3
    const studentAssignmentCount = {};
    uploadedFiles.forEach(file => {
      if (file.assignedStudent) {
        studentAssignmentCount[file.assignedStudent] = (studentAssignmentCount[file.assignedStudent] || 0) + 1;
      }
    });

    return (
      <div className="space-y-6 md:space-y-8 px-0">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl md:rounded-3xl mb-4 md:mb-6 shadow-lg shadow-emerald-500/25">
            <Upload className="text-white" size={isMobile ? 24 : 32} />
          </div>
          <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 md:mb-3">
            Upload & Assign Papers
          </h2>
          <p className="text-slate-400 text-sm md:text-lg">
            Upload papers and assign them to students
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
          {/* Left Column - Upload Area */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-4 md:p-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-slate-200 text-base md:text-lg font-semibold mb-3 md:mb-4 block">
                      Upload Files
                    </Label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="paper-upload"
                    />
                    <Label
                      htmlFor="paper-upload"
                      className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-700/50 to-slate-800/30 border-2 border-dashed border-slate-600 rounded-xl md:rounded-2xl p-6 md:p-8 cursor-pointer hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
                    >
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                        <Upload className="text-emerald-400" size={isMobile ? 20 : 28} />
                      </div>
                      <span className="text-slate-200 text-sm md:text-lg font-semibold text-center mb-1 md:mb-2">
                        Drop files here or click to browse
                      </span>
                      <span className="text-slate-400 text-center text-xs md:text-sm">
                        Supports PDF, DOC, JPG, PNG files
                      </span>
                    </Label>
                  </div>

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-slate-200 text-base md:text-lg font-semibold">
                        Uploaded Files ({uploadedFiles.length})
                      </Label>
                      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                        {uploadedFiles.map((file) => {
                          const isSelected = selectedFiles.includes(file.id);
                          const isAssigned = file.assignedStudent;
                          
                          // Task 2: Different colors for different states
                          let bgColor = 'bg-slate-700/30';
                          let borderColor = 'border-transparent';
                          
                          if (isAssigned) {
                            bgColor = 'bg-emerald-500/10';
                            borderColor = 'border-emerald-500/20';
                          } else if (isSelected) {
                            bgColor = 'bg-blue-500/10';
                            borderColor = 'border-blue-500/20';
                          }

                          return (
                            <div 
                              key={file.id} 
                              className={`flex items-center justify-between rounded-lg md:rounded-xl p-3 md:p-4 transition-all border ${bgColor} ${borderColor}`}
                            >
                              <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                                {/* Task 4: File Preview */}
                                <FilePreview file={file} />
                                
                                <div className="flex-1 min-w-0">
                                  <span className="text-slate-200 font-medium block truncate text-sm md:text-base">{file.name}</span>
                                  <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                                    <Badge 
                                      variant="secondary" 
                                      className="text-xs bg-slate-600/50 text-slate-300"
                                    >
                                      {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                    </Badge>
                                    {file.assignedStudent && (
                                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                                        Assigned to: {allStudents.find(s => s.id === file.assignedStudent)?.name}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1 md:space-x-2 ml-2">
                                {!file.assignedStudent && (
                                  <>
                                    <div 
                                      className={`w-4 h-4 md:w-5 md:h-5 rounded border cursor-pointer transition-all flex items-center justify-center ${
                                        isSelected
                                          ? 'bg-blue-500 border-blue-500'
                                          : 'border-slate-400 hover:border-blue-400'
                                      }`}
                                      onClick={() => toggleFileSelection(file.id)}
                                    >
                                      {isSelected && (
                                        <CheckCircle size={isMobile ? 12 : 14} className="text-white" />
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFile(file.id)}
                                      className="text-red-400 hover:text-red-300 hover:bg-red-400/20 p-1 md:p-2"
                                    >
                                      <X size={isMobile ? 14 : 16} />
                                    </Button>
                                  </>
                                )}
                                {file.assignedStudent && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => unassignFile(file.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/20 p-1 md:p-2"
                                  >
                                    <X size={isMobile ? 14 : 16} />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Students List */}
          <div className="space-y-6">
            <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl shadow-2xl">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-white text-lg md:text-xl flex items-center">
                  <Users className="text-purple-400 mr-2 md:mr-3" size={isMobile ? 16 : 20} />
                  Assign to Students
                  {selectedFiles.length > 0 && (
                    <Badge className="ml-2 bg-blue-500/20 text-blue-300 text-xs">
                      {selectedFiles.length} selected
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white pl-10 custom-scrollbar text-sm md:text-base"
                  />
                </div>

                {/* Students List */}
                <div className="space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-y-auto custom-scrollbar">
                  {filteredStudents.map((student) => {
                    const assignedCount = studentAssignmentCount[student.id] || 0;
                    const hasAssignedFiles = assignedCount > 0;
                    
                    return (
                      <div
                        key={student.id}
                        className={`p-3 md:p-4 rounded-lg md:rounded-xl cursor-pointer transition-all border ${
                          selectedStudent?.id === student.id
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30'
                            : hasAssignedFiles
                            ? 'bg-emerald-500/10 border-emerald-500/20'
                            : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50'
                        }`}
                        onClick={() => assignFilesToStudent(student.id)}
                      >
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 ${
                            hasAssignedFiles ? 'bg-emerald-500/20' : 'bg-purple-500/20'
                          }`}>
                            <User className={hasAssignedFiles ? "text-emerald-400" : "text-purple-400"} size={isMobile ? 14 : 18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold truncate text-sm md:text-base">{student.name}</div>
                            <div className="text-slate-400 text-xs md:text-sm">Roll No: {student.roll_number}</div>
                            {/* Task 3: Show assigned files count */}
                            {hasAssignedFiles && (
                              <div className="text-emerald-300 text-xs mt-1">
                                {assignedCount} file{assignedCount > 1 ? 's' : ''} assigned
                              </div>
                            )}
                          </div>
                          {selectedFiles.length > 0 && (
                            <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                              {selectedFiles.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Assignment Stats */}
                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <CardContent className="p-3 md:p-4">
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                        {uploadedFiles.filter(f => f.assignedStudent).length} / {uploadedFiles.length}
                      </div>
                      <p className="text-purple-200 text-xs md:text-sm">Files Assigned</p>
                      <div className="w-full bg-slate-600 rounded-full h-2 mt-2 md:mt-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(uploadedFiles.filter(f => f.assignedStudent).length / Math.max(uploadedFiles.length, 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-xl">
              <CardContent className="p-4 md:p-6">
                <div className="text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <BarChart3 className="text-white" size={isMobile ? 20 : 24} />
                  </div>
                  <h3 className="text-white font-semibold text-sm md:text-base mb-1 md:mb-2">Quick Stats</h3>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">{uploadedFiles.length}</div>
                  <p className="text-blue-200 text-xs md:text-sm">Total Files</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 pt-4 md:pt-6 px-2">
          <Button
            onClick={() => setCurrentStep(1)}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold w-full md:w-auto"
          >
            <ChevronLeft size={18} className="mr-2" />
            Back
          </Button>
          <Button
            onClick={() => setCurrentStep(3)}
            disabled={uploadedFiles.filter(f => f.assignedStudent).length === 0}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 md:px-12 py-3 md:py-4 rounded-xl font-semibold shadow-lg shadow-emerald-500/25 w-full md:w-auto"
          >
            Configure Grading
            <Settings size={18} className="ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  // Step 3: Grading Configuration - Mobile responsive
  const renderStep3 = () => (
    <div className="space-y-6 md:space-y-8 px-2">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl md:rounded-3xl mb-4 md:mb-6 shadow-lg shadow-orange-500/25">
          <Settings className="text-white" size={isMobile ? 24 : 32} />
        </div>
        <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 md:mb-3">
          Grading Configuration
        </h2>
        <p className="text-slate-400 text-sm md:text-lg">
          Set up how you want the papers to be evaluated
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
        {/* Left Column - Settings */}
        <div className="xl:col-span-2 space-y-6">
          {/* Assessment Method */}
          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-white text-lg md:text-xl flex items-center">
                <Target className="text-orange-400 mr-2 md:mr-3" size={isMobile ? 16 : 20} />
                Assessment Methodology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={gradingSettings.method}
                onValueChange={(value) => setGradingSettings(prev => ({ ...prev, method: value }))}
                className="space-y-3 md:space-y-4"
              >
                <div className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 rounded-lg md:rounded-xl hover:bg-slate-700/30 cursor-pointer transition-all border-2 border-transparent hover:border-slate-600">
                  <RadioGroupItem value="literal" id="literal-grading" />
                  <div className="flex-1">
                    <Label htmlFor="literal-grading" className="text-white font-semibold text-base md:text-lg cursor-pointer">
                      Literal Comparison
                    </Label>
                    <p className="text-slate-400 mt-1 md:mt-2 text-sm md:text-base">
                      Direct word-for-word matching against standard answers. Best for objective questions with precise answers.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 rounded-lg md:rounded-xl hover:bg-slate-700/30 cursor-pointer transition-all border-2 border-transparent hover:border-slate-600">
                  <RadioGroupItem value="conceptual" id="conceptual-grading" />
                  <div className="flex-1">
                    <Label htmlFor="conceptual-grading" className="text-white font-semibold text-base md:text-lg cursor-pointer">
                      Conceptual Matching
                    </Label>
                    <p className="text-slate-400 mt-1 md:mt-2 text-sm md:text-base">
                      AI-powered context understanding. Evaluates meaning and conceptual understanding. Ideal for subjective answers.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Source Material */}
          <Card className="bg-slate-800/40 p-4 border-slate-700/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-white text-lg md:text-xl flex items-center">
                <BookOpen className="text-blue-400 mr-2 md:mr-3" size={isMobile ? 16 : 20} />
                Reference Material
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={gradingSettings.sourceKey}
                onValueChange={(value) => setGradingSettings(prev => ({ ...prev, sourceKey: value }))}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-12 md:h-14 text-sm md:text-lg focus:border-blue-500">
                  <SelectValue placeholder="Select answer key source..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-white custom-scrollbar">
                  <SelectItem value="math-key">Mathematics Standard Answer Key</SelectItem>
                  <SelectItem value="science-key">Science Curriculum Guide</SelectItem>
                  <SelectItem value="english-key">English Literature Standards</SelectItem>
                  <SelectItem value="history-key">Historical Reference Material</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-slate-400 text-xs md:text-sm mt-2 md:mt-3">
                Choose the reference material that matches your assessment criteria for accurate grading.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="bg-gradient-to-br p-4 from-slate-800/40 to-slate-900/40 border-slate-700/50 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-lg md:text-xl">Assessment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center py-2 md:py-3 border-b border-slate-600/50">
                <span className="text-slate-400 text-sm md:text-base">Selected Paper</span>
                <span className="text-white font-semibold text-right text-sm md:text-base">
                  {papers.find(p => p.id.toString() === paperData.paper_id)?.title || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 md:py-3 border-b border-slate-600/50">
                <span className="text-slate-400 text-sm md:text-base">Class</span>
                <span className="text-white text-sm md:text-base">{classes.find(c => c.id.toString() === paperData.class_id)?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-2 md:py-3 border-b border-slate-600/50">
                <span className="text-slate-400 text-sm md:text-base">Subject</span>
                <span className="text-white text-sm md:text-base">{subjects.find(s => s.id.toString() === paperData.subject_id)?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-2 md:py-3 border-b border-slate-600/50">
                <span className="text-slate-400 text-sm md:text-base">Files to Grade</span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs md:text-sm">
                  {uploadedFiles.filter(f => f.assignedStudent).length}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 md:py-3">
                <span className="text-slate-400 text-sm md:text-base">Students</span>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 text-xs md:text-sm">
                  {new Set(uploadedFiles.filter(f => f.assignedStudent).map(f => f.assignedStudent)).size}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Start Grading Card */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-xl">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Sparkles className="text-orange-400" size={isMobile ? 20 : 28} />
                </div>
                <h3 className="text-white font-semibold text-lg md:text-xl mb-2 md:mb-3">Ready to Grade</h3>
                <p className="text-orange-200 text-xs md:text-sm mb-4 md:mb-6">
                  {uploadedFiles.filter(f => f.assignedStudent).length} files will be processed using {gradingSettings.method} assessment
                </p>
                <Button
                  onClick={handleBeginGrading}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl shadow-lg shadow-orange-500/25"
                  disabled={!gradingSettings.sourceKey || gradePapersMutation.isPending}
                >
                  {gradePapersMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2 md:mr-3"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 md:mr-3" size={isMobile ? 16 : 20} />
                      Begin AI Grading
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center pt-4 md:pt-6 px-2">
        <Button
          onClick={() => setCurrentStep(2)}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold w-full md:w-auto"
        >
          <ChevronLeft size={18} className="mr-2" />
          Back to Upload
        </Button>
      </div>
    </div>
  );

  // Step 4: Results with Table and Individual Result Cards - Mobile responsive
  const renderStep4 = () => (
    <div className="space-y-6 md:space-y-8 px-0">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl md:rounded-3xl mb-4 md:mb-6 shadow-lg shadow-green-500/25">
          <Award className="text-white" size={isMobile ? 24 : 32} />
        </div>
        <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 md:mb-3">
          Grading Results
        </h2>
        <p className="text-slate-400 text-sm md:text-lg">
          Detailed analysis and performance reports for all students
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 md:gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-xl">
          <CardContent className="p-3 md:p-6 text-center">
            <div className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{results.length}</div>
            <p className="text-blue-200 text-xs md:text-sm">Students Graded</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-xl">
          <CardContent className="p-3 md:p-6 text-center">
            <div className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">
              {Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / Math.max(results.length, 1))}%
            </div>
            <p className="text-green-200 text-xs md:text-sm">Average Score</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-xl">
          <CardContent className="p-3 md:p-6 text-center">
            <div className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">
              {results.filter(r => r.percentage >= 80).length}
            </div>
            <p className="text-orange-200 text-xs md:text-sm">Excellent Grades</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-xl">
          <CardContent className="p-3 md:p-6 text-center">
            <div className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">
              {results.filter(r => r.percentage < 60).length}
            </div>
            <p className="text-purple-200 text-xs md:text-sm">Need Improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card className="p-4 bg-slate-800/40 overflow-hidden overflow-x-auto custom-scrollbar border-slate-700/50 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white text-lg md:text-xl flex md:flex-row md:items-center justify-between gap-2 md:gap-0">
            <div className="flex items-center">
              <BarChart3 className="text-blue-400 mr-2 md:mr-3" size={isMobile ? 18 : 24} />
              Student Results
            </div>
            <div className="flex gap-1 md:gap-2">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs">
                <Printer className="mr-1 md:mr-2" size={14} />
                {isMobile ? "" : "Print All"}
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs">
                <Download className="mr-1 md:mr-2" size={14} />
                {isMobile ? "" : "Export All"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-600/50">
                  <th className="text-left py-3 px-2 md:px-4 text-slate-300 font-semibold text-sm">Student</th>
                  <th className="text-left py-3 px-2 md:px-4 text-slate-300 font-semibold text-sm">Roll No</th>
                  {!isMobile && (
                    <>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold text-sm">Class</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold text-sm">Subject</th>
                    </>
                  )}
                  <th className="text-center py-3 px-2 md:px-4 text-slate-300 font-semibold text-sm">Marks</th>
                  <th className="text-center py-3 px-2 md:px-4 text-slate-300 font-semibold text-sm">Percentage</th>
                  <th className="text-center py-3 px-2 md:px-4 text-slate-300 font-semibold text-sm">Grade</th>
                  <th className="text-center py-3 px-2 md:px-4 text-slate-300 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-b border-slate-600/30 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-2 md:px-4 text-white font-medium text-sm">{result.studentName}</td>
                    <td className="py-3 px-2 md:px-4 text-slate-300 text-sm">{result.rollNumber}</td>
                    {!isMobile && (
                      <>
                        <td className="py-3 px-4 text-slate-300 text-sm">{result.className}</td>
                        <td className="py-3 px-4 text-slate-300 text-sm">{result.subjectName}</td>
                      </>
                    )}
                    <td className="py-3 px-2 md:px-4 text-center">
                      <Badge className={
                        result.percentage >= 80 ? "bg-green-500/20 text-green-300 border-green-500/30 text-xs" :
                        result.percentage >= 60 ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs" :
                        "bg-red-500/20 text-red-300 border-red-500/30 text-xs"
                      }>
                        {result.obtainedMarks}/{result.totalMarks}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 md:px-4 text-center text-white font-semibold text-sm">
                      {result.percentage}%
                    </td>
                    <td className="py-3 px-2 md:px-4 text-center">
                      <Badge className={
                        result.grade === "A+" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 text-xs" :
                        result.grade === "A" ? "bg-green-500/20 text-green-300 border-green-500/30 text-xs" :
                        result.grade === "B" ? "bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs" :
                        result.grade === "C" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs" :
                        result.grade === "D" ? "bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs" :
                        "bg-red-500/20 text-red-300 border-red-500/30 text-xs"
                      }>
                        {result.grade}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 md:px-4 text-center">
                      <div className="flex justify-center space-x-1 md:space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedResult(result)}
                          className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20 text-xs p-1 md:p-2"
                        >
                          <Eye size={12} className="md:mr-1" />
                          {isMobile ? "" : "View"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs p-1 md:p-2"
                        >
                          <Download size={12} className="md:mr-1" />
                          {isMobile ? "" : "Download"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Individual Result Card Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex  items-center justify-center z-50 p-2 md:p-4">
          <div className="overflow-y-auto custom-scrollbar bg-slate-800 rounded-xl md:rounded-2xl w-full max-w-2xl max-h-[90vh] ">
            <div className="p-4 md:p-6 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-white text-lg md:text-xl font-semibold">Student Result Card</h3>
              <Button
                variant="ghost"
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 hover:text-white p-2"
              >
                <X size={20} />
              </Button>
            </div>
            <div className="p-4 md:p-6">
              {/* Result Card Header */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 border border-blue-500/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div>
                    <h4 className="text-white font-semibold text-base md:text-lg">{selectedResult.studentName}</h4>
                    <p className="text-slate-400 text-sm">Roll No: {selectedResult.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Class: {selectedResult.className}</p>
                    <p className="text-slate-400 text-sm">Subject: {selectedResult.subjectName}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">{selectedResult.percentage}%</div>
                    <Badge className={
                      selectedResult.grade === "A+" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 text-xs md:text-sm" :
                      "bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs md:text-sm"
                    }>
                      Grade: {selectedResult.grade}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Marks Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                <Card className="bg-slate-700/30 border-slate-600">
                  <CardContent className="p-3 md:p-4">
                    <h5 className="text-white font-semibold mb-2 md:mb-3 text-sm md:text-base">Marks Summary</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Obtained Marks:</span>
                        <span className="text-white font-semibold">{selectedResult.obtainedMarks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Marks:</span>
                        <span className="text-white font-semibold">{selectedResult.totalMarks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Percentage:</span>
                        <span className="text-white font-semibold">{selectedResult.percentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Grade:</span>
                        <span className="text-white font-semibold">{selectedResult.grade}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700/30 border-slate-600">
                  <CardContent className="p-3 md:p-4">
                    <h5 className="text-white font-semibold mb-2 md:mb-3 text-sm md:text-base">Paper Details</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Paper Title:</span>
                        <span className="text-white font-semibold text-right">{selectedResult.paperTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Graded Files:</span>
                        <span className="text-white font-semibold">{selectedResult.gradedFiles.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                          {selectedResult.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Feedback and Suggestions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                  <Card className="bg-slate-700/30 border-slate-600">
                    <CardContent className="p-3 md:p-4">
                      <h5 className="text-white font-semibold mb-2 md:mb-3 text-sm md:text-base flex items-center">
                        <Lightbulb className="text-blue-400 mr-2" size={16} />
                        AI Feedback
                      </h5>
                      <p className="text-slate-200 leading-relaxed text-sm md:text-base">{selectedResult.feedback}</p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-3 md:p-4">
                        <h5 className="text-white font-semibold mb-2 md:mb-3 text-sm md:text-base flex items-center">
                          <TrendingUp className="text-emerald-400 mr-2" size={16} />
                          Suggestions
                        </h5>
                        <ul className="space-y-1 md:space-y-2">
                          {selectedResult.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start text-slate-300 text-xs md:text-sm">
                              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-400 rounded-full mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-3 md:p-4">
                        <h5 className="text-white font-semibold mb-2 md:mb-3 text-sm md:text-base flex items-center">
                          <Sparkles className="text-purple-400 mr-2" size={16} />
                          Improvements
                        </h5>
                        <ul className="space-y-1 md:space-y-2">
                          {selectedResult.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-start text-slate-300 text-xs md:text-sm">
                              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-400 rounded-full mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 md:space-y-4">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 md:py-3 text-sm">
                    <Download className="mr-2" size={16} />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 py-2 md:py-3 text-sm">
                    <Printer className="mr-2" size={16} />
                    Print Result
                  </Button>
                  <div className="bg-slate-700/30 rounded-lg md:rounded-xl p-3 md:p-4">
                    <h5 className="text-white font-semibold mb-2 text-xs md:text-sm">Performance Chart</h5>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          selectedResult.percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          selectedResult.percentage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-red-500 to-pink-500'
                        }`}
                        style={{ width: `${selectedResult.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-6 md:pt-8 border-t border-slate-700/50 px-2">
        <Button
          onClick={() => {
            setCurrentStep(1);
            setUploadedFiles([]);
            setResults([]);
            setSelectedFiles([]);
            setSelectedStudent(null);
            setPaperData({
              class_id: "",
              subject_id: "",
              paper_id: "",
            });
          }}
          variant="outline"
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-lg"
        >
          Grade New Papers
        </Button>
        <Button className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 md:py-4 rounded-xl font-semibold text-sm md:text-lg shadow-lg shadow-emerald-500/25">
          <Download className="mr-2 md:mr-3" size={isMobile ? 16 : 20} />
          Export All Results
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
     <GlassmorphismLayout>
   <div className="flex">
        <TeacherSidebar />
        <div className="flex-1 container mx-auto !p-0 px-0 md:px-0 py-0 md:py-0">
              <div className=" mx-0 p-0 md:p-0 lg:p-6">
          {/* Enhanced Progress Steps */}
          <ProgressSteps />

          {/* Main Content */}
          <div className="max-w-7xl mx-0">
            {renderCurrentStep()}
          </div>
        
        </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.8);
        }
      `}</style>
    </GlassmorphismLayout>
  );
}