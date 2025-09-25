import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Layout from "./components/Layout";
import NotFound from "./pages/not-found";
import CreatePaper from "./pages/CreatePaper";
import PaperBuilder from "./pages/PaperBuilder";
import GradePapers from "./pages/GradePapers";
import PaperViewer from "./pages/PaperViewer";
import Manage from "./pages/Manage";
import StudyMaterials from './pages/StudyMaterials';
import CreatePersonalDb from './pages/CreatePersonalDb';
import ClassesManagement from './pages/ClassesManagement';
import SubjectManagement from './pages/SubjectManagement';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { 
  children: React.ReactNode, 
  requiredRole?: string 
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Public Only Route Component (for login/register when already authenticated)
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  if (user) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    } else {
      return <Navigate to="/student" replace />;
    }
  }
  
  return <>{children}</>;
};

// Unauthorized Page Component
const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">403</h1>
        <p className="text-white/80 mb-4">You don't have permission to access this page</p>
        <a href="/" className="text-emerald-300 hover:text-emerald-200">
          Return to Home
        </a>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        } 
      />
      
      {/* Protected routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/create" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <CreatePaper />
          </ProtectedRoute>
        } 
      />
      
      <Route 
  path="/teacher/subjects" 
  element={
    <ProtectedRoute requiredRole="teacher">
      <SubjectManagement />
    </ProtectedRoute>
  } 
/>
      <Route 
        path="/teacher/grade" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <GradePapers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/manage" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <Manage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student" 
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />

 <Route 
  path="/teacher/study-materials" 
  element={
    <ProtectedRoute requiredRole="teacher">
      <StudyMaterials />
    </ProtectedRoute>
  } 
/>
      <Route 
        path="/paper-viewer" 
        element={
          <ProtectedRoute>
            <PaperViewer />
          </ProtectedRoute>
        } 
      />
      <Route 
  path="/teacher/classes" 
  element={
    <ProtectedRoute requiredRole="teacher">
      <ClassesManagement />
    </ProtectedRoute>
  } 
/>

<Route 
        path="/teacher/paper-builder/:id" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <PaperBuilder/>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/create-personal-db" 
        element={
          <ProtectedRoute>
            <CreatePersonalDb />
          </ProtectedRoute>
        } 
      />
      
      {/* Additional routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ThemeProvider>
            <Toaster />
            <Router>
              <Layout>
                <AppRoutes />
              </Layout>
            </Router>
          </ThemeProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;