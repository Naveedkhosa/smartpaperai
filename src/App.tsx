import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Login from "./pages/admin-teacher/Login";
import Register from "./pages/admin-teacher/Register";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/admin-teacher/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherStudent from "./pages/admin-teacher/TeacherStudent";
import AddStudent from "./pages/admin-teacher/AddStudent";
import Layout from "./components/Layout";
import NotFound from "./pages/admin-teacher/not-found";
import CreatePaper from "./pages/admin-teacher/CreatePaper";
import PapersPage from "./pages/admin-teacher/PapersPage";

import PaperBuilder from "./pages/admin-teacher/PaperBuilder";
import TemplatesPage from './pages/admin-teacher/TemplatesPage';
import TemplateBuilder from './pages/admin-teacher/TemplateBuilder';
import GradePapers from "./pages/admin-teacher/GradePapers";
import PaperViewer from "./pages/admin-teacher/PaperViewer";
import Manage from "./pages/admin-teacher/Manage";
import StudyMaterials from './pages/admin-teacher/StudyMaterials';
import CreatePersonalDb from './pages/admin-teacher/CreatePersonalDb';
import ClassesManagement from './pages/admin-teacher/ClassesManagement';
import SubjectManagement from './pages/admin-teacher/SubjectManagement';
import CreditBuyPage from "./pages/admin-teacher/CreditBuyPage"; // Add this import
import PaperPreviewPage from './pages/admin-teacher/PaperPreviewPage';
import Home from "./pages/Home";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import {
  SuperAdminDashboard,
  SuperAdminManageUsers,
  SuperAdminProfile,
  SuperAdminRolesPermissions,
  SuperAdminReports,
  SuperAdminSubscriptions,
  SuperAdminStudyMaterials,
  SuperAdminTemplates,
  SuperAdminClasses,
  SuperAdminSubjects,
  SuperAdminPlans,
  SuperAdminCMS,
  SuperAdminSettings,
  SuperAdminActivityLogs
} from "./pages/super-admin";


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
        path="/teacher/papers" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <PapersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/preview/:paperId" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <PaperPreviewPage />
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
        path="/teacher/students" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherStudent />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/add-student" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <AddStudent />
          </ProtectedRoute>
        } 
      />
      
      {/* Credit Buy Page Route - Added Here */}
      <Route 
        path="/teacher/credits" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <CreditBuyPage />
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
        path="/teacher/paper-viewer/:id"
        element={
          <ProtectedRoute requiredRole="teacher">
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

      {/* Templates Routes */}
      <Route 
        path="/teacher/templates" 
        element={
          <ProtectedRoute>
            <TemplatesPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/templates/builder" 
        element={
          <ProtectedRoute>
            <TemplateBuilder />
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
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<Home />} />

      {/* Temporary public routes for Super Admin previews */}
      <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="/super-admin/users" element={<SuperAdminManageUsers />} />
      <Route path="/super-admin/profile" element={<SuperAdminProfile />} />
      <Route path="/super-admin/roles" element={<SuperAdminRolesPermissions />} />
      <Route path="/super-admin/reports" element={<SuperAdminReports />} />
      <Route path="/super-admin/subscriptions" element={<SuperAdminSubscriptions />} />
      <Route path="/super-admin/study-materials" element={<SuperAdminStudyMaterials />} />
      <Route path="/super-admin/templates" element={<SuperAdminTemplates />} />
      <Route path="/super-admin/classes" element={<SuperAdminClasses />} />
      <Route path="/super-admin/subjects" element={<SuperAdminSubjects />} />
      <Route path="/super-admin/plans" element={<SuperAdminPlans />} />
      <Route path="/super-admin/cms" element={<SuperAdminCMS />} />
      <Route path="/super-admin/settings" element={<SuperAdminSettings />} />
      <Route path="/super-admin/activity-logs" element={<SuperAdminActivityLogs />} />
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