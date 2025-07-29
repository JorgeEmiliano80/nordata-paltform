
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Target, AlertTriangle, CheckCircle2, Clock, TrendingUp, Users, DollarSign } from 'lucide-react';
import { ClientRecommendation, useAnalytics } from '@/hooks/useAnalytics';

interface RecommendationsDashboardProps {
  recommendations: ClientRecommendation[];
  onRefresh: () => void;
  onGenerate: () => void;
  loading: boolean;
}

const PRIORITY_COLORS = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary'
} as const;

const PRIORITY_ICONS = {
  high: AlertTriangle,
  medium: Target,
  low: CheckCircle2
};

const RECOMMENDATION_TYPES = {
  reactivation: { label: 'Reactivación', icon: Users, color: '#EF4444' },
  success_improvement: { label: 'Mejora de Éxito', icon: TrendingUp, color: '#F59E0B' },
  upsell_opportunity: { label: 'Oportunidad de Venta', icon: DollarSign, color: '#10B981' },
  retention: { label: 'Retención', icon: Target, color: '#3B82F6' },
  optimization: { label: 'Optimización', icon: CheckCircle2, color: '#8B5CF6' }
};

export const RecommendationsDashboard: React.FC<RecommendationsDashboardProps> = ({
  recommendations,
  onRefresh,
  onGenerate,
  loading
}) => {
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showImplemented, setShowImplemented] = useState(false);
  const { updateRecommendationStatus } = useAnalytics();

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      const matchesPriority = selectedPriority === 'all' || rec.priority === selectedPriority;
      const matchesType = selectedType === 'all' || rec.recommendation_type === selectedType;
      const matchesImplemented = showImplemented || !rec.is_implemented;
      
      return matchesPriority && matchesType && matchesImplemented;
    });
  }, [recommendations, selectedPriority, selectedType, showImplemented]);

  const stats = useMemo(() => {
    const total = recommendations.length;
    const implemented = recommendations.filter(r => r.is_implemented).length;
    const pending = total - implemented;
    const high = recommendations.filter(r => r.priority === 'high' && !r.is_implemented).length;
    const expired = recommendations.filter(r => 
      r.expires_at && new Date(r.expires_at) < new Date() && !r.is_implemented
    ).length;
    
    const implementationRate = total > 0 ? (implemented / total) * 100 : 0;
    
    return {
      total,
      implemented,
      pending,
      high,
      expired,
      implementationRate
    };
  }, [recommendations]);

  const recommendationsByType = useMemo(() => {
    const types = recommendations.reduce((acc, rec) => {
      acc[rec.recommendation_type] = (acc[rec.recommendation_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(types).map(([type, count]) => ({
      type,
      count,
      label: RECOMMENDATION_TYPES[type as keyof typeof RECOMMENDATION_TYPES]?.label || type,
      color: RECOMMENDATION_TYPES[type as keyof typeof RECOMMENDATION_TYPES]?.color || '#6B7280'
    }));
  }, [recommendations]);

  const recommendationsByPriority = useMemo(() => {
    const priorities = recommendations.reduce((acc, rec) => {
      acc[rec.priority] = (acc[rec.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(priorities).map(([priority, count]) => ({
      priority,
      count,
      label: priority.charAt(0).toUpperCase() + priority.slice(1)
    }));
  }, [recommendations]);

  const handleToggleImplementation = async (recommendationId: string, isImplemented: boolean) => {
    await updateRecommendationStatus(recommendationId, isImplemented);
  };

  const getRecommendationIcon = (type: string) => {
    const config = RECOMMENDATION_TYPES[type as keyof typeof RECOMMENDATION_TYPES];
    return config?.icon || Target;
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recomendaciones Estratégicas</h2>
          <p className="text-muted-foreground">
            Oportunidades de mejora y acciones recomendadas para optimizar resultados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onGenerate}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <Target className="h-4 w-4 mr-2" />
            Generar Recomendaciones
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
            <CardTitle className="text-sm font-medium">Total Recomendaciones</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="mt-2">
              <Progress value={stats.implementationRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.implementationRate.toFixed(1)}% implementadas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.high} de alta prioridad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implementadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.implemented}</div>
            <p className="text-xs text-muted-foreground">
              Acciones completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
          <TabsTrigger value="implementation">Implementación</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros y Controles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Prioridad:</label>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Tipo:</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {Object.entries(RECOMMENDATION_TYPES).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Implementadas:</label>
                  <Switch
                    checked={showImplemented}
                    onCheckedChange={setShowImplemented}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredRecommendations.map((recommendation) => {
              const Icon = getRecommendationIcon(recommendation.recommendation_type);
              const expired = recommendation.expires_at && isExpired(recommendation.expires_at);
              
              return (
                <Card key={recommendation.id} className={`${expired ? 'border-red-200 bg-red-50' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                            <Badge variant={PRIORITY_COLORS[recommendation.priority]}>
                              {recommendation.priority}
                            </Badge>
                            {expired && (
                              <Badge variant="destructive">Expirada</Badge>
                            )}
                          </div>
                          <CardDescription className="text-sm">
                            {recommendation.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={recommendation.is_implemented}
                          onCheckedChange={(checked) => 
                            handleToggleImplementation(recommendation.id, checked)
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          {recommendation.is_implemented ? 'Implementada' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Acciones Recomendadas:</h4>
                        <ul className="space-y-1">
                          {recommendation.action_items.map((item, index) => (
                            <li key={index} className="text-sm flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-1">Impacto Potencial:</h4>
                          <p className="text-sm text-muted-foreground">
                            {recommendation.potential_impact}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Esfuerzo de Implementación:</h4>
                          <p className="text-sm text-muted-foreground">
                            {recommendation.implementation_effort}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Creada: {new Date(recommendation.created_at).toLocaleDateString('es-ES')}
                        </span>
                        {recommendation.expires_at && (
                          <span className={expired ? 'text-red-600' : ''}>
                            Expira: {new Date(recommendation.expires_at).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo</CardTitle>
                <CardDescription>
                  Cantidad de recomendaciones por categoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendationsByType.map((type) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="font-medium">{type.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{type.count}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {((type.count / stats.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Prioridad</CardTitle>
                <CardDescription>
                  Nivel de urgencia de las recomendaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendationsByPriority.map((priority) => (
                    <div key={priority.priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={PRIORITY_COLORS[priority.priority as keyof typeof PRIORITY_COLORS]}>
                          {priority.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{priority.count}</span>
                        <span className="text-sm text-muted-foreground">
                          {((priority.count / stats.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progreso de Implementación</CardTitle>
              <CardDescription>
                Estado actual de las recomendaciones implementadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stats.implementationRate.toFixed(1)}%
                  </div>
                  <p className="text-muted-foreground">
                    Tasa de implementación general
                  </p>
                  <Progress value={stats.implementationRate} className="mt-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <div className="text-2xl font-bold text-green-600">{stats.implemented}</div>
                    <p className="text-sm text-muted-foreground">Implementadas</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                    <p className="text-sm text-muted-foreground">Pendientes</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
                    <p className="text-sm text-muted-foreground">Expiradas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
