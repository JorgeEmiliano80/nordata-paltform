
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InviteRegister from "./pages/InviteRegister";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Data from "./pages/Data";
import Pipelines from "./pages/Pipelines";
import Analytics from "./pages/Analytics";
import Chatbot from "./pages/Chatbot";
import AI from "./pages/AI";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import AdminPanel from "./pages/AdminPanel";
import Landing from "./pages/Landing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import Customers from "./pages/Customers";
import Insights from "./pages/Insights";
import Unauthorized from "./pages/Unauthorized";
import "./App.css";
import "./lib/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401 (unauthorized) errors
        if (error?.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <AuthProvider>
              <Toaster />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/invite/:token" element={<InviteRegister />} />
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  
                  {/* Client routes (also accessible by admins) */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <RoleProtectedRoute requiredRole="client">
                        <Dashboard />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/upload" element={
                    <ProtectedRoute>
                      <RoleProtectedRoute requiredRole="client">
                        <Upload />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/data" element={
                    <ProtectedRoute>
                      <RoleProtectedRoute requiredRole="client">
                        <Data />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/pipelines" element={
                    <ProtectedRoute>
                      <RoleProtectedRoute requiredRole="client">
                        <Pipelines />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/insights" element={
                    <ProtectedRoute>
                      <RoleProtectedRoute requiredRole="client">
                        <Insights />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/chatbot" element={
                    <ProtectedRoute>
                      <RoleProtectedRoute requiredRole="client">
                        <Chatbot />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/ai" element={
                    <ProtectedRoute>
                      <RoleProtectedRoute requiredRole="client">
                        <AI />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/ai-assistant" element={
                    <ProtectedRoute>
                      <RoleProtectedRoute requiredRole="client">
                        <AIAssistant />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/customers" element={
                    <ProtectedRoute>
                      <RoleProtectedRoute requiredRole="client">
                        <Customers />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <RoleProtectedRoute requiredRole="client">
                        <Settings />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin-only routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <RoleProtectedRoute requiredRole="admin">
                        <Admin />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin-panel" element={
                    <ProtectedRoute>
                      <RoleProtectedRoute requiredRole="admin">
                        <AdminPanel />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <RoleProtectedRoute requiredRole="admin">
                        <Analytics />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
