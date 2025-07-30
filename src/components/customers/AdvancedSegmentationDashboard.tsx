
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAdvancedCustomerSegmentation } from '@/hooks/useAdvancedCustomerSegmentation';
import { Loader2, Users, TrendingUp, Filter } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = {
  age: {
    young: '#10B981',
    adult: '#3B82F6', 
    senior: '#8B5CF6',
    unknown: '#6B7280'
  },
  location: {
    'north america': '#EF4444',
    'south america': '#F59E0B',
    'europe': '#10B981',
    'asia': '#3B82F6',
    'africa': '#8B5CF6',
    'oceania': '#EC4899',
    'unknown': '#6B7280'
  },
  industry: {
    technology: '#10B981',
    healthcare: '#EF4444',
    finance: '#3B82F6',
    education: '#F59E0B',
    retail: '#8B5CF6',
    manufacturing: '#EC4899',
    unknown: '#6B7280'
  },
  value: {
    high_value: '#10B981',
    medium_value: '#F59E0B', 
    low_value: '#EF4444'
  },
  activity: {
    active: '#10B981',
    moderate: '#F59E0B',
    inactive: '#EF4444'
  }
};

const getColorForSegment = (type: string, segment: string) => {
  const colorMap = COLORS[type as keyof typeof COLORS];
  if (colorMap && typeof colorMap === 'object') {
    return (colorMap as any)[segment] || '#6B7280';
  }
  return '#6B7280';
};

const formatChartData = (distribution: { [key: string]: number }, type: string) => {
  return Object.entries(distribution).map(([key, value]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    value,
    color: getColorForSegment(type, key)
  }));
};

export const AdvancedSegmentationDashboard = () => {
  const { segments, summary, loading, fetchSegments, calculateSegmentation } = useAdvancedCustomerSegmentation();

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleCalculateSegmentation = async () => {
    await calculateSegmentation();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando segmentación...</span>
      </div>
    );
  }

  const totalCustomers = segments.length;
  const activeSegments = summary ? Object.keys(summary.activity_distribution).length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Segmentación Avanzada de Clientes</h2>
          <p className="text-muted-foreground">
            Análisis detallado de clientes por edad, ubicación, industria, valor y actividad
          </p>
        </div>
        <Button onClick={handleCalculateSegmentation} disabled={loading}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Recalcular Segmentación
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Clientes segmentados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segmentos Activos</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSegments}</div>
            <p className="text-xs text-muted-foreground">
              Diferentes segmentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Valor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.value_distribution.high_value || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes de alto valor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.activity_distribution.active || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Con alta actividad
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {summary && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Age Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Edad</CardTitle>
              <CardDescription>Segmentación de clientes por grupos etarios</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={formatChartData(summary.age_distribution, 'age')}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formatChartData(summary.age_distribution, 'age').map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Value Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Valor</CardTitle>
              <CardDescription>Clientes segmentados por valor económico</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formatChartData(summary.value_distribution, 'value')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {formatChartData(summary.value_distribution, 'value').map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Industry Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Industria</CardTitle>
              <CardDescription>Clientes por sector industrial</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formatChartData(summary.industry_distribution, 'industry')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {formatChartData(summary.industry_distribution, 'industry').map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Actividad</CardTitle>
              <CardDescription>Nivel de actividad de los clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={formatChartData(summary.activity_distribution, 'activity')}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formatChartData(summary.activity_distribution, 'activity').map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Segments List */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de Segmentación por Cliente</CardTitle>
          <CardDescription>Lista completa de todos los clientes con sus segmentos asignados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {segments.map((segment) => (
              <div key={segment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{segment.customer?.name || 'Cliente desconocido'}</h4>
                  <p className="text-sm text-muted-foreground">{segment.customer?.email}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" style={{ borderColor: getColorForSegment('age', segment.age_segment) }}>
                    Edad: {segment.age_segment}
                  </Badge>
                  <Badge variant="outline" style={{ borderColor: getColorForSegment('location', segment.location_segment) }}>
                    Ubicación: {segment.location_segment}
                  </Badge>
                  <Badge variant="outline" style={{ borderColor: getColorForSegment('industry', segment.industry_segment) }}>
                    Industria: {segment.industry_segment}
                  </Badge>
                  <Badge variant="outline" style={{ borderColor: getColorForSegment('value', segment.value_segment) }}>
                    Valor: {segment.value_segment}
                  </Badge>
                  <Badge variant="outline" style={{ borderColor: getColorForSegment('activity', segment.activity_segment) }}>
                    Actividad: {segment.activity_segment}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {segments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No hay datos de segmentación disponibles.</p>
            <Button onClick={handleCalculateSegmentation} className="mt-4">
              Calcular Segmentación
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSegmentationDashboard;
