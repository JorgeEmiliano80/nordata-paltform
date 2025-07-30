
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Activity, MapPin, Building, DollarSign, RefreshCw } from 'lucide-react';
import { useAdvancedCustomerSegmentation } from '@/hooks/useAdvancedCustomerSegmentation';

// Colores para los gráficos
const COLORS = {
  age: {
    young: '#3b82f6',
    adult: '#10b981', 
    senior: '#f59e0b',
    unknown: '#6b7280'
  },
  location: {
    'north america': '#ef4444',
    'south america': '#f97316',
    'europe': '#eab308',
    'asia': '#22c55e',
    'africa': '#06b6d4',
    'oceania': '#8b5cf6',
    unknown: '#6b7280'
  },
  industry: {
    technology: '#3b82f6',
    healthcare: '#10b981',
    finance: '#f59e0b',
    education: '#ef4444',
    retail: '#8b5cf6',
    manufacturing: '#06b6d4',
    unknown: '#6b7280'
  },
  value: {
    high_value: '#22c55e',
    medium_value: '#f59e0b',
    low_value: '#ef4444'
  },
  activity: {
    active: '#22c55e',
    moderate: '#f59e0b',
    inactive: '#ef4444'
  }
};

const AdvancedSegmentationDashboard: React.FC = () => {
  const { segments, loading, calculateSegmentation } = useAdvancedCustomerSegmentation();
  const [selectedSegment, setSelectedSegment] = useState<string>('age');

  useEffect(() => {
    calculateSegmentation();
  }, []);

  const handleRecalculate = () => {
    calculateSegmentation();
  };

  // Preparar datos para gráficos
  const getChartData = (segmentType: keyof typeof COLORS) => {
    const counts: { [key: string]: number } = {};
    
    segments.forEach(segment => {
      const value = segment[`${segmentType}_segment`] || 'unknown';
      counts[value] = (counts[value] || 0) + 1;
    });

    return Object.entries(counts).map(([key, value]) => ({
      name: key.replace('_', ' ').toUpperCase(),
      value,
      color: COLORS[segmentType][key as keyof typeof COLORS[typeof segmentType]] || COLORS[segmentType].unknown
    }));
  };

  const getSegmentIcon = (type: string) => {
    switch (type) {
      case 'age': return <Users className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'industry': return <Building className="h-4 w-4" />;
      case 'value': return <DollarSign className="h-4 w-4" />;
      case 'activity': return <Activity className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const ageData = getChartData('age');
  const locationData = getChartData('location');
  const industryData = getChartData('industry');
  const valueData = getChartData('value');
  const activityData = getChartData('activity');

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Segmentación Avanzada de Clientes</h2>
          <p className="text-muted-foreground">Análisis multidimensional de tu base de clientes</p>
        </div>
        <Button onClick={handleRecalculate} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Recalcular Segmentos
        </Button>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold">{segments.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {['age', 'location', 'industry', 'value', 'activity'].map((type) => (
          <Card key={type}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {type === 'age' && 'Segmentos Edad'}
                    {type === 'location' && 'Ubicaciones'}
                    {type === 'industry' && 'Industrias'}
                    {type === 'value' && 'Niveles Valor'}
                    {type === 'activity' && 'Niveles Actividad'}
                  </p>
                  <p className="text-2xl font-bold">
                    {getChartData(type as keyof typeof COLORS).length}
                  </p>
                </div>
                {getSegmentIcon(type)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos de segmentación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segmentación por Edad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Segmentación por Edad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`age-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Segmentación por Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Segmentación por Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {locationData.map((entry, index) => (
                    <Cell key={`location-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Segmentación por Industria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Segmentación por Industria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={industryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {industryData.map((entry, index) => (
                    <Cell key={`industry-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Segmentación por Valor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Segmentación por Valor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={valueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {valueData.map((entry, index) => (
                    <Cell key={`value-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista detallada de segmentos */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Segmentación por Cliente</CardTitle>
          <CardDescription>
            Vista completa de todos los segmentos asignados a cada cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {segments.slice(0, 10).map((segment) => (
              <div
                key={segment.customer_id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {segment.customer_id?.toString().slice(-2) || 'C'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">Cliente #{segment.customer_id}</p>
                    <p className="text-sm text-muted-foreground">
                      Actualizado: {new Date(segment.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{segment.age_segment}</Badge>
                  <Badge variant="outline">{segment.location_segment}</Badge>
                  <Badge variant="outline">{segment.industry_segment}</Badge>
                  <Badge variant="outline">{segment.value_segment}</Badge>
                  <Badge variant="outline">{segment.activity_segment}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedSegmentationDashboard;
