import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import GlassmorphismLayout from '@/components/GlassmorphismLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Star, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  CloudUpload,
  NotebookPen,
  Calendar
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['/api/submissions/student', user?.id],
    enabled: !!user?.id,
  });

  const { data: grades, isLoading: gradesLoading } = useQuery({
    queryKey: ['/api/grades/student', user?.id],
    enabled: !!user?.id,
  });

  const studentStats = {
    overallGrade: 'A-',
    assignmentsCompleted: 18,
    totalAssignments: 22,
    averageScore: 87,
    pendingSubmissions: 4,
  };

  const recentGrades = [
    { id: 1, title: 'Math Quiz - Chapter 3', submittedDate: '2 days ago', score: 92 },
    { id: 2, title: 'English Essay', submittedDate: '1 week ago', score: 85 },
    { id: 3, title: 'Science Lab Report', submittedDate: '1 week ago', score: 94 },
  ];

  const pendingAssignments = [
    { id: 1, title: 'Physics Test - Motion', dueDate: 'Due in 2 days', status: 'urgent' },
    { id: 2, title: 'History Research', dueDate: 'Due in 5 days', status: 'normal' },
  ];

  const feedbackData = {
    title: 'Math Quiz - Quadratic Equations',
    feedback: [
      { type: 'success', message: 'Excellent understanding of quadratic formula application' },
      { type: 'error', message: 'Minor calculation error in problem 3 - check arithmetic steps' },
      { type: 'warning', message: 'Need to show more work for factoring problems' },
    ]
  };

  const revisionSuggestions = [
    { id: 1, chapter: 'Chapter 5: Quadratic Equations', topic: 'Review factoring methods' },
    { id: 2, chapter: 'Chapter 3: Linear Systems', topic: 'Practice substitution method' },
  ];

  if (submissionsLoading || gradesLoading) {
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
                Hello, {user?.fullName?.split(' ')[0] || 'Student'}!
              </h2>
              <p className="text-white/80">Track your progress and submit assignments</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm">Student ID</p>
              <p className="text-white font-semibold">STU-2024-0156</p>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glassmorphism rounded-xl p-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Overall Grade</p>
                <p className="text-2xl font-bold text-white">{studentStats.overallGrade}</p>
              </div>
              <Star className="text-2xl text-yellow-300" size={32} />
            </div>
          </div>

          <div className="glassmorphism rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Assignments Completed</p>
                <p className="text-2xl font-bold text-white">
                  {studentStats.assignmentsCompleted}/{studentStats.totalAssignments}
                </p>
              </div>
              <CheckCircle className="text-2xl text-emerald-300" size={32} />
            </div>
          </div>

          <div className="glassmorphism rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Average Score</p>
                <p className="text-2xl font-bold text-white">{studentStats.averageScore}%</p>
              </div>
              <TrendingUp className="text-2xl text-emerald-300" size={32} />
            </div>
          </div>

          <div className="glassmorphism rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Pending Submissions</p>
                <p className="text-2xl font-bold text-white">{studentStats.pendingSubmissions}</p>
              </div>
              <Clock className="text-2xl text-amber-300" size={32} />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignment Submission */}
          <div className="lg:col-span-2">
            <Card data-testid="assignment-submission-form" className="glassmorphism-strong border-white/30 animate-slide-up">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Submit Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="block text-white/80 text-sm font-medium mb-2">Assignment</Label>
                  <Select>
                    <SelectTrigger data-testid="select-assignment" className="glass-input">
                      <SelectValue placeholder="Select Assignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math1">Math Quiz - Algebra</SelectItem>
                      <SelectItem value="eng1">English Essay - Literature</SelectItem>
                      <SelectItem value="sci1">Science Test - Chemistry</SelectItem>
                      <SelectItem value="phy1">Physics Test - Motion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="block text-white/80 text-sm font-medium mb-2">Roll Number</Label>
                  <Input 
                    data-testid="input-roll-number"
                    type="text"
                    placeholder="Enter your roll number"
                    className="glass-input"
                  />
                </div>

                <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
                  <CloudUpload className="text-4xl text-emerald-300 mb-4 mx-auto" />
                  <h4 className="text-white font-semibold mb-2">Upload Your Files</h4>
                  <p className="text-white/60 text-sm mb-4">Drag and drop files here or click to browse</p>
                  <Button 
                    data-testid="button-choose-files"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    Choose Files
                  </Button>
                </div>

                <Button 
                  data-testid="button-submit-assignment"
                  className="w-full emerald-gradient text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all"
                >
                  <NotebookPen className="mr-2" size={16} />
                  Submit Assignment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Grades & Pending Assignments */}
          <div className="space-y-6">
            {/* Recent Grades */}
            <Card data-testid="recent-grades" className="glassmorphism-strong border-white/30 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Recent Grades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentGrades.map((grade) => (
                  <div key={grade.id} className="glassmorphism p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-semibold text-sm">{grade.title}</h4>
                        <p className="text-white/60 text-xs">Submitted {grade.submittedDate}</p>
                      </div>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          grade.score >= 90 
                            ? 'bg-emerald-500 text-white' 
                            : grade.score >= 80 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-orange-500 text-white'
                        }`}
                      >
                        {grade.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pending Assignments */}
            <Card data-testid="pending-assignments" className="glassmorphism-strong border-white/30 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Pending Assignments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingAssignments.map((assignment) => (
                  <div key={assignment.id} className="glassmorphism p-4 rounded-lg">
                    <h4 className="text-white font-semibold text-sm">{assignment.title}</h4>
                    <p className="text-white/60 text-xs">{assignment.dueDate}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span 
                        className={`text-xs ${
                          assignment.status === 'urgent' ? 'text-amber-300' : 'text-emerald-300'
                        }`}
                      >
                        {assignment.status === 'urgent' ? 'Due Soon' : 'Good Time'}
                      </span>
                      {assignment.status === 'urgent' ? (
                        <Clock className="text-amber-300" size={16} />
                      ) : (
                        <Calendar className="text-emerald-300" size={16} />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Feedback Section */}
        <Card data-testid="feedback-section" className="glassmorphism-strong border-white/30 mt-8 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Latest Feedback & Revision Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Detailed Feedback</h4>
                <div className="glassmorphism p-6 rounded-lg">
                  <h5 className="text-white font-semibold mb-3">{feedbackData.title}</h5>
                  <div className="space-y-3">
                    {feedbackData.feedback.map((item, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        {item.type === 'success' ? (
                          <CheckCircle className="text-emerald-300 mt-1" size={16} />
                        ) : item.type === 'error' ? (
                          <div className="w-4 h-4 bg-red-300 rounded-full mt-1"></div>
                        ) : (
                          <div className="w-4 h-4 bg-yellow-300 rounded-full mt-1"></div>
                        )}
                        <p className="text-white/80 text-sm">{item.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Revision Suggestions</h4>
                <div className="space-y-3">
                  {revisionSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="glassmorphism p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-white font-semibold text-sm">{suggestion.chapter}</h5>
                          <p className="text-white/60 text-xs">{suggestion.topic}</p>
                        </div>
                        <button 
                          data-testid={`button-revision-${suggestion.id}`}
                          className="text-emerald-300 hover:text-emerald-200"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </GlassmorphismLayout>
  );
}
