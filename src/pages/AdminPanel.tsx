import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, FileText, Users, Activity, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AdminUser {
  user_id: string;
  full_name: string;
  company_name: string;
  role: 'admin' | 'client';
  user_created_at: string;
  is_active: boolean;
  total_files: number;
  processed_files: number;
  failed_files: number;
  last_upload: string | null;
  total_chat_messages: number;
}

interface PendingInvitation {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  industry: string;
  invitation_token: string;
  invited_at: string;
  expires_at: string;
  used_at: string | null;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  
  // Form states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteCompany, setInviteCompany] = useState('');
  const [inviteIndustry, setInviteIndustry] = useState('');
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState('');

  const industries = [
    { value: 'agronegocio', label: 'Agronegócio' },
    { value: 'varejo', label: 'Varejo' },
    { value: 'automotriz', label: 'Automotriz' },
    { value: 'industria', label: 'Indústria' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'turismo', label: 'Turismo' },
    { value: 'tecnologia', label: 'TI' },
    { value: 'outros', label: 'Outros' }
  ];

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Buscar dashboard de usuários
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_admin_dashboard');

      if (usersError) {
        console.error('Erro ao buscar usuários:', usersError);
        toast.error('Erro ao carregar usuários');
      } else {
        setUsers(usersData || []);
      }

      // Buscar convites pendentes
      const { data: invitesData, error: invitesError } = await supabase
        .from('pending_invitations')
        .select('*')
        .is('used_at', null)
        .order('invited_at', { ascending: false });

      if (invitesError) {
        console.error('Erro ao buscar convites:', invitesError);
        toast.error('Erro ao carregar convites');
      } else {
        setInvitations(invitesData || []);
      }

    } catch (error) {
      console.error('Erro ao buscar dados admin:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail || !inviteName || !inviteCompany) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setInviteLoading(true);

      const { data, error } = await supabase.functions.invoke('admin-invite-user', {
        body: {
          email: inviteEmail,
          fullName: inviteName,
          companyName: inviteCompany,
          industry: inviteIndustry
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success('Convite criado com sucesso!');
        setGeneratedInviteUrl(data.inviteUrl);
        
        // Limpar formulário
        setInviteEmail('');
        setInviteName('');
        setInviteCompany('');
        setInviteIndustry('');
        
        // Atualizar lista de convites
        await fetchAdminData();
      } else {
        throw new Error(data?.error || 'Erro ao criar convite');
      }
    } catch (error: any) {
      console.error('Erro ao convidar usuário:', error);
      toast.error(`Erro ao criar convite: ${error.message}`);
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInviteUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copiada para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar URL');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie usuários e monitore a plataforma NORDATA.AI
          </p>
        </div>

        {/* Estatísticas gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                Clientes ativos na plataforma
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Convites Pendentes</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invitations.length}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando confirmação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Arquivos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.reduce((acc, user) => acc + user.total_files, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Arquivos processados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividade</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.reduce((acc, user) => acc + user.total_chat_messages, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Mensagens do chat
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="invites">Convites</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usuários da Plataforma</CardTitle>
                <CardDescription>
                  Lista de todos os clientes registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Nenhum usuário encontrado
                    </h3>
                    <p className="text-muted-foreground">
                      Comece convidando seu primeiro cliente
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Arquivos</TableHead>
                        <TableHead>Último Upload</TableHead>
                        <TableHead>Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell className="font-medium">
                            {user.full_name}
                          </TableCell>
                          <TableCell>{user.company_name}</TableCell>
                          <TableCell>
                            <Badge variant={user.is_active ? "default" : "secondary"}>
                              {user.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{user.total_files} total</span>
                              <span className="text-xs text-muted-foreground">
                                {user.processed_files} processados, {user.failed_files} falhas
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.last_upload ? formatDate(user.last_upload) : 'Nunca'}
                          </TableCell>
                          <TableCell>
                            {formatDate(user.user_created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invites" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Convites</h2>
                <p className="text-muted-foreground">
                  Gerencie convites pendentes e convide novos usuários
                </p>
              </div>
              
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Convidar Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Convidar Novo Usuário</DialogTitle>
                    <DialogDescription>
                      Preencha os dados para criar um convite de acesso à plataforma
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleInviteUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-name">Nome Completo *</Label>
                        <Input
                          id="invite-name"
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          placeholder="Nome do usuário"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Email *</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="email@empresa.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-company">Empresa *</Label>
                        <Input
                          id="invite-company"
                          value={inviteCompany}
                          onChange={(e) => setInviteCompany(e.target.value)}
                          placeholder="Nome da empresa"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-industry">Setor</Label>
                        <select
                          id="invite-industry"
                          className="w-full h-10 px-3 py-2 border border-border rounded-md bg-background"
                          value={inviteIndustry}
                          onChange={(e) => setInviteIndustry(e.target.value)}
                        >
                          <option value="">Selecione o setor</option>
                          {industries.map((industry) => (
                            <option key={industry.value} value={industry.value}>
                              {industry.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {generatedInviteUrl && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p>Convite criado com sucesso! Compartilhe este link:</p>
                            <div className="flex items-center space-x-2">
                              <Input 
                                value={generatedInviteUrl} 
                                readOnly 
                                className="text-xs"
                              />
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => copyInviteUrl(generatedInviteUrl)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowInviteDialog(false);
                          setGeneratedInviteUrl('');
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={inviteLoading}>
                        {inviteLoading ? 'Criando...' : 'Criar Convite'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Convites Pendentes</CardTitle>
                <CardDescription>
                  Convites enviados aguardando confirmação
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Nenhum convite pendente
                    </h3>
                    <p className="text-muted-foreground">
                      Todos os convites foram aceitos ou nenhum foi enviado ainda
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Enviado em</TableHead>
                        <TableHead>Expira em</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((invitation) => (
                        <TableRow key={invitation.id}>
                          <TableCell className="font-medium">
                            {invitation.full_name}
                          </TableCell>
                          <TableCell>{invitation.email}</TableCell>
                          <TableCell>{invitation.company_name}</TableCell>
                          <TableCell>{formatDate(invitation.invited_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {new Date(invitation.expires_at) < new Date() ? (
                                <Badge variant="destructive">Expirado</Badge>
                              ) : (
                                <Badge variant="outline">
                                  {formatDate(invitation.expires_at)}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyInviteUrl(
                                `${window.location.origin}/login?token=${invitation.invitation_token}`
                              )}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copiar Link
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;