
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, TrendingUp, DollarSign, Activity, Bell, RefreshCw } from 'lucide-react';

import ClientSegmentsDashboard from '@/components/analytics/ClientSegmentsDashboard';
import DataFlowDashboard from '@/components/analytics/DataFlowDashboard';
import BehaviorAnalyticsDashboard from '@/components/analytics/BehaviorAnalyticsDashboard';
import FinancialDashboard from '@/components/analytics/FinancialDashboard';
import RecommendationsDashboard from '@/components/analytics/RecommendationsDashboard';
import PerformanceDashboard from '@/components/analytics/PerformanceDashboard';

import { useAnalytics } from '@/hooks/useAnalytics';

const Analytics = () => {
  const { 
    loading,
    clientSegments,
    financialMetrics,
    recommendations,
    dataFlowMetrics,
    behaviorEvents,
    calculateSegmentation,
    generateRecommendations,
    generateDataFlowMetrics,
    fetchClientSegments,
    fetchFinancialMetrics,
    fetchRecommendations,
    fetchDataFlowMetrics,
    fetchBehaviorEvents
  } = useAnalytics();

  const [activeTab, setActiveTab] = useState('overview');

  React.useEffect(() => {
    // Cargar datos iniciales
    fetchClientSegments();
    fetchFinancialMetrics();
    fetchRecommendations();
    fetchDataFlowMetrics();
    fetchBehaviorEvents();
  }, []);

  const handleCalculateSegmentation = async () => {
    await calculateSegmentation();
  };

  const handleGenerateRecommendations = async () => {
    await generateRecommendations();
  };

  const handleGenerateDataFlow = async () => {
    await generateDataFlowMetrics();
  };

  const handleRefreshAll = async () => {
    await Promise.all([
      fetchClientSegments(),
      fetchFinancialMetrics(),
      fetchRecommendations(),
      fetchDataFlowMetrics(),
      fetchBehaviorEvents()
    ]);
  };

  // Calcular métricas del overview
  const totalClients = clientSegments.length;
  const vipClients = clientSegments.filter(c => c.segment === 'vip').length;
  const atRiskClients = clientSegments.filter(c => c.segment === 'at_risk').length;
  const totalRevenue = financialMetrics.reduce((sum, m) => sum + m.revenue, 0);
  const totalRecommendations = recommendations.length;
  const pendingRecommendations = recommendations.filter(r => !r.is_implemented).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Análisis avanzado de clientes, datos financieros y rendimiento del negocio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefreshAll}
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar Todo
          </Button>
          <Button 
            onClick={handleCalculateSegmentation}
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <Users className="h-4 w-4 mr-2" />
            Calcular Segmentación
          </Button>
          <Button 
            onClick={handleGenerateRecommendations}
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <Bell className="h-4 w-4 mr-2" />
            Generar Recomendaciones
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="dataflow">Flujo de Datos</TabsTrigger>
          <TabsTrigger value="behavior">Comportamiento</TabsTrigger>
          <TabsTrigger value="financial">Financiero</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClients}</div>
                <div className="flex items-center mt-2">
                  <Badge variant="secondary" className="mr-2">
                    {vipClients} VIP
                  </Badge>
                  <Badge variant="destructive">
                    {atRiskClients} En Riesgo
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% desde el mes anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Archivos Procesados</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataFlowMetrics.reduce((sum, m) => sum + m.files_completed_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  En las últimas 24 horas
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
                  Pendientes de {totalRecommendations} totales
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Clientes por Segmento</CardTitle>
                <CardDescription>
                  Segmentación actual de la base de clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['vip', 'premium', 'regular', 'new', 'at_risk', 'inactive'].map(segment => {
                    const count = clientSegments.filter(c => c.segment === segment).length;
                    const percentage = totalClients > 0 ? (count / totalClients) * 100 : 0;
                    return (
                      <div key={segment} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-16 justify-center">
                            {segment.toUpperCase()}
                          </Badge>
                          <span className="text-sm">{count} clientes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Últimos eventos y métricas del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Segmentación actualizada</p>
                      <p className="text-xs text-muted-foreground">Hace 5 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nuevas recomendaciones generadas</p>
                      <p className="text-xs text-muted-foreground">Hace 15 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Métricas financieras actualizadas</p>
                      <p className="text-xs text-muted-foreground">Hace 30 minutos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <ClientSegmentsDashboard />
        </TabsContent>

        <TabsContent value="dataflow" className="space-y-6">
          <DataFlowDashboard />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <BehaviorAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <FinancialDashboard />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationsDashboard />
          <PerformanceDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
