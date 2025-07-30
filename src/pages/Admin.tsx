
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Settings, Shield, Activity, UserPlus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAdmin } from '@/hooks/useAdmin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminSystemSettings from '@/components/admin/AdminSystemSettings';
import AdminActivityMonitor from '@/components/admin/AdminActivityMonitor';
import { toast } from 'sonner';

const Admin = () => {
  const { loading, fetchAdminData, createInvitation, manageUser } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  const [inviteForm, setInviteForm] = useState({
    email: '',
    fullName: '',
    companyName: '',
    industry: '',
  });

  const loadAdminData = async () => {
    const data = await fetchAdminData();
    setUsers(data.users);
    setInvitations(data.invitations);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateInvitation = async () => {
    if (!inviteForm.email || !inviteForm.fullName) {
      toast.error('Email y nombre son requeridos');
      return;
    }

    const result = await createInvitation(
      inviteForm.email,
      inviteForm.fullName,
      inviteForm.companyName,
      inviteForm.industry
    );

    if (result.success) {
      setInviteForm({ email: '', fullName: '', companyName: '', industry: '' });
      setInviteDialogOpen(false);
      await loadAdminData();
    }
  };

  const handleUserAction = async (action: string, userId: string, data?: any) => {
    let result;
    
    switch (action) {
      case 'activate':
        result = await manageUser('activate_user', userId);
        break;
      case 'deactivate':
        result = await manageUser('deactivate_user', userId);
        break;
      case 'update':
        result = await manageUser('update_profile', userId, data);
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
                Invitar Usuario
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

        {/* Invite User Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Crea una invitación para que un nuevo usuario se una a la plataforma
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  placeholder="Juan Pérez"
                  value={inviteForm.fullName}
                  onChange={(e) => setInviteForm({...inviteForm, fullName: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Empresa</Label>
                <Input
                  id="companyName"
                  placeholder="Empresa SA"
                  value={inviteForm.companyName}
                  onChange={(e) => setInviteForm({...inviteForm, companyName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industria</Label>
                <Input
                  id="industry"
                  placeholder="Tecnología"
                  value={inviteForm.industry}
                  onChange={(e) => setInviteForm({...inviteForm, industry: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateInvitation} disabled={loading}>
                  {loading ? 'Creando...' : 'Crear Invitación'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Admin;
