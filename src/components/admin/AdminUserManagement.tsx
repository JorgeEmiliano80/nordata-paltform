
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Building, 
  Shield, 
  Settings,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AdminUser } from '@/hooks/useAdmin';

interface AdminUserManagementProps {
  users: AdminUser[];
  loading: boolean;
  onUserAction: (action: string, userId: string, data?: any) => Promise<void>;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ 
  users, 
  loading, 
  onUserAction 
}) => {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    fullName: '',
    companyName: '',
    industry: '',
    role: 'client' as 'admin' | 'client',
  });

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setUserForm({
      fullName: user.full_name || '',
      companyName: user.company_name || '',
      industry: '', // No tenemos este campo en AdminUser
      role: user.role
    });
    setUserDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    await onUserAction('update', selectedUser.user_id, {
      fullName: userForm.fullName,
      company: userForm.companyName,
      industry: userForm.industry,
      role: userForm.role
    });
    
    setUserDialogOpen(false);
    setSelectedUser(null);
  };

  const getStatusBadge = (user: AdminUser) => {
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

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
        <Shield className="h-3 w-3 mr-1" />
        {role === 'admin' ? 'Administrador' : 'Cliente'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Gestión de Usuarios ({users.length})
          </CardTitle>
          <CardDescription>
            Administra usuarios del sistema y sus permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium text-lg">
                      {user.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{user.full_name || 'Sin nombre'}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {user.company_name || 'Sin empresa'}
                      </span>
                      <span>
                        Registrado: {format(new Date(user.user_created_at), 'PPP', { locale: es })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(user)}
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="font-bold text-lg">{user.total_files || 0}</div>
                        <div className="text-xs text-muted-foreground">Archivos</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{user.processed_files || 0}</div>
                        <div className="text-xs text-muted-foreground">Procesados</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{user.total_chat_messages || 0}</div>
                        <div className="text-xs text-muted-foreground">Mensajes</div>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Usuario
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onUserAction(user.is_active ? 'deactivate' : 'activate', user.user_id)}
                      >
                        {user.is_active ? (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
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
                <Button onClick={handleUpdateUser}>
                  Actualizar Usuario
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;
