import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TeacherSidebar from '@/components/TeacherSidebar';
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from '@/lib/axios';
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Search,
  Loader2,
} from "lucide-react";

// API base URL
const API_BASE_URL = "https://apis.babalrukn.com/api";

interface Template {
  id: string;
  title: string;
  class_id: number;
  subject_id: number;
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

interface StudyMaterial {
  id: number;
  title: string;
  description: string;
  file_name: string;
  file_type: string;
  file_url: string;
  thumbnail_url: string | null;
  is_public: boolean;
  user: {
    id: number;
    name: string;
  };
  student_class: {
    id: number;
    name: string;
  };
  subject: {
    id: number;
    name: string;
  };
  type: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface MaterialType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Class {
  id: number;
  name: string;
  description: string;
}

interface Subject {
  id: number;
  name: string;
  description: string;
  class_id: number;
}

// Extended interface for selected materials with page numbers
interface SelectedMaterialWithPages extends StudyMaterial {
  fromPage?: number;
  toPage?: number;
}

// Study Material Creation Dialog Component
function StudyMaterialCreationDialog({
  open,
  onOpenChange,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    material_type_id: '',
    class_id: '',
    subject_id: '',
    is_public: 'false'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);

  // Fetch material types
  const { data: materialTypes } = useQuery<MaterialType[]>({
    queryKey: ['material-types'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/user/study-materials/types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch material types');
      }

      const data = await response.json();
      return data.data.material_types;
    },
    enabled: !!token,
  });

  // Fetch classes
  const { data: classes } = useQuery<Class[]>({
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

  // Fetch subjects based on selected class
  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects', formData.class_id],
    queryFn: async () => {
      if (!formData.class_id) return [];

      const response = await fetch(`${API_BASE_URL}/user/classes/${formData.class_id}/subjects`, {
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
    enabled: !!token && !!formData.class_id,
  });

  // Create study material mutation
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${API_BASE_URL}/user/study-materials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create study material');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-materials'] });
      onOpenChange(false);
      resetForm();
      onSuccess();
      toast({
        title: 'Success',
        description: 'Study material created successfully',
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      material_type_id: '',
      class_id: '',
      subject_id: '',
      is_public: 'false'
    });
    setSelectedFile(null);
    setSelectedThumbnail(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.material_type_id || !formData.class_id || !formData.subject_id || !selectedFile) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields and select a file',
        variant: 'destructive',
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('material_type_id', formData.material_type_id);
    formDataToSend.append('class_id', formData.class_id);
    formDataToSend.append('subject_id', formData.subject_id);
    formDataToSend.append('is_public', formData.is_public === 'true' ? '1' : '0');
    formDataToSend.append('file', selectedFile);

    if (selectedThumbnail) {
      formDataToSend.append('thumbnail', selectedThumbnail);
    }

