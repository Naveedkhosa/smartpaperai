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
  // State to hold the currently selected class filter ('all' or class ID string)
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    class_id: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);

  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useQuery<Class[]>({
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
      // Ensure we correctly handle nested API response structures
      return data.classes || data.data?.classes || data.data || [];
    },
    enabled: !!token,
  });

  // Fetch all subjects
  const { data: subjects, isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      // NOTE: Assuming /user/subjects fetches ALL subjects as per previous logic.
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
      // Ensure classes data is available before attempting to map
      const currentClasses = queryClient.getQueryData(['classes']) as Class[] | undefined;
      
      if (currentClasses && currentClasses.length > 0) {
        return subjectsData.map((subject: Subject) => ({
          ...subject,
          class_name: currentClasses.find((c: Class) => c.id === subject.class_id)?.name || `Class ${subject.class_id}`
        }));
      }
      
      return subjectsData;
    },
    // The query is enabled once the token is present. It will run again when classes data changes.
    enabled: !!token, 
    // We explicitly invalidate when classes change so we don't need `!!classes` here, 
    // but the effect relies on the eventual presence of classes for full functionality.
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
      // NOTE: The endpoint structure is matched to API documentation: /user/classes/{class_id}/subjects/{subject_id}
      const response = await fetch(`${API_BASE_URL}/user/classes/${updatedSubject.class_id}/subjects/${updatedSubject.id}`, {
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
      // NOTE: The endpoint structure is matched to API documentation: /user/classes/{class_id}/subjects/{subject_id}
      const response = await fetch(`${API_BASE_URL}/user/classes/${subject.class_id}/subjects/${subject.id}`, {
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
      class_id: selectedSubject.class_id // Use the original class_id for update endpoint
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
      // Pre-select current filter class if it's not 'all', otherwise default to the first class or empty
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

  const isLoading = classesLoading || subjectsLoading;

  if (isLoading) {
    return (
    <div className="flex">
      <TeacherSidebar />
      <div className="flex-1 ml-0 lg:ml-0 min-h-screen flex items-center justify-center">
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
                className="emerald-gradient min-w-[180px]"
              >
                <Plus size={20} className="mr-2" />
                Add New Subject
              </Button>
            </div>
          </div>

          {/* Combined Search and Filter Row (Updated Design) */}
          <div className="glassmorphism-strong rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              
              {/* Filter by Class (Dropdown) */}
              <div className="w-full md:w-1/3 min-w-[200px]">
                <Label htmlFor="class-filter" className="text-slate-300 mb-1 block text-sm font-medium">Filter by Class</Label>
                {classes && classes.length > 0 ? (
                  <Select
                    value={selectedClass}
                    onValueChange={(value) => {
                      setSelectedClass(value);
                      setCurrentPage(1); // Reset page on filter change
                    }}
                  >
                    <SelectTrigger id="class-filter" className="glass-input w-full h-10 border-white/30 hover:border-emerald-400/50 transition-colors">
                      <SelectValue placeholder="Select a Class" />
                    </SelectTrigger>
                    <SelectContent className="glassmorphism-strong border-white/30">
                      <SelectItem value="all" className='text-white/90 font-semibold'>All Classes</SelectItem>
                      {classes.map((classItem: Class) => (
                        <SelectItem key={classItem.id} value={classItem.id.toString()}>
                          {classItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input readOnly disabled className="glass-input h-10 text-xs border-white/30" value="No Classes Available" />
                )}
              </div>

              {/* Search Bar (Input) */}
              <div className="w-full md:flex-1 relative">
                <Label htmlFor="search-input" className="text-slate-300 mb-1 block text-sm font-medium">Search Subjects</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
                  <Input
                    id="search-input"
                    type="text"
                    placeholder="Search by name, description, or class..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset page on search change
                    }}
                    className="glass-input pl-10 h-10 border-white/30 focus:border-emerald-400/50 transition-colors" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subjects Grid */}
          {filteredSubjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-6">
                {paginatedSubjects.map((subject: Subject) => (
                  <Card key={subject.id} className="glassmorphism-strong border-white/20 hover:border-emerald-400/50 transition-all shadow-2xl rounded-xl">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-white text-xl font-extrabold">{subject.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(subject)}
                            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-full"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(subject)}
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                      {subject.description && (
                        <p className="text-slate-300/80 text-sm mt-2 line-clamp-2 italic">{subject.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2 border-t border-white/10 pt-4 mt-4">
                          <div className="flex items-center text-slate-400 text-sm">
                            <BookOpen size={16} className="mr-2 text-emerald-400/90" />
                            <span className="font-semibold text-white/90">Subject ID: {subject.id}</span>
                          </div>
                          <div className="flex items-center text-slate-400 text-sm">
                            <GraduationCap size={16} className="mr-2 text-indigo-400/90" />
                            <span className='text-slate-300'>Class: {subject.class_name || `Class ${subject.class_id}`}</span>
                          </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-500">
                        <span className='font-light'>Created on:</span> {new Date(subject.created_at).toLocaleDateString()}
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
                    className="glassmorphism-strong border-white/30 text-white hover:bg-white/10"
                  >
                    <ChevronLeft size={16} className="mr-2" />
                    Previous
                  </Button>
                  <span className="text-white font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="glassmorphism-strong border-white/30 text-white hover:bg-white/10"
                  >
                    Next
                    <ChevronRight size={16} className="ml-2" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="glassmorphism-strong rounded-xl p-12 text-center shadow-2xl border border-white/20">
              <Book size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-2xl text-white font-bold mb-2">
                {searchTerm || selectedClass !== 'all' ? 'No subjects match your filters' : 'No subjects yet'}
              </h3>
              <p className="text-slate-300/80 mb-6 text-lg">
                {searchTerm ? 'Try adjusting your search terms or filter settings' : 'Get started by creating your first subject to populate this list'}
              </p>
              <Button onClick={openCreateDialog} className="emerald-gradient text-base h-11">
                <Plus size={20} className="mr-2" />
                Create New Subject
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
                      <SelectTrigger id="create-class" className="glass-input">
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
