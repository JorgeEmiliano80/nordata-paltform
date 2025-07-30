
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  FileText, 
  MessageSquare, 
  Users, 
  Clock,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityEvent {
  id: string;
  type: 'file_upload' | 'user_login' | 'chat_message' | 'file_processed' | 'user_registered' | 'error';
  user_name: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

const AdminActivityMonitor: React.FC = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Datos simulados para demostrar la funcionalidad
  const mockActivities: ActivityEvent[] = [
    {
      id: '1',
      type: 'file_upload',
      user_name: 'María García',
      description: 'Subió archivo de ventas Q1-2024.xlsx',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      metadata: { file_size: '2.5MB', file_type: 'xlsx' }
    },
    {
      id: '2',
      type: 'user_login',
      user_name: 'Carlos López',
      description: 'Inició sesión desde Madrid',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      metadata: { ip: '192.168.1.1', location: 'Madrid, España' }
    },
    {
      id: '3',
      type: 'file_processed',
      user_name: 'Ana Rodríguez',
      description: 'Archivo procesado exitosamente: clientes-2024.csv',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      metadata: { processing_time: '2.3s', insights_generated: 15 }
    },
    {
      id: '4',
      type: 'chat_message',
      user_name: 'Luis Martín',
      description: 'Nueva conversación con el chatbot IA',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      metadata: { messages_count: 8, topic: 'análisis de datos' }
    },
    {
      id: '5',
      type: 'user_registered',
      user_name: 'Nueva usuaria',
      description: 'Se registró Patricia Sánchez de TechCorp',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      metadata: { company: 'TechCorp', role: 'client' }
    },
    {
      id: '6',
      type: 'error',
      user_name: 'Sistema',
      description: 'Error procesando archivo: formato no soportado',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      metadata: { error_code: 'UNSUPPORTED_FORMAT', file: 'data.xyz' }
    }
  ];

  useEffect(() => {
    // Simular carga de actividades
    const loadActivities = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setActivities(mockActivities);
      setLoading(false);
    };

    loadActivities();
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'file_upload':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'user_login':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'chat_message':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'file_processed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'user_registered':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventBadge = (type: string) => {
    const badges = {
      file_upload: { label: 'Archivo', variant: 'secondary' as const },
      user_login: { label: 'Login', variant: 'secondary' as const },
      chat_message: { label: 'Chat', variant: 'secondary' as const },
      file_processed: { label: 'Procesado', variant: 'secondary' as const },
      user_registered: { label: 'Nuevo Usuario', variant: 'secondary' as const },
      error: { label: 'Error', variant: 'destructive' as const }
    };

    const badge = badges[type as keyof typeof badges] || { label: 'Actividad', variant: 'secondary' as const };
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const refreshActivities = () => {
    setActivities([...mockActivities]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actividad Última Hora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+12% vs hora anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Activos ahora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Archivos Procesados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1s</div>
            <p className="text-xs text-muted-foreground">Procesamiento</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Actividad en Tiempo Real
              </CardTitle>
              <CardDescription>
                Monitoreo de eventos del sistema
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshActivities}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getEventIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{activity.user_name}</span>
                    {getEventBadge(activity.type)}
                    <span className="text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {format(new Date(activity.timestamp), 'HH:mm', { locale: es })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                  {activity.metadata && (
                    <div className="text-xs text-muted-foreground bg-background p-2 rounded border">
                      <pre>{JSON.stringify(activity.metadata, null, 2)}</pre>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(activity.timestamp), 'MMM dd, HH:mm', { locale: es })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivityMonitor;