    createMutation.mutate(formDataToSend);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedThumbnail(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glassmorphism-strong border-white/30 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Study Material</DialogTitle>
          <DialogDescription className="text-slate-300">
            Share educational resources with your students
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="glass-input"
                placeholder="Enter material title"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="glass-input"
                placeholder="Enter material description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="class">Class *</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(value) => setFormData({ ...formData, class_id: value, subject_id: '' })}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent className="glassmorphism-strong border-white/30">
                    {classes?.map((classItem: Class) => (
                      <SelectItem key={classItem.id} value={classItem.id.toString()}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={formData.subject_id}
                  onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
                  disabled={!formData.class_id}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="glassmorphism-strong border-white/30">
                    {subjects?.map((subject: Subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Material Type *</Label>
                <Select
                  value={formData.material_type_id}
                  onValueChange={(value) => setFormData({ ...formData, material_type_id: value })}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="glassmorphism-strong border-white/30">
                    {materialTypes?.map((type: MaterialType) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.is_public}
                  onValueChange={(value) => setFormData({ ...formData, is_public: value })}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent className="glassmorphism-strong border-white/30">
                    <SelectItem value="false">Private</SelectItem>
                    <SelectItem value="true">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="file">File *</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="glass-input"
                  required
                />
                <p className="text-slate-400 text-xs">PDF, DOC, PPT (Max 46MB)</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="glass-input"
                />
                <p className="text-slate-400 text-xs">JPG, PNG (Max 2MB)</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              className="mr-2 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="emerald-gradient"
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload Material
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className }: any) => (
  <div className={`bg-slate-800 rounded-lg p-6 w-full max-w-md ${className}`}>
    {children}
  </div>
);

const DialogHeader = ({ children }: any) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle = ({ children }: any) => (
  <h2 className="text-xl font-bold text-white">{children}</h2>
);

const DialogDescription = ({ children, className }: any) => (
  <p className={`text-slate-300 text-sm ${className}`}>{children}</p>
);

const DialogFooter = ({ children }: any) => (
  <div className="flex justify-end gap-2 mt-6">{children}</div>
);

export default function CreatePaperPage() {
  const { user, logout, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Form states
  const [paperForm, setPaperForm] = useState({
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

  // Study Material States - Changed to single selection
  const [selectedMaterial, setSelectedMaterial] = useState<SelectedMaterialWithPages | null>(null);
  const [isAddStudyMaterialDialogOpen, setIsAddStudyMaterialDialogOpen] = useState(false);

  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/user/classes", user?.id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/user/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch classes");

      const data = await response.json();

      if (data.status && data.data && data.data.classes) {
        return data.data.classes;
      } else {
        throw new Error("Unexpected API response format");
      }
    },
    enabled: !!user?.id && !!token,
  });

  // Fetch subjects based on selected class
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
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

  // Fetch templates based on selected class and subject
  const { data: templates = [], isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: ['templates', paperForm.class_id, paperForm.subject_id],
    queryFn: async () => {
      if (!paperForm.class_id || !paperForm.subject_id) {
        return [];
      }

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
        let filteredTemplates = data.data.paper_templates.data || [];

        const selectedClassId = parseInt(paperForm.class_id);
        const selectedSubjectId = parseInt(paperForm.subject_id);

        filteredTemplates = filteredTemplates.filter((template: Template) => {
          return template.class_id === selectedClassId &&
            template.subject_id === selectedSubjectId;
        });

        return filteredTemplates;
      }
      return [];
    },
    enabled: !!token && !!paperForm.class_id && !!paperForm.subject_id,
  });

  // Fetch study materials based on selected class and subject only
  const { data: materialsResponse, isLoading: materialsLoading } = useQuery({
    queryKey: ['study-materials', paperForm.class_id, paperForm.subject_id],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (paperForm.class_id) params.append('class_id', paperForm.class_id);
      if (paperForm.subject_id) params.append('subject_id', paperForm.subject_id);

      const response = await fetch(`${API_BASE_URL}/user/study-materials?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch study materials');
      }

      const data = await response.json();
      return data;
    },
    enabled: !!token && paperForm.creationMethod === 'generate' && !!paperForm.class_id && !!paperForm.subject_id,
  });

  // Extract materials from response and filter by source type
  const allMaterials: StudyMaterial[] = materialsResponse?.data?.materials?.data || [];
  const materials = allMaterials.filter((material: StudyMaterial) => {
    if (paperForm.sourceType === 'public') {
      return material.is_public;
    } else {
      return material.user.id === user?.id;
    }
  });

  // Mutations
  const createPaperMutation = useMutation({
    mutationFn: async (paperData: any) => {
      let api_endpoint = `${API_BASE_URL}/user/papers`;
      if (paperData?.created_by === "generate") {
        api_endpoint = `${API_BASE_URL}/user/papers-ai`;
      }else if(paperData?.created_by === "upload"){
        api_endpoint = `${API_BASE_URL}/user/composed/papers-ai`;
      }

      let response = await api.post(api_endpoint, paperData);
      return response;
    },
    onSuccess: (data:any) => {

      queryClient.invalidateQueries({
        queryKey: ["/user/papers", user?.id],
      });

      console.log("data : ",data);

      

      setSelectedMaterial(null);

      toast({
        title: "Success",
        description: data?.message || "Paper created successfully"
      });

      if (paperForm.creationMethod === "manual") {
        navigate(`/teacher/paper-builder/${data.data.paper.id}`);
      }else if (paperForm.creationMethod === "generate") {
        navigate(`/teacher/paper-builder/${data.data.paper_id}`);
      }

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


    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle material selection - Single selection only
  const handleMaterialSelect = (material: StudyMaterial) => {
    if (selectedMaterial?.id === material.id) {
      // Deselect if same material is clicked
      setSelectedMaterial(null);
      // If deselected, reset generation mode to 'intelligent'
      setPaperForm(prev => ({
        ...prev,
        generationMode: 'intelligent'
      }));
    } else {
      const isPastPaper = material.type.name.toLowerCase().includes('past paper');
      const newMaterial: SelectedMaterialWithPages = {
        ...material,
        fromPage: !isPastPaper ? 1 : undefined,
        toPage: !isPastPaper ? 3 : undefined
      };
      setSelectedMaterial(newMaterial);

      // Set default generation mode based on selection
      let newGenerationMode = paperForm.generationMode;
      if (isPastPaper) {
        // Default to as-is if past paper is selected
        newGenerationMode = 'as-is';
      } else if (newGenerationMode === 'as-is') {
        // If current mode is as-is, but new selection is not, reset to intelligent/keybook
        newGenerationMode = 'intelligent';
      }

      setPaperForm(prev => ({
        ...prev,
        generationMode: newGenerationMode
      }));
    }
  };

  // Handle page number changes
  const handlePageNumberChange = (field: 'fromPage' | 'toPage', value: string) => {
    if (selectedMaterial) {
      setSelectedMaterial({
        ...selectedMaterial,
        [field]: value ? parseInt(value) : undefined
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('excel') || fileType.includes('xls')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('ppt')) return '📑';
    if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png')) return '🖼️';
    return '📁';
  };

  const getThumbnailUrl = (thumbnail: string | null) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith("http")) return thumbnail;
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}/storage/${thumbnail}`;
  };

  const handleCreatePaper = () => {
    if (!paperForm.title || !paperForm.class_id || !paperForm.subject_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (paperForm.creationMethod === "generate" && !paperForm.template_id) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive",
      });
      return;
    }

    // Validation for 'as-is' mode - must have a past paper selected
    if (paperForm.generationMode === 'as-is' && (!selectedMaterial || !selectedMaterial.type.name.toLowerCase().includes('past paper'))) {
      toast({
        title: "Error",
        description: "To use 'As-Is from Past Papers' mode, you must select a material of type 'Past Paper'.",
        variant: "destructive",
      });
      return;
    }

    // Validation for 'as-is' mode - must have a non-past paper material selected
    if (paperForm.generationMode === 'as-is' && (!selectedMaterial || selectedMaterial.type.name.toLowerCase().includes('past paper'))) {
      toast({
        title: "Error",
        description: "To use 'As-Is from Key Book' mode, you must select a material that is not a 'Past Paper'.",
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
      ...(paperForm.template_id && {
        template_id: parseInt(paperForm.template_id),
      }),
      ...(paperForm.creationMethod === "generate" && {
        data_source: paperForm.sourceType,
        generation_mode: paperForm.generationMode,
        study_material: selectedMaterial?.id,
        study_material_from_page: selectedMaterial?.fromPage,
        study_material_to_page: selectedMaterial?.toPage
      }),
    };

    createPaperMutation.mutate(paperData);
  };

  const handleTemplateSelect = (templateId: string) => {
    setPaperForm(prev => ({
      ...prev,
      template_id: templateId === prev.template_id ? "" : templateId
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
        <div className="flex-1 ml-0 lg:ml-0 min-h-screen">
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
                      <SelectContent className="glassmorphism-strong border-white/30">
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
                      <SelectContent className="glassmorphism-strong border-white/30">
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
                  {(() => {
                    const isPastPaperMaterial = selectedMaterial?.type.name.toLowerCase().includes("past paper");
                    const isPastPaperOptionHidden =
                      selectedMaterial &&
                      !isPastPaperMaterial;

                    // *** UPDATED LOGIC: Hide Keybook option if a Past Paper is selected ***
                    const isKeyBookOptionHidden =
                      selectedMaterial &&
                      isPastPaperMaterial;
                    // *** END UPDATED LOGIC ***

                    return (
                      <>
                        <h3 className="text-lg font-semibold text-white">
                          Study Material Selection
                        </h3>

                        {/* Source Selection */}
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

                            {/* Public Database with Study Materials */}
                            <TabsContent value="public" className="mt-6">
                              {/* Info message */}
                              {paperForm.class_id && paperForm.subject_id ? (
                                <div className="glassmorphism-strong rounded-xl p-4 mb-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-white text-sm font-medium">
                                        Showing public study materials for:
                                      </p>
                                      <p className="text-slate-300 text-sm">
                                        Class: {classes?.find((c: Class) => c.id.toString() === paperForm.class_id)?.name} |
                                        Subject: {subjects?.find((s: Subject) => s.id.toString() === paperForm.subject_id)?.name}
                                      </p>
                                    </div>
                                    <div className="text-white text-sm">
                                      {selectedMaterial ? "1 material selected" : "No material selected"}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="glassmorphism-strong rounded-xl p-6 mb-6 text-center">
                                  <BookOpen className="mx-auto text-slate-400 mb-2" size={32} />
                                  <p className="text-white text-sm">
                                    Please select a class and subject in Basic Information to view study materials
                                  </p>
                                </div>
                              )}

                              {/* Materials Grid with Single Selection */}
                              {materialsLoading ? (
                                <div className="flex justify-center py-8">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-300"></div>
                                </div>
                              ) : materials.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {materials.map((material: StudyMaterial) => {
                                    const isSelected = selectedMaterial?.id === material.id;

                                    return (
                                      <div
                                        key={material.id}
                                        className={`relative group overflow-hidden rounded-xl border transition-all bg-slate-900 cursor-pointer ${isSelected
                                          ? 'border-emerald-400 bg-emerald-400/10 ring-2 ring-emerald-400'
                                          : 'border-white/30 hover:border-emerald-400/40'
                                          }`}
                                        onClick={() => handleMaterialSelect(material)}
                                      >
                                        {/* Selection Indicator */}
                                        {isSelected && (
                                          <div className="absolute top-2 right-2 z-10">
                                            <div className="bg-emerald-500 rounded-full p-1">
                                              <CheckCircle className="text-white" size={16} />
                                            </div>
                                          </div>
                                        )}

                                        {/* Thumbnail or Icon */}
                                        <div className="h-40 w-full flex items-center justify-center relative overflow-hidden bg-slate-800">
                                          {material.thumbnail_url ? (
                                            <img
                                              src={getThumbnailUrl(material.thumbnail_url)}
                                              alt={material.title}
                                              className="h-full w-full object-contain"
                                              onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                                const iconDiv = e.currentTarget.parentElement?.querySelector(".fallback-icon");
                                                if (iconDiv) (iconDiv as HTMLElement).style.display = "flex";
                                              }}
                                            />
                                          ) : (
                                            <div className="fallback-icon text-6xl text-slate-400 flex items-center justify-center">
                                              {getFileIcon(material.file_type)}
                                            </div>
                                          )}

                                          {/* Title overlay */}
                                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm font-bold p-2">
                                            <p className="line-clamp-1">{material.title}</p>
                                          </div>
                                        </div>

                                        {/* Info with icons */}
                                        <div className="flex items-center justify-between p-3 border-t border-white/20 bg-slate-800/50">
                                          <div className="flex items-center gap-2 text-slate-200 text-xs">
                                            <BookOpen size={16} />
                                            <span>{material.student_class.name}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-slate-200 text-xs">
                                            <FileText size={16} />
                                            <span>{material.subject.name}</span>
                                          </div>
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                                          {material.description && (
                                            <p className="text-slate-200 text-sm line-clamp-3 mb-4">
                                              {material.description}
                                            </p>
                                          )}
                                          <div className="flex gap-2">
                                            <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                                              {material.type.name}
                                            </Badge>
                                            <Badge variant="outline" className={material.is_public ? 'text-green-400 border-green-400/30' : 'text-orange-400 border-orange-400/30'}>
                                              {material.is_public ? 'Public' : 'Private'}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                paperForm.class_id && paperForm.subject_id && (
                                  <div className="glassmorphism-strong rounded-xl p-12 text-center">
                                    <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                                    <h3 className="text-xl text-white mb-2">No study materials found</h3>
                                    <p className="text-slate-300/80 mb-6">
                                      No public study materials available for the selected class and subject
                                    </p>
                                  </div>
                                )
                              )}
                            </TabsContent>

                            {/* Personal Database with Study Materials */}
                            <TabsContent value="personal" className="mt-6">
                              {/* Personal Database Header */}
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-2">
                                  {["All", "Notes", "Books"].map((cat) => (
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
                                {/* Open popup instead of navigating */}
                                <Button
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-3"
                                  onClick={() => setIsAddStudyMaterialDialogOpen(true)}
                                >
                                  <Plus size={16} />
                                </Button>
                              </div>

                              {/* Info message */}
                              {paperForm.class_id && paperForm.subject_id ? (
                                <div className="glassmorphism-strong rounded-xl p-4 mb-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-white text-sm font-medium">
                                        Showing your study materials for:
                                      </p>
                                      <p className="text-slate-300 text-sm">
                                        Class: {classes?.find((c: Class) => c.id.toString() === paperForm.class_id)?.name} |
                                        Subject: {subjects?.find((s: Subject) => s.id.toString() === paperForm.subject_id)?.name}
                                      </p>
                                    </div>
                                    <div className="text-white text-sm">
                                      {selectedMaterial ? "1 material selected" : "No material selected"}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="glassmorphism-strong rounded-xl p-6 mb-6 text-center">
                                  <BookOpen className="mx-auto text-slate-400 mb-2" size={32} />
                                  <p className="text-white text-sm">
                                    Please select a class and subject in Basic Information to view your study materials
                                  </p>
                                </div>
                              )}

                              {/* Personal Materials Grid */}
                              {materialsLoading ? (
                                <div className="flex justify-center py-8">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-300"></div>
                                </div>
                              ) : materials.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {materials
                                    .filter((material: StudyMaterial) =>
                                      paperForm.personalCategory === "All" ||
                                      material.type.name === paperForm.personalCategory
                                    )
                                    .map((material: StudyMaterial) => {
                                      const isSelected = selectedMaterial?.id === material.id;

                                      return (
                                        <div
                                          key={material.id}
                                          className={`relative group overflow-hidden rounded-xl border transition-all bg-slate-900 cursor-pointer ${isSelected
                                            ? 'border-emerald-400 bg-emerald-400/10 ring-2 ring-emerald-400'
                                            : 'border-white/30 hover:border-emerald-400/40'
                                            }`}
                                          onClick={() => handleMaterialSelect(material)}
                                        >
                                          {/* Selection Indicator */}
                                          {isSelected && (
                                            <div className="absolute top-2 right-2 z-10">
                                              <div className="bg-emerald-500 rounded-full p-1">
                                                <CheckCircle className="text-white" size={16} />
                                              </div>
                                            </div>
                                          )}

                                          {/* Thumbnail or Icon */}
                                          <div className="h-40 w-full flex items-center justify-center relative overflow-hidden bg-slate-800">
                                            {material.thumbnail_url ? (
                                              <img
                                                src={getThumbnailUrl(material.thumbnail_url)}
                                                alt={material.title}
                                                className="h-full w-full object-contain"
                                              />
                                            ) : (
                                              <div className="text-6xl text-slate-400">
                                                {getFileIcon(material.file_type)}
                                              </div>
                                            )}

                                            {/* Title overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm font-bold p-2">
                                              <p className="line-clamp-1">{material.title}</p>
                                            </div>
                                          </div>

                                          {/* Info with icons */}
                                          <div className="flex items-center justify-between p-3 border-t border-white/20 bg-slate-800/50">
                                            <div className="flex items-center gap-2 text-slate-200 text-xs">
                                              <BookOpen size={16} />
                                              <span>{material.student_class.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-200 text-xs">
                                              <FileText size={16} />
                                              <span>{material.subject.name}</span>
                                            </div>
                                          </div>

                                          {/* Hover Overlay */}
                                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                                            {material.description && (
                                              <p className="text-slate-200 text-sm line-clamp-3 mb-4">
                                                {material.description}
                                              </p>
                                            )}
                                            <div className="flex gap-2">
                                              <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                                                {material.type.name}
                                              </Badge>
                                              <Badge variant="outline" className={material.is_public ? 'text-green-400 border-green-400/30' : 'text-orange-400 border-orange-400/30'}>
                                                {material.is_public ? 'Public' : 'Private'}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              ) : (
                                paperForm.class_id && paperForm.subject_id && (
                                  <div className="glassmorphism-strong rounded-xl p-12 text-center">
                                    <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                                    <h3 className="text-xl text-white mb-2">No personal study materials found</h3>
                                    <p className="text-slate-300/80 mb-6">
                                      Get started by uploading your first study material
                                    </p>
                                    <Button
                                      onClick={() => setIsAddStudyMaterialDialogOpen(true)}
                                      className="emerald-gradient"
                                    >
                                      <Plus size={20} className="mr-2" />
                                      Upload Material
                                    </Button>
                                  </div>
                                )
                              )}
                            </TabsContent>
                          </Tabs>

                          {/* Page Number Selection Section - Only show if material is selected */}
                          {selectedMaterial && (
                            <div className="mt-8 glassmorphism-strong rounded-xl p-6 border border-emerald-400/30">
                              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <BookOpen className="mr-2 text-emerald-300" size={20} />
                                Page Range Selection
                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center space-x-4">
                                  <div className="flex-shrink-0">
                                    {selectedMaterial.thumbnail_url ? (
                                      <img
                                        src={getThumbnailUrl(selectedMaterial.thumbnail_url)}
                                        alt={selectedMaterial.title}
                                        className="h-16 w-16 object-cover rounded-lg"
                                      />
                                    ) : (
                                      <div className="h-16 w-16 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
                                        {getFileIcon(selectedMaterial.file_type)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-white font-medium text-sm line-clamp-2">
                                      {selectedMaterial.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">
                                        {selectedMaterial.type.name}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                                        {selectedMaterial.student_class.name}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {/* Page Inputs - Only show for non-past paper materials */}
                                {!selectedMaterial.type.name.toLowerCase().includes('past paper') && (
                                  <div className="space-y-3">
                                    <Label className="text-white/80 text-sm font-medium">
                                      Select Page Range:
                                    </Label>
                                    <div className="flex items-center gap-4">
                                      <div className="flex-1">
                                        <Label className="text-white/70 text-xs mb-1 block">From Page:</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={selectedMaterial.fromPage || 1}
                                          onChange={(e) => handlePageNumberChange('fromPage', e.target.value)}
                                          className="glass-input"
                                          placeholder="1"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <Label className="text-white/70 text-xs mb-1 block">To Page:</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={selectedMaterial.toPage || 3}
                                          onChange={(e) => handlePageNumberChange('toPage', e.target.value)}
                                          className="glass-input"
                                          placeholder="3"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Note for past papers */}
                                {selectedMaterial.type.name.toLowerCase().includes('past paper') && (
                                  <div className="col-span-2 p-3 bg-blue-400/10 border border-blue-400/30 rounded-lg">
                                    <p className="text-blue-300 text-sm">
                                      <strong>Note:</strong> Past papers are used in their entirety. Page range selection is not available for past papers.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

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
                                  // Disabled if a specific as-is mode should be forced by material selection
                                  disabled={selectedMaterial &&
                                    ((isPastPaperMaterial && paperForm.generationMode !== 'as-is') ||
                                      (!isPastPaperMaterial && paperForm.generationMode !== 'as-is'))
                                  }
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

                            {/* *** UPDATED CODE: Conditional Rendering for As-Is Key Book *** */}
                            {!isKeyBookOptionHidden && (
                              <div className="glassmorphism p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <RadioGroupItem
                                    data-testid="radio-as-is-mode"
                                    value="as-is"
                                    id="as-is"
                                    // Disabled if no material selected or selected material is past paper
                                    disabled={!selectedMaterial || isPastPaperMaterial}
                                  />
                                  <Label
                                    htmlFor="as-is"
                                    className="text-white cursor-pointer"
                                  >
                                    As-Is from Key Book
                                  </Label>
                                </div>
                                <p className="text-white/60 text-xs ml-6 mt-1">
                                  Direct questions from selected key book materials
                                </p>
                              </div>
                            )}
                            {/* *** END UPDATED CODE *** */}

                            {/* Conditional Rendering for As-Is Past Papers */}
                            {!isPastPaperOptionHidden && (
                              <div className="glassmorphism p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <RadioGroupItem
                                    data-testid="radio-as-is-mode"
                                    value="as-is"
                                    id="as-is"
                                    // Disabled if no material selected or selected material is not past paper
                                    disabled={!selectedMaterial || !isPastPaperMaterial}
                                  />
                                  <Label
                                    htmlFor="as-is"
                                    className="text-white cursor-pointer"
                                  >
                                    As-Is
                                  </Label>
                                </div>
                                <p className="text-white/60 text-xs ml-6 mt-1">
                                  Questions directly from previous examination papers
                                </p>
                              </div>
                            )}

                          </RadioGroup>
                        </div>

                        {/* Template Selection */}
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

                          {/* Show message when class/subject not selected */}
                          {(!paperForm.class_id || !paperForm.subject_id) && (
                            <div className="glassmorphism-strong rounded-xl p-6 text-center">
                              <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                              <h3 className="text-xl text-white mb-2">Select Class and Subject</h3>
                              <p className="text-slate-300/80">
                                Please select both a class and subject in Basic Information to view available templates
                              </p>
                            </div>
                          )}

                          {/* Show templates when class and subject are selected */}
                          {paperForm.class_id && paperForm.subject_id && (
                            <>
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
                                      className={`relative group overflow-hidden rounded-xl border transition-all bg-slate-900 cursor-pointer ${paperForm.template_id === template.id
                                        ? 'border-emerald-400 bg-emerald-400/10 ring-2 ring-emerald-400'
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
                                            {template.class?.name || `Class ${template.class_id}`}
                                          </Badge>
                                          <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs">
                                            {template.subject?.name || `Subject ${template.subject_id}`}
                                          </Badge>
                                        </div>

                                        <div className="flex justify-between items-center">
                                          <span className="text-slate-400 text-xs">
                                            Updated {new Date(template.updated_at).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Hover Overlay */}
                                      <div className={`absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center ${paperForm.template_id === template.id ? 'opacity-100' : ''
                                        }`}>
                                        <p className="text-slate-200 text-sm line-clamp-3 mb-4">
                                          {template.class?.name || `Class ${template.class_id}`} - {template.subject?.name || `Subject ${template.subject_id}`}
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
                                    No templates available for the selected class and subject combination
                                  </p>
                                  <Button
                                    onClick={() => navigate("/templates")}
                                    className="emerald-gradient"
                                  >
                                    <Plus size={20} className="mr-2" /> Create Template
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    );
                  })()}
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

              {/* Manual Creation */}
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

          {/* Study Material Creation Dialog */}
          <StudyMaterialCreationDialog
            open={isAddStudyMaterialDialogOpen}
            onOpenChange={setIsAddStudyMaterialDialogOpen}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['study-materials'] });
            }}
          />
        </div>
      </div>
    </GlassmorphismLayout>
  );
}