
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { RefreshCw, Mouse, Upload, MessageCircle, Eye, Download, Zap } from 'lucide-react';
import { BehaviorEvent } from '@/hooks/useAnalytics';

interface BehaviorAnalyticsDashboardProps {
  events: BehaviorEvent[];
  onRefresh: () => void;
  loading: boolean;
}

const EVENT_ICONS = {
  login: Mouse,
  file_upload: Upload,
  file_process: Zap,
  chat_message: MessageCircle,
  dashboard_view: Eye,
  result_download: Download,
  feature_use: Mouse
};

const EVENT_COLORS = {
  login: '#3B82F6',
  file_upload: '#10B981',
  file_process: '#F59E0B',
  chat_message: '#8B5CF6',
  dashboard_view: '#06B6D4',
  result_download: '#EF4444',
  feature_use: '#6B7280'
};

const EVENT_LABELS = {
  login: 'Inicio de Sesión',
  file_upload: 'Subida de Archivo',
  file_process: 'Procesamiento',
  chat_message: 'Mensaje de Chat',
  dashboard_view: 'Vista de Dashboard',
  result_download: 'Descarga de Resultado',
  feature_use: 'Uso de Funcionalidad'
};

export const BehaviorAnalyticsDashboard: React.FC<BehaviorAnalyticsDashboardProps> = ({
  events,
  onRefresh,
  loading
}) => {
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d'>('7d');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const days = { '1d': 1, '7d': 7, '30d': 30 }[timeRange];
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return events.filter(event => {
      const eventDate = new Date(event.created_at);
      const matchesTime = eventDate >= cutoff;
      const matchesEvent = selectedEvent === 'all' || event.event_type === selectedEvent;
      
      return matchesTime && matchesEvent;
    });
  }, [events, timeRange, selectedEvent]);

  const eventDistribution = useMemo(() => {
    const distribution = filteredEvents.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([event, count]) => ({
      event,
      count,
      label: EVENT_LABELS[event as keyof typeof EVENT_LABELS],
      color: EVENT_COLORS[event as keyof typeof EVENT_COLORS]
    }));
  }, [filteredEvents]);

  const hourlyActivity = useMemo(() => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      events: 0,
      label: `${i.toString().padStart(2, '0')}:00`
    }));

    filteredEvents.forEach(event => {
      const hour = new Date(event.created_at).getHours();
      hourlyData[hour].events++;
    });

    return hourlyData;
  }, [filteredEvents]);

  const dailyActivity = useMemo(() => {
    const dailyData: Record<string, number> = {};
    
    filteredEvents.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + 1;
    });

    return Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date,
        count,
        label: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
      }));
  }, [filteredEvents]);

  const userEngagement = useMemo(() => {
    const userActivity = filteredEvents.reduce((acc, event) => {
      const userId = event.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          totalEvents: 0,
          totalDuration: 0,
          eventTypes: new Set(),
          lastActivity: event.created_at
        };
      }
      
      acc[userId].totalEvents++;
      acc[userId].totalDuration += event.duration_seconds || 0;
      acc[userId].eventTypes.add(event.event_type);
      
      if (new Date(event.created_at) > new Date(acc[userId].lastActivity)) {
        acc[userId].lastActivity = event.created_at;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(userActivity)
      .sort((a: any, b: any) => b.totalEvents - a.totalEvents)
      .slice(0, 10);
  }, [filteredEvents]);

  const avgSessionDuration = useMemo(() => {
    const sessions = filteredEvents.reduce((acc, event) => {
      const sessionId = event.session_id || event.user_id;
      if (!acc[sessionId]) {
        acc[sessionId] = [];
      }
      acc[sessionId].push(event.duration_seconds || 0);
      return acc;
    }, {} as Record<string, number[]>);

    const totalDuration = Object.values(sessions).reduce((sum, session) => 
      sum + session.reduce((s, d) => s + d, 0), 0);
    const totalSessions = Object.keys(sessions).length;

    return totalSessions > 0 ? totalDuration / totalSessions : 0;
  }, [filteredEvents]);

  const totalEvents = filteredEvents.length;
  const uniqueUsers = new Set(filteredEvents.map(e => e.user_id)).size;
  const mostActiveEvent = eventDistribution.reduce((max, current) => 
    current.count > max.count ? current : max, eventDistribution[0] || { count: 0, label: 'N/A' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análisis de Comportamiento</h2>
          <p className="text-muted-foreground">
            Patrones de uso y actividad de los usuarios en la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Último día</SelectItem>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
            </SelectContent>
          </Select>
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
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <Mouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Últimos {timeRange === '1d' ? '1 día' : timeRange === '7d' ? '7 días' : '30 días'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Únicos</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evento Más Frecuente</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostActiveEvent.count}</div>
            <p className="text-xs text-muted-foreground">
              {mostActiveEvent.label}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración Promedio</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSessionDuration.toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">
              Por sesión
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="patterns">Patrones</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="timeline">Línea de Tiempo</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Eventos</CardTitle>
                <CardDescription>
                  Frecuencia de cada tipo de evento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {eventDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Evento</CardTitle>
                <CardDescription>
                  Desglose detallado por categoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventDistribution.map((event) => {
                    const Icon = EVENT_ICONS[event.event as keyof typeof EVENT_ICONS] || Mouse;
                    return (
                      <div key={event.event} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4" style={{ color: event.color }} />
                          <div>
                            <p className="font-medium">{event.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.count} eventos
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {((event.count / totalEvents) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad por Hora</CardTitle>
                <CardDescription>
                  Distribución de eventos durante el día
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="events" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendencia Diaria</CardTitle>
                <CardDescription>
                  Evolución de la actividad por día
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Más Activos</CardTitle>
              <CardDescription>
                Top 10 usuarios por actividad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userEngagement.map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{user.userId}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.eventTypes.size} tipos de eventos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{user.totalEvents} eventos</p>
                      <p className="text-sm text-muted-foreground">
                        {user.totalDuration.toFixed(0)}s total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Línea de Tiempo de Eventos</CardTitle>
              <CardDescription>
                Eventos recientes organizados cronológicamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredEvents.slice(0, 50).map((event) => {
                  const Icon = EVENT_ICONS[event.event_type] || Mouse;
                  return (
                    <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Icon className="h-4 w-4" style={{ color: EVENT_COLORS[event.event_type] }} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{EVENT_LABELS[event.event_type]}</p>
                          <Badge variant="outline" className="text-xs">
                            {event.event_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.created_at).toLocaleString('es-ES')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{event.user_id}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.duration_seconds > 0 ? `${event.duration_seconds}s` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
