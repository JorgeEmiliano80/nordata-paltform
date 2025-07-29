
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Building, 
  Shield, 
  Activity, 
  FileText,
  MessageSquare,
  Database,
  Settings,
  Eye,
  UserCheck,
  UserX,
  Loader2,
  Copy,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { useAdmin } from '@/hooks/useAdmin';

const AdminPanel: React.FC = () => {
  const { loading, fetchAdminData, createInvitation, manageUser } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState<any>(null);
  const [showInviteResult, setShowInviteResult] = useState(false);
  
  const [inviteForm, setInviteForm] = useState({
    email: '',
    fullName: '',
    companyName: '',
    industry: '',
  });

  const [userForm, setUserForm] = useState({
    fullName: '',
    companyName: '',
    industry: '',
    role: 'client' as 'admin' | 'client',
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
      setGeneratedInvite(result);
      setShowInviteResult(true);
      setInviteForm({ email: '', fullName: '', companyName: '', industry: '' });
      setInviteDialogOpen(false);
      await loadAdminData();
    }
  };

  const handleUserAction = async (action: string, userId: string) => {
    let result;
    
    switch (action) {
      case 'activate':
        result = await manageUser('activate_user', userId);
        break;
      case 'deactivate':
        result = await manageUser('deactivate_user', userId);
        break;
      case 'update':
        result = await manageUser('update_profile', userId, {
          fullName: userForm.fullName,
          company: userForm.companyName,
          industry: userForm.industry,
          role: userForm.role
        });
        break;
      default:
        return;
    }

    if (result.success) {
      setUserDialogOpen(false);
      setSelectedUser(null);
      await loadAdminData();
    }
  };

  const copyInviteUrl = () => {
    if (generatedInvite?.inviteUrl) {
      navigator.clipboard.writeText(generatedInvite.inviteUrl);
      toast.success('URL de invitación copiada al portapapeles');
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

  const getStatusBadge = (user: any) => {
    if (user.is_active) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <UserCheck className="h-3 w-3 mr-1" />
          Activo
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          <UserX className="h-3 w-3 mr-1" />
          Inactivo
        </Badge>
      );
    }
  };

  const getInvitationStatusBadge = (invitation: any) => {
    if (invitation.used_at) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Usado
        </Badge>
      );
    } else if (new Date(invitation.expires_at) < new Date()) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Expirado
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Panel de Administración
              </h1>
              <p className="text-muted-foreground text-lg">
                Gestiona usuarios y monitorea la plataforma
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Total Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} activos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Usuarios Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% del total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Total Archivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFiles}</div>
                <p className="text-xs text-muted-foreground">
                  En la plataforma
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Mensajes Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMessages}</div>
                <p className="text-xs text-muted-foreground">
                  Total conversaciones
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Invitaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingInvites}</div>
                <p className="text-xs text-muted-foreground">
                  Pendientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-primary" />
                  Invites Expirados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.expiredInvites}</div>
                <p className="text-xs text-muted-foreground">
                  Necesitan reenvío
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>
                Administra usuarios y sus permisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {user.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{user.full_name || 'Sin nombre'}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {user.company_name || 'Sin empresa'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{user.total_files || 0}</span>
                            <MessageSquare className="h-4 w-4 text-muted-foreground ml-2" />
                            <span>{user.total_chat_messages || 0}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.last_upload ? format(new Date(user.last_upload), 'PPP', { locale: es }) : 'Sin uploads'}
                          </div>
                        </div>
                        
                        {getStatusBadge(user)}
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setUserForm({
                                fullName: user.full_name || '',
                                companyName: user.company_name || '',
                                industry: user.industry || '',
                                role: user.role
                              });
                              setUserDialogOpen(true);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.is_active ? 'deactivate' : 'activate', user.user_id)}
                          >
                            {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invitations Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Invitaciones
              </CardTitle>
              <CardDescription>
                Gestiona las invitaciones pendientes y enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay invitaciones enviadas
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{invitation.full_name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{invitation.email}</span>
                            {invitation.company_name && (
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {invitation.company_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <div className="text-xs text-muted-foreground">
                            Enviado: {format(new Date(invitation.invited_at), 'PPP', { locale: es })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Expira: {format(new Date(invitation.expires_at), 'PPP', { locale: es })}
                          </div>
                        </div>
                        
                        {getInvitationStatusBadge(invitation)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Crear Invitación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Management Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestionar Usuario</DialogTitle>
            <DialogDescription>
              Actualiza la información del usuario seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userFullName">Nombre Completo</Label>
                <Input
                  id="userFullName"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({...userForm, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userCompanyName">Empresa</Label>
                <Input
                  id="userCompanyName"
                  value={userForm.companyName}
                  onChange={(e) => setUserForm({...userForm, companyName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userIndustry">Industria</Label>
                <Input
                  id="userIndustry"
                  value={userForm.industry}
                  onChange={(e) => setUserForm({...userForm, industry: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => handleUserAction('update', selectedUser.user_id)} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Actualizar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invitation Result Dialog */}
      <Dialog open={showInviteResult} onOpenChange={setShowInviteResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitación Creada</DialogTitle>
            <DialogDescription>
              La invitación ha sido creada exitosamente
            </DialogDescription>
          </DialogHeader>
          {generatedInvite && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Invitación enviada a {generatedInvite.email || inviteForm.email}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>URL de Invitación</Label>
                <div className="flex gap-2">
                  <Input
                    value={generatedInvite.inviteUrl}
                    readOnly
                    className="text-sm"
                  />
                  <Button onClick={copyInviteUrl} variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Token de Invitación</Label>
                <Input
                  value={generatedInvite.invitationToken}
                  readOnly
                  className="text-sm font-mono"
                />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setShowInviteResult(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
