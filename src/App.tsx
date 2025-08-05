
import React from 'react';
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import AdminPanel from "@/pages/AdminPanel";
import Settings from "@/pages/Settings";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
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
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <TrackingProvider module="main">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Index />} />
                    
                    {/* Protected routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
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
                </TrackingProvider>
              </BrowserRouter>
            </TooltipProvider>
          </CurrencyProvider>
        </AuthProvider>
      </SecurityProvider>
    </QueryClientProvider>
  );
};

export default App;
