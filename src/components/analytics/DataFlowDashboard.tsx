
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, Upload, CheckCircle, XCircle, Clock, Users, Database, TrendingUp, RefreshCw } from 'lucide-react';
import { useAnalytics, type DataFlowMetric } from '@/hooks/useAnalytics';
import { format } from 'date-fns';

interface DataFlowDashboardProps {
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DataFlowDashboard: React.FC<DataFlowDashboardProps> = ({ className = "" }) => {
  const { 
    dataFlowMetrics, 
    fetchDataFlowMetrics, 
    generateDataFlowMetrics,
    loading 
  } = useAnalytics();
  
  const [timeRange, setTimeRange] = useState('24');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDataFlowMetrics(parseInt(timeRange));
  }, [timeRange, fetchDataFlowMetrics]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDataFlowMetrics(parseInt(timeRange));
    }, 5 * 60 * 1000);

    setRefreshInterval(interval);
    return () => clearInterval(interval);
  }, [timeRange, fetchDataFlowMetrics]);

  const handleRefresh = () => {
    fetchDataFlowMetrics(parseInt(timeRange));
  };

  const handleGenerate = () => {
    generateDataFlowMetrics();
  };

  // Calculate current metrics
  const currentMetrics = dataFlowMetrics.length > 0 ? dataFlowMetrics[0] : {
    files_uploaded_count: 0,
    files_processing_count: 0,
    files_completed_count: 0,
    files_failed_count: 0,
    total_data_volume_mb: 0,
    active_users_count: 0,
    databricks_jobs_running: 0,
    avg_processing_time_minutes: 0
  };

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getTrendData = () => {
    if (dataFlowMetrics.length < 2) return [];
    
    return dataFlowMetrics.slice(0, 24).reverse().map(metric => ({
      timestamp: format(new Date(metric.timestamp), 'HH:mm'),
      uploads: metric.files_uploaded_count,
      processing: metric.files_processing_count,
      completed: metric.files_completed_count,
      failed: metric.files_failed_count,
      volume: metric.total_data_volume_mb,
      users: metric.active_users_count
    }));
  };

  const getVolumeData = () => {
    return dataFlowMetrics.slice(0, 12).reverse().map(metric => ({
      timestamp: format(new Date(metric.timestamp), 'HH:mm'),
      volume: metric.total_data_volume_mb,
      users: metric.active_users_count
    }));
  };

  const getStatusDistribution = () => {
    const total = currentMetrics.files_uploaded_count + 
                 currentMetrics.files_processing_count + 
                 currentMetrics.files_completed_count + 
                 currentMetrics.files_failed_count;
                 
    if (total === 0) return [];
    
    return [
      { name: 'Completados', value: currentMetrics.files_completed_count, color: '#00C49F' },
      { name: 'En Proceso', value: currentMetrics.files_processing_count, color: '#FFBB28' },
      { name: 'Subidos', value: currentMetrics.files_uploaded_count, color: '#0088FE' },
      { name: 'Fallidos', value: currentMetrics.files_failed_count, color: '#FF8042' }
    ].filter(item => item.value > 0);
  };

  const trendData = getTrendData();
  const volumeData = getVolumeData();
  const statusDistribution = getStatusDistribution();

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Flujo de Datos en Tiempo Real</h2>
          <p className="text-muted-foreground">
            Monitoreo del flujo de datos, procesamiento y actividad de usuarios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 hora</SelectItem>
              <SelectItem value="6">6 horas</SelectItem>
              <SelectItem value="24">24 horas</SelectItem>
              <SelectItem value="168">7 días</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={handleGenerate} size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Generar Métricas
          </Button>
        </div>
      </div>

      {/* Métricas en Tiempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivos Subidos</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.files_uploaded_count}</div>
            <Badge variant="secondary" className="mt-1">
              Última hora
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Procesamiento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.files_processing_count}</div>
            <Badge variant="outline" className="mt-1">
              Activos
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.files_completed_count}</div>
            <Badge variant="default" className="mt-1">
              Exitosos
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallidos</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.files_failed_count}</div>
            <Badge variant="destructive" className="mt-1">
              Errores
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volumen de Datos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(currentMetrics.total_data_volume_mb / 1024).toFixed(1)} GB
            </div>
            <p className="text-xs text-muted-foreground">
              {currentMetrics.total_data_volume_mb.toFixed(0)} MB procesados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.active_users_count}</div>
            <p className="text-xs text-muted-foreground">
              En la última hora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetrics.avg_processing_time_minutes.toFixed(1)} min
            </div>
            <p className="text-xs text-muted-foreground">
              Tiempo de procesamiento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="volume">Volumen</TabsTrigger>
          <TabsTrigger value="status">Estado</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Archivos por Hora</CardTitle>
              <CardDescription>
                Flujo de archivos subidos, procesados y completados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="uploads" stroke="#0088FE" name="Subidos" />
                  <Line type="monotone" dataKey="processing" stroke="#FFBB28" name="Procesando" />
                  <Line type="monotone" dataKey="completed" stroke="#00C49F" name="Completados" />
                  <Line type="monotone" dataKey="failed" stroke="#FF8042" name="Fallidos" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Volumen de Datos y Usuarios Activos</CardTitle>
              <CardDescription>
                Volumen de datos procesados y actividad de usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="volume" fill="#0088FE" name="Volumen (MB)" />
                  <Line yAxisId="right" type="monotone" dataKey="users" stroke="#00C49F" name="Usuarios" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Estados</CardTitle>
              <CardDescription>
                Estado actual de los archivos en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Estado del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
          <CardDescription>
            Información en tiempo real sobre el estado de los servicios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trabajos Databricks</span>
                <Badge variant="outline">
                  {('databricks_jobs_running' in currentMetrics) ? currentMetrics.databricks_jobs_running : 0} activos
                </Badge>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Capacidad de Procesamiento</span>
                <Badge variant="outline">85% utilizada</Badge>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataFlowDashboard;
