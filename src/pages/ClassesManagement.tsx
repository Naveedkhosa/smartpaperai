import { useState, useEffect } from 'react';
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
import api from '../lib/axios';
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

// Interface for the expected API response data structure
interface ClassesResponseData {
  classes: Class[];
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
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
  // State for current page, managed locally
  const [currentPage, setCurrentPage] = useState(1);
  // Debounced state for search term, used for the API call
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const itemsPerPage = 6;

  // --- Search and Pagination Logic ---
  
  // Debounce search term and reset page on change
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // IMPORTANT: Reset to the first page when the search term changes
      setCurrentPage(1); 
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch classes with search and pagination
  // Note: We use debouncedSearchTerm and currentPage in the queryKey
  const { data: classesData, isLoading, isFetching } = useQuery<ClassesResponseData>({
    queryKey: ['classes', debouncedSearchTerm, currentPage],
    queryFn: async () => {
      let url = '/user/classes';
      const params = new URLSearchParams();
      
      // Use the debounced search term in the API request
      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }
      
      // Append pagination parameters
      params.append('page', currentPage.toString());
      params.append('per_page', itemsPerPage.toString());

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);
      
      if (!response.status || response.status !== 200) {
        throw new Error('Failed to fetch classes');
      }

      // Assuming your API returns an object with 'data' which contains 'classes' and 'pagination'
      // The response structure suggests the data field contains the classes and pagination
      return response.data?.data;
    },
    // Only enable if the user token is present
    enabled: !!token, 
  });

  // Extract data with fallbacks
  const classes = classesData?.classes || [];
  const paginationInfo = classesData?.pagination || {
    current_page: currentPage, // Use local state for initial current_page
    total: 0,
    per_page: itemsPerPage,
    last_page: 1
  };
  
  // Calculate the last page for navigation, ensure it's at least 1
  const lastPage = Math.max(paginationInfo.last_page, 1);
  
  // Handlers for pagination controls
  const handleNextPage = () => {
    if (currentPage < lastPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // --- Student Count Logic ---
  
  // Fetch students data (assuming this is necessary for the student count display)
  const { data: studentsData } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      // Fetch a large number of students to count against classes locally
      const response = await api.get('/user/students?per_page=1000'); 
      
      if (!response.status || response.status !== 200) {
        throw new Error('Failed to fetch students');
      }

      // Adjust to the correct nested structure for students array
      return response.data?.data?.students?.data || [];
    },
    enabled: !!token && classes.length > 0, // Only fetch if authenticated and we have classes to check against
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
  });

  // Count students per class
  const getStudentCountForClass = (classId: number) => {
    if (!studentsData) return 0;
    // Assuming a student object has a 'class_id' field
    return studentsData.filter((student: any) => student.class_id === classId).length;
  };

  // --- Mutators (Create, Update, Delete) ---

  // Create class mutation using axios
  const createMutation = useMutation({
    mutationFn: async (newClass: { name: string; description: string }) => {
      const response = await api.post('/user/classes', newClass);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate classes query to refetch the list from the first page, including the new class
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '' });
      setCurrentPage(1); // Reset to first page
      toast({
        title: 'Success',
        description: 'Class created successfully',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create class',
        variant: 'destructive',
      });
    },
  });

  // Update class mutation using axios
  const updateMutation = useMutation({
    mutationFn: async (updatedClass: { id: number; name: string; description: string }) => {
      const response = await api.put(`/user/classes/${updatedClass.id}`, {
        name: updatedClass.name,
        description: updatedClass.description
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the relevant queries to update the list and student count (if necessary)
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsEditDialogOpen(false);
      setSelectedClass(null);
      toast({
        title: 'Success',
        description: 'Class updated successfully',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update class',
        variant: 'destructive',
      });
    },
  });

  // Delete class mutation using axios
  const deleteMutation = useMutation({
    mutationFn: async (classId: number) => {
      const response = await api.delete(`/user/classes/${classId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate classes query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['students'] }); // Important: Students may be tied to this class
      setIsDeleteDialogOpen(false);
      setSelectedClass(null);
      
      // Adjust page if current page is now empty
      if (classes.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
      }
      
      toast({
        title: 'Success',
        description: 'Class deleted successfully',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete class',
        variant: 'destructive',
      });
    },
  });

  // --- Handlers for Dialogs and Forms ---

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

  // --- Render ---

  // Loading state for initial fetch
  if (isLoading) {
    return (
      <GlassmorphismLayout>
        <div className="flex">
          <TeacherSidebar />
          <div className="flex-1 ml-0 lg:ml-0 min-h-screen p-0">
            <div className="container mx-auto">
              <div className="glassmorphism-strong rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-300"></div>
                    <p className="text-white text-lg">Loading classes...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassmorphismLayout>
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
                  // This updates the local searchTerm state
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input pl-10"
                />
                {/* Show fetching indicator while the API call is in progress after debounce */}
                {isFetching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Loading State for Search */}
            {isFetching && !isLoading && (
              <div className="glassmorphism-strong rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-300"></div>
                    <p className="text-slate-300">Updating classes...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Classes Grid - 6 cards per page */}
            {classes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {classes.map((classItem: Class) => (
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
                            {/* NOTE: subjects_count is not present in the API response provided, defaulted to 0 */}
                            <span>{classItem.subjects_count || 0} subjects</span> 
                          </div>
                          <div className="flex items-center">
                            <Users size={16} className="mr-1" />
                            <span>{getStudentCountForClass(classItem.id)} students</span>
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
                {lastPage > 1 && (
                  <div className="flex justify-center items-center mt-8 gap-4">
                    <Button
                      variant="outline"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1 || isFetching}
                      className="glassmorphism-strong border-white/30 text-white"
                    >
                      <ChevronLeft size={16} className="mr-2" />
                      Previous
                    </Button>
                    <span className="text-white">
                      Page {currentPage} of {lastPage}
                    </span>
                    <Button
                      variant="outline"
                      onClick={handleNextPage}
                      disabled={currentPage === lastPage || isFetching}
                      className="glassmorphism-strong border-white/30 text-white"
                    >
                      Next
                      <ChevronRight size={16} className="ml-2" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              // No Classes Found State
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