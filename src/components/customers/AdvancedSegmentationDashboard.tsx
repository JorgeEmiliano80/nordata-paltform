
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, Users, MapPin, Building2, TrendingUp, Activity } from 'lucide-react';
import { useAdvancedCustomerSegmentation } from '@/hooks/useAdvancedCustomerSegmentation';

const COLORS = {
  age: {
    young: '#10B981',
    adult: '#3B82F6', 
    senior: '#8B5CF6',
    unknown: '#6B7280'
  },
  location: {
    'North America': '#10B981',
    'South America': '#3B82F6',
    'Europe': '#8B5CF6',
    'Asia': '#F59E0B',
    'Africa': '#EF4444',
    'Oceania': '#EC4899',
    'unknown': '#6B7280'
  },
  industry: {
    'technology': '#10B981',
    'healthcare': '#3B82F6',
    'finance': '#8B5CF6',
    'education': '#F59E0B',
    'retail': '#EF4444',
    'manufacturing': '#EC4899',
    'unknown': '#6B7280'
  },
  value: {
    'high_value': '#10B981',
    'medium_value': '#F59E0B',
    'low_value': '#EF4444'
  },
  activity: {
    'active': '#10B981',
    'moderate': '#F59E0B',
    'inactive': '#EF4444'
  }
};

const SEGMENT_LABELS = {
  age: {
    young: 'Joven (<30)',
    adult: 'Adulto (30-50)',
    senior: 'Senior (+50)',
    unknown: 'No especificado'
  },
  industry: {
    technology: 'Tecnología',
    healthcare: 'Salud',
    finance: 'Finanzas',
    education: 'Educación',
    retail: 'Retail',
    manufacturing: 'Manufactura',
    unknown: 'No especificado'
  },
  value: {
    high_value: 'Alto valor',
    medium_value: 'Valor medio',
    low_value: 'Bajo valor'
  },
  activity: {
    active: 'Activo',
    moderate: 'Moderado',
    inactive: 'Inactivo'
  }
};

export const AdvancedSegmentationDashboard: React.FC = () => {
  const { 
    segments, 
    summary, 
    loading, 
    fetchSegments, 
    calculateSegmentation 
  } = useAdvancedCustomerSegmentation();

  useEffect(() => {
    fetchSegments();
  }, []);

  const formatDistributionData = (distribution: { [key: string]: number }, type: keyof typeof COLORS) => {
    return Object.entries(distribution).map(([key, value]) => ({
      name: SEGMENT_LABELS[type]?.[key as keyof typeof SEGMENT_LABELS[typeof type]] || key,
      value,
      color: COLORS[type]?.[key as keyof typeof COLORS[typeof type]] || '#6B7280'
    }));
  };

  const totalCustomers = segments.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Segmentación Avanzada de Clientes</h2>
          <p className="text-muted-foreground">
            Análisis demográfico y comercial de su base de clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={calculateSegmentation}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <TrendingUp className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recalcular
          </Button>
          <Button
            onClick={fetchSegments}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segmentos Edad</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? Object.keys(summary.age_distribution).length : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ubicaciones</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? Object.keys(summary.location_distribution).length : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industrias</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? Object.keys(summary.industry_distribution).length : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? (summary.activity_distribution.active || 0) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de segmentación */}
      {summary && (
        <Tabs defaultValue="age" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="age">Edad</TabsTrigger>
            <TabsTrigger value="location">Ubicación</TabsTrigger>
            <TabsTrigger value="industry">Industria</TabsTrigger>
            <TabsTrigger value="value">Valor</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="age" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Edad</CardTitle>
                <CardDescription>Segmentación de clientes por grupos etarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={formatDistributionData(summary.age_distribution, 'age')}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {formatDistributionData(summary.age_distribution, 'age').map((entry, index) => (
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

          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Ubicación</CardTitle>
                <CardDescription>Distribución geográfica de clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatDistributionData(summary.location_distribution, 'location')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="industry" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Industria</CardTitle>
                <CardDescription>Segmentación por sector comercial</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatDistributionData(summary.industry_distribution, 'industry')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="value" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Valor</CardTitle>
                <CardDescription>Segmentación por valor económico</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={formatDistributionData(summary.value_distribution, 'value')}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {formatDistributionData(summary.value_distribution, 'value').map((entry, index) => (
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

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Actividad</CardTitle>
                <CardDescription>Nivel de actividad de los clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={formatDistributionData(summary.activity_distribution, 'activity')}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {formatDistributionData(summary.activity_distribution, 'activity').map((entry, index) => (
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
      )}

      {/* Lista detallada de segmentos */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Segmentación</CardTitle>
          <CardDescription>
            Lista completa de clientes con sus respectivos segmentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {segments.map((segment) => (
              <div key={segment.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">
                      {segment.customer?.name || 'Cliente sin nombre'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {segment.customer?.email || 'Sin email'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">
                    {SEGMENT_LABELS.age[segment.age_segment as keyof typeof SEGMENT_LABELS.age] || segment.age_segment}
                  </Badge>
                  <Badge variant="outline">
                    {segment.location_segment}
                  </Badge>
                  <Badge variant="outline">
                    {SEGMENT_LABELS.industry[segment.industry_segment as keyof typeof SEGMENT_LABELS.industry] || segment.industry_segment}
                  </Badge>
                  <Badge 
                    variant={segment.value_segment === 'high_value' ? 'default' : 'secondary'}
                  >
                    {SEGMENT_LABELS.value[segment.value_segment as keyof typeof SEGMENT_LABELS.value]}
                  </Badge>
                  <Badge 
                    variant={segment.activity_segment === 'active' ? 'default' : 'secondary'}
                  >
                    {SEGMENT_LABELS.activity[segment.activity_segment as keyof typeof SEGMENT_LABELS.activity]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
