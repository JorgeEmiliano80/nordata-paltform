
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
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
import "./App.css";
import "./lib/i18n";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
                
                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                <Route path="/data" element={<ProtectedRoute><Data /></ProtectedRoute>} />
                <Route path="/pipelines" element={<ProtectedRoute><Pipelines /></ProtectedRoute>} />
                <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
                <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
                <Route path="/ai" element={<ProtectedRoute><AI /></ProtectedRoute>} />
                <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                <Route path="/admin-panel" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                <Route path="/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </CurrencyProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
