
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Database, 
  Activity,
  Zap,
  Brain,
  Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const Dashboard = () => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFiles: 0,
    processedFiles: 0,
    processingFiles: 0,
    errorFiles: 0,
    totalInsights: 0,
    chatMessages: 0
  });

  useEffect(() => {
    // Aquí cargaremos las estadísticas reales desde el backend
    // Por ahora usamos datos mock
    setStats({
      totalFiles: 12,
      processedFiles: 8,
      processingFiles: 2,
      errorFiles: 2,
      totalInsights: 24,
      chatMessages: 156
    });
  }, []);

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: any) => (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color.replace('from-', 'text-').replace(' to-accent', '')}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 text-success mr-1" />
            <span className="text-xs text-success">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const QuickAction = ({ title, description, icon: Icon, onClick, variant = "outline" }: any) => (
    <Button 
      variant={variant}
      className="justify-start h-auto p-4 hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
      onClick={onClick}
    >
      <Icon className="mr-3 h-5 w-5" />
      <div className="text-left">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bienvenido, Jorge Emiliano
            </h1>
            <p className="text-muted-foreground text-lg">
              {isAdmin() ? 'Panel de administración de la plataforma' : 'Su centro de análisis de datos inteligente'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isAdmin() ? (
              <>
                <StatCard
                  title="Usuarios Activos"
                  value="24"
                  subtitle="Clientes registrados"
                  icon={Users}
                  color="from-primary to-accent"
                  trend="+12% este mes"
                />
                <StatCard
                  title="Archivos Procesados"
                  value="1,247"
                  subtitle="Total en la plataforma"
                  icon={Database}
                  color="from-accent to-primary"
                  trend="+8% esta semana"
                />
                <StatCard
                  title="Insights Generados"
                  value="3,891"
                  subtitle="Análisis automáticos"
                  icon={Brain}
                  color="from-data-flow to-primary"
                  trend="+15% este mes"
                />
                <StatCard
                  title="Actividad del Sistema"
                  value="98.7%"
                  subtitle="Tiempo de disponibilidad"
                  icon={Activity}
                  color="from-success to-primary"
                  trend="Óptimo"
                />
              </>
            ) : (
              <>
                <StatCard
                  title="Mis Archivos"
                  value={stats.totalFiles}
                  subtitle={`${stats.processedFiles} procesados`}
                  icon={FileText}
                  color="from-primary to-accent"
                  trend="+2 esta semana"
                />
                <StatCard
                  title="En Procesamiento"
                  value={stats.processingFiles}
                  subtitle="Databricks activo"
                  icon={Zap}
                  color="from-data-flow to-primary"
                />
                <StatCard
                  title="Insights Generados"
                  value={stats.totalInsights}
                  subtitle="Análisis disponibles"
                  icon={Brain}
                  color="from-accent to-primary"
                  trend="+6 nuevos"
                />
                <StatCard
                  title="Mensajes Chat"
                  value={stats.chatMessages}
                  subtitle="Conversaciones IA"
                  icon={MessageSquare}
                  color="from-data-process to-primary"
                  trend="+23 hoy"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary" />
                  Acciones Rápidas
                </CardTitle>
                <CardDescription>
                  Acceda a las principales funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {isAdmin() ? (
                  <>
                    <QuickAction
                      title="Panel de Administración"
                      description="Gestionar usuarios y configuración"
                      icon={Shield}
                      onClick={() => navigate('/admin')}
                      variant="hero"
                    />
                    <QuickAction
                      title="Monitoreo de Archivos"
                      description="Ver procesamiento en tiempo real"
                      icon={Database}
                      onClick={() => navigate('/upload')}
                    />
                  </>
                ) : (
                  <>
                    <QuickAction
                      title="Subir Archivo"
                      description="Enviar datos para análisis"
                      icon={Upload}
                      onClick={() => navigate('/upload')}
                      variant="hero"
                    />
                    <QuickAction
                      title="Chat con IA"
                      description="Consultar sobre sus datos"
                      icon={MessageSquare}
                      onClick={() => navigate('/chatbot')}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-primary/5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Actividad Reciente
                </CardTitle>
                <CardDescription>
                  Últimas acciones en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      <div>
                        <p className="text-sm font-medium">Archivo procesado</p>
                        <p className="text-xs text-muted-foreground">datos_ventas.csv</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Hace 5 min
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-data-flow rounded-full" />
                      <div>
                        <p className="text-sm font-medium">Procesamiento iniciado</p>
                        <p className="text-xs text-muted-foreground">inventario.xlsx</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Hace 12 min
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <div>
                        <p className="text-sm font-medium">Nuevo insight generado</p>
                        <p className="text-xs text-muted-foreground">Análisis de tendencias</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Hace 1 hora
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
