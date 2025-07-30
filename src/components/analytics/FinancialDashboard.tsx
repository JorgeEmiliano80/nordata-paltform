
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Users, Calendar, Download } from 'lucide-react';
import { useAnalytics, type FinancialMetric } from '@/hooks/useAnalytics';
import { useCurrency } from '@/context/CurrencyContext';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface FinancialDashboardProps {
  className?: string;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ className = "" }) => {
  const { 
    financialMetrics, 
    fetchFinancialMetrics, 
    loading 
  } = useAnalytics();
  
  const { formatAmount, convertAmount } = useCurrency();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [period, setPeriod] = useState('daily');

  useEffect(() => {
    const startDate = dateRange?.from?.toISOString().split('T')[0];
    const endDate = dateRange?.to?.toISOString().split('T')[0];
    fetchFinancialMetrics(startDate, endDate);
  }, [dateRange, fetchFinancialMetrics]);

  // Calculate aggregated metrics with currency conversion
  const calculateTotals = () => {
    return financialMetrics.reduce((acc, metric) => ({
      revenue: acc.revenue + convertAmount(metric.revenue),
      costs: acc.costs + convertAmount(metric.costs),
      profit: acc.profit + convertAmount(metric.profit),
      mrr: Math.max(acc.mrr, convertAmount(metric.mrr)),
      ltv: Math.max(acc.ltv, convertAmount(metric.ltv)),
      cac: Math.max(acc.cac, convertAmount(metric.cac))
    }), { revenue: 0, costs: 0, profit: 0, mrr: 0, ltv: 0, cac: 0 });
  };

  const totals = calculateTotals();

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getRevenueData = () => {
    return financialMetrics.map(metric => ({
      date: format(new Date(metric.metric_date), 'dd/MM'),
      revenue: convertAmount(metric.revenue),
      costs: convertAmount(metric.costs),
      profit: convertAmount(metric.profit),
      mrr: convertAmount(metric.mrr)
    }));
  };

  const getCashFlowData = () => {
    let runningBalance = 0;
    return financialMetrics.map(metric => {
      const convertedProfit = convertAmount(metric.profit);
      runningBalance += convertedProfit;
      return {
        date: format(new Date(metric.metric_date), 'dd/MM'),
        inflow: convertAmount(metric.revenue),
        outflow: convertAmount(metric.costs),
        balance: runningBalance
      };
    });
  };

  const getKPIData = () => {
    return financialMetrics.map(metric => {
      const convertedLtv = convertAmount(metric.ltv);
      const convertedCac = convertAmount(metric.cac);
      return {
        date: format(new Date(metric.metric_date), 'dd/MM'),
        ltv: convertedLtv,
        cac: convertedCac,
        ratio: convertedCac > 0 ? convertedLtv / convertedCac : 0
      };
    });
  };

  const formatTooltipValue = (value: any) => {
    if (typeof value === 'number') {
      return formatAmount(value);
    }
    return value?.toString() || '';
  };

  const revenueData = getRevenueData();
  const cashFlowData = getCashFlowData();
  const kpiData = getKPIData();

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Financiero</h2>
          <p className="text-muted-foreground">
            Análisis de ingresos, costos y métricas financieras clave
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DatePickerWithRange 
            date={dateRange} 
            onDateChange={handleDateChange}
          />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diario</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totals.revenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% desde el mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totals.costs)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -3.2% desde el mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totals.profit)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +18.7% desde el mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totals.mrr)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8.3% desde el mes anterior
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Ingresos & Costos</TabsTrigger>
          <TabsTrigger value="cashflow">Flujo de Caja</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Ingresos y Costos</CardTitle>
              <CardDescription>
                Comparativa de ingresos, costos y beneficios en el tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Line type="monotone" dataKey="revenue" stroke="#0088FE" name="Ingresos" />
                  <Line type="monotone" dataKey="costs" stroke="#FF8042" name="Costos" />
                  <Line type="monotone" dataKey="profit" stroke="#00C49F" name="Beneficio" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingresos Recurrentes Mensuales (MRR)</CardTitle>
              <CardDescription>
                Evolución del MRR y tendencia de crecimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Area type="monotone" dataKey="mrr" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="MRR" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flujo de Caja</CardTitle>
              <CardDescription>
                Entrada y salida de dinero con balance acumulado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Bar dataKey="inflow" fill="#00C49F" name="Ingresos" />
                  <Bar dataKey="outflow" fill="#FF8042" name="Egresos" />
                  <Line type="monotone" dataKey="balance" stroke="#8884d8" name="Balance" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>KPIs Financieros</CardTitle>
              <CardDescription>
                Lifetime Value (LTV), Customer Acquisition Cost (CAC) y ratio LTV/CAC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={kpiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Line type="monotone" dataKey="ltv" stroke="#0088FE" name="LTV" />
                  <Line type="monotone" dataKey="cac" stroke="#FF8042" name="CAC" />
                  <Line type="monotone" dataKey="ratio" stroke="#00C49F" name="Ratio LTV/CAC" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">LTV Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(totals.ltv)}</div>
                <p className="text-sm text-muted-foreground">
                  Valor de vida del cliente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CAC Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(totals.cac)}</div>
                <p className="text-sm text-muted-foreground">
                  Costo de adquisición
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ratio LTV/CAC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totals.cac > 0 ? (totals.ltv / totals.cac).toFixed(1) : '0'}:1
                </div>
                <p className="text-sm text-muted-foreground">
                  {totals.cac > 0 && totals.ltv / totals.cac > 3 ? 'Excelente' : 'Mejorable'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
