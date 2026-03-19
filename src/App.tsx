import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import SplashPage from "./pages/SplashPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminDoctorsPage from "./pages/AdminDoctorsPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminVideoAnalyzerPage from "./pages/AdminVideoAnalyzerPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import DoctorReportsPage from "./pages/DoctorReportsPage";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import AssessmentPage from "./pages/AssessmentPage";
import GovernancePage from "./pages/GovernancePage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode; allowedRole?: "admin" | "doctor" }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && profile?.role !== allowedRole) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={profile?.role === "admin" ? "/admin/dashboard" : "/doctor/dashboard"} replace /> : <LoginPage />} />
      <Route path="/" element={user ? <Navigate to={profile?.role === "admin" ? "/admin/dashboard" : "/doctor/dashboard"} replace /> : <SplashPage />} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/doctors" element={<ProtectedRoute allowedRole="admin"><AdminDoctorsPage /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRole="admin"><AdminReportsPage /></ProtectedRoute>} />
      
      <Route path="/admin/video-analyzer" element={<ProtectedRoute allowedRole="admin"><AdminVideoAnalyzerPage /></ProtectedRoute>} />

      {/* Doctor routes */}
      <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboardPage /></ProtectedRoute>} />
      <Route path="/doctor/assessment" element={<ProtectedRoute allowedRole="doctor"><AssessmentPage /></ProtectedRoute>} />
      <Route path="/doctor/reports" element={<ProtectedRoute allowedRole="doctor"><DoctorReportsPage /></ProtectedRoute>} />
      <Route path="/doctor/profile" element={<ProtectedRoute allowedRole="doctor"><DoctorProfilePage /></ProtectedRoute>} />
      

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
