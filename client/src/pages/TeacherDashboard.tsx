import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import GlassmorphismLayout from '@/components/GlassmorphismLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Presentation, 
  FileText, 
  Clock, 
  Users,
  Brain,
  Upload,
  Plus,
  CheckCircle,
  BarChart3,
  CloudUpload
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['/api/classes/teacher', user?.id],
    enabled: !!user?.id,
  });

  const { data: papers, isLoading: papersLoading } = useQuery({
    queryKey: ['/api/papers/teacher', user?.id],
    enabled: !!user?.id,
  });

  const teacherStats = {
    activeClasses: classes?.length || 6,
    papersCreated: papers?.length || 24,
    pendingGrading: 12,
    totalStudents: 156,
  };

  const recentPapers = [
    { id: 1, title: 'Math Quiz - Algebra', class: 'Class 9-A', submissions: 23, avgScore: '85%' },
    { id: 2, title: 'English Essay - Literature', class: 'Class 10-A', submissions: 18, avgScore: '78%' },
  ];

  const pendingSubmissions = [
    { id: 1, title: 'Physics Test - Chapter 5', class: 'Class 10-B', submissions: 15 },
    { id: 2, title: 'Chemistry Lab Report', class: 'Class 9-A', submissions: 22 },
  ];

  if (classesLoading || papersLoading) {
    return (
      <GlassmorphismLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-300"></div>
          </div>
        </div>
      </GlassmorphismLayout>
    );
  }

  return (
    <GlassmorphismLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="glassmorphism rounded-2xl p-8 mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.fullName}!
              </h2>
              <p className="text-white/80">Manage your classes and create engaging assignments</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm">Today's Date</p>
              <p className="text-white font-semibold">
                {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glassmorphism rounded-xl p-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Active Classes</p>
                <p className="text-2xl font-bold text-white">{teacherStats.activeClasses}</p>
              </div>
              <Presentation className="text-2xl text-emerald-300" size={32} />
            </div>
          </div>

          <div className="glassmorphism rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Papers Created</p>
                <p className="text-2xl font-bold text-white">{teacherStats.papersCreated}</p>
              </div>
              <FileText className="text-2xl text-emerald-300" size={32} />
            </div>
          </div>

          <div className="glassmorphism rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Pending Grading</p>
                <p className="text-2xl font-bold text-white">{teacherStats.pendingGrading}</p>
              </div>
              <Clock className="text-2xl text-amber-300" size={32} />
            </div>
          </div>

          <div className="glassmorphism rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-white">{teacherStats.totalStudents}</p>
              </div>
              <Users className="text-2xl text-emerald-300" size={32} />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Paper Creation */}
          <div className="lg:col-span-2">
            <Card data-testid="paper-creation-form" className="glassmorphism-strong border-white/30 animate-slide-up">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Create New Paper</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-white/80 text-sm font-medium mb-2">Subject</Label>
                    <Select>
                      <SelectTrigger data-testid="select-subject" className="glass-input">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="block text-white/80 text-sm font-medium mb-2">Class</Label>
                    <Select>
                      <SelectTrigger data-testid="select-class" className="glass-input">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9a">Class 9-A</SelectItem>
                        <SelectItem value="9b">Class 9-B</SelectItem>
                        <SelectItem value="10a">Class 10-A</SelectItem>
                        <SelectItem value="10b">Class 10-B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border border-white/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Paper Creation Method</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      data-testid="button-generate-from-sources"
                      className="glassmorphism p-6 rounded-xl hover:bg-white/20 transition-all text-left"
                    >
                      <Brain className="text-2xl text-emerald-300 mb-3" />
                      <h5 className="text-white font-semibold mb-2">Generate from Sources</h5>
                      <p className="text-white/70 text-sm">Use AI to create papers from uploaded materials or key books</p>
                    </button>
                    <button 
                      data-testid="button-upload-paper"
                      className="glassmorphism p-6 rounded-xl hover:bg-white/20 transition-all text-left"
                    >
                      <Upload className="text-2xl text-emerald-300 mb-3" />
                      <h5 className="text-white font-semibold mb-2">Upload Composed Paper</h5>
                      <p className="text-white/70 text-sm">Upload your own pre-written paper with OCR support</p>
                    </button>
                  </div>
                </div>

                <Button 
                  data-testid="button-create-paper"
                  className="w-full emerald-gradient text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all"
                >
                  <Plus className="mr-2" size={16} />
                  Create Paper
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card data-testid="quick-actions" className="glassmorphism-strong border-white/30 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button 
                  data-testid="button-upload-submissions"
                  className="w-full glassmorphism hover:bg-white/20 p-4 rounded-lg text-left transition-all flex items-center"
                >
                  <CloudUpload className="text-emerald-300 mr-3" size={20} />
                  <span className="text-white">Upload Submissions</span>
                </button>
                <button 
                  data-testid="button-grade-papers"
                  className="w-full glassmorphism hover:bg-white/20 p-4 rounded-lg text-left transition-all flex items-center"
                >
                  <CheckCircle className="text-emerald-300 mr-3" size={20} />
                  <span className="text-white">Grade Papers</span>
                </button>
                <button 
                  data-testid="button-view-analytics"
                  className="w-full glassmorphism hover:bg-white/20 p-4 rounded-lg text-left transition-all flex items-center"
                >
                  <BarChart3 className="text-emerald-300 mr-3" size={20} />
                  <span className="text-white">View Analytics</span>
                </button>
                <button 
                  data-testid="button-manage-classes"
                  className="w-full glassmorphism hover:bg-white/20 p-4 rounded-lg text-left transition-all flex items-center"
                >
                  <Users className="text-emerald-300 mr-3" size={20} />
                  <span className="text-white">Manage Classes</span>
                </button>
              </CardContent>
            </Card>

            {/* Recent Papers */}
            <Card data-testid="recent-papers" className="glassmorphism-strong border-white/30 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Recent Papers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentPapers.map((paper) => (
                  <div key={paper.id} className="glassmorphism p-4 rounded-lg">
                    <h4 className="text-white font-semibold text-sm">{paper.title}</h4>
                    <p className="text-white/60 text-xs">{paper.class} • {paper.submissions} submissions</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-emerald-300 text-xs">{paper.avgScore} avg score</span>
                      <button className="text-white/40 hover:text-white/60">→</button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Grading Interface */}
        <Card data-testid="grading-interface" className="glassmorphism-strong border-white/30 mt-8 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Grading & Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Pending Submissions</h4>
                <div className="space-y-3">
                  {pendingSubmissions.map((submission) => (
                    <div key={submission.id} className="glassmorphism p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-white font-semibold">{submission.title}</h5>
                          <p className="text-white/60 text-sm">{submission.class} • {submission.submissions} submissions</p>
                        </div>
                        <Button 
                          data-testid={`button-grade-${submission.id}`}
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          Grade Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Assessment Options</h4>
                <div className="space-y-4">
                  <div className="glassmorphism p-4 rounded-lg">
                    <h5 className="text-white font-semibold mb-2">Grading Method</h5>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input 
                          data-testid="radio-literal-comparison"
                          type="radio" 
                          name="grading" 
                          className="mr-2" 
                        />
                        <span className="text-white/80 text-sm">Literal Comparison</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          data-testid="radio-conceptual-matching"
                          type="radio" 
                          name="grading" 
                          className="mr-2" 
                          defaultChecked 
                        />
                        <span className="text-white/80 text-sm">Conceptual Matching</span>
                      </label>
                    </div>
                  </div>
                  
                  <Button 
                    data-testid="button-begin-assessment"
                    className="w-full emerald-gradient text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all"
                  >
                    Begin Assessment
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </GlassmorphismLayout>
  );
}
