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
} from "lucide-react";

export default function CreatePaperPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form states
  const [paperForm, setPaperForm] = useState({
    title: "",
    subject: "",
    classId: "",
    creationMethod: "generate", // 'generate' or 'upload'
    generationMode: "intelligent", // 'asis-keybook', 'asis-pastpapers', 'intelligent'
    questionTypes: [] as string[],
    totalMarks: 100,
    sourceType: "public", // 'public' or 'personal'
    personalCategory: "All", // filter
    content: "",
  });

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["/api/classes/teacher", user?.id],
    enabled: !!user?.id,
  });

  // Mock data
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
      setPaperForm({
        title: "",
        subject: "",
        classId: "",
        creationMethod: "generate",
        generationMode: "intelligent",
        questionTypes: [],
        totalMarks: 100,
        sourceType: "public",
        personalCategory: "All",
        content: "",
      });
      toast({ title: "Success", description: "Paper created successfully" });
      navigate("/teacher");
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
                      <SelectItem value="mathematics">Mathematics</SelectItem>
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
                          onClick={() => navigate("/create-personal-db")} // Changed from "/addpersonaldata"
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

                  {/* Question Types */}
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
                                data-testid={`checkbox-${type
                                  .toLowerCase()
                                  .replace(" ", "-")}`}
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

              </div>
            )}




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
      </div>
      </div>
    </GlassmorphismLayout>
  );
}
