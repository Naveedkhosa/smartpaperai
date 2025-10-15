import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Brain,
  Upload,
  Plus,
  Lightbulb,
  ScanLine,
  FileX,
  BookOpen,
  Bookmark,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  Eye,
  FileText,
  CheckCircle,
  Settings,
  Edit3,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";

// API base URL
const API_BASE_URL = "https://apis.babalrukn.com/api";

interface Template {
  id: string;
  title: string;
  class_id: string;
  subject_id: string;
  total_marks: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  class?: {
    id: string;
    name: string;
  };
  subject?: {
    id: string;
    name: string;
  };
  sections_count: number;
  sections?: Array<{
    id: string;
    title: string;
    groups: Array<{
      questions_count: number;
    }>;
  }>;
}

export default function CreatePaperPage() {
  const { user, logout, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form states
  const [paperForm, setPaperForm] = useState({
    title: "",
    subject_id: "",
    class_id: "",
    creationMethod: "generate", // 'generate', 'upload', or 'manual'
    generationMode: "intelligent", // 'asis-keybook', 'asis-pastpapers', 'intelligent'
    duration: 120, // Duration in minutes
    sourceType: "public", // 'public' or 'personal'
    personalCategory: "All", // filter
    content: "",
    template_id: "", // Selected template ID
  });

  // Fetch classes with authentication
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["/user/classes", user?.id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/user/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch classes");
      
      const data = await response.json();
      
      // Check if the response structure matches the API documentation
      if (data.status && data.data && data.data.classes) {
        return data.data.classes;
      } else {
        throw new Error("Unexpected API response format");
      }
    },
    enabled: !!user?.id && !!token,
  });

  // Fetch subjects based on selected class
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects', paperForm.class_id],
    queryFn: async () => {
        if (!paperForm.class_id) return [];

        const response = await fetch(`${API_BASE_URL}/user/classes/${paperForm.class_id}/subjects`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch subjects');
        }

        const data = await response.json();
        return data.data.class?.subjects || [];
    },
    enabled: !!token && !!paperForm.class_id,
  });

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['templates', paperForm.class_id, paperForm.subject_id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/user/paper-templates?per_page=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      
      if (data.status && data.data && data.data.paper_templates) {
        // Filter templates by selected class and subject if they are set
        let filteredTemplates = data.data.paper_templates.data || [];
        
        if (paperForm.class_id) {
          filteredTemplates = filteredTemplates.filter((template: Template) => 
            template.class_id === paperForm.class_id
          );
        }
        
        if (paperForm.subject_id) {
          filteredTemplates = filteredTemplates.filter((template: Template) => 
            template.subject_id === paperForm.subject_id
          );
        }
        
        return filteredTemplates;
      }
      return [];
    },
    enabled: !!token,
  });

  // Mock data for public files
  const [publicFiles] = useState([
    { title: "Physics MCQs", thumbnail: "/thumbs/physics.png" },
    { title: "Chemistry Notes", thumbnail: "/thumbs/chem.png" },
    { title: "Math Paper", thumbnail: "/thumbs/math.png" },
    { title: "Biology Quiz", thumbnail: "/thumbs/bio.png" },
    { title: "English Test", thumbnail: "/thumbs/eng.png" },
    { title: "Computer Science", thumbnail: "/thumbs/cs.png" },
    { title: "History Material", thumbnail: "/thumbs/history.png" },
    { title: "Geography MCQs", thumbnail: "/thumbs/geo.png" },
  ]);

  const [personalFiles] = useState([
    {
      title: "Past Paper 2019",
      category: "Past papers",
      thumbnail: "/thumbs/pdf.jpg",
    },
    {
      title: "Past Paper 2020",
      category: "Past papers",
      thumbnail: "/thumbs/pdf.jpg",
    },
    { title: "Key Notes", category: "Ebook", thumbnail: "/thumbs/doc.png" },
    {
      title: "Lecture Slides",
      category: "Ebook",
      thumbnail: "/thumbs/doc.png",
    },
    { title: "Diagrams", category: "Ebook", thumbnail: "/thumbs/pdf.jpg" },
  ]);

  // Pagination
  const [visiblePublic, setVisiblePublic] = useState(6);

  // Mutations
  const createPaperMutation = useMutation({
    mutationFn: async (paperData: any) => {
      const response = await fetch(`${API_BASE_URL}/user/papers`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paperData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create paper");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["/user/papers", user?.id],
      });
      
      // Reset form
      setPaperForm({
        title: "",
        subject_id: "",
        class_id: "",
        creationMethod: "generate",
        generationMode: "intelligent",
        duration: 120,
        sourceType: "public",
        personalCategory: "All",
        content: "",
        template_id: "",
      });
      
      toast({ 
        title: "Success", 
        description: data.message || "Paper created successfully" 
      });
      
      // Redirect to paper builder if manual creation
      if (paperForm.creationMethod === "manual") {
        navigate(`/teacher/paper-builder/${data.data.paper.id}`);
      } else {
        navigate("/teacher");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreatePaper = () => {
    // Validate form - now including template_id for generate method
    if (!paperForm.title || !paperForm.class_id || !paperForm.subject_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Additional validation for template when using generate method
    if (paperForm.creationMethod === "generate" && !paperForm.template_id) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive",
      });
      return;
    }
    
    const paperData = {
      title: paperForm.title,
      class_id: parseInt(paperForm.class_id),
      subject_id: parseInt(paperForm.subject_id),
      created_by: paperForm.creationMethod,
      duration: paperForm.duration,
      // Include template_id if selected
      ...(paperForm.template_id && {
        template_id: parseInt(paperForm.template_id),
      }),
      // Include generation parameters if using generate method
      ...(paperForm.creationMethod === "generate" && {
        data_source: paperForm.sourceType,
        generation_mode: paperForm.generationMode,
      }),
    };
    
    createPaperMutation.mutate(paperData);
  };

  const handleTemplateSelect = (templateId: string) => {
    setPaperForm(prev => ({
      ...prev,
      template_id: templateId === prev.template_id ? "" : templateId // Toggle selection
    }));
  };

  if (classesLoading) {
    return (
      <GlassmorphismLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-300"></div>
        </div>
      </GlassmorphismLayout>
    );
  }

  return (
    <GlassmorphismLayout>
      <div className="flex">
        <TeacherSidebar />
        {/* Main Content */}
        <div className="flex-1 ml-0 lg:ml-0 min-h-screen ">
          {/* Header */}
          <div className="glassmorphism-strong rounded-2xl p-6 mb-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Create New Paper
                </h2>
                <p className="text-slate-200/90 text-sm sm:text-base">
                  Generate papers using AI or upload your own compositions
                </p>
              </div>
              <Button
                onClick={() => navigate("/teacher")}
                className="bg-slate-700 hover:bg-slate-600 text-white"
              >
                <ArrowLeft className="mr-2" size={16} />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Paper Creation Form */}
          <Card
            data-testid="paper-creation-comprehensive"
            className="glassmorphism-strong border-white/30"
          >
            <CardContent className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="block text-white/80 text-sm font-medium mb-2">
                      Paper Title *
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
                      Duration (minutes) *
                    </Label>
                    <Input
                      type="number"
                      value={paperForm.duration}
                      onChange={(e) =>
                        setPaperForm({ ...paperForm, duration: parseInt(e.target.value) || 120 })
                      }
                      className="glass-input"
                      placeholder="Duration in minutes"
                    />
                  </div>
                  <div>
                    <Label className="block text-white/80 text-sm font-medium mb-2">
                      Class *
                    </Label>
                    <Select
                      value={paperForm.class_id}
                      onValueChange={(value) =>
                        setPaperForm({ ...paperForm, class_id: value, subject_id: "", template_id: "" })
                      }
                    >
                      <SelectTrigger
                        data-testid="select-paper-class"
                        className="glass-input"
                      >
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes?.map((cls: any) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="block text-white/80 text-sm font-medium mb-2">
                      Subject *
                    </Label>
                    <Select
                      value={paperForm.subject_id}
                      onValueChange={(value) =>
                        setPaperForm({ ...paperForm, subject_id: value, template_id: "" })
                      }
                      disabled={!paperForm.class_id || subjectsLoading}
                    >
                      <SelectTrigger
                        data-testid="select-paper-subject"
                        className="glass-input"
                      >
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects?.map((subject: any) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
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
                    setPaperForm({ ...paperForm, creationMethod: value, template_id: "" })
                  }
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
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
                  <div className="glassmorphism p-6 rounded-xl space-y-3">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        data-testid="radio-manual-method"
                        value="manual"
                        id="manual"
                      />
                      <Label
                        htmlFor="manual"
                        className="text-white font-semibold cursor-pointer flex items-center"
                      >
                        <Edit3 className="text-emerald-300 mr-2" size={20} />
                        Create with Manual Editor
                      </Label>
                    </div>
                    <p className="text-white/70 text-sm ml-6">
                      Use our built-in editor to manually create your paper
                    </p>
                  </div>
                </RadioGroup>
              </div>

              {/* Generation Options - Only show for generate method */}
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
                      value={paperForm.sourceType}
                      onValueChange={(val) =>
                        setPaperForm({ ...paperForm, sourceType: val })
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
                          {publicFiles.slice(0, visiblePublic).map((file, i) => (
                            <div
                              key={i}
                              className="glassmorphism rounded-xl p-3 shadow-md hover:shadow-emerald-400/20 transition"
                            >
                              <img
                                src={file.thumbnail}
                                alt={file.title}
                                className="w-full h-32 object-cover rounded-lg mb-3"
                              />
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
                              onClick={() => setVisiblePublic(visiblePublic + 6)}
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
                            {["All", "Ebook", "Past Papers"].map((cat) => (
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
                            onClick={() => navigate("/create-personal-db")}
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
                                <img
                                  src={file.thumbnail}
                                  alt={file.title}
                                  className="w-full h-32 object-cover rounded-lg mb-3"
                                />
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

                    {/* Generation Mode */}
                    <div className="space-y-3 mt-6">
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

                    {/* Template Selection - Required when Generate from Sources is selected */}
                    <div className="space-y-4 mt-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">
                            Select Template
                          </h3>
                          <span className="text-red-400 text-lg">*</span>
                        </div>
                        <Button
                          onClick={() => navigate("/templates")}
                          className="emerald-gradient"
                          size="sm"
                        >
                          <Plus size={16} className="mr-2" /> New Template
                        </Button>
                      </div>

                      {/* Validation message */}
                      {!paperForm.template_id && (
                        <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-lg p-3">
                          Please select a template to continue
                        </div>
                      )}
                      
                      {templatesLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-300"></div>
                        </div>
                      ) : templates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {templates.map((template: Template) => (
                            <div
                              key={template.id}
                              className={`relative group overflow-hidden rounded-xl border transition-all bg-slate-900 cursor-pointer ${
                                paperForm.template_id === template.id 
                                  ? 'border-emerald-400 bg-emerald-400/10' 
                                  : 'border-white/30 hover:border-emerald-400/40'
                              } ${!paperForm.template_id ? 'border-red-400/50' : ''}`}
                              onClick={() => handleTemplateSelect(template.id)}
                            >
                              {/* Header */}
                              <div className="h-32 w-full flex items-center justify-center relative overflow-hidden bg-slate-800">
                                <div className="text-6xl text-slate-400">
                                  <FileText />
                                </div>

                                {/* Title overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm font-bold p-2">
                                  <p className="line-clamp-1">{template.title}</p>
                                </div>

                                {/* Selection Checkmark */}
                                {paperForm.template_id === template.id && (
                                  <div className="absolute top-2 right-2 z-10">
                                    <div className="bg-emerald-500 rounded-full p-1">
                                      <CheckCircle className="text-white" size={16} />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Info with icons */}
                              <div className="flex items-center justify-between p-3 border-t border-white/20 bg-slate-800/50">
                                <div className="flex items-center gap-2 text-slate-200 text-xs">
                                  <BookOpen size={16} />
                                  <span>{template.total_marks} Marks</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-200 text-xs">
                                  <span>{template.sections_count} Sections</span>
                                </div>
                              </div>

                              {/* Description */}
                              <div className="p-3">
                                <div className="mb-2">
                                  <Badge variant="outline" className="text-blue-400 border-blue-400/30 text-xs mr-2">
                                    {template.class?.name}
                                  </Badge>
                                  <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs">
                                    {template.subject?.name}
                                  </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400 text-xs">
                                    Updated {new Date(template.updated_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              {/* Hover Overlay */}
                              <div className={`absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center ${
                                paperForm.template_id === template.id ? 'opacity-100' : ''
                              }`}>
                                <p className="text-slate-200 text-sm line-clamp-3 mb-4">
                                  {template.class?.name} - {template.subject?.name}
                                </p>

                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/templates/builder?edit=${template.id}`);
                                    }}
                                    className="p-2 rounded-full bg-blue-500 hover:bg-blue-400 text-white"
                                  >
                                    <Edit size={16} />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/templates/builder?edit=${template.id}`);
                                    }}
                                    className="p-2 rounded-full bg-green-500 hover:bg-green-400 text-white"
                                  >
                                    <FileText size={16} />
                                  </Button>

                                 
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="glassmorphism-strong rounded-xl p-12 text-center">
                          <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                          <h3 className="text-xl text-white mb-2">No templates found</h3>
                          <p className="text-slate-300/80 mb-6">
                            {paperForm.class_id && paperForm.subject_id
                              ? 'No templates found for selected class and subject'
                              : 'Select a class and subject to see available templates'
                            }
                          </p>
                          <Button 
                            onClick={() => navigate("/templates")} 
                            className="emerald-gradient"
                          >
                            <Plus size={20} className="mr-2" /> Create Template
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Options - Only show for upload method */}
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
                </div>
              )}

              {/* Manual Creation - No additional options needed */}
              {paperForm.creationMethod === "manual" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">
                    Manual Paper Creation
                  </h3>
                  <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center">
                    <Edit3 className="text-6xl text-emerald-300 mb-4 mx-auto" />
                    <h4 className="text-white font-semibold mb-2">
                      Use Our Paper Builder
                    </h4>
                    <p className="text-white/60 text-sm mb-4">
                      Create your paper using our intuitive drag-and-drop editor
                      with built-in templates and question banks
                    </p>
                  </div>
                </div>
              )}

              <Button
                data-testid="button-generate-paper"
                onClick={handleCreatePaper}
                disabled={createPaperMutation.isPending || (paperForm.creationMethod === "generate" && !paperForm.template_id)}
                className="w-full emerald-gradient text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPaperMutation.isPending
                  ? "Creating..."
                  : paperForm.creationMethod === "generate"
                    ? "Generate Paper"
                    : paperForm.creationMethod === "upload"
                      ? "Create Paper"
                      : "Create Paper"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </GlassmorphismLayout>
  );
}