import React from 'react';
import { Layout } from "@/components/layout/Layout";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/NotFound";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import AdminPanel from "@/pages/AdminPanel";
import FileUpload from "@/pages/FileUpload";
import Chat from "@/pages/Chat";
import Settings from "@/pages/Settings";
import Invite from "@/pages/Invite";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { useRole } from "@/hooks/useRole";
import { useTracking } from "@/components/tracking/useTracking";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SecurityProvider } from "@/components/SecurityProvider";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { TrackingProvider } from "@/components/tracking/TrackingProvider";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <AuthProvider>
          <CurrencyProvider>
            <TrackingProvider>
              <TooltipProvider>
                <Toaster />
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/invite" element={<Invite />} />
                    <Route path="/" element={<Index />} />
                    
                    {/* Protected routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/file-upload" element={
                      <ProtectedRoute>
                        <FileUpload />
                      </ProtectedRoute>
                    } />
                    <Route path="/chat" element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } />

                    {/* Admin routes */}
                    <Route path="/admin" element={
                      <AdminRoute>
                        <AdminPanel />
                      </AdminRoute>
                    } />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </TrackingProvider>
          </CurrencyProvider>
        </AuthProvider>
      </SecurityProvider>
    </QueryClientProvider>
  );
};

export default App;
