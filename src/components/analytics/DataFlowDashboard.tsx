
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { RefreshCw, Upload, Clock, CheckCircle, XCircle, Users, HardDrive, Zap } from 'lucide-react';
import { DataFlowMetric } from '@/hooks/useAnalytics';

interface DataFlowDashboardProps {
  metrics: DataFlowMetric[];
  onRefresh: () => void;
  onGenerate: () => void;
  loading: boolean;
}

export const DataFlowDashboard: React.FC<DataFlowDashboardProps> = ({
  metrics,
  onRefresh,
  onGenerate,
  loading
}) => {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');

  const filteredMetrics = useMemo(() => {
    const now = new Date();
    const hours = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 168
    }[timeRange];

    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    return metrics
      .filter(m => new Date(m.timestamp) >= cutoff)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(m => ({
        ...m,
        time: new Date(m.timestamp).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        date: new Date(m.timestamp).toLocaleDateString('es-ES')
      }));
  }, [metrics, timeRange]);

  const latestMetrics = metrics[0] || {
    files_uploaded_count: 0,
    files_processing_count: 0,
    files_completed_count: 0,
    files_failed_count: 0,
    total_data_volume_mb: 0,
    active_users_count: 0,
    avg_processing_time_minutes: 0
  };

  const totalFiles = latestMetrics.files_uploaded_count + latestMetrics.files_completed_count;
  const successRate = totalFiles > 0 ? (latestMetrics.files_completed_count / totalFiles) * 100 : 0;

  const fileStatusData = [
    { name: 'Subidos', value: latestMetrics.files_uploaded_count, color: '#3B82F6' },
    { name: 'Procesando', value: latestMetrics.files_processing_count, color: '#F59E0B' },
    { name: 'Completados', value: latestMetrics.files_completed_count, color: '#10B981' },
    { name: 'Fallidos', value: latestMetrics.files_failed_count, color: '#EF4444' }
  ];

  const volumeData = filteredMetrics.map(m => ({
    time: m.time,
    volume: m.total_data_volume_mb,
    files: m.files_uploaded_count + m.files_completed_count
  }));

  const processingTimeData = filteredMetrics.map(m => ({
    time: m.time,
    avgTime: m.avg_processing_time_minutes,
    completed: m.files_completed_count
  }));

  const userActivityData = filteredMetrics.map(m => ({
    time: m.time,
    users: m.active_users_count,
    uploads: m.files_uploaded_count
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Flujo de Datos en Tiempo Real</h2>
          <p className="text-muted-foreground">
            Monitoreo del procesamiento de archivos y actividad del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="6h">6 horas</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 días</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={onGenerate}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <Zap className="h-4 w-4 mr-2" />
            Generar Métricas
          </Button>
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivos Subidos</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestMetrics.files_uploaded_count}</div>
            <p className="text-xs text-muted-foreground">
              Última hora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Procesando</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {latestMetrics.files_processing_count}
            </div>
            <p className="text-xs text-muted-foreground">
              En proceso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {latestMetrics.files_completed_count}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasa éxito: {successRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestMetrics.active_users_count}</div>
            <p className="text-xs text-muted-foreground">
              Última hora
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Archivos</CardTitle>
            <CardDescription>
              Distribución actual del procesamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fileStatusData.map((status) => (
                <div key={status.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="font-medium">{status.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{status.value}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {totalFiles > 0 ? ((status.value / totalFiles) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Rendimiento</CardTitle>
            <CardDescription>
              Indicadores clave del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Volumen de Datos</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {latestMetrics.total_data_volume_mb.toFixed(1)} MB
                  </div>
                  <p className="text-xs text-muted-foreground">Procesados</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tiempo Promedio</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {latestMetrics.avg_processing_time_minutes.toFixed(1)} min
                  </div>
                  <p className="text-xs text-muted-foreground">Por archivo</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Jobs Databricks</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {latestMetrics.databricks_jobs_running || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Ejecutándose</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Volumen de Datos</CardTitle>
            <CardDescription>
              Evolución del volumen procesado ({timeRange})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'volume' ? `${value} MB` : value,
                      name === 'volume' ? 'Volumen' : 'Archivos'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiempo de Procesamiento</CardTitle>
            <CardDescription>
              Tiempo promedio de procesamiento ({timeRange})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processingTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} min`, 'Tiempo promedio']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad de Usuarios</CardTitle>
          <CardDescription>
            Usuarios activos y archivos subidos por periodo ({timeRange})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#8B5CF6" name="Usuarios activos" />
                <Bar dataKey="uploads" fill="#F59E0B" name="Archivos subidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
