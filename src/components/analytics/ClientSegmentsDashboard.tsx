
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, TrendingUp, DollarSign, Activity, RefreshCw, Search } from 'lucide-react';
import { ClientSegment } from '@/hooks/useAnalytics';

interface ClientSegmentsDashboardProps {
  segments: ClientSegment[];
  onRefresh: () => void;
  loading: boolean;
}

const SEGMENT_COLORS = {
  vip: '#8B5CF6',
  premium: '#3B82F6',
  regular: '#10B981',
  new: '#F59E0B',
  at_risk: '#EF4444',
  inactive: '#6B7280'
};

const SEGMENT_LABELS = {
  vip: 'VIP',
  premium: 'Premium',
  regular: 'Regular',
  new: 'Nuevo',
  at_risk: 'En Riesgo',
  inactive: 'Inactivo'
};

export const ClientSegmentsDashboard: React.FC<ClientSegmentsDashboardProps> = ({
  segments,
  onRefresh,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'revenue' | 'activity'>('score');

  const filteredSegments = useMemo(() => {
    return segments.filter(segment => {
      const matchesSearch = searchTerm === '' || 
        segment.user_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSegment = selectedSegment === 'all' || segment.segment === selectedSegment;
      
      return matchesSearch && matchesSegment;
    });
  }, [segments, searchTerm, selectedSegment]);

  const sortedSegments = useMemo(() => {
    return [...filteredSegments].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'revenue':
          return b.revenue_contribution - a.revenue_contribution;
        case 'activity':
          return b.activity_level - a.activity_level;
        default:
          return 0;
      }
    });
  }, [filteredSegments, sortBy]);

  const segmentDistribution = useMemo(() => {
    const distribution = segments.reduce((acc, segment) => {
      acc[segment.segment] = (acc[segment.segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([segment, count]) => ({
      segment,
      count,
      label: SEGMENT_LABELS[segment as keyof typeof SEGMENT_LABELS],
      color: SEGMENT_COLORS[segment as keyof typeof SEGMENT_COLORS]
    }));
  }, [segments]);

  const revenueBySegment = useMemo(() => {
    const revenue = segments.reduce((acc, segment) => {
      acc[segment.segment] = (acc[segment.segment] || 0) + segment.revenue_contribution;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(revenue).map(([segment, total]) => ({
      segment: SEGMENT_LABELS[segment as keyof typeof SEGMENT_LABELS],
      revenue: total,
      color: SEGMENT_COLORS[segment as keyof typeof SEGMENT_COLORS]
    }));
  }, [segments]);

  const activityTrends = useMemo(() => {
    const trends = segments.reduce((acc, segment) => {
      acc[segment.segment] = (acc[segment.segment] || 0) + segment.activity_level;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(trends).map(([segment, total]) => ({
      segment: SEGMENT_LABELS[segment as keyof typeof SEGMENT_LABELS],
      activity: total,
      color: SEGMENT_COLORS[segment as keyof typeof SEGMENT_COLORS]
    }));
  }, [segments]);

  const totalClients = segments.length;
  const totalRevenue = segments.reduce((sum, s) => sum + s.revenue_contribution, 0);
  const avgScore = segments.reduce((sum, s) => sum + s.score, 0) / segments.length || 0;
  const atRiskClients = segments.filter(s => s.segment === 'at_risk').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Segmentación de Clientes</h2>
          <p className="text-muted-foreground">
            Análisis detallado de la clasificación y comportamiento de clientes
          </p>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Clientes segmentados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Contribución total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Actividad promedio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes en Riesgo</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{atRiskClients}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Segmento</CardTitle>
              <CardDescription>
                Cantidad de clientes por cada segmento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={segmentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {segmentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  {segmentDistribution.map((segment) => (
                    <div key={segment.segment} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <div>
                          <p className="font-medium">{segment.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {segment.count} clientes
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {((segment.count / totalClients) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue por Segmento</CardTitle>
              <CardDescription>
                Contribución financiera de cada segmento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueBySegment}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segment" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad por Segmento</CardTitle>
              <CardDescription>
                Nivel de actividad acumulado por segmento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segment" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="activity" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                Detalle individual de cada cliente segmentado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filtrar por segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(SEGMENT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="activity">Actividad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sortedSegments.map((segment) => (
                  <div key={segment.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: SEGMENT_COLORS[segment.segment] }}
                      />
                      <div>
                        <p className="font-medium">{segment.user_id}</p>
                        <p className="text-sm text-muted-foreground">
                          Último: {new Date(segment.last_activity).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Score: {segment.score}</p>
                        <p className="text-sm text-muted-foreground">
                          ${segment.revenue_contribution.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={segment.segment === 'at_risk' ? 'destructive' : 'default'}>
                        {SEGMENT_LABELS[segment.segment]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
