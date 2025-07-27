import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFiles } from '@/hooks/useFiles';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageCircle,
  PlusCircle,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { files, loading: filesLoading } = useFiles(user?.id);
  const { notifications, unreadCount } = useNotifications(user?.id);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'Enviado';
      case 'processing':
        return 'Processando';
      case 'done':
        return 'Concluído';
      case 'error':
        return 'Erro';
      default:
        return status;
    }
  };

  // Estatísticas dos arquivos
  const fileStats = {
    total: files.length,
    processing: files.filter(f => f.status === 'processing').length,
    completed: files.filter(f => f.status === 'done').length,
    failed: files.filter(f => f.status === 'error').length,
    totalInsights: files.reduce((acc, file) => acc + (file.insights?.length || 0), 0)
  };

  // Arquivos recentes (últimos 5)
  const recentFiles = files.slice(0, 5);

  // Insights recentes
  const recentInsights = files
    .filter(f => f.insights && f.insights.length > 0)
    .flatMap(f => f.insights?.map(insight => ({ ...insight, fileName: f.file_name })) || [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (filesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Bem-vindo{profile?.full_name ? `, ${profile.full_name}` : ''}!
            </h1>
            <p className="text-muted-foreground">
              {profile?.company_name && (
                <span className="font-medium">{profile.company_name}</span>
              )}
              {profile?.industry && profile?.company_name && " • "}
              {profile?.industry && (
                <span className="capitalize">{profile.industry}</span>
              )}
              <br />
              Gerencie seus arquivos de dados e visualize insights da plataforma NORDATA.AI
            </p>
          </div>

          {/* Estatísticas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Arquivos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fileStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Arquivos enviados para análise
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Processamento</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fileStats.processing}</div>
                <p className="text-xs text-muted-foreground">
                  Sendo analisados pelo Databricks
                </p>
                {fileStats.processing > 0 && (
                  <div className="mt-2">
                    <Progress value={65} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fileStats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  Processamento finalizado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Insights Gerados</CardTitle>
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fileStats.totalInsights}</div>
                <p className="text-xs text-muted-foreground">
                  Análises disponíveis
                </p>
              </CardContent>
            </Card>
          </div>

          {fileStats.total === 0 ? (
            /* Estado vazio - Primeiro uso */
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Comece enviando seus dados</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Faça upload de arquivos CSV, Excel ou JSON para começar a gerar insights poderosos 
                      com nossa plataforma de análise de dados.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => navigate('/upload')} size="lg">
                      <Upload className="h-5 w-5 mr-2" />
                      Fazer Upload
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/chatbot')} size="lg">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Conversar com IA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Conteúdo principal */
            <Tabs defaultValue="files" className="space-y-6">
              <TabsList>
                <TabsTrigger value="files">Meus Arquivos</TabsTrigger>
                <TabsTrigger value="insights">Insights Recentes</TabsTrigger>
                <TabsTrigger value="activity">Atividade</TabsTrigger>
              </TabsList>

              <TabsContent value="files" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Arquivos Enviados</h2>
                    <p className="text-muted-foreground">
                      Gerencie e monitore seus dados na plataforma
                    </p>
                  </div>
                  <Button onClick={() => navigate('/upload')}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Novo Upload
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    {recentFiles.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          Nenhum arquivo enviado
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Faça o upload do seu primeiro arquivo para começar
                        </p>
                        <Button onClick={() => navigate('/upload')}>
                          <Upload className="h-4 w-4 mr-2" />
                          Fazer Upload
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome do Arquivo</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Tamanho</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Insights</TableHead>
                            <TableHead>Enviado em</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentFiles.map((file) => (
                            <TableRow key={file.id}>
                              <TableCell className="font-medium">
                                {file.file_name}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {file.file_type?.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatFileSize(file.file_size)}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusColor(file.status)}>
                                  {getStatusLabel(file.status)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {file.insights?.length || 0} insights
                              </TableCell>
                              <TableCell>{formatDate(file.uploaded_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {files.length > 5 && (
                  <div className="text-center">
                    <Button variant="outline" onClick={() => navigate('/analytics')}>
                      Ver Todos os Arquivos
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Insights Recentes</h2>
                  <p className="text-muted-foreground">
                    Últimas análises geradas pela IA
                  </p>
                </div>

                {recentInsights.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div>
                          <h3 className="text-lg font-medium mb-2">Nenhum insight disponível</h3>
                          <p className="text-muted-foreground">
                            Faça upload de arquivos para gerar análises inteligentes
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {recentInsights.map((insight, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{insight.title}</CardTitle>
                              <CardDescription>
                                Arquivo: {insight.fileName} • {formatDate(insight.created_at)}
                              </CardDescription>
                            </div>
                            <Badge variant="outline">
                              {insight.insight_type}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {insight.description}
                          </p>
                          {insight.confidence_score && (
                            <div className="mt-2">
                              <div className="text-xs text-muted-foreground mb-1">
                                Confiança: {Math.round(insight.confidence_score * 100)}%
                              </div>
                              <Progress value={insight.confidence_score * 100} className="h-2" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Atividade Recente</h2>
                  <p className="text-muted-foreground">
                    Notificações e atualizações da plataforma
                  </p>
                </div>

                {notifications.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div>
                          <h3 className="text-lg font-medium mb-2">Nenhuma atividade recente</h3>
                          <p className="text-muted-foreground">
                            As notificações sobre seus dados aparecerão aqui
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {notifications.slice(0, 10).map((notification) => (
                      <Card key={notification.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'success' ? 'bg-green-500' : 
                              notification.type === 'error' ? 'bg-red-500' : 
                              'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <h4 className="font-medium">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(notification.created_at)}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <Badge variant="secondary" className="text-xs">
                                Novo
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Ações rápidas */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-6 flex flex-col items-center space-y-3"
                  onClick={() => navigate('/upload')}
                >
                  <Upload className="w-8 h-8 text-primary" />
                  <div className="text-center">
                    <p className="font-semibold">Enviar Dados</p>
                    <p className="text-sm text-muted-foreground">Faça upload de novos arquivos</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-6 flex flex-col items-center space-y-3"
                  onClick={() => navigate('/chatbot')}
                >
                  <MessageCircle className="w-8 h-8 text-primary" />
                  <div className="text-center">
                    <p className="font-semibold">Chat com IA</p>
                    <p className="text-sm text-muted-foreground">Converse sobre seus dados</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-6 flex flex-col items-center space-y-3"
                  onClick={() => navigate('/analytics')}
                >
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <div className="text-center">
                    <p className="font-semibold">Ver Análises</p>
                    <p className="text-sm text-muted-foreground">Explore todos os insights</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;