
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Users, TrendingUp, DollarSign, Target, AlertTriangle } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ClientSegmentsDashboard } from '@/components/analytics/ClientSegmentsDashboard';
import { DataFlowDashboard } from '@/components/analytics/DataFlowDashboard';
import { BehaviorAnalyticsDashboard } from '@/components/analytics/BehaviorAnalyticsDashboard';
import { RecommendationsDashboard } from '@/components/analytics/RecommendationsDashboard';
import { FinancialDashboard } from '@/components/analytics/FinancialDashboard';
import { PerformanceDashboard } from '@/components/analytics/PerformanceDashboard';
import { toast } from 'sonner';

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    loading,
    clientSegments,
    financialMetrics,
    recommendations,
    dataFlowMetrics,
    behaviorEvents,
    fetchClientSegments,
    fetchFinancialMetrics,
    fetchRecommendations,
    fetchDataFlowMetrics,
    fetchBehaviorEvents,
    calculateSegmentation,
    generateRecommendations,
    generateDataFlowMetrics,
    trackBehaviorEvent
  } = useAnalytics();

  useEffect(() => {
    loadInitialData();
    trackBehaviorEvent('dashboard_view', { dashboard_type: 'analytics' });
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        fetchClientSegments(),
        fetchFinancialMetrics(),
        fetchRecommendations(),
        fetchDataFlowMetrics(),
        fetchBehaviorEvents()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Error al cargar datos iniciales');
    }
  };

  const refreshAllData = async () => {
    toast.info('Actualizando datos...');
    await loadInitialData();
    toast.success('Datos actualizados');
  };

  const getOverviewStats = () => {
    const totalClients = clientSegments.length;
    const vipClients = clientSegments.filter(s => s.segment === 'vip').length;
    const atRiskClients = clientSegments.filter(s => s.segment === 'at_risk').length;
    const totalRevenue = financialMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const activeRecommendations = recommendations.filter(r => !r.is_implemented).length;
    const latestDataFlow = dataFlowMetrics[0];

    return {
      totalClients,
      vipClients,
      atRiskClients,
      totalRevenue,
      activeRecommendations,
      latestDataFlow
    };
  };

  const stats = getOverviewStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Análisis avanzado de clientes, rendimiento y recomendaciones estratégicas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={refreshAllData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={calculateSegmentation}
            variant="default"
            size="sm"
            disabled={loading}
          >
            <Target className="h-4 w-4 mr-2" />
            Recalcular Segmentación
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="segments">Segmentación</TabsTrigger>
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
                <div className="text-2xl font-bold">{stats.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.vipClients} VIP • {stats.atRiskClients} en riesgo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Ingresos acumulados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recomendaciones Activas</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeRecommendations}</div>
                <p className="text-xs text-muted-foreground">
                  Oportunidades identificadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Archivos Procesados</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.latestDataFlow?.files_completed_count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Última hora
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Segmentos</CardTitle>
                <CardDescription>
                  Clasificación actual de clientes por segmento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['vip', 'premium', 'regular', 'new', 'at_risk', 'inactive'].map((segment) => {
                    const count = clientSegments.filter(s => s.segment === segment).length;
                    const percentage = stats.totalClients > 0 ? (count / stats.totalClients) * 100 : 0;
                    
                    return (
                      <div key={segment} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={segment === 'vip' ? 'default' : segment === 'at_risk' ? 'destructive' : 'secondary'}>
                            {segment.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{count} clientes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-secondary rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-primary" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">
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
                <CardTitle>Recomendaciones Prioritarias</CardTitle>
                <CardDescription>
                  Acciones recomendadas de alta prioridad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations
                    .filter(r => r.priority === 'high' && !r.is_implemented)
                    .slice(0, 5)
                    .map((rec) => (
                      <div key={rec.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{rec.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {rec.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {rec.priority}
                        </Badge>
                      </div>
                    ))}
                  {recommendations.filter(r => r.priority === 'high' && !r.is_implemented).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay recomendaciones de alta prioridad pendientes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments">
          <ClientSegmentsDashboard 
            segments={clientSegments}
            onRefresh={fetchClientSegments}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="dataflow">
          <DataFlowDashboard 
            metrics={dataFlowMetrics}
            onRefresh={fetchDataFlowMetrics}
            onGenerate={generateDataFlowMetrics}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="behavior">
          <BehaviorAnalyticsDashboard 
            events={behaviorEvents}
            onRefresh={fetchBehaviorEvents}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialDashboard 
            metrics={financialMetrics}
            onRefresh={fetchFinancialMetrics}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="recommendations">
          <RecommendationsDashboard 
            recommendations={recommendations}
            onRefresh={fetchRecommendations}
            onGenerate={generateRecommendations}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
