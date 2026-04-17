import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import { DynamicSEO } from "@/components/DynamicSEO";
import Landing from "./pages/Landing";
import Survey from "./pages/Survey";
import Dashboard from "./pages/Dashboard";
import HRPanel from "./pages/HRPanel";
import EmployeeResponses from "./pages/EmployeeResponses";
import ManagerActions from "./pages/ManagerActions";
import ManagerAssignments from "./pages/ManagerAssignments";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import SuggestionBox from "./pages/SuggestionBox";
import SuggestionsManagement from "./pages/SuggestionsManagement";
import Targets from "./pages/Targets";
import Analytics from "./pages/Analytics";
import Install from "./pages/Install";
import ExportSpec from "./pages/ExportSpec";
import AdminCMS from "./pages/AdminCMS";
import AdminRoute from "./components/AdminRoute";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DynamicSEO />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/hr-panel" element={
              <ProtectedRoute>
                <HRPanel />
              </ProtectedRoute>
            } />
            <Route path="/employee-responses" element={
              <ProtectedRoute>
                <EmployeeResponses />
              </ProtectedRoute>
            } />
            <Route path="/manager-actions" element={
              <ProtectedRoute>
                <ManagerActions />
              </ProtectedRoute>
            } />
            <Route path="/manager-assignments" element={
              <ProtectedRoute>
                <ManagerAssignments />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/suggestion-box" element={<SuggestionBox />} />
            <Route path="/install" element={<Install />} />
            <Route path="/suggestions-management" element={
              <ProtectedRoute>
                <SuggestionsManagement />
              </ProtectedRoute>
            } />
            <Route path="/targets" element={
              <ProtectedRoute>
                <Targets />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/export-spec" element={<ExportSpec />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminCMS />
              </AdminRoute>
            } />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
