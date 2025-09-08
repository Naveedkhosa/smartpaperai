// pages/TeacherDashboard.js
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Presentation,
  FileText,
  Clock,
  Users,
  Eye,
  Edit3,
  CloudUpload,
  CheckCircle,
  Plus,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut
} from "lucide-react";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["/api/classes/teacher", user?.id],
    enabled: !!user?.id,
  });

  const { data: papers, isLoading: papersLoading } = useQuery({
    queryKey: ["/api/papers/teacher", user?.id],
    enabled: !!user?.id,
  });

  const teacherStats = {
    activeClasses: (classes as any[])?.length || 6,
    papersCreated: (papers as any[])?.length || 24,
    pendingGrading: 12,
    totalStudents: 156,
  };

  const recentPapers = [
    {
      id: 1,
      title: "Math Quiz - Algebra",
      class: "Class 9-A",
      submissions: 23,
      avgScore: "85%",
      status: "completed",
    },
    {
      id: 2,
      title: "English Essay - Literature",
      class: "Class 10-A",
      submissions: 18,
      avgScore: "78%",
      status: "active",
    },
    {
      id: 3,
      title: "Physics Test - Motion",
      class: "Class 10-B",
      submissions: 0,
      avgScore: "0%",
      status: "draft",
    },
  ];

  const pendingSubmissions = [
    {
      id: 1,
      title: "Physics Test - Chapter 5",
      class: "Class 10-B",
      submissions: 15,
      dueDate: "2 days",
    },
    {
      id: 2,
      title: "Chemistry Lab Report",
      class: "Class 9-A",
      submissions: 22,
      dueDate: "5 days",
    },
  ];

  const menuItems = [
    { path: "/teacher", label: "Overview", icon: Eye },
    { path: "/teacher/create", label: "Create Paper", icon: FileText },
    { path: "/teacher/grade", label: "Grade", icon: CheckCircle },
    { path: "/teacher/manage", label: "Manage", icon: Settings },
  ];

  if (classesLoading || papersLoading) {
    return (
      <GlassmorphismLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-300"></div>
        </div>
      </GlassmorphismLayout>
    );
  }

  return (
    <GlassmorphismLayout>
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-0 left-0 z-50 p-2 rounded-lg glassmorphism-strong"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full glassmorphism-strong z-40 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:w-64 w-3/4`}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Logo/Brand */}
          <div className="flex items-center mb-8 pt-4">
            <h2 className="text-xl font-bold text-white">Teacher Portal</h2>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center p-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-emerald-500/30 text-emerald-200"
                          : "text-slate-200/80 hover:text-slate-100 hover:bg-white/10"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="ml-3 font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="mt-auto pt-4 border-t border-white/20">
            <button
              onClick={logout}
              className="flex items-center w-full p-3 rounded-lg text-slate-200/80 hover:text-slate-100 hover:bg-red-500/20 transition-all"
            >
              <LogOut size={20} />
              <span className="ml-3 font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-4">
        {/* Welcome Section */}
        <div className="glassmorphism-strong rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome back, {user?.fullName}!
              </h2>
              <p className="text-slate-200/90 text-sm sm:text-base">
                Comprehensive paper generation and assessment platform
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-slate-300/80 text-xs sm:text-sm">
                Today's Date
              </p>
              <p className="text-white font-semibold text-sm sm:text-base">
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glassmorphism-strong rounded-xl p-4 sm:p-6 animate-scale-in hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200/80 text-xs sm:text-sm font-medium">
                  Active Classes
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {teacherStats.activeClasses}
                </p>
              </div>
              <Presentation className="text-emerald-400 opacity-80" size={28} />
            </div>
          </div>

          <div
            className="glassmorphism-strong rounded-xl p-4 sm:p-6 animate-scale-in hover:scale-105 transition-transform"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200/80 text-xs sm:text-sm font-medium">
                  Papers Created
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {teacherStats.papersCreated}
                </p>
              </div>
              <FileText className="text-emerald-400 opacity-80" size={28} />
            </div>
          </div>

          <div
            className="glassmorphism-strong rounded-xl p-4 sm:p-6 animate-scale-in hover:scale-105 transition-transform"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200/80 text-xs sm:text-sm font-medium">
                  Pending Grading
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {teacherStats.pendingGrading}
                </p>
              </div>
              <Clock className="text-amber-400 opacity-80" size={28} />
            </div>
          </div>

          <div
            className="glassmorphism-strong rounded-xl p-4 sm:p-6 animate-scale-in hover:scale-105 transition-transform"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200/80 text-xs sm:text-sm font-medium">
                  Total Students
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {teacherStats.totalStudents}
                </p>
              </div>
              <Users className="text-emerald-400 opacity-80" size={28} />
            </div>
          </div>
        </div>

        {/* Overview Content */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Papers */}
            <Card
              data-testid="recent-papers-list"
              className="glassmorphism-strong border-white/30"
            >
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  Recent Papers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="glassmorphism p-4 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold text-sm">
                        {paper.title}
                      </h4>
                      <Badge
                        className={
                          paper.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : paper.status === "active"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-slate-500/20 text-slate-300"
                        }
                      >
                        {paper.status}
                      </Badge>
                    </div>
                    <p className="text-white/60 text-xs mb-3">
                      {paper.class} • {paper.submissions} submissions
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-300 text-xs">
                        {paper.avgScore} avg score
                      </span>
                      <div className="flex space-x-2">
                        <button
                          data-testid={`button-view-paper-${paper.id}`}
                          className="text-emerald-300 hover:text-emerald-200 p-1"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          data-testid={`button-edit-paper-${paper.id}`}
                          className="text-blue-300 hover:text-blue-200 p-1"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card
              data-testid="quick-actions-overview"
              className="glassmorphism-strong border-white/30"
            >
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  to="/teacher/grade"
                  className="w-full glassmorphism hover:bg-white/20 p-4 rounded-lg text-left transition-all flex items-center"
                >
                  <CloudUpload className="text-emerald-300 mr-3" size={20} />
                  <span className="text-white">Upload Submissions</span>
                </Link>
                <Link
                  to="/teacher/grade"
                  className="w-full glassmorphism hover:bg-white/20 p-4 rounded-lg text-left transition-all flex items-center"
                >
                  <CheckCircle className="text-emerald-300 mr-3" size={20} />
                  <span className="text-white">Grade Papers</span>
                </Link>
                <Link
                  to="/teacher/create"
                  className="w-full glassmorphism hover:bg-white/20 p-4 rounded-lg text-left transition-all flex items-center"
                >
                  <Plus className="text-emerald-300 mr-3" size={20} />
                  <span className="text-white">Create New Paper</span>
                </Link>
                <button
                  data-testid="button-view-analytics-overview"
                  className="w-full glassmorphism hover:bg-white/20 p-4 rounded-lg text-left transition-all flex items-center"
                >
                  <BarChart3 className="text-emerald-300 mr-3" size={20} />
                  <span className="text-white">View Analytics</span>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Pending Submissions */}
          <Card
            data-testid="pending-submissions-overview"
            className="glassmorphism-strong border-white/30"
          >
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                Pending Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="glassmorphism p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="text-white font-semibold">
                          {submission.title}
                        </h5>
                        <p className="text-white/60 text-sm">
                          {submission.class}
                        </p>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-300">
                        Due in {submission.dueDate}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-300 text-sm">
                        {submission.submissions} submissions
                      </span>
                      <Link
                        to="/teacher/grade"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Grade
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </GlassmorphismLayout>
  );
}