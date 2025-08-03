
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, Settings, Shield, Activity, UserPlus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAdmin } from '@/hooks/useAdmin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminSystemSettings from '@/components/admin/AdminSystemSettings';
import AdminActivityMonitor from '@/components/admin/AdminActivityMonitor';
import AdminUserInviteDialog from '@/components/admin/AdminUserInviteDialog';

const Admin = () => {
  const { loading, fetchAdminData, createUserWithPassword, manageUser } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const loadAdminData = async () => {
    const data = await fetchAdminData();
    setUsers(data.users);
    setInvitations(data.invitations);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateUser = async (
    email: string, 
    fullName: string, 
    companyName: string, 
    industry: string, 
    temporaryPassword: string
  ) => {
    const result = await createUserWithPassword(email, fullName, companyName, industry, temporaryPassword);
    
    if (result.success) {
      await loadAdminData();
    }
    
    return result;
  };

  const handleUserAction = async (action: string, userId: string, data?: any) => {
    let result;
    
    switch (action) {
      case 'activate':
        result = await manageUser('activate', userId);
        break;
      case 'deactivate':
        result = await manageUser('deactivate', userId);
        break;
      case 'update':
        result = await manageUser('deactivate', userId, data); // Update not supported, fallback to deactivate
        break;
      default:
        return;
    }

    if (result.success) {
      await loadAdminData();
    }
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.is_active).length,
    totalFiles: users.reduce((sum, u) => sum + (u.total_files || 0), 0),
    totalMessages: users.reduce((sum, u) => sum + (u.total_chat_messages || 0), 0),
    pendingInvites: invitations.filter(i => !i.used_at).length,
    expiredInvites: invitations.filter(i => !i.used_at && new Date(i.expires_at) < new Date()).length,
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Panel de Administración
                </h1>
                <p className="text-muted-foreground text-lg">
                  Gestiona usuarios, monitorea el sistema y configura la plataforma
                </p>
              </div>
              
              <Button
                onClick={() => setInviteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Crear Usuario
              </Button>
            </div>

            {/* Admin Tabs */}
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Usuarios
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuraciones
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Actividad
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-4">
                <AdminDashboard stats={stats} />
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <AdminUserManagement 
                  users={users}
                  loading={loading}
                  onUserAction={handleUserAction}
                />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <AdminSystemSettings />
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <AdminActivityMonitor />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* User Creation Dialog */}
        <AdminUserInviteDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          onInviteUser={handleCreateUser}
          loading={loading}
        />
      </div>
    </>
  );
};

export default Admin;
