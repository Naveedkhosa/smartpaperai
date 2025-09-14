import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import TeacherSidebar from '@/components/TeacherSidebar';
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
  Edit,
  Trash2,
  BookOpen,
  Search,
  Loader2,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Book,
  ChevronRightIcon,
  ChevronLeftIcon
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

interface Class {
  id: number;
  name: string;
  description: string;
  organized_by: number;
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: number;
  name: string;
  description: string;
  class_id: number;
  created_at: string;
  updated_at: string;
  class_name?: string;
}

export default function SubjectManagement() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    class_id: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [scrollPosition, setScrollPosition] = useState(0);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);

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
      return data.classes || data.data?.classes || data.data || [];
    },
    enabled: !!token,
  });

  // Fetch all subjects
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/user/subjects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }

      const data = await response.json();
      const subjectsData = data.subjects || data.data?.subjects || data.data || [];
      
      // Enhance subjects with class names
      if (classes && classes.length > 0) {
        return subjectsData.map((subject: Subject) => ({
          ...subject,
          class_name: classes.find((c: Class) => c.id === subject.class_id)?.name || `Class ${subject.class_id}`
        }));
      }
      
      return subjectsData;
    },
    enabled: !!token,
  });

  // Update allSubjects when subjects data changes
  useEffect(() => {
    if (subjects) {
      setAllSubjects(subjects);
    }
  }, [subjects]);

  // Filter subjects based on selected class
  const filteredSubjectsByClass = selectedClass === 'all' 
    ? allSubjects 
    : allSubjects.filter(subject => subject.class_id.toString() === selectedClass);

  // Filter subjects based on search term
  const filteredSubjects = filteredSubjectsByClass.filter((subject: Subject) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (subject.class_name && subject.class_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Create subject mutation
  const createMutation = useMutation({
    mutationFn: async (newSubject: { name: string; description: string; class_id: string }) => {
      const response = await fetch(`${API_BASE_URL}/user/classes/${newSubject.class_id}/subjects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: newSubject.name,
          description: newSubject.description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subject');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', class_id: '' });
      toast({
        title: 'Success',
        description: 'Subject created successfully',
        variant: 'default',
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

  // Update subject mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedSubject: { id: number; name: string; description: string; class_id: number }) => {
      const response = await fetch(`${API_BASE_URL}/classes/${updatedSubject.class_id}/subjects/${updatedSubject.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: updatedSubject.name,
          description: updatedSubject.description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update subject');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsEditDialogOpen(false);
      setSelectedSubject(null);
      toast({
        title: 'Success',
        description: 'Subject updated successfully',
        variant: 'default',
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

  // Delete subject mutation
  const deleteMutation = useMutation({
    mutationFn: async (subject: Subject) => {
      const response = await fetch(`${API_BASE_URL}/classes/${subject.class_id}/subjects/${subject.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete subject');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsDeleteDialogOpen(false);
      setSelectedSubject(null);
      toast({
        title: 'Success',
        description: 'Subject deleted successfully',
        variant: 'default',
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

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Subject name is required',
        variant: 'destructive',
      });
      return;
    }
    if (!formData.class_id) {
      toast({
        title: 'Error',
        description: 'Please select a class',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Subject name is required',
        variant: 'destructive',
      });
      return;
    }
    updateMutation.mutate({
      id: selectedSubject.id,
      name: formData.name,
      description: formData.description,
      class_id: selectedSubject.class_id
    });
  };

  const handleDelete = () => {
    if (selectedSubject) {
      deleteMutation.mutate(selectedSubject);
    }
  };

  const openEditDialog = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || '',
      class_id: subject.class_id.toString()
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  const openCreateDialog = () => {
    setFormData({
      name: '',
      description: '',
      class_id: selectedClass !== 'all' ? selectedClass : (classes && classes.length > 0 ? classes[0].id.toString() : '')
    });
    setIsCreateDialogOpen(true);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubjects = filteredSubjects.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    const container = document.getElementById('class-tabs-container');
    if (container) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  const isLoading = classesLoading || subjectsLoading;

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
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Subject Management</h1>
                <p className="text-slate-200/90">
                  Create and manage subjects for your classes
                </p>
              </div>
              <Button
                onClick={openCreateDialog}
                className="emerald-gradient"
              >
                <Plus size={20} className="mr-2" />
                Add New Subject
              </Button>
            </div>
          </div>

          {/* Class Tabs with Scroll */}
          {classes && classes.length > 0 ? (
            <div className="rounded-2xl backdrop-blur-md p-5 shadow-lg border border-white/10">
  <h2 className="text-lg font-semibold text-white mb-4">Select Class</h2>

  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    <button
      onClick={() => setSelectedClass("all")}
      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all 
        ${selectedClass === "all" 
          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md scale-105" 
          : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
    >
      All Classes
    </button>

    {classes.map((classItem: Class) => (
      <button
        key={classItem.id}
        onClick={() => setSelectedClass(classItem.id.toString())}
        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all
          ${selectedClass === classItem.id.toString()
            ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md scale-105"
            : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
      >
        {classItem.name}
      </button>
    ))}
  </div>
</div>

           
          ) : (
            <div className="glassmorphism-strong rounded-xl p-4 mb-6">
              <p className="text-white text-center">No classes available. Please create a class first.</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="glassmorphism-strong rounded-xl p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <Input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="glass-input pl-10"
              />
            </div>
          </div>

          {/* Subjects Grid */}
          {filteredSubjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-6">
                {paginatedSubjects.map((subject: Subject) => (
                  <Card key={subject.id} className="glassmorphism-strong border-white/30 hover:border-emerald-400/30 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-white text-lg">{subject.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(subject)}
                            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(subject)}
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                      {subject.description && (
                        <p className="text-slate-300/80 text-sm mt-2">{subject.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-slate-400 text-sm mb-2">
                        <BookOpen size={16} className="mr-1" />
                        <span>Subject</span>
                      </div>
                      {selectedClass === 'all' && (
                        <div className="flex items-center text-slate-400 text-sm">
                          <GraduationCap size={16} className="mr-1" />
                          <span>Class: {subject.class_name || `Class ${subject.class_id}`}</span>
                        </div>
                      )}
                      <div className="mt-4 pt-3 border-t border-white/20 text-xs text-slate-400">
                        Created {new Date(subject.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="glassmorphism-strong border-white/30 text-white"
                  >
                    <ChevronLeft size={16} className="mr-2" />
                    Previous
                  </Button>
                  <span className="text-white">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="glassmorphism-strong border-white/30 text-white"
                  >
                    Next
                    <ChevronRight size={16} className="ml-2" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="glassmorphism-strong rounded-xl p-12 text-center">
              <Book size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl text-white mb-2">
                {searchTerm ? 'No subjects found' : 'No subjects yet'}
              </h3>
              <p className="text-slate-300/80 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first subject'}
              </p>
              <Button onClick={openCreateDialog} className="emerald-gradient">
                <Plus size={20} className="mr-2" />
                Create Subject
              </Button>
            </div>
          )}

          {/* Create Subject Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="glassmorphism-strong border-white/30 text-white">
              <DialogHeader>
                <DialogTitle>Create New Subject</DialogTitle>
                <DialogDescription className="text-slate-300">
                  Add a new subject to your class
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="create-class">Class</Label>
                    <Select
                      value={formData.class_id}
                      onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                    >
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Select a class" />
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
                    <Label htmlFor="name">Subject Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="glass-input"
                      placeholder="e.g., Mathematics, Physics, etc."
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="glass-input"
                      placeholder="Brief description of the subject"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
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
                    Create Subject
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Subject Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="glassmorphism-strong border-white/30 text-white">
              <DialogHeader>
                <DialogTitle>Edit Subject</DialogTitle>
                <DialogDescription className="text-slate-300">
                  Update the subject information
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Subject Name</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="glass-input"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description (Optional)</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="glass-input"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="mr-2 border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    className="emerald-gradient"
                  >
                    {updateMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Subject
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
                  This action cannot be undone. This will permanently delete the subject
                  {selectedSubject && ` "${selectedSubject.name}"`} and remove all associated data.
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