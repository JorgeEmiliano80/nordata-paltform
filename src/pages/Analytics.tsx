import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, TrendingUp, DollarSign, Activity, Bell, RefreshCw } from 'lucide-react';

import { ClientSegmentsDashboard } from '@/components/analytics/ClientSegmentsDashboard';
import DataFlowDashboard from '@/components/analytics/DataFlowDashboard';
import { BehaviorAnalyticsDashboard } from '@/components/analytics/BehaviorAnalyticsDashboard';
import FinancialDashboard from '@/components/analytics/FinancialDashboard';
import { RecommendationsDashboard } from '@/components/analytics/RecommendationsDashboard';
import { PerformanceDashboard } from '@/components/analytics/PerformanceDashboard';

import { useAnalytics } from '@/hooks/useAnalytics';

const Analytics: React.FC = () => {
  const {
    loading,
    clientSegments,
    dataFlowMetrics,
    behaviorEvents,
    recommendations,
    fetchClientSegments,
    fetchDataFlowMetrics,
    fetchBehaviorEvents,
    fetchRecommendations,
    generateRecommendations
  } = useAnalytics();

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchClientSegments();
    fetchDataFlowMetrics();
    fetchBehaviorEvents();
    fetchRecommendations();
  }, []);

  const refreshData = async () => {
    await Promise.all([
      fetchClientSegments(),
      fetchDataFlowMetrics(),
      fetchBehaviorEvents(),
      fetchRecommendations()
    ]);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Análisis avanzado de rendimiento y comportamiento
          </p>
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => generateRecommendations()}
            disabled={loading}
          >
            <Bell className="h-4 w-4 mr-2" />
            Generar Recomendaciones
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Users className="h-4 w-4 mr-2" />
            Clientes
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
          <TabsTrigger value="recommendations">
            <Bell className="h-4 w-4 mr-2" />
            Recomendaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Content */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen General</CardTitle>
              <CardDescription>
                Vista rápida de las métricas más importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  Esta sección está en desarrollo. ¡Pronto podrás ver aquí un resumen completo!
                </AlertDescription>
              </Alert>
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

        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationsDashboard 
            recommendations={recommendations}
            onRefresh={fetchRecommendations}
            onGenerate={generateRecommendations}
            loading={loading}
          />
          <PerformanceDashboard loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
