import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Book
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
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  const recentActivities = [
    { id: 1, icon: User, message: 'Teacher Sarah created new paper', time: '2 minutes ago', type: 'success' },
    { id: 2, icon: GraduationCap, message: '45 students submitted assignments', time: '15 minutes ago', type: 'info' },
    { id: 3, icon: Book, message: 'New study material uploaded', time: '1 hour ago', type: 'warning' },
  ];

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
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-slate-400">Monitor system performance and manage users</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stats-total-users" className="admin-card animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Users className="text-emerald-400" size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-emerald-400">+12%</span>
                <span className="text-slate-400 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stats-active-teachers" className="admin-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Teachers</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.activeTeachers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Presentation className="text-blue-400" size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-emerald-400">+5%</span>
                <span className="text-slate-400 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stats-papers-generated" className="admin-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Papers Generated</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.papersGenerated || 432}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="text-purple-400" size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-emerald-400">+18%</span>
                <span className="text-slate-400 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stats-submissions-graded" className="admin-card animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Submissions Graded</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.submissionsGraded || 1856}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-emerald-400" size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-emerald-400">+24%</span>
                <span className="text-slate-400 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Usage Analytics */}
          <Card data-testid="usage-analytics" className="admin-card animate-slide-up">
            <CardHeader>
              <CardTitle className="text-xl text-white">Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="text-6xl text-emerald-400 mb-4 mx-auto" />
                  <p className="text-slate-400">Analytics Chart</p>
                  <p className="text-slate-500 text-sm">Chart.js integration coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card data-testid="recent-activity" className="admin-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
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

        {/* User Management Section */}
        <Card data-testid="user-management" className="admin-card animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-white">User Management</CardTitle>
              <Button 
                data-testid="button-add-user"
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Plus className="mr-2" size={16} />
                Add User
              </Button>
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
      </div>
    </AdminLayout>
  );
}
