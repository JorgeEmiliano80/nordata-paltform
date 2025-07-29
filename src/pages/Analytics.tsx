import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, TrendingUp, DollarSign, Activity, Bell, RefreshCw, FileText, Database, Info } from 'lucide-react';

import { ClientSegmentsDashboard } from '@/components/analytics/ClientSegmentsDashboard';
import DataFlowDashboard from '@/components/analytics/DataFlowDashboard';
import { BehaviorAnalyticsDashboard } from '@/components/analytics/BehaviorAnalyticsDashboard';
import FinancialDashboard from '@/components/analytics/FinancialDashboard';
import { RecommendationsDashboard } from '@/components/analytics/RecommendationsDashboard';
import { PerformanceDashboard } from '@/components/analytics/PerformanceDashboard';

import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';

const Analytics: React.FC = () => {
  const {
    loading,
    clientSegments,
    dataFlowMetrics,
    behaviorEvents,
    recommendations,
    financialMetrics,
    fetchClientSegments,
    fetchDataFlowMetrics,
    fetchBehaviorEvents,
    fetchRecommendations,
    fetchFinancialMetrics,
    generateRecommendations,
    calculateSegmentation,
    generateDataFlowMetrics
  } = useAnalytics();

  const { profile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchClientSegments();
    fetchDataFlowMetrics();
    fetchBehaviorEvents();
    fetchRecommendations();
    fetchFinancialMetrics();
  }, []);

  const refreshData = async () => {
    await Promise.all([
      fetchClientSegments(),
      fetchDataFlowMetrics(),
      fetchBehaviorEvents(),
      fetchRecommendations(),
      fetchFinancialMetrics()
    ]);
  };

  // Calcular métricas de resumen
  const totalFiles = dataFlowMetrics.reduce((sum, metric) => 
    sum + metric.files_uploaded_count + metric.files_completed_count, 0
  );
  
  const totalUsers = clientSegments.length;
  const totalRevenue = financialMetrics.reduce((sum, metric) => sum + metric.revenue, 0);
  const pendingRecommendations = recommendations.filter(r => !r.is_implemented).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            {isAdmin() ? 'Panel completo de análisis y rendimiento' : 'Análisis de tu negocio y datos'}
          </p>
          {!isAdmin() && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Estás viendo tus datos personalizados. Los administradores pueden ver datos de todos los usuarios.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          {isAdmin() && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => generateRecommendations()}
                disabled={loading}
              >
                <Bell className="h-4 w-4 mr-2" />
                Generar Recomendaciones
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => calculateSegmentation()}
                disabled={loading}
              >
                <Users className="h-4 w-4 mr-2" />
                Calcular Segmentación
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${isAdmin() ? 'grid-cols-6' : 'grid-cols-5'}`}>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Users className="h-4 w-4 mr-2" />
            {isAdmin() ? 'Clientes' : 'Mi Perfil'}
          </TabsTrigger>
          <TabsTrigger value="dataflow">
            <TrendingUp className="h-4 w-4 mr-2" />
            Flujo de Datos
          </TabsTrigger>
          <TabsTrigger value="behavior">
            <Activity className="h-4 w-4 mr-2" />
            Comportamiento
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="h-4 w-4 mr-2" />
            Financiero
          </TabsTrigger>
          {isAdmin() && (
            <TabsTrigger value="recommendations">
              <Bell className="h-4 w-4 mr-2" />
              Recomendaciones
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Archivos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalFiles}</div>
                <p className="text-xs text-muted-foreground">
                  Archivos procesados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isAdmin() ? 'Usuarios Activos' : 'Mi Actividad'}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isAdmin() ? totalUsers : behaviorEvents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {isAdmin() ? 'Usuarios registrados' : 'Eventos registrados'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Ingresos {isAdmin() ? 'acumulados' : 'generados'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recomendaciones</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingRecommendations}</div>
                <p className="text-xs text-muted-foreground">
                  Pendientes de implementar
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
              <CardDescription>
                Información general sobre el funcionamiento de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Flujo de Datos</span>
                  <Badge variant="outline">
                    <Database className="h-3 w-3 mr-1" />
                    Activo
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Integración Databricks</span>
                  <Badge variant="outline">
                    <Activity className="h-3 w-3 mr-1" />
                    Configurado
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Analytics</span>
                  <Badge variant="outline">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Operativo
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <ClientSegmentsDashboard 
            segments={clientSegments}
            onRefresh={fetchClientSegments}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="dataflow" className="space-y-6">
          <DataFlowDashboard />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <BehaviorAnalyticsDashboard 
            events={behaviorEvents}
            onRefresh={fetchBehaviorEvents}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <FinancialDashboard />
        </TabsContent>

        {isAdmin() && (
          <TabsContent value="recommendations" className="space-y-6">
            <RecommendationsDashboard 
              recommendations={recommendations}
              onRefresh={fetchRecommendations}
              onGenerate={generateRecommendations}
              loading={loading}
            />
            <PerformanceDashboard loading={loading} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Analytics;
