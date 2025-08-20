import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GlassmorphismLayout from '@/components/GlassmorphismLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { 
  BookOpen, 
  Upload, 
  GraduationCap, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Star,
  Trophy,
  FileText,
  Eye,
  Download,
  MessageSquare,
  Lightbulb,
  BookMarked,
  Calendar,
  ArrowRight,
  BarChart3,
  Award,
  CloudUpload,
  NotebookPen,
  Bookmark,
  Users,
  Settings
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);

  // Form state for assignment submission
  const [submissionForm, setSubmissionForm] = useState({
    assignmentId: '',
    rollNumber: '',
    uploadLink: ''
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['/api/submissions/student', user?.id],
    enabled: !!user?.id,
  });

  const { data: grades, isLoading: gradesLoading } = useQuery({
    queryKey: ['/api/grades/student', user?.id],
    enabled: !!user?.id,
  });

  const { data: studyMaterials } = useQuery({
    queryKey: ['/api/study-materials'],
  });

  const studentStats = {
    overallGrade: 'A-',
    assignmentsCompleted: 18,
    totalAssignments: 22,
    averageScore: 87,
    pendingSubmissions: 4,
    completionRate: Math.round((18/22) * 100)
  };

  const recentGrades = [
    { id: 1, title: 'Math Quiz - Quadratic Equations', submittedDate: '2024-01-15', score: 92, status: 'completed', feedback: 'Excellent work on solving complex equations. Minor arithmetic error in question 3.' },
    { id: 2, title: 'English Essay - Literature Analysis', submittedDate: '2024-01-10', score: 85, status: 'completed', feedback: 'Strong analysis of themes. Improve citation formatting.' },
    { id: 3, title: 'Physics Lab Report - Motion Study', submittedDate: '2024-01-08', score: 94, status: 'completed', feedback: 'Comprehensive data analysis and conclusions. Well structured report.' },
  ];

  const pendingAssignments = [
    { id: 1, title: 'Chemistry Test - Organic Compounds', dueDate: '2024-01-20', status: 'urgent', subject: 'Chemistry', uploadLink: 'CHE-2024-001' },
    { id: 2, title: 'History Research - World War Analysis', dueDate: '2024-01-25', status: 'normal', subject: 'History', uploadLink: 'HIS-2024-002' },
    { id: 3, title: 'Biology Lab - Cell Division', dueDate: '2024-01-30', status: 'normal', subject: 'Biology', uploadLink: 'BIO-2024-003' },
  ];

  const detailedFeedback = [
    {
      id: 1,
      title: 'Math Quiz - Quadratic Equations',
      score: 92,
      totalMarks: 100,
      submittedDate: '2024-01-15',
      gradedDate: '2024-01-17',
      mistakes: [
        { question: 'Q3: Solving x² - 5x + 6 = 0', error: 'Calculation error in final step', correction: 'x = 2, 3 not x = 1, 3', severity: 'minor' },
        { question: 'Q7: Graph interpretation', error: 'Missed vertex identification', correction: 'Vertex at (-2, -1)', severity: 'moderate' }
      ],
      strengths: [
        'Excellent understanding of quadratic formula',
        'Clear step-by-step working',
        'Proper use of mathematical notation'
      ],
      improvements: [
        'Double-check arithmetic calculations',
        'Review vertex form of quadratic equations',
        'Practice graph interpretation'
      ]
    }
  ];

  const revisionSuggestions = [
    { 
      id: 1, 
      subject: 'Mathematics',
      chapter: 'Chapter 5: Quadratic Equations', 
      topic: 'Factoring and Vertex Form',
      priority: 'high',
      reason: 'Recent mistakes in graph interpretation',
      studyTime: '45 minutes'
    },
    { 
      id: 2, 
      subject: 'Physics',
      chapter: 'Chapter 3: Motion and Forces', 
      topic: 'Acceleration calculations',
      priority: 'medium',
      reason: 'Preparation for upcoming test',
      studyTime: '30 minutes'
    },
    { 
      id: 3, 
      subject: 'Chemistry',
      chapter: 'Chapter 2: Organic Compounds', 
      topic: 'Nomenclature rules',
      priority: 'high',
      reason: 'Assignment due soon',
      studyTime: '60 minutes'
    }
  ];

  const academicProgress = {
    subjects: [
      { name: 'Mathematics', currentGrade: 'A-', progress: 88, trend: 'up' },
      { name: 'Physics', currentGrade: 'B+', progress: 82, trend: 'stable' },
      { name: 'Chemistry', currentGrade: 'A', progress: 94, trend: 'up' },
      { name: 'English', currentGrade: 'B', progress: 78, trend: 'down' },
      { name: 'History', currentGrade: 'A-', progress: 86, trend: 'up' }
    ]
  };

  // Mutation for submission
  const submitAssignmentMutation = useMutation({
    mutationFn: (submissionData: any) =>
      fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...submissionData,
          studentId: user?.id,
        })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/submissions/student', user?.id] });
      setSubmissionDialogOpen(false);
      setSubmissionForm({ assignmentId: '', rollNumber: '', uploadLink: '' });
      toast({ title: 'Success', description: 'Assignment submitted successfully' });
    }
  });

  const handleSubmitAssignment = () => {
    submitAssignmentMutation.mutate(submissionForm);
  };

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
              <p className="text-white/80">Your personalized learning and assignment portal</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm">Student ID</p>
              <p className="text-white font-semibold">STU-2024-{Math.random().toString().slice(2,6)}</p>
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
            <div className="mt-3 flex items-center">
              <Progress value={studentStats.completionRate} className="flex-1 mr-2" />
              <span className="text-white/60 text-xs">{studentStats.completionRate}%</span>
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
            <p className="text-emerald-300 text-xs mt-2">4 remaining</p>
          </div>

          <div className="glassmorphism rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Average Score</p>
                <p className="text-2xl font-bold text-white">{studentStats.averageScore}%</p>
              </div>
              <TrendingUp className="text-2xl text-emerald-300" size={32} />
            </div>
            <p className="text-emerald-300 text-xs mt-2">↗ +3% from last month</p>
          </div>

          <div className="glassmorphism rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Pending Submissions</p>
                <p className="text-2xl font-bold text-white">{studentStats.pendingSubmissions}</p>
              </div>
              <Clock className="text-2xl text-amber-300" size={32} />
            </div>
            <p className="text-amber-300 text-xs mt-2">1 due soon</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-8 glassmorphism border-white/30">
            <TabsTrigger 
              value="overview" 
              data-testid="tab-overview"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 text-white/70"
            >
              <Eye className="mr-2" size={16} />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="submit" 
              data-testid="tab-submit"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 text-white/70"
            >
              <Upload className="mr-2" size={16} />
              Submit
            </TabsTrigger>
            <TabsTrigger 
              value="feedback" 
              data-testid="tab-feedback"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 text-white/70"
            >
              <MessageSquare className="mr-2" size={16} />
              Feedback
            </TabsTrigger>
            <TabsTrigger 
              value="study" 
              data-testid="tab-study"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 text-white/70"
            >
              <BookOpen className="mr-2" size={16} />
              Study
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Grades */}
              <Card data-testid="recent-grades-overview" className="glassmorphism-strong border-white/30">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Recent Grades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentGrades.map((grade) => (
                    <div key={grade.id} className="glassmorphism p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-semibold text-sm">{grade.title}</h4>
                          <p className="text-white/60 text-xs">Submitted {new Date(grade.submittedDate).toLocaleDateString()}</p>
                        </div>
                        <Badge 
                          className={
                            grade.score >= 90 ? 'bg-emerald-500/20 text-emerald-300' :
                            grade.score >= 80 ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-orange-500/20 text-orange-300'
                          }
                        >
                          {grade.score}%
                        </Badge>
                      </div>
                      <p className="text-white/60 text-xs line-clamp-2">{grade.feedback}</p>
                      <div className="flex justify-end mt-2">
                        <button 
                          data-testid={`button-view-feedback-${grade.id}`}
                          onClick={() => setActiveTab('feedback')}
                          className="text-emerald-300 hover:text-emerald-200 text-xs"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Academic Progress */}
              <Card data-testid="academic-progress" className="glassmorphism-strong border-white/30">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Subject Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {academicProgress.subjects.map((subject, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium text-sm">{subject.name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-slate-500/20 text-slate-300 text-xs">
                            {subject.currentGrade}
                          </Badge>
                          <span className={`text-xs ${
                            subject.trend === 'up' ? 'text-emerald-300' :
                            subject.trend === 'down' ? 'text-red-300' : 'text-yellow-300'
                          }`}>
                            {subject.trend === 'up' ? '↗' : subject.trend === 'down' ? '↘' : '→'}
                          </span>
                        </div>
                      </div>
                      <Progress value={subject.progress} className="h-2" />
                      <span className="text-white/60 text-xs">{subject.progress}% completion</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Pending Assignments */}
            <Card data-testid="pending-assignments-overview" className="glassmorphism-strong border-white/30">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Pending Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pendingAssignments.map((assignment) => (
                    <div key={assignment.id} className="glassmorphism p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-semibold text-sm">{assignment.title}</h4>
                          <p className="text-white/60 text-xs">{assignment.subject}</p>
                        </div>
                        <Badge 
                          className={
                            assignment.status === 'urgent' 
                              ? 'bg-red-500/20 text-red-300' 
                              : 'bg-green-500/20 text-green-300'
                          }
                        >
                          {assignment.status === 'urgent' ? 'Urgent' : 'Normal'}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-xs mb-3">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                      <Button 
                        data-testid={`button-submit-overview-${assignment.id}`}
                        onClick={() => setActiveTab('submit')}
                        size="sm"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        Submit Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submit Tab */}
          <TabsContent value="submit" className="space-y-6">
            <Card data-testid="assignment-submission-comprehensive" className="glassmorphism-strong border-white/30">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Assignment Submission Portal</CardTitle>
                <p className="text-white/70">Submit assignments via upload links or direct file uploads</p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Submission Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glassmorphism p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Via Upload Link</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="block text-white/80 text-sm font-medium mb-2">Upload Link Code</Label>
                        <Input 
                          data-testid="input-upload-link"
                          value={submissionForm.uploadLink}
                          onChange={(e) => setSubmissionForm({...submissionForm, uploadLink: e.target.value})}
                          placeholder="e.g., CHE-2024-001"
                          className="glass-input"
                        />
                      </div>
                      <Button 
                        data-testid="button-submit-via-link"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Upload className="mr-2" size={16} />
                        Submit via Link
                      </Button>
                    </div>
                  </div>

                  <div className="glassmorphism p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Direct Upload</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="block text-white/80 text-sm font-medium mb-2">Select Assignment</Label>
                        <Select value={submissionForm.assignmentId} onValueChange={(value) => setSubmissionForm({...submissionForm, assignmentId: value})}>
                          <SelectTrigger data-testid="select-assignment-direct" className="glass-input">
                            <SelectValue placeholder="Choose Assignment" />
                          </SelectTrigger>
                          <SelectContent>
                            {pendingAssignments.map((assignment) => (
                              <SelectItem key={assignment.id} value={assignment.id.toString()}>
                                {assignment.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="block text-white/80 text-sm font-medium mb-2">Roll Number</Label>
                        <Input 
                          data-testid="input-roll-number-direct"
                          value={submissionForm.rollNumber}
                          onChange={(e) => setSubmissionForm({...submissionForm, rollNumber: e.target.value})}
                          placeholder="Your roll number"
                          className="glass-input"
                        />
                      </div>
                      <Button 
                        data-testid="button-submit-direct"
                        onClick={handleSubmitAssignment}
                        disabled={submitAssignmentMutation.isPending}
                        className="w-full emerald-gradient text-white"
                      >
                        {submitAssignmentMutation.isPending ? 'Submitting...' : 'Direct Submit'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">File Upload</h3>
                  <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
                    <CloudUpload className="text-6xl text-emerald-300 mb-4 mx-auto" />
                    <h4 className="text-white font-semibold mb-2">Upload Assignment Files</h4>
                    <p className="text-white/60 text-sm mb-4">
                      Support for PDF, DOC, DOCX, JPG, PNG files<br/>
                      Maximum file size: 10MB per file
                    </p>
                    <Button 
                      data-testid="button-choose-files-comprehensive"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <Upload className="mr-2" size={16} />
                      Choose Files to Upload
                    </Button>
                  </div>
                </div>

                {/* Submission History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Recent Submissions</h3>
                  <div className="space-y-3">
                    {recentGrades.slice(0, 3).map((submission) => (
                      <div key={submission.id} className="glassmorphism p-4 rounded-lg flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-semibold text-sm">{submission.title}</h4>
                          <p className="text-white/60 text-xs">Submitted: {new Date(submission.submittedDate).toLocaleDateString()}</p>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-300">
                          {submission.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <Card data-testid="detailed-feedback-system" className="glassmorphism-strong border-white/30">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Detailed Feedback & Analysis</CardTitle>
                <p className="text-white/70">Comprehensive assessment feedback with mistake identification and improvement suggestions</p>
              </CardHeader>
              <CardContent className="space-y-8">
                {detailedFeedback.map((feedback) => (
                  <div key={feedback.id} className="space-y-6">
                    <div className="glassmorphism p-6 rounded-xl">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{feedback.title}</h3>
                          <p className="text-white/60 text-sm">
                            Submitted: {new Date(feedback.submittedDate).toLocaleDateString()} • 
                            Graded: {new Date(feedback.gradedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{feedback.score}/{feedback.totalMarks}</div>
                          <Badge className="bg-emerald-500/20 text-emerald-300">
                            {Math.round((feedback.score / feedback.totalMarks) * 100)}%
                          </Badge>
                        </div>
                      </div>

                      {/* Mistakes Analysis */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Mistake Analysis</h4>
                        {feedback.mistakes.map((mistake, index) => (
                          <div key={index} className="glassmorphism p-4 rounded-lg border-l-4 border-red-400">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="text-white font-semibold text-sm">{mistake.question}</h5>
                              <Badge 
                                className={
                                  mistake.severity === 'minor' ? 'bg-yellow-500/20 text-yellow-300' :
                                  mistake.severity === 'moderate' ? 'bg-orange-500/20 text-orange-300' :
                                  'bg-red-500/20 text-red-300'
                                }
                              >
                                {mistake.severity}
                              </Badge>
                            </div>
                            <p className="text-red-300 text-xs mb-2">
                              <strong>Error:</strong> {mistake.error}
                            </p>
                            <p className="text-emerald-300 text-xs">
                              <strong>Correction:</strong> {mistake.correction}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Strengths */}
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-white">Strengths</h4>
                        <div className="space-y-2">
                          {feedback.strengths.map((strength, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <CheckCircle className="text-emerald-300 mt-1" size={16} />
                              <p className="text-white/80 text-sm">{strength}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Areas for Improvement */}
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-white">Areas for Improvement</h4>
                        <div className="space-y-2">
                          {feedback.improvements.map((improvement, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <Target className="text-amber-300 mt-1" size={16} />
                              <p className="text-white/80 text-sm">{improvement}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Study Tab */}
          <TabsContent value="study" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revision Suggestions */}
              <Card data-testid="revision-suggestions-comprehensive" className="glassmorphism-strong border-white/30">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">AI-Powered Revision Suggestions</CardTitle>
                  <p className="text-white/70">Personalized study recommendations based on your performance</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {revisionSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="glassmorphism p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-semibold text-sm">{suggestion.subject}</h4>
                          <p className="text-white/60 text-xs">{suggestion.chapter}</p>
                        </div>
                        <Badge 
                          className={
                            suggestion.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                            suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }
                        >
                          {suggestion.priority} priority
                        </Badge>
                      </div>
                      <h5 className="text-emerald-300 font-medium text-sm mb-2">{suggestion.topic}</h5>
                      <p className="text-white/60 text-xs mb-2">
                        <strong>Reason:</strong> {suggestion.reason}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-white/50 text-xs">Est. {suggestion.studyTime}</span>
                        <Button 
                          data-testid={`button-start-revision-${suggestion.id}`}
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          <Lightbulb className="mr-1" size={12} />
                          Start
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Study Materials */}
              <Card data-testid="study-materials-access" className="glassmorphism-strong border-white/30">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Study Materials Library</CardTitle>
                  <p className="text-white/70">Access curated learning resources</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(studyMaterials as any[])?.length > 0 ? (
                    (studyMaterials as any[]).map((material: any) => (
                      <div key={material.id} className="glassmorphism p-4 rounded-lg">
                        <h4 className="text-white font-semibold text-sm mb-1">{material.title}</h4>
                        <p className="text-white/60 text-xs mb-3">{material.subject}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-white/50 text-xs">
                            Added {new Date(material.createdAt).toLocaleDateString()}
                          </span>
                          <Button 
                            data-testid={`button-access-material-${material.id}`}
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Download className="mr-1" size={12} />
                            Access
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="text-6xl text-slate-600 mb-4 mx-auto" />
                      <p className="text-white/60">No study materials available yet</p>
                      <p className="text-white/40 text-sm">Check back later for new resources</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Academic Analytics */}
            <Card data-testid="academic-analytics" className="glassmorphism-strong border-white/30">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Academic Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glassmorphism p-4 rounded-lg text-center">
                    <Trophy className="text-4xl text-yellow-300 mb-3 mx-auto" />
                    <h4 className="text-white font-semibold">Best Subject</h4>
                    <p className="text-emerald-300 text-lg">Chemistry</p>
                    <p className="text-white/60 text-xs">94% average</p>
                  </div>
                  
                  <div className="glassmorphism p-4 rounded-lg text-center">
                    <Target className="text-4xl text-blue-300 mb-3 mx-auto" />
                    <h4 className="text-white font-semibold">Focus Area</h4>
                    <p className="text-amber-300 text-lg">English</p>
                    <p className="text-white/60 text-xs">Needs improvement</p>
                  </div>
                  
                  <div className="glassmorphism p-4 rounded-lg text-center">
                    <Award className="text-4xl text-purple-300 mb-3 mx-auto" />
                    <h4 className="text-white font-semibold">Overall Rank</h4>
                    <p className="text-emerald-300 text-lg">Top 15%</p>
                    <p className="text-white/60 text-xs">In your class</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </GlassmorphismLayout>
  );
}
