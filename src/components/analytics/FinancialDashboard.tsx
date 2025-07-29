
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { RefreshCw, DollarSign, TrendingUp, TrendingDown, PiggyBank, CreditCard, Calculator } from 'lucide-react';
import { FinancialMetric } from '@/hooks/useAnalytics';
import { DateRange } from 'react-day-picker';

interface FinancialDashboardProps {
  metrics: FinancialMetric[];
  onRefresh: (startDate?: string, endDate?: string) => void;
  loading: boolean;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  metrics,
  onRefresh,
  loading
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [viewType, setViewType] = useState<'monthly' | 'daily'>('monthly');

  const filteredMetrics = useMemo(() => {
    let filtered = [...metrics];
    
    if (dateRange?.from) {
      filtered = filtered.filter(m => new Date(m.metric_date) >= dateRange.from!);
    }
    if (dateRange?.to) {
      filtered = filtered.filter(m => new Date(m.metric_date) <= dateRange.to!);
    }
    
    return filtered.sort((a, b) => new Date(a.metric_date).getTime() - new Date(b.metric_date).getTime());
  }, [metrics, dateRange]);

  const aggregatedData = useMemo(() => {
    if (viewType === 'daily') {
      return filteredMetrics.map(m => ({
        ...m,
        date: new Date(m.metric_date).toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric' 
        }),
        fullDate: m.metric_date
      }));
    } else {
      // Agrupar por mes
      const monthlyData = filteredMetrics.reduce((acc, m) => {
        const month = new Date(m.metric_date).toISOString().substring(0, 7);
        
        if (!acc[month]) {
          acc[month] = {
            month,
            revenue: 0,
            costs: 0,
            profit: 0,
            mrr: 0,
            ltv: 0,
            cac: 0,
            processing_cost: 0,
            storage_cost: 0,
            count: 0
          };
        }
        
        acc[month].revenue += m.revenue;
        acc[month].costs += m.costs;
        acc[month].profit += m.profit;
        acc[month].mrr += m.mrr;
        acc[month].ltv += m.ltv;
        acc[month].cac += m.cac;
        acc[month].processing_cost += m.processing_cost;
        acc[month].storage_cost += m.storage_cost;
        acc[month].count++;
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(monthlyData).map((m: any) => ({
        ...m,
        date: new Date(m.month + '-01').toLocaleDateString('es-ES', { 
          month: 'short', 
          year: 'numeric' 
        }),
        fullDate: m.month,
        // Promedios para métricas que no se suman
        mrr: m.mrr / m.count,
        ltv: m.ltv / m.count,
        cac: m.cac / m.count
      }));
    }
  }, [filteredMetrics, viewType]);

  const kpiData = useMemo(() => {
    const total = filteredMetrics.reduce((acc, m) => ({
      revenue: acc.revenue + m.revenue,
      costs: acc.costs + m.costs,
      profit: acc.profit + m.profit,
      processingCost: acc.processingCost + m.processing_cost,
      storageCost: acc.storageCost + m.storage_cost
    }), { revenue: 0, costs: 0, profit: 0, processingCost: 0, storageCost: 0 });

    const avgMRR = filteredMetrics.reduce((sum, m) => sum + m.mrr, 0) / filteredMetrics.length || 0;
    const avgLTV = filteredMetrics.reduce((sum, m) => sum + m.ltv, 0) / filteredMetrics.length || 0;
    const avgCAC = filteredMetrics.reduce((sum, m) => sum + m.cac, 0) / filteredMetrics.length || 0;

    const margin = total.revenue > 0 ? ((total.profit / total.revenue) * 100) : 0;
    const ltvCacRatio = avgCAC > 0 ? (avgLTV / avgCAC) : 0;

    return {
      ...total,
      avgMRR,
      avgLTV,
      avgCAC,
      margin,
      ltvCacRatio
    };
  }, [filteredMetrics]);

  const growthData = useMemo(() => {
    if (aggregatedData.length < 2) return [];
    
    return aggregatedData.map((current, index) => {
      if (index === 0) return { ...current, revenueGrowth: 0, profitGrowth: 0 };
      
      const previous = aggregatedData[index - 1];
      const revenueGrowth = previous.revenue > 0 ? 
        ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0;
      const profitGrowth = previous.profit > 0 ? 
        ((current.profit - previous.profit) / previous.profit) * 100 : 0;
      
      return {
        ...current,
        revenueGrowth,
        profitGrowth
      };
    });
  }, [aggregatedData]);

  const costBreakdown = useMemo(() => {
    const total = filteredMetrics.reduce((acc, m) => ({
      processing: acc.processing + m.processing_cost,
      storage: acc.storage + m.storage_cost,
      other: acc.other + (m.costs - m.processing_cost - m.storage_cost)
    }), { processing: 0, storage: 0, other: 0 });

    return [
      { name: 'Procesamiento', value: total.processing, color: '#3B82F6' },
      { name: 'Almacenamiento', value: total.storage, color: '#10B981' },
      { name: 'Otros', value: total.other, color: '#F59E0B' }
    ];
  }, [filteredMetrics]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Financiero</h2>
          <p className="text-muted-foreground">
            Análisis de ingresos, costos y métricas financieras clave
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewType} onValueChange={(value) => setViewType(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="daily">Diario</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => onRefresh(dateRange?.from?.toISOString(), dateRange?.to?.toISOString())}
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
            <CardTitle className="text-sm font-medium">Revenue Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpiData.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Ingresos acumulados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpiData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${kpiData.profit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Margen: {kpiData.margin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR Promedio</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpiData.avgMRR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Ingresos recurrentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV / CAC</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpiData.ltvCacRatio >= 3 ? 'text-green-600' : 'text-red-600'}`}>
              {kpiData.ltvCacRatio.toFixed(1)}x
            </div>
            <p className="text-xs text-muted-foreground">
              Ratio de eficiencia
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ingresos y Costos</CardTitle>
            <CardDescription>
              Evolución financiera {viewType === 'monthly' ? 'mensual' : 'diaria'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aggregatedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Ingresos" />
                  <Line type="monotone" dataKey="costs" stroke="#EF4444" strokeWidth={2} name="Costos" />
                  <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} name="Ganancia" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desglose de Costos</CardTitle>
            <CardDescription>
              Distribución de gastos operativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costBreakdown.map((cost) => (
                <div key={cost.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cost.color }}
                    />
                    <span className="font-medium">{cost.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${cost.value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {((cost.value / kpiData.costs) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crecimiento</CardTitle>
            <CardDescription>
              Tasa de crecimiento período a período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="revenueGrowth" fill="#10B981" name="Crecimiento Ingresos" />
                  <Bar dataKey="profitGrowth" fill="#3B82F6" name="Crecimiento Ganancia" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas Clave</CardTitle>
            <CardDescription>
              Indicadores financieros importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">LTV Promedio</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">${kpiData.avgLTV.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Valor de vida</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">CAC Promedio</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">${kpiData.avgCAC.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Costo adquisición</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Margen Neto</span>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${kpiData.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {kpiData.margin.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Rentabilidad</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estado Financiero</span>
                  <Badge variant={kpiData.profit >= 0 ? 'default' : 'destructive'}>
                    {kpiData.profit >= 0 ? 'Rentable' : 'En Pérdidas'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
