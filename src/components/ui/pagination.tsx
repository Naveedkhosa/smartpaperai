import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Presentation,
  FileText,
  Clock,
  Users,
  Brain,
  Upload,
  Plus,
  CheckCircle,
  BarChart3,
  CloudUpload,
  BookOpen,
  Lightbulb,
  ScanLine,
  Settings,
  FileX,
  Target,
  Bookmark,
  Eye,
  Edit3,
  Image,
} from "lucide-react";

// Import sample images (replace with your actual image imports)
import physicsThumb from "@/thumbs/physics.png";
import chemThumb from "@/thumbs/chem.png";
import mathThumb from "@/thumbs/doc.png";
import bioThumb from "@/thumbs/doc.png";
import engThumb from "@/thumbs/doc.png";
import csThumb from "@/thumbs/doc.png";
import historyThumb from "@/thumbs/doc.png";
import geoThumb from "@/thumbs/doc.png";
import pdfThumb from "@/thumbs/pdf.jpg";
import docThumb from "@/thumbs/doc.png";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [paperCreationOpen, setPaperCreationOpen] = useState(false);
  const [submissionUploadOpen, setSubmissionUploadOpen] = useState(false);

  // Form states
  const [paperForm, setPaperForm] = useState({
    title: "",
    subject: "",
    classId: "",
    creationMethod: "generate",
    sourceType: "keybook",
    generationMode: "intelligent",
    questionTypes: [],
    totalMarks: 100,
    content: "",
    personalCategory: "All",
    databaseType: "public",
  });

  const [gradingSettings, setGradingSettings] = useState({
    method: "conceptual",
    selectedPaper: "",
    sourceKey: "",
  });

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["/api/classes/teacher", user?.id],
    enabled: !!user?.id,
  });

  const { data: papers, isLoading: papersLoading } = useQuery({
    queryKey: ["/api/papers/teacher", user?.id],
    enabled: !!user?.id,
  });

  const { data: studyMaterials } = useQuery({
    queryKey: ["/api/study-materials"],
  });

  const teacherStats = {
    activeClasses: (classes as any[])?.length || 6,
    papersCreated: (papers as any[])?.length || 24,
    pendingGrading: 12,
    totalStudents: 156,
  };

  const recentPapers = [
    {
      id: 1,
      title: "Math Quiz - Algebra",
      class: "Class 9-A",
      submissions: 23,
      avgScore: "85%",
      status: "completed",
    },
    {
      id: 2,
      title: "English Essay - Literature",
      class: "Class 10-A",
      submissions: 18,
      avgScore: "78%",
      status: "active",
    },
    {
      id: 3,
      title: "Physics Test - Motion",
      class: "Class 10-B",
      submissions: 0,
      avgScore: "0%",
      status: "draft",
    },
  ];

  const pendingSubmissions = [
    {
      id: 1,
      title: "Physics Test - Chapter 5",
      class: "Class 10-B",
      submissions: 15,
      dueDate: "2 days",
    },
    {
      id: 2,
      title: "Chemistry Lab Report",
      class: "Class 9-A",
      submissions: 22,
      dueDate: "5 days",
    },
  ];

  // Using imported images
  const [publicFiles] = useState([
    { title: "Physics MCQs", thumbnail: physicsThumb },
    { title: "Chemistry Notes", thumbnail: chemThumb },
    { title: "Math Paper", thumbnail: mathThumb },
    { title: "Biology Quiz", thumbnail: bioThumb },
    { title: "English Test", thumbnail: engThumb },
    { title: "Computer Science", thumbnail: csThumb },
    { title: "History Material", thumbnail: historyThumb },
    { title: "Geography MCQs", thumbnail: geoThumb },
  ]);

  const [personalFiles] = useState([
    { title: "Past Paper 2019", category: "Past papers", thumbnail: pdfThumb },
    { title: "Past Paper 2020", category: "Past papers", thumbnail: pdfThumb },
    { title: "Key Notes", category: "Ebook", thumbnail: docThumb },
    { title: "Lecture Slides", category: "Ebook", thumbnail: docThumb },
    { title: "Diagrams", category: "Ebook", thumbnail: pdfThumb },
  ]);

  // Pagination
  const [visiblePublic, setVisiblePublic] = useState(6);

  // Mock data for key books and past papers
  const keyBooks = [
    {
      id: 1,
      title: "Mathematics Grade 10 - Chapter 1-5",
      subject: "Mathematics",
    },
    { id: 2, title: "Physics Fundamentals", subject: "Physics" },
    { id: 3, title: "Chemistry Basics", subject: "Chemistry" },
  ];

  const pastPapers = [
    {
      id: 1,
      title: "2023 Mathematics Final Exam",
      subject: "Mathematics",
      year: "2023",
    },
    { id: 2, title: "2022 Physics Midterm", subject: "Physics", year: "2022" },
  ];

  // Mutations
  const createPaperMutation = useMutation({
    mutationFn: (paperData: any) =>
      fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paperData,
          teacherId: user?.id,
        }),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/papers/teacher", user?.id],
      });
      setPaperCreationOpen(false);
      setPaperForm({
        title: "",
        subject: "",
        classId: "",
        creationMethod: "generate",
        sourceType: "keybook",
        generationMode: "intelligent",
        questionTypes: [],
        totalMarks: 100,
        content: "",
        personalCategory: "All",
        databaseType: "public",
      });
      toast({ title: "Success", description: "Paper created successfully" });
    },
  });

  const handleCreatePaper = () => {
    const paperData = {
      title: paperForm.title,
      subject: paperForm.subject,
      classId: paperForm.classId,
      totalMarks: paperForm.totalMarks,
      content: {
        creationMethod: paperForm.creationMethod,
        sourceType: paperForm.sourceType,
        generationMode: paperForm.generationMode,
        questionTypes: paperForm.questionTypes,
        generatedContent: paperForm.content,
      },
    };
    createPaperMutation.mutate(paperData);
  };

  const handleQuestionTypeToggle = (type: string) => {
    setPaperForm((prev) => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter((t) => t !== type)
        : [...prev.questionTypes, type],
    }));
  };

  if (classesLoading || papersLoading) {
    return (
      <GlassmorphismLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-300"></div>
          </div>
        </div>
      </GlassmorphismLayout>
    );
  }

  return (
    <GlassmorphismLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="glassmorphism-strong rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome back, {user?.fullName}!
              </h2>
              <p className="text-slate-200/90 text-sm sm:text-base">
                Comprehensive paper generation and assessment platform
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-slate-300/80 text-xs sm:text-sm">
                Today's Date
              </p>
              <p className="text-white font-semibold text-sm sm:text-base">
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="glassmorphism-strong rounded-xl p-4 sm:p-6 animate-scale-in hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200/80 text-xs sm:text-sm font-medium">
                  Active Classes
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {teacherStats.activeClasses}
                </p>
              </div>
              <Presentation className="text-emerald-400 opacity-80" size={28} />
            </div>
          </div>

          <div
            className="glassmorphism-strong rounded-xl p-4 sm:p-6 animate-scale-in hover:scale-105 transition-transform"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200/80 text-xs sm:text-sm font-medium">
                  Papers Created
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {teacherStats.papersCreated}
                </p>
              </div>
              <FileText className="text-emerald-400 opacity-80" size={28} />
            </div>
          </div>

          <div
            className="glassmorphism-strong rounded-xl p-4 sm:p-6 animate-scale-in hover:scale-105 transition-transform"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200/80 text-xs sm:text-sm font-medium">
                  Pending Grading
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {teacherStats.pendingGrading}
                </p>
              </div>
              <Clock className="text-amber-400 opacity-80" size={28} />
            </div>
          </div>

          <div
            className="glassmorphism-strong rounded-xl p-4 sm:p-6 animate-scale-in hover:scale-105 transition-transform"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200/80 text-xs sm:text-sm font-medium">
                  Total Students
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {teacherStats.totalStudents}
                </p>
              </div>
              <Users className="text-emerald-400 opacity-80" size={28} />
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-6 sm:mb-8 glassmorphism-strong border-white/30 gap-1 sm:gap-0 p-1">
            <TabsTrigger
              value="overview"
              data-testid="tab-overview"
              className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-emerald-200 text-slate-200/80 hover:text-slate-100 transition-all text-xs sm:text-sm py-2 sm:py-3 font-medium"
            >
              <Eye className="mr-1 sm:mr-2" size={14} />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger
              value="create"
              data-testid="tab-create-paper"
              className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-emerald-200 text-slate-200/80 hover:text-slate-100 transition-all text-xs sm:text-sm py-2 sm:py-3 font-medium"
            >
              <FileText className="mr-1 sm:mr-2" size={14} />
              <span className="hidden sm:inline">Create Paper</span>
              <span className="sm:hidden">Create</span>
            </TabsTrigger>
            <TabsTrigger
              value="grade"
              data-testid="tab-grading"
              className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-emerald-200 text-slate-200/80 hover:text-slate-100 transition-all text-xs sm:text-sm py-2 sm:py-3 font-medium"
            >
              <CheckCircle className="mr-1 sm:mr-2" size={14} />
              <span className="hidden sm:inline">Grade</span>
              <span className="sm:hidden">Grade</span>
            </TabsTrigger>
            <TabsTrigger
              value="manage"
              data-testid="tab-manage"
              className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-emerald-200 text-slate-200/80 hover:text-slate-100 transition-all text-xs sm:text-sm py-2 sm:py-3 font-medium"
            >
              <Settings className="mr-1 sm:mr-2" size={14} />
              <span className="hidden sm:inline">Manage</span>
              <span className="sm:hidden">More</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Papers */}
              <Card
                data-testid="recent-papers-list"
                className="glassmorphism-strong border-white/30"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">
                    Recent Papers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentPapers.map((paper) => (
                    <div
                      key={paper.id}
                      className="glassmorphism p-4 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold text-sm">
                          {paper.title}
                        </h4>
                        <Badge
                          className={
                            paper.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : paper.status === "active"
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-slate-500/20 text-slate-300"
                          }
                        >
                          {paper.status}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-xs mb-3">
                        {paper.class} • {paper.submissions} submissions
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-300 text-xs">
                          {paper.avgScore} avg score
                        </span>
                        <div className="flex space-x-2">
                          <button
                            data-testid={`button-view-paper-${paper.id}`}
                            className="text-emerald-300 hover:text-emerald-200 p-1"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            data-testid={`button-edit-paper-${paper.id}`}
                            className="text-blue-300 hover:text-blue-200 p-1"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card
                data-testid="quick-actions-overview"
                className="glassmorphism-strong border-white/30"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    data-testid="button-upload-submissions-overview"
                    onClick={() => setSubmissionUploadOpen(true)}
                    className="w-full glassmorphism hover:bg-white/20 p-4 rounded-lg text-left transition-all flex items-center"
                  >
                    <CloudUpload className="text-emerald-300 mr-3" size={20} />
                    <span className="text-white">Upload Submissions</span>
                  </button>
                  <button
                    data-testid="button-grade-papers-overview"
                    onClick={() => setActiveTab("grade")}
                    className="w-full glassmorphism hover:bg-white/20 p-4 rounded-lg text-left transition-all flex items-center"
                  >
                    <CheckCircle className="text-emerald-300 mr-3" size={20} />
                    <span className="text-white">Grade Papers</span>
                  </button>
                  <button
                    data-testid="button-create-paper-overview"
                    onClick={() => setActiveTab("create")}
                    className="w-full glassmorphism hover:bg-white/20 p-4 rounded-lg text-left transition-all flex items-center"
                  >
                    <Plus className="text-emerald-300 mr-3" size={20} />
                    <span className="text-white">Create New Paper</span>
                  </button>
                  <button
                    data-testid="button-view-analytics-overview"
                    className="w-full glassmorphism hover:bg-white/20 p-4 rounded-lg text-left transition-all flex items-center"
                  >
                    <BarChart3 className="text-emerald-300 mr-3" size={20} />
                    <span className="text-white">View Analytics</span>
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Pending Submissions */}
            <Card
              data-testid="pending-submissions-overview"
              className="glassmorphism-strong border-white/30"
            >
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  Pending Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="glassmorphism p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="text-white font-semibold">
                            {submission.title}
                          </h5>
                          <p className="text-white/60 text-sm">
                            {submission.class}
                          </p>
                        </div>
                        <Badge className="bg-amber-500/20 text-amber-300">
                          Due in {submission.dueDate}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-300 text-sm">
                          {submission.submissions} submissions
                        </span>
                        <Button
                          data-testid={`button-grade-overview-${submission.id}`}
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          onClick={() => setActiveTab("grade")}
                        >
                          Grade
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Paper Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card
              data-testid="paper-creation-comprehensive"
              className="glassmorphism-strong border-white/30"
            >
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">
                  Paper Generation System
                </CardTitle>
                <p className="text-white/70">
                  Create papers using AI or upload your own compositions
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="block text-white/80 text-sm font-medium mb-2">
                        Paper Title
                      </Label>
                      <Input
                        data-testid="input-paper-title"
                        value={paperForm.title}
                        onChange={(e) =>
                          setPaperForm({ ...paperForm, title: e.target.value })
                        }
                        className="glass-input"
                        placeholder="e.g., Math Quiz - Algebra"
                      />
                    </div>
                    <div>
                      <Label className="block text-white/80 text-sm font-medium mb-2">
                        Subject
                      </Label>
                      <Select
                        value={paperForm.subject}
                        onValueChange={(value) =>
                          setPaperForm({ ...paperForm, subject: value })
                        }
                      >
                        <SelectTrigger
                          data-testid="select-paper-subject"
                          className="glass-input"
                        >
                          <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mathematics">
                            Mathematics
                          </SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="physics">Physics</SelectItem>
                          <SelectItem value="chemistry">Chemistry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="block text-white/80 text-sm font-medium mb-2">
                        Class
                      </Label>
                      <Select
                        value={paperForm.classId}
                        onValueChange={(value) =>
                          setPaperForm({ ...paperForm, classId: value })
                        }
                      >
                        <SelectTrigger
                          data-testid="select-paper-class"
                          className="glass-input"
                        >
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {(classes as any[])?.map((cls: any) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Creation Method */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Creation Method
                  </h3>
                  <RadioGroup
                    value={paperForm.creationMethod}
                    onValueChange={(value) =>
                      setPaperForm({ ...paperForm, creationMethod: value })
                    }
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="glassmorphism p-6 rounded-xl space-y-3">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem
                          data-testid="radio-generate-method"
                          value="generate"
                          id="generate"
                        />
                        <Label
                          htmlFor="generate"
                          className="text-white font-semibold cursor-pointer flex items-center"
                        >
                          <Brain className="text-emerald-300 mr-2" size={20} />
                          Generate from Sources
                        </Label>
                      </div>
                      <p className="text-white/70 text-sm ml-6">
                        Use AI to create papers from key books, past papers, or
                        personal materials
                      </p>
                    </div>
                    <div className="glassmorphism p-6 rounded-xl space-y-3">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem
                          data-testid="radio-upload-method"
                          value="upload"
                          id="upload"
                        />
                        <Label
                          htmlFor="upload"
                          className="text-white font-semibold cursor-pointer flex items-center"
                        >
                          <Upload className="text-emerald-300 mr-2" size={20} />
                          Upload Composed Paper
                        </Label>
                      </div>
                      <p className="text-white/70 text-sm ml-6">
                        Upload your pre-written paper with OCR support for
                        handwritten documents
                      </p>
                    </div>
                  </RadioGroup>
                </div>

                {/* Generation Options */}
                {paperForm.creationMethod === "generate" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">
                      Source Selection
                    </h3>
                    {/* Task 1: Source Selection */}
                    <div className="mt-6">
                      <Label className="text-white/80 text-sm font-medium">
                        Select Source
                      </Label>

                      <Tabs
                        value={paperForm.databaseType}
                        onValueChange={(val) =>
                          setPaperForm({ ...paperForm, databaseType: val })
                        }
                        className="mt-3"
                      >
                        <TabsList className="grid grid-cols-2 bg-white/10 rounded-xl">
                          <TabsTrigger
                            value="public"
                            className="text-white data-[state=active]:bg-emerald-600/70 data-[state=active]:text-white rounded-lg"
                          >
                            Public Database
                          </TabsTrigger>
                          <TabsTrigger
                            value="personal"
                            className="text-white data-[state=active]:bg-emerald-600/70 data-[state=active]:text-white rounded-lg"
                          >
                            Personal Database
                          </TabsTrigger>
                        </TabsList>

                        {/* Task 2: Public Database */}
                        <TabsContent value="public" className="mt-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[400px] overflow-y-auto pr-2">
                            {publicFiles
                              .slice(0, visiblePublic)
                              .map((file, i) => (
                                <div
                                  key={i}
                                  className="glassmorphism rounded-xl p-3 shadow-md hover:shadow-emerald-400/20 transition"
                                >
                                  <div className="w-full h-32 bg-slate-700/50 rounded-lg mb-3 flex items-center justify-center">
                                    {file.thumbnail ? (
                                      <img
                                        src={file.thumbnail}
                                        alt={file.title}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.nextSibling && (target.nextSibling as HTMLElement).style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    <div className="hidden flex-col items-center justify-center text-slate-300">
                                      <Image size={32} />
                                      <span className="text-xs mt-1">No preview</span>
                                    </div>
                                  </div>
                                  <p className="text-white font-medium text-sm truncate">
                                    {file.title}
                                  </p>
                                </div>
                              ))}
                          </div>
                          {visiblePublic < publicFiles.length && (
                            <div className="flex justify-center mt-4">
                              <Button
                                variant="outline"
                                onClick={() =>
                                  setVisiblePublic(visiblePublic + 6)
                                }
                                className="border-white/20 text-white hover:bg-emerald-500/20 rounded-lg"
                              >
                                Load More
                              </Button>
                            </div>
                          )}
                        </TabsContent>

                        {/* Task 3: Personal Database */}
                        <TabsContent value="personal" className="mt-6">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex gap-2">
                              {["All","Ebook", "Past Papers"].map((cat) => (
                                <Button
                                  key={cat}
                                  variant={
                                    paperForm.personalCategory === cat
                                      ? "default"
                                      : "outline"
                                  }
                                  className="rounded-lg"
                                  onClick={() =>
                                    setPaperForm({
                                      ...paperForm,
                                      personalCategory: cat,
                                    })
                                  }
                                >
                                  {cat}
                                </Button>
                              ))}
                            </div>
                            <Button
                              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-3"
                            >
                              +
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {personalFiles
                              .filter(
                                (f) =>
                                  paperForm.personalCategory === "All" ||
                                  f.category === paperForm.personalCategory,
                              )
                              .map((file, i) => (
                                <div
                                  key={i}
                                  className="glassmorphism rounded-xl p-3 shadow-md hover:shadow-emerald-400/20 transition"
                                >
                                  <div className="w-full h-32 bg-slate-700/50 rounded-lg mb-3 flex items-center justify-center">
                                    {file.thumbnail ? (
                                      <img
                                        src={file.thumbnail}
                                        alt={file.title}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.nextSibling && (target.nextSibling as HTMLElement).style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    <div className="hidden flex-col items-center justify-center text-slate-300">
                                      <Image size={32} />
                                      <span className="text-xs mt-1">No preview</span>
                                    </div>
                                  </div>
                                  <p className="text-white font-medium text-sm truncate">
                                    {file.title}
                                  </p>
                                </div>
                              ))}
                          </div>

                          {/* Upload Box */}
                          <div className="mt-6 p-6 border-2 border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center text-white/70">
                            <Upload className="w-8 h-8 mb-2 text-emerald-300" />
                            <p>Drag & drop files here or click to upload</p>
                            <Input type="file" multiple className="hidden" />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                )}

                {/* Upload Options */}
                {paperForm.creationMethod === "upload" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">
                      Upload Paper
                    </h3>
                    <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
                      <ScanLine className="text-6xl text-emerald-300 mb-4 mx-auto" />
                      <h4 className="text-white font-semibold mb-2">
                        Upload Your Composed Paper
                      </h4>
                      <p className="text-white/60 text-sm mb-4">
                        Supports handwritten papers with OCR technology
                        <br />
                        Accepted formats: PDF, JPG, PNG, DOCX
                      </p>
                      <Button
                        data-testid="button-upload-paper-file"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        Choose File to Upload
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-white/80 text-sm font-medium">
                        Paper Content (Editable after OCR)
                      </Label>
                      <Textarea
                        data-testid="textarea-paper-content"
                        value={paperForm.content}
                        onChange={(e) =>
                          setPaperForm({
                            ...paperForm,
                            content: e.target.value,
                          })
                        }
                        className="glass-input min-h-[200px]"
                        placeholder="Extracted or typed paper content will appear here..."
                      />
                    </div>
                  </div>
                )}

                {/* Generation Mode */}
                {paperForm.creationMethod === "generate" && (
                  <div className="space-y-3">
                    <Label className="text-white/80 text-sm font-medium">
                      Generation Mode
                    </Label>
                    <RadioGroup
                      value={paperForm.generationMode}
                      onValueChange={(value) =>
                        setPaperForm({ ...paperForm, generationMode: value })
                      }
                      className="space-y-3"
                    >
                      <div className="glassmorphism p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            data-testid="radio-intelligent-mode"
                            value="intelligent"
                            id="intelligent"
                          />
                          <Label
                            htmlFor="intelligent"
                            className="text-white cursor-pointer flex items-center"
                          >
                            <Lightbulb className="text-emerald-300 mr-2" size={16} />
                            Intelligent Generation
                          </Label>
                        </div>
                        <p className="text-white/60 text-xs ml-6 mt-1">
                          AI-powered question generation with variety and complexity
                          control
                        </p>
                      </div>
                      <div className="glassmorphism p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            data-testid="radio-asis-keybook-mode"
                            value="asis-keybook"
                            id="asis-keybook"
                          />
                          <Label
                            htmlFor="asis-keybook"
                            className="text-white cursor-pointer"
                          >
                            As-Is from Key Book
                          </Label>
                        </div>
                        <p className="text-white/60 text-xs ml-6 mt-1">
                          Direct questions from selected key book materials
                        </p>
                      </div>
                      <div className="glassmorphism p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            data-testid="radio-asis-pastpapers-mode"
                            value="asis-pastpapers"
                            id="asis-pastpapers"
                          />
                          <Label
                            htmlFor="asis-pastpapers"
                            className="text-white cursor-pointer"
                          >
                            As-Is from Past Papers
                          </Label>
                        </div>
                        <p className="text-white/60 text-xs ml-6 mt-1">
                          Questions directly from previous examination papers
                        </p>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Question Types */}
                {paperForm.creationMethod === "generate" && (
                  <div className="space-y-3">
                    <Label className="text-white/80 text-sm font-medium">
                      Question Types & Marks
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["MCQ", "Short Q", "Long Q"].map((type) => {
                        // mapping for placeholders
                        const totalPlaceholderMap = {
                          MCQ: "Total MCQ",
                          "Short Q": "Total Short",
                          "Long Q": "Total Long",
                        };

                        return (
                          <div key={type} className="glassmorphism p-4 rounded-lg">
                            <div className="flex items-center space-x-3 mb-2">
                              <input
                                type="checkbox"
                                data-testid={`checkbox-${type.toLowerCase().replace(" ", "-")}`}
                                checked={paperForm.questionTypes.includes(type)}
                                onChange={() => handleQuestionTypeToggle(type)}
                                className="rounded border-white/30"
                              />
                              <Label className="text-white cursor-pointer">
                                {type}
                              </Label>
                            </div>

                            {/* Marks input */}
                            <Input
                              type="number"
                              placeholder="Marks"
                              className="glass-input mt-2"
                              disabled={!paperForm.questionTypes.includes(type)}
                            />

                            {/* Total input with dynamic placeholder */}
                            <Input
                              type="number"
                              placeholder={totalPlaceholderMap[type]}
                              className="glass-input mt-2"
                              disabled={!paperForm.questionTypes.includes(type)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Total Marks */}
                <div>
                  <Label className="block text-white/80 text-sm font-medium mb-2">
                    Total Marks
                  </Label>
                  <Input
                    type="number"
                    data-testid="input-total-marks"
                    value={paperForm.totalMarks}
                    onChange={(e) =>
                      setPaperForm({
                        ...paperForm,
                        totalMarks: parseInt(e.target.value) || 0,
                      })
                    }
                    className="glass-input"
                    placeholder="100"
                  />
                </div>

                <Button
                  data-testid="button-generate-paper"
                  onClick={handleCreatePaper}
                  disabled={createPaperMutation.isPending}
                  className="w-full emerald-gradient text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all"
                >
                  {createPaperMutation.isPending
                    ? "Creating..."
                    : paperForm.creationMethod === "generate"
                      ? "Generate Paper"
                      : "Create Paper"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grading Tab */}
          <TabsContent value="grade" className="space-y-6">
            <Card
              data-testid="grading-system"
              className="glassmorphism-strong border-white/30"
            >
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">
                  Automated Grading System
                </CardTitle>
                <p className="text-white/70">
                  Grade submissions with AI-powered assessment
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Grading Configuration */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Assessment Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="block text-white/80 text-sm font-medium mb-2">
                          Select Paper
                        </Label>
                        <Select
                          value={gradingSettings.selectedPaper}
                          onValueChange={(value) =>
                            setGradingSettings({
                              ...gradingSettings,
                              selectedPaper: value,
                            })
                          }
                        >
                          <SelectTrigger
                            data-testid="select-grading-paper"
                            className="glass-input"
                          >
                            <SelectValue placeholder="Choose paper to grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {recentPapers.map((paper) => (
                              <SelectItem
                                key={paper.id}
                                value={paper.id.toString()}
                              >
                                {paper.title} - {paper.class}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="block text-white/80 text-sm font-medium mb-2">
                          Source Key Material
                        </Label>
                        <Select
                          value={gradingSettings.sourceKey}
                          onValueChange={(value) =>
                            setGradingSettings({
                              ...gradingSettings,
                              sourceKey: value,
                            })
                          }
                        >
                          <SelectTrigger
                            data-testid="select-source-key"
                            className="glass-input"
                          >
                            <SelectValue placeholder="Select verification source" />
                          </SelectTrigger>
                          <SelectContent>
                            {keyBooks.map((book) => (
                              <SelectItem
                                key={book.id}
                                value={book.id.toString()}
                              >
                                {book.title} - {book.subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="glassmorphism p-4 rounded-lg">
                        <h4 className="text-white font-semibold mb-3">
                          Assessment Methodology
                        </h4>
                        <RadioGroup
                          value={gradingSettings.method}
                          onValueChange={(value) =>
                            setGradingSettings({
                              ...gradingSettings,
                              method: value,
                            })
                          }
                          className="space-y-3"
                        >
                          <div className="flex items-start space-x-3">
                            <RadioGroupItem
                              data-testid="radio-literal-grading"
                              value="literal"
                              id="literal-grading"
                            />
                            <div>
                              <Label
                                htmlFor="literal-grading"
                                className="text-white font-medium cursor-pointer"
                              >
                                Literal Comparison
                              </Label>
                              <p className="text-white/60 text-xs">
                                Direct word-for-word comparison against answer
                                key
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <RadioGroupItem
                              data-testid="radio-conceptual-grading"
                              value="conceptual"
                              id="conceptual-grading"
                            />
                            <div>
                              <Label
                                htmlFor="conceptual-grading"
                                className="text-white font-medium cursor-pointer"
                              >
                                Conceptual Matching
                              </Label>
                              <p className="text-white/60 text-xs">
                                Context-aware assessment considering meaning and
                                understanding
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Pending Assessments
                    </h3>
                    <div className="space-y-3">
                      {pendingSubmissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="glassmorphism p-4 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-white font-semibold">
                                {submission.title}
                              </h4>
                              <p className="text-white/60 text-sm">
                                {submission.class}
                              </p>
                            </div>
                            <Badge className="bg-amber-500/20 text-amber-300">
                              {submission.submissions} submissions
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/60 text-xs">
                              Due in {submission.dueDate}
                            </span>
                            <Button
                              data-testid={`button-start-grading-${submission.id}`}
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                              Start Grading
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <Button
                    data-testid="button-begin-paper-assessment"
                    className="w-full btn-primary-professional py-4 text-sm sm:text-base"
                  >
                    <Target className="mr-2" size={16} />
                    Begin Paper Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Submission Upload */}
              <Card
                data-testid="submission-management"
                className="glassmorphism-strong border-white/30"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">
                    Submission Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">
                      Teacher-Managed Uploads
                    </h4>
                    <div className="glassmorphism p-4 rounded-lg">
                      <p className="text-white/70 text-sm mb-4">
                        Upload student papers in bulk and assign them manually
                      </p>
                      <div className="space-y-3">
                        <Select>
                          <SelectTrigger
                            data-testid="select-upload-paper"
                            className="glass-input"
                          >
                            <SelectValue placeholder="Select corresponding paper" />
                          </SelectTrigger>
                          <SelectContent>
                            {recentPapers.map((paper) => (
                              <SelectItem
                                key={paper.id}
                                value={paper.id.toString()}
                              >
                                {paper.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                          <CloudUpload className="text-4xl text-emerald-300 mb-3 mx-auto" />
                          <p className="text-white/60 text-sm">
                            Drop multiple submission files here
                          </p>
                          <Button
                            data-testid="button-bulk-upload"
                            className="mt-3 bg-emerald-500 hover:bg-emerald-600"
                          >
                            Choose Files
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">
                      Generate Upload Links
                    </h4>
                    <div className="glassmorphism p-4 rounded-lg">
                      <p className="text-white/70 text-sm mb-4">
                        Create unique links for students to submit directly
                      </p>
                      <div className="space-y-3">
                        <Select>
                          <SelectTrigger
                            data-testid="select-link-paper"
                            className="glass-input"
                          >
                            <SelectValue placeholder="Select paper for submissions" />
                          </SelectTrigger>
                          <SelectContent>
                            {recentPapers.map((paper) => (
                              <SelectItem
                                key={paper.id}
                                value={paper.id.toString()}
                              >
                                {paper.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          data-testid="button-generate-link"
                          className="w-full bg-blue-500 hover:bg-blue-600"
                        >
                          Generate Upload Link
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics */}
              <Card
                data-testid="teaching-analytics"
                className="glassmorphism-strong border-white/30"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">
                    Teaching Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="glassmorphism p-4 rounded-lg">
                      <h4 className="text-white font-semibold mb-2">
                        Class Performance
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Average Score</span>
                          <span className="text-emerald-300">84.5%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Completion Rate</span>
                          <span className="text-blue-300">92%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Top Performer</span>
                          <span className="text-yellow-300">
                            Sarah Mitchell
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="glassmorphism p-4 rounded-lg">
                      <h4 className="text-white font-semibold mb-2">
                        Recent Activity
                      </h4>
                      <div className="space-y-2">
                        <div className="text-xs text-white/60">
                          • 23 submissions graded today
                        </div>
                        <div className="text-xs text-white/60">
                          • 4 new papers created this week
                        </div>
                        <div className="text-xs text-white/60">
                          • 156 students across 6 classes
                        </div>
                      </div>
                    </div>

                    <Button
                      data-testid="button-detailed-analytics"
                      className="w-full bg-purple-500 hover:bg-purple-600"
                    >
                      <BarChart3 className="mr-2" size={16} />
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </GlassmorphismLayout>
  );
}