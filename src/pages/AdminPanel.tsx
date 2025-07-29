
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Trash2
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const AdminPanel = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'María García',
      email: 'maria@empresa.com',
      company: 'Tech Solutions SA',
      role: 'client',
      status: 'active',
      lastLogin: '2024-01-15',
      filesCount: 12,
      messagesCount: 45,
    },
    {
      id: 2,
      name: 'Carlos López',
      email: 'carlos@comercial.com',
      company: 'Comercial ABC',
      role: 'client',
      status: 'active',
      lastLogin: '2024-01-14',
      filesCount: 8,
      messagesCount: 23,
    },
    {
      id: 3,
      name: 'Ana Martínez',
      email: 'ana@startup.com',
      company: 'Startup Innovadora',
      role: 'client',
      status: 'inactive',
      lastLogin: '2024-01-10',
      filesCount: 3,
      messagesCount: 12,
    },
  ]);

  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    company: '',
    industry: '',
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalFiles: users.reduce((sum, u) => sum + u.filesCount, 0),
    totalMessages: users.reduce((sum, u) => sum + u.messagesCount, 0),
  };

  const handleInviteUser = () => {
    // Lógica para enviar invitación
    console.log('Invitando usuario:', inviteForm);
    setInviteForm({ name: '', email: '', company: '', industry: '' });
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
                Gestione usuarios y monitoree la plataforma
              </p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="hero" className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Invitar Usuario</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Envíe una invitación para que se una a la plataforma
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      placeholder="María García"
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="maria@empresa.com"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      placeholder="Tech Solutions SA"
                      value={inviteForm.company}
                      onChange={(e) => setInviteForm({...inviteForm, company: e.target.value})}
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
                  <Button onClick={handleInviteUser} className="w-full">
                    Enviar Invitación
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} activos
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-primary/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Archivos</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFiles}</div>
                <p className="text-xs text-muted-foreground">
                  En la plataforma
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-data-flow/5 to-primary/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
                <MessageSquare className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMessages}</div>
                <p className="text-xs text-muted-foreground">
                  Total del chat
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-success/5 to-primary/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actividad</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  Usuarios activos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-primary" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>
                Administre usuarios y sus permisos
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border/50 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {user.company}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.filesCount}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.messagesCount}</span>
                        </div>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={
                          user.status === 'active' 
                            ? 'bg-success/10 text-success border-success/20' 
                            : 'bg-muted/10 text-muted-foreground border-muted/20'
                        }
                      >
                        {user.status}
                      </Badge>
                      
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
