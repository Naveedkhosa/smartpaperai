import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Layout from "./components/Layout";
import NotFound from "./pages/not-found";
import CreatePaper from "./pages/CreatePaper";
import GradePapers from "./pages/GradePapers";
import PaperViewer from "./pages/PaperViewer";
import Manage from "./pages/Manage";
import CreatePersonalDb from './pages/CreatePersonalDb';



function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ThemeProvider>
            <Toaster />
            <Router>
              <Layout>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/teacher" element={<TeacherDashboard />} />
                  <Route path="/teacher/create" element={<CreatePaper />} />
                  <Route path="/teacher/grade" element={<GradePapers />} />
                  <Route path="/teacher/manage" element={<Manage />} />
                  <Route path="/student" element={<StudentDashboard />} />
                  <Route path="/paper-viewer" element={<PaperViewer />} />
                  <Route path="/create-personal-db" element={<CreatePersonalDb />} />
                  <Route path="/" element={<Login />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </Router>
          </ThemeProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;