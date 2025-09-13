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
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Search,
  Loader2,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

interface Class {
  id: number;
  name: string;
  description: string;
  organized_by: number;
  created_at: string;
  updated_at: string;
  subjects_count?: number;
  student_count?: number;
}

export default function ClassesManagement() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch classes
  const { data: classes, isLoading } = useQuery({
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

  // Create class mutation
  const createMutation = useMutation({
    mutationFn: async (newClass: { name: string; description: string }) => {
      const response = await fetch(`${API_BASE_URL}/user/classes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(newClass),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create class');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '' });
      setCurrentPage(1); // Reset to first page after creating a new class
      toast({
        title: 'Success',
        description: 'Class created successfully',
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

  // Update class mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedClass: { id: number; name: string; description: string }) => {
      const response = await fetch(`${API_BASE_URL}/user/classes/${updatedClass.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: updatedClass.name,
          description: updatedClass.description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update class');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsEditDialogOpen(false);
      setSelectedClass(null);
      toast({
        title: 'Success',
        description: 'Class updated successfully',
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

  // Delete class mutation
  const deleteMutation = useMutation({
    mutationFn: async (classId: number) => {
      const response = await fetch(`${API_BASE_URL}/user/classes/${classId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete class');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsDeleteDialogOpen(false);
      setSelectedClass(null);
      toast({
        title: 'Success',
        description: 'Class deleted successfully',
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
        description: 'Class name is required',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Class name is required',
        variant: 'destructive',
      });
      return;
    }
    updateMutation.mutate({
      id: selectedClass.id,
      name: formData.name,
      description: formData.description
    });
  };

  const handleDelete = () => {
    if (selectedClass) {
      deleteMutation.mutate(selectedClass.id);
    }
  };

  const openEditDialog = (classItem: Class) => {
    setSelectedClass(classItem);
    setFormData({
      name: classItem.name,
      description: classItem.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsDeleteDialogOpen(true);
  };

  const filteredClasses = classes?.filter((classItem: Class) =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (classItem.description && classItem.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, startIndex + itemsPerPage);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen gradient-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-300"></div>
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
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Class Management</h1>
                <p className="text-slate-200/90">
                  Create and manage your classes
                </p>
              </div>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="emerald-gradient"
              >
                <Plus size={20} className="mr-2" />
                Add New Class
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="glassmorphism-strong rounded-xl p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <Input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="glass-input pl-10"
              />
            </div>
          </div>

          {/* Classes Grid */}
          {paginatedClasses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-6">
                {paginatedClasses.map((classItem: Class) => (
                  <Card key={classItem.id} className="glassmorphism-strong border-white/30 hover:border-emerald-400/30 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-white text-lg">{classItem.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(classItem)}
                            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(classItem)}
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                      {classItem.description && (
                        <p className="text-slate-300/80 text-sm mt-2">{classItem.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-slate-400 text-sm">
                        <div className="flex items-center">
                          <BookOpen size={16} className="mr-1" />
                          <span>{classItem.subjects_count || 0} subjects</span>
                        </div>
                        <div className="flex items-center">
                          <Users size={16} className="mr-1" />
                          <span>{classItem.student_count || 0} students</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/20 text-xs text-slate-400">
                        Created {new Date(classItem.created_at).toLocaleDateString()}
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
              <GraduationCap size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl text-white mb-2">No classes found</h3>
              <p className="text-slate-300/80 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first class'}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="emerald-gradient">
                <Plus size={20} className="mr-2" />
                Create Class
              </Button>
            </div>
          )}

          {/* Create Class Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="glassmorphism-strong border-white/30 text-white">
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
                <DialogDescription className="text-slate-300">
                  Add a new class to your account
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Class Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="glass-input"
                      placeholder="e.g., Grade 10 Mathematics"
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
                      placeholder="Brief description of the class"
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
                    Create Class
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Class Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="glassmorphism-strong border-white/30 text-white">
              <DialogHeader>
                <DialogTitle>Edit Class</DialogTitle>
                <DialogDescription className="text-slate-300">
                  Update the class information
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Class Name</Label>
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
                    Update Class
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
                  This action cannot be undone. This will permanently delete the class
                  {selectedClass && ` "${selectedClass.name}"`} and remove all associated data.
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