import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import TeacherSidebar from '@/components/TeacherSidebar';
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
    Plus,
    Trash2,
    Download,
    Eye,
    Search,
    Loader2,
    FileText,
    BookOpen,
    X
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

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

export default function StudyMaterials() {
    const { user, token } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        class_id: '',
        subject_id: '',
        type_id: '',
        visibility: ''
    });
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

    // Fetch study materials
    const { data: materialsResponse, isLoading } = useQuery({
        queryKey: ['study-materials', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.class_id && filters.class_id !== 'all') params.append('class_id', filters.class_id);
            if (filters.subject_id && filters.subject_id !== 'all') params.append('subject_id', filters.subject_id);
            if (filters.type_id && filters.type_id !== 'all') params.append('type_id', filters.type_id);
            if (filters.visibility && filters.visibility !== 'all') params.append('visibility', filters.visibility);
            
            // Add search parameter if search term exists
            if (searchTerm) params.append('search', searchTerm);

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
        enabled: !!token,
    });

    // Extract materials from response
    const materials = materialsResponse?.data?.materials?.data || [];

    // Fetch material types
    const { data: materialTypes } = useQuery({
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
// Subjects for filter (depends on filters.class_id)
const { data: filterSubjects = [] } = useQuery({
    queryKey: ['subjects', filters.class_id],
    queryFn: async () => {
        if (!filters.class_id) return [];

        const response = await fetch(`${API_BASE_URL}/user/classes/${filters.class_id}/subjects`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch subjects for filter');
        }

        const data = await response.json();
        return data.data.class?.subjects || [];
    },
    enabled: !!token && !!filters.class_id,
});


// Fetch subjects based on selected class
const { data: subjects = [] } = useQuery({
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
    enabled: !!token && !!formData.class_id, // <-- make sure enabled is true only when class_id exists
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
            setIsCreateDialogOpen(false);
            resetForm();
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

    // Delete study material mutation
    const deleteMutation = useMutation({
        mutationFn: async (materialId: number) => {
            const response = await fetch(`${API_BASE_URL}/user/study-materials/${materialId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete study material');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['study-materials'] });
            setIsDeleteDialogOpen(false);
            setSelectedMaterial(null);
            toast({
                title: 'Success',
                description: 'Study material deleted successfully',
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

    const handleCreateSubmit = (e: React.FormEvent) => {
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

    const getThumbnailUrl = (thumbnail: string | null) => {
        if (!thumbnail) return null;
        
        // If it's already a full URL, return as is
        if (thumbnail.startsWith("http")) return thumbnail;
        
        // Construct the proper URL based on API documentation
        const baseUrl = API_BASE_URL.replace('/api', '');
        return `${baseUrl}/storage/${thumbnail}`;
    };

    const handleDelete = () => {
        if (selectedMaterial) {
            deleteMutation.mutate(selectedMaterial.id);
        }
    };

    const openDeleteDialog = (material: StudyMaterial) => {
        setSelectedMaterial(material);
        setIsDeleteDialogOpen(true);
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

    const handleFilterChange = (key: string, value: string) => {
        if (value === 'all') {
            setFilters(prev => ({ ...prev, [key]: '' }));
        } else {
            setFilters(prev => ({ ...prev, [key]: value }));
        }
    };

    const clearFilters = () => {
        setFilters({
            class_id: '',
            subject_id: '',
            type_id: '',
            visibility: ''
        });
    };

    const filteredMaterials = materials.filter((material: StudyMaterial) =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.description && material.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word') || fileType.includes('doc')) return '📝';
        if (fileType.includes('excel') || fileType.includes('xls')) return '📊';
        if (fileType.includes('powerpoint') || fileType.includes('ppt')) return '📑';
        if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png')) return '🖼️';
        return '📁';
    };

    if (isLoading) {
        return (
            <div className="flex">
                <TeacherSidebar />
                <div className="flex-1 ml-0 lg:ml-0  min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-300"></div>
                </div>
            </div>
        );
    }

    return (
        <GlassmorphismLayout>
            <div className="flex">
                <TeacherSidebar />
                <div className="flex-1 ml-0 lg:ml-0 min-h-screen p-0">
                    <div className="container mx-auto">
                        {/* Header */}
                        <div className="glassmorphism-strong rounded-2xl p-6 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Study Materials</h1>
                                    <p className="text-slate-200/90">
                                        Manage and share educational resources with your students
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setIsCreateDialogOpen(true)}
                                    className="emerald-gradient"
                                >
                                    <Plus size={20} className="mr-2" />
                                    Add New Material
                                </Button>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="glassmorphism-strong rounded-xl p-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <Input
                                        type="text"
                                        placeholder="Search materials..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="glass-input pl-10"
                                    />
                                </div>

                                <Select
                                    value={filters.class_id}
                                    onValueChange={(value) => handleFilterChange('class_id', value)}
                                >
                                    <SelectTrigger className="glass-input">
                                        <SelectValue placeholder="Filter by Class" />
                                    </SelectTrigger>
                                    <SelectContent className="glassmorphism-strong border-white/30">
                                        <SelectItem value="all">All Classes</SelectItem>
                                        {classes?.map((classItem: Class) => (
                                            <SelectItem key={classItem.id} value={classItem.id.toString()}>
                                                {classItem.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                             <Select
    value={filters.subject_id}
    onValueChange={(value) => handleFilterChange('subject_id', value)}
    disabled={!filters.class_id}
>
    <SelectTrigger className="glass-input">
        <SelectValue placeholder="Filter by Subject" />
    </SelectTrigger>
    <SelectContent className="glassmorphism-strong border-white/30">
        <SelectItem value="all">All Subjects</SelectItem>
        {filterSubjects?.map((subject: Subject) => (
            <SelectItem key={subject.id} value={subject.id.toString()}>
                {subject.name}
            </SelectItem>
        ))}
    </SelectContent>
</Select>


                                <Select
                                    value={filters.type_id}
                                    onValueChange={(value) => handleFilterChange('type_id', value)}
                                >
                                    <SelectTrigger className="glass-input">
                                        <SelectValue placeholder="Filter by Type" />
                                    </SelectTrigger>
                                    <SelectContent className="glassmorphism-strong border-white/30">
                                        <SelectItem value="all">All Types</SelectItem>
                                        {materialTypes?.map((type: MaterialType) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.visibility}
                                    onValueChange={(value) => handleFilterChange('visibility', value)}
                                >
                                    <SelectTrigger className="glass-input">
                                        <SelectValue placeholder="Filter by Visibility" />
                                    </SelectTrigger>
                                    <SelectContent className="glassmorphism-strong border-white/30">
                                        <SelectItem value="all">All Visibility</SelectItem>
                                        <SelectItem value="1">Public</SelectItem>
                                        <SelectItem value="0">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {(filters.class_id || filters.subject_id || filters.type_id || filters.visibility) && (
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-300 text-sm">
                                        Filters applied
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-slate-300 border-white/20 hover:bg-white/10"
                                    >
                                        <X size={16} className="mr-1" />
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Materials Grid */}
                        {filteredMaterials.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                                {filteredMaterials.map((material: StudyMaterial) => (
                                   <Card
  key={material.id}
  className="relative group overflow-hidden rounded-xl border border-white/30 hover:border-emerald-400/40 transition-all bg-slate-900"
>
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
      <p className="line-clamp-1">
        {material.title}
        </p>
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
    <Button
      variant="ghost"
      size="icon"
      onClick={() => openDeleteDialog(material)}
      className="p-3 rounded-full bg-red-500 hover:bg-red-400 text-white"
    >
      <Trash2 size={20} />
    </Button>
  </div>
</Card>

                                ))}
                            </div>
                        ) : (
                            <div className="glassmorphism-strong rounded-xl p-12 text-center">
                                <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                                <h3 className="text-xl text-white mb-2">No study materials found</h3>
                                <p className="text-slate-300/80 mb-6">
                                    {searchTerm || filters.class_id || filters.subject_id || filters.type_id || filters.visibility
                                        ? 'Try adjusting your search or filters'
                                        : 'Get started by uploading your first study material'}
                                </p>
                                <Button onClick={() => setIsCreateDialogOpen(true)} className="emerald-gradient">
                                    <Plus size={20} className="mr-2" />
                                    Upload Material
                                </Button>
                            </div>
                        )}

                        {/* Create Material Dialog */}
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogContent className="glassmorphism-strong border-white/30 text-white max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Upload Study Material</DialogTitle>
                                    <DialogDescription className="text-slate-300">
                                        Share educational resources with your students
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateSubmit}>
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
                                                <p className="text-slate-400 text-xs">PDF, DOC, PPT, XLS, images, etc. (Max 46MB)</p>
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
                                                setIsCreateDialogOpen(false);
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

                        {/* Delete Confirmation Dialog */}
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogContent className="glassmorphism-strong border-white/30 text-white">
                                <DialogHeader>
                                    <DialogTitle>Are you sure?</DialogTitle>
                                    <DialogDescription className="text-slate-300">
                                        This action cannot be undone. This will permanently delete the study material
                                        {selectedMaterial && ` "${selectedMaterial.title}"`} and remove all associated files.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsDeleteDialogOpen(false)}
                                        className="mr-2 border-white/20 text-white hover:bg-white/10"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleDelete}
                                        disabled={deleteMutation.isPending}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                        {deleteMutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Delete
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </GlassmorphismLayout>
    );
}