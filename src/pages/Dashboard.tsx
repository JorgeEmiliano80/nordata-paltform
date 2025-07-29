
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle, Users, Database, Activity, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFiles } from '@/hooks/useFiles';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const Dashboard = () => {
  const { user, profile, isAdmin } = useAuth();
  const { files, loading: filesLoading, getFileStats } = useFiles(user?.id);
  const { fetchAdminData } = useAdmin();
  const navigate = useNavigate();
  const [adminStats, setAdminStats] = useState({ users: [], invitations: [] });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const fileStats = getFileStats();

  useEffect(() => {
    if (isAdmin()) {
      console.log('Usuario admin detectado, cargando datos...');
      setAdminLoading(true);
      setAdminError(null);
      
      fetchAdminData()
        .then((data) => {
          console.log('Datos admin cargados:', data);
          setAdminStats(data);
        })
        .catch((error) => {
          console.error('Error cargando datos admin:', error);
          setAdminError('Error al cargar datos del panel admin');
        })
        .finally(() => {
          setAdminLoading(false);
        });
    }
  }, [isAdmin, fetchAdminData]);

  const recentFiles = files.slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mostrar loading apenas cuando necessário
  if (filesLoading || (isAdmin() && adminLoading && !adminError)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Bem-vindo, {profile?.full_name || user?.email}!
            </h1>
            <p className="text-muted-foreground mt-2">
              {isAdmin() ? 'Painel de administração da plataforma' : 'Sua plataforma de análise de dados'}
            </p>
          </div>

          {/* Mostrar error de admin si existe */}
          {adminError && isAdmin() && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-medium">{adminError}</p>
                </div>
                <p className="text-sm text-red-600 mt-2">
                  Verifique se o usuário está configurado corretamente como administrador.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isAdmin() && !adminError ? (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminStats.users.length}</div>
                    <p className="text-xs text-muted-foreground">Clientes ativos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Convites Pendentes</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminStats.invitations.length}</div>
                    <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Arquivos Totais</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{fileStats.total}</div>
                    <p className="text-xs text-muted-foreground">Na plataforma</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Processamentos</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{fileStats.processing}</div>
                    <p className="text-xs text-muted-foreground">Em andamento</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Meus Arquivos</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{fileStats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      {fileStats.done} processados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Em Processamento</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{fileStats.processing}</div>
                    <p className="text-xs text-muted-foreground">
                      {fileStats.uploaded} na fila
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Insights</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{fileStats.totalInsights}</div>
                    <p className="text-xs text-muted-foreground">Gerados automaticamente</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Com Erro</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{fileStats.error}</div>
                    <p className="text-xs text-muted-foreground">Requer atenção</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesse as principais funcionalidades da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {isAdmin() ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-4"
                        onClick={() => navigate('/admin')}
                      >
                        <Users className="mr-3 h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Painel Admin</div>
                          <div className="text-sm text-muted-foreground">Gerenciar usuários e convites</div>
                        </div>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-4"
                        onClick={() => navigate('/upload')}
                      >
                        <Upload className="mr-3 h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Ver Arquivos</div>
                          <div className="text-sm text-muted-foreground">Monitorar processamentos</div>
                        </div>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-4"
                        onClick={() => navigate('/upload')}
                      >
                        <Upload className="mr-3 h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Upload de Arquivos</div>
                          <div className="text-sm text-muted-foreground">Enviar dados para análise</div>
                        </div>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-4"
                        onClick={() => navigate('/chatbot')}
                      >
                        <MessageSquare className="mr-3 h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Chat com IA</div>
                          <div className="text-sm text-muted-foreground">Converse sobre seus dados</div>
                        </div>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-4"
                        onClick={() => navigate('/analytics')}
                      >
                        <TrendingUp className="mr-3 h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Analytics</div>
                          <div className="text-sm text-muted-foreground">Visualizar insights</div>
                        </div>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Files */}
            <Card>
              <CardHeader>
                <CardTitle>Arquivos Recentes</CardTitle>
                <CardDescription>
                  {isAdmin() ? 'Últimos arquivos de todos os usuários' : 'Seus arquivos mais recentes'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentFiles.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Nenhum arquivo encontrado</p>
                    <p className="text-sm text-gray-500">
                      {isAdmin() ? 'Usuários ainda não enviaram arquivos' : 'Faça seu primeiro upload'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(file.status)}
                          <div>
                            <p className="font-medium text-sm">{file.file_name}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(file.uploaded_at)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {file.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
