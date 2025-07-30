
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialDashboard from '@/components/analytics/FinancialDashboard';
import { PerformanceDashboard } from '@/components/analytics/PerformanceDashboard';
import { BehaviorAnalyticsDashboard } from '@/components/analytics/BehaviorAnalyticsDashboard';
import { ClientSegmentsDashboard } from '@/components/analytics/ClientSegmentsDashboard';
import DataFlowDashboard from '@/components/analytics/DataFlowDashboard';
import { RecommendationsDashboard } from '@/components/analytics/RecommendationsDashboard';
import { useAnalytics } from '@/hooks/useAnalytics';

const Analytics = () => {
  const {
    loading,
    clientSegments,
    recommendations,
    behaviorEvents,
    fetchClientSegments,
    fetchRecommendations,
    fetchBehaviorEvents,
    generateRecommendations
  } = useAnalytics();

  useEffect(() => {
    fetchClientSegments();
    fetchRecommendations();
    fetchBehaviorEvents();
  }, []);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Análisis avanzado de datos e insights de tu plataforma
          </p>
        </div>

        <Tabs defaultValue="financial" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="financial">Financiero</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="behavior">Comportamiento</TabsTrigger>
            <TabsTrigger value="segments">Segmentos</TabsTrigger>
            <TabsTrigger value="dataflow">Flujo de Datos</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-4">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <PerformanceDashboard loading={loading} />
          </TabsContent>

          <TabsContent value="behavior" className="space-y-4">
            <BehaviorAnalyticsDashboard 
              events={behaviorEvents}
              onRefresh={fetchBehaviorEvents}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="segments" className="space-y-4">
            <ClientSegmentsDashboard 
              segments={clientSegments} 
              onRefresh={fetchClientSegments} 
              loading={loading} 
            />
          </TabsContent>

          <TabsContent value="dataflow" className="space-y-4">
            <DataFlowDashboard />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <RecommendationsDashboard 
              recommendations={recommendations}
              onRefresh={fetchRecommendations}
              onGenerate={generateRecommendations}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
