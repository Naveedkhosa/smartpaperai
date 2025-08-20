import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { 
  Users, 
  Presentation, 
  FileText, 
  CheckCircle, 
  TrendingUp,
  Edit,
  Trash2,
  Plus,
  User,
  GraduationCap,
  Book,
  Upload,
  Settings,
  Database,
  School2
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeTeachers: number;
  totalStudents: number;
  papersGenerated: number;
  submissionsGraded: number;
  totalClasses: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [materialFormOpen, setMaterialFormOpen] = useState(false);
  const [classFormOpen, setClassFormOpen] = useState(false);
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: studyMaterials, isLoading: materialsLoading } = useQuery({
    queryKey: ['/api/study-materials'],
  });

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['/api/classes'],
  });

  // Form states
  const [userForm, setUserForm] = useState({
    username: '', password: '', email: '', role: 'student', fullName: ''
  });
  
  const [materialForm, setMaterialForm] = useState({
    title: '', subject: '', content: ''
  });
  
  const [classForm, setClassForm] = useState({
    name: '', subject: '', teacherId: ''
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (userData: any) => 
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setUserFormOpen(false);
      setUserForm({ username: '', password: '', email: '', role: 'student', fullName: '' });
      toast({ title: 'Success', description: 'User created successfully' });
    }
  });

  const createMaterialMutation = useMutation({
    mutationFn: (materialData: any) =>
      fetch('/api/study-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-materials'] });
      setMaterialFormOpen(false);
      setMaterialForm({ title: '', subject: '', content: '' });
      toast({ title: 'Success', description: 'Study material created successfully' });
    }
  });

  const createClassMutation = useMutation({
    mutationFn: (classData: any) =>
      fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setClassFormOpen(false);
      setClassForm({ name: '', subject: '', teacherId: '' });
      toast({ title: 'Success', description: 'Class created successfully' });
    }
  });

  const recentActivities = [
    { id: 1, icon: User, message: 'Teacher Sarah created new paper', time: '2 minutes ago', type: 'success' },
    { id: 2, icon: GraduationCap, message: '45 students submitted assignments', time: '15 minutes ago', type: 'info' },
    { id: 3, icon: Book, message: 'New study material uploaded', time: '1 hour ago', type: 'warning' },
  ];

  const handleCreateUser = () => {
    createUserMutation.mutate(userForm);
  };

  const handleCreateMaterial = () => {
    createMaterialMutation.mutate({
      ...materialForm,
      uploadedBy: null // Admin upload
    });
  };

  const handleCreateClass = () => {
    createClassMutation.mutate(classForm);
  };

  if (statsLoading || usersLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Control Panel</h1>
          <p className="text-slate-400">Comprehensive system management and analytics</p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-8 bg-slate-800 border border-slate-700">
            <TabsTrigger 
              value="overview" 
              data-testid="tab-overview"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <TrendingUp className="mr-2" size={16} />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              data-testid="tab-users"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <Users className="mr-2" size={16} />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="materials" 
              data-testid="tab-materials"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <Book className="mr-2" size={16} />
              Materials
            </TabsTrigger>
            <TabsTrigger 
              value="classes" 
              data-testid="tab-classes"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <School2 className="mr-2" size={16} />
              Classes
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="stats-total-users" className="admin-card animate-scale-in">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Users className="text-emerald-400" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="stats-active-teachers" className="admin-card animate-scale-in">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Active Teachers</p>
                      <p className="text-2xl font-bold text-white">{stats?.activeTeachers || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Presentation className="text-blue-400" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="stats-papers-generated" className="admin-card animate-scale-in">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Papers Generated</p>
                      <p className="text-2xl font-bold text-white">{stats?.papersGenerated || 432}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="text-purple-400" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="stats-submissions-graded" className="admin-card animate-scale-in">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Classes</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalClasses || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <School2 className="text-emerald-400" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card data-testid="usage-analytics" className="admin-card animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="text-6xl text-emerald-400 mb-4 mx-auto" />
                      <p className="text-slate-400">System Performance</p>
                      <p className="text-slate-500 text-sm">Real-time analytics dashboard</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="recent-activity" className="admin-card animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'success' ? 'bg-emerald-500' :
                          activity.type === 'info' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}>
                          <activity.icon className="text-white" size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{activity.message}</p>
                          <p className="text-slate-400 text-xs">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card data-testid="user-management" className="admin-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white">User Management</CardTitle>
                  <Dialog open={userFormOpen} onOpenChange={setUserFormOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        data-testid="button-add-user"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        <Plus className="mr-2" size={16} />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create New User</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="fullName" className="text-right text-slate-300">Name</Label>
                          <Input
                            id="fullName"
                            data-testid="input-user-fullname"
                            value={userForm.fullName}
                            onChange={(e) => setUserForm({...userForm, fullName: e.target.value})}
                            className="col-span-3 bg-slate-700 border-slate-600 text-white"
                            placeholder="Full Name"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="username" className="text-right text-slate-300">Username</Label>
                          <Input
                            id="username"
                            data-testid="input-user-username"
                            value={userForm.username}
                            onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                            className="col-span-3 bg-slate-700 border-slate-600 text-white"
                            placeholder="Username"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right text-slate-300">Email</Label>
                          <Input
                            id="email"
                            data-testid="input-user-email"
                            type="email"
                            value={userForm.email}
                            onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                            className="col-span-3 bg-slate-700 border-slate-600 text-white"
                            placeholder="Email"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="password" className="text-right text-slate-300">Password</Label>
                          <Input
                            id="password"
                            data-testid="input-user-password"
                            type="password"
                            value={userForm.password}
                            onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                            className="col-span-3 bg-slate-700 border-slate-600 text-white"
                            placeholder="Password"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="role" className="text-right text-slate-300">Role</Label>
                          <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
                            <SelectTrigger data-testid="select-user-role" className="col-span-3 bg-slate-700 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        data-testid="button-create-user"
                        onClick={handleCreateUser}
                        disabled={createUserMutation.isPending}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white w-full"
                      >
                        {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-300 py-3">Name</th>
                        <th className="text-left text-slate-300 py-3">Role</th>
                        <th className="text-left text-slate-300 py-3">Email</th>
                        <th className="text-left text-slate-300 py-3">Status</th>
                        <th className="text-left text-slate-300 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(users as any[])?.map((user: any) => (
                        <tr key={user.id} className="border-b border-slate-700/50">
                          <td className="py-3 text-white">{user.fullName}</td>
                          <td className="py-3 text-slate-300 capitalize">{user.role}</td>
                          <td className="py-3 text-slate-300">{user.email}</td>
                          <td className="py-3">
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs">
                              Active
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <button 
                                data-testid={`button-edit-user-${user.id}`}
                                className="text-emerald-400 hover:text-emerald-300"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                data-testid={`button-delete-user-${user.id}`}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Study Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            <Card data-testid="study-materials" className="admin-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white">Study Materials Database</CardTitle>
                  <Dialog open={materialFormOpen} onOpenChange={setMaterialFormOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        data-testid="button-add-material"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        <Upload className="mr-2" size={16} />
                        Add Material
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add Study Material</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="title" className="text-right text-slate-300">Title</Label>
                          <Input
                            id="title"
                            data-testid="input-material-title"
                            value={materialForm.title}
                            onChange={(e) => setMaterialForm({...materialForm, title: e.target.value})}
                            className="col-span-3 bg-slate-700 border-slate-600 text-white"
                            placeholder="Material Title"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="subject" className="text-right text-slate-300">Subject</Label>
                          <Input
                            id="subject"
                            data-testid="input-material-subject"
                            value={materialForm.subject}
                            onChange={(e) => setMaterialForm({...materialForm, subject: e.target.value})}
                            className="col-span-3 bg-slate-700 border-slate-600 text-white"
                            placeholder="Subject"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                          <Label htmlFor="content" className="text-right text-slate-300">Content</Label>
                          <Textarea
                            id="content"
                            data-testid="textarea-material-content"
                            value={materialForm.content}
                            onChange={(e) => setMaterialForm({...materialForm, content: e.target.value})}
                            className="col-span-3 bg-slate-700 border-slate-600 text-white min-h-[100px]"
                            placeholder="Study material content..."
                          />
                        </div>
                      </div>
                      <Button 
                        data-testid="button-create-material"
                        onClick={handleCreateMaterial}
                        disabled={createMaterialMutation.isPending}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white w-full"
                      >
                        {createMaterialMutation.isPending ? 'Adding...' : 'Add Material'}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(studyMaterials as any[])?.map((material: any) => (
                    <div key={material.id} className="bg-slate-700 p-4 rounded-lg">
                      <h4 className="text-white font-semibold mb-2">{material.title}</h4>
                      <p className="text-slate-300 text-sm mb-2">{material.subject}</p>
                      <p className="text-slate-400 text-xs line-clamp-3">{material.content}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-slate-500 text-xs">
                          {new Date(material.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            data-testid={`button-edit-material-${material.id}`}
                            className="text-emerald-400 hover:text-emerald-300"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            data-testid={`button-delete-material-${material.id}`}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="col-span-full text-center py-8">
                      <Database className="text-6xl text-slate-600 mb-4 mx-auto" />
                      <p className="text-slate-400">No study materials uploaded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6">
            <Card data-testid="class-management" className="admin-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white">Class Management</CardTitle>
                  <Dialog open={classFormOpen} onOpenChange={setClassFormOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        data-testid="button-add-class"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        <Plus className="mr-2" size={16} />
                        Add Class
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create New Class</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="className" className="text-right text-slate-300">Class Name</Label>
                          <Input
                            id="className"
                            data-testid="input-class-name"
                            value={classForm.name}
                            onChange={(e) => setClassForm({...classForm, name: e.target.value})}
                            className="col-span-3 bg-slate-700 border-slate-600 text-white"
                            placeholder="e.g., Class 10-A"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="classSubject" className="text-right text-slate-300">Subject</Label>
                          <Input
                            id="classSubject"
                            data-testid="input-class-subject"
                            value={classForm.subject}
                            onChange={(e) => setClassForm({...classForm, subject: e.target.value})}
                            className="col-span-3 bg-slate-700 border-slate-600 text-white"
                            placeholder="Subject"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="teacherId" className="text-right text-slate-300">Teacher</Label>
                          <Select value={classForm.teacherId} onValueChange={(value) => setClassForm({...classForm, teacherId: value})}>
                            <SelectTrigger data-testid="select-class-teacher" className="col-span-3 bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Select Teacher" />
                            </SelectTrigger>
                            <SelectContent>
                              {(users as any[])?.filter((user: any) => user.role === 'teacher').map((teacher: any) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {teacher.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        data-testid="button-create-class"
                        onClick={handleCreateClass}
                        disabled={createClassMutation.isPending}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white w-full"
                      >
                        {createClassMutation.isPending ? 'Creating...' : 'Create Class'}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(classes as any[])?.map((classItem: any) => (
                    <div key={classItem.id} className="bg-slate-700 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <School2 className="text-emerald-400" size={24} />
                        <div className="flex space-x-2">
                          <button 
                            data-testid={`button-edit-class-${classItem.id}`}
                            className="text-emerald-400 hover:text-emerald-300"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            data-testid={`button-delete-class-${classItem.id}`}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-white font-semibold text-lg mb-2">{classItem.name}</h4>
                      <p className="text-slate-300 text-sm mb-3">{classItem.subject}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Created {new Date(classItem.createdAt).toLocaleDateString()}
                        </span>
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                          Active
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="col-span-full text-center py-8">
                      <School2 className="text-6xl text-slate-600 mb-4 mx-auto" />
                      <p className="text-slate-400">No classes created yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
