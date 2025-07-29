
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';

interface PerformanceMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_type: string;
  dimension_filters: any;
  time_period: string;
  comparison_period: string;
  trend_direction: 'up' | 'down' | 'stable';
  created_at: string;
}

interface PerformanceDashboardProps {
  loading: boolean;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  loading
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [metricType, setMetricType] = useState<string>('all');

  // Datos simulados para demostración
  const mockMetrics: PerformanceMetric[] = [
    {
      id: '1',
      metric_name: 'Conversion Rate',
      metric_value: 15.2,
      metric_type: 'conversion',
      dimension_filters: {},
      time_period: '2024-01-01',
      comparison_period: '2023-12-01',
      trend_direction: 'up',
      created_at: '2024-01-01'
    },
    {
      id: '2',
      metric_name: 'User Engagement',
      metric_value: 78.5,
      metric_type: 'usage',
      dimension_filters: {},
      time_period: '2024-01-01',
      comparison_period: '2023-12-01',
      trend_direction: 'up',
      created_at: '2024-01-01'
    },
    {
      id: '3',
      metric_name: 'System Performance',
      metric_value: 95.3,
      metric_type: 'performance',
      dimension_filters: {},
      time_period: '2024-01-01',
      comparison_period: '2023-12-01',
      trend_direction: 'stable',
      created_at: '2024-01-01'
    }
  ];

  const filteredMetrics = useMemo(() => {
    return mockMetrics.filter(metric => {
      const matchesType = metricType === 'all' || metric.metric_type === metricType;
      return matchesType;
    });
  }, [metricType]);

  const performanceData = useMemo(() => {
    return filteredMetrics.map(metric => ({
      name: metric.metric_name,
      value: metric.metric_value,
      type: metric.metric_type,
      trend: metric.trend_direction
    }));
  }, [filteredMetrics]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Analytics</h2>
          <p className="text-muted-foreground">
            Métricas de rendimiento y análisis de tendencias
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
            </SelectContent>
          </Select>
          <Select value={metricType} onValueChange={setMetricType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las métricas</SelectItem>
              <SelectItem value="conversion">Conversión</SelectItem>
              <SelectItem value="usage">Uso</SelectItem>
              <SelectItem value="performance">Rendimiento</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.metric_name}</CardTitle>
              {getTrendIcon(metric.trend_direction)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTrendColor(metric.trend_direction)}`}>
                {metric.metric_value.toFixed(1)}
                {metric.metric_type === 'conversion' || metric.metric_type === 'usage' ? '%' : ''}
              </div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="outline" className="mr-1">{metric.metric_type}</Badge>
                Tendencia: {metric.trend_direction}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métricas de Rendimiento</CardTitle>
          <CardDescription>
            Visualización de las métricas clave por categoría
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Áreas de Mejora</CardTitle>
          <CardDescription>
            Identificación automática de oportunidades de optimización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">Optimización de Conversión</h4>
                <p className="text-sm text-amber-800">
                  La tasa de conversión puede mejorarse implementando un flujo de onboarding más claro
                  y reduciendo los pasos en el proceso de carga de archivos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Engagement del Usuario</h4>
                <p className="text-sm text-blue-800">
                  Incrementar la retención implementando notificaciones push y dashboards más interactivos
                  que muestren valor inmediato al usuario.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Rendimiento del Sistema</h4>
                <p className="text-sm text-green-800">
                  El sistema mantiene un rendimiento óptimo. Continuar monitoreando y optimizando
                  los tiempos de procesamiento en Databricks.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
