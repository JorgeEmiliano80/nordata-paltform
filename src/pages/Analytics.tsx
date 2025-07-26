import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target, Calendar, Award } from "lucide-react";
import Navbar from "@/components/Navbar";

const AnalyticsPage = () => {
  // Mock data - in real app this would come from processed files
  const salesMetrics = [
    { title: "Receita Total", value: "R$ 248.500", change: "+12.5%", trend: "up", icon: DollarSign },
    { title: "Vendas Totais", value: "1,245", change: "+8.2%", trend: "up", icon: ShoppingCart },
    { title: "Clientes Únicos", value: "892", change: "+15.3%", trend: "up", icon: Users },
    { title: "Ticket Médio", value: "R$ 199", change: "-2.1%", trend: "down", icon: Target },
  ];

  const topCustomers = [
    { name: "Maria Silva", total: "R$ 5.240", orders: 12, segment: "VIP" },
    { name: "João Santos", total: "R$ 4.180", orders: 8, segment: "Premium" },
    { name: "Ana Costa", total: "R$ 3.920", orders: 15, segment: "Premium" },
    { name: "Pedro Lima", total: "R$ 3.450", orders: 6, segment: "Regular" },
    { name: "Carla Souza", total: "R$ 2.890", orders: 9, segment: "Regular" },
  ];

  const customerSegments = [
    { segment: "VIP", count: 45, percentage: 5, revenue: "R$ 89.500", color: "bg-primary", avgAge: 42, topProducts: ["Premium Services", "Enterprise"], industry: "Todos" },
    { segment: "Premium", count: 178, percentage: 20, revenue: "R$ 124.600", color: "bg-accent", avgAge: 38, topProducts: ["Consultoria", "Software"], industry: "Tecnologia/Varejo" },
    { segment: "Regular", count: 445, percentage: 50, revenue: "R$ 34.400", color: "bg-data-flow", avgAge: 35, topProducts: ["Produtos Básicos", "Serviços"], industry: "Agronegócio/Indústria" },
    { segment: "Novo", count: 224, percentage: 25, revenue: "R$ 0", color: "bg-muted", avgAge: 29, topProducts: ["Trial", "Demo"], industry: "Ecommerce/Turismo" },
  ];

  const industrySegments = [
    { name: "Agronegócio", clients: 156, revenue: "R$ 89.300", growth: "+18.5%", avgTicket: "R$ 572" },
    { name: "Varejo", clients: 298, revenue: "R$ 67.800", growth: "+12.3%", avgTicket: "R$ 227" },
    { name: "Automotriz", clients: 89, revenue: "R$ 45.200", growth: "+8.7%", avgTicket: "R$ 508" },
    { name: "Indústria", clients: 134, revenue: "R$ 34.900", growth: "+15.2%", avgTicket: "R$ 260" },
    { name: "Ecommerce", clients: 187, revenue: "R$ 28.400", growth: "+22.1%", avgTicket: "R$ 152" },
    { name: "Turismo", clients: 78, revenue: "R$ 12.100", growth: "-5.3%", avgTicket: "R$ 155" },
  ];

  const revenueData = [
    { month: "Jan", revenue: 18500, profit: 12300, loss: -2100 },
    { month: "Fev", revenue: 22100, profit: 14800, loss: -1800 },
    { month: "Mar", revenue: 19800, profit: 13200, loss: -2400 },
    { month: "Abr", revenue: 26300, profit: 17500, loss: -1600 },
    { month: "Mai", revenue: 24700, profit: 16400, loss: -2000 },
    { month: "Jun", revenue: 28900, profit: 19200, loss: -1400 },
  ];

  const worstPerformers = [
    { name: "Roberto Dias", total: "R$ 45", orders: 1, lastPurchase: "90 dias" },
    { name: "Lucia Mendes", total: "R$ 120", orders: 2, lastPurchase: "45 dias" },
    { name: "Carlos Nunes", total: "R$ 89", orders: 1, lastPurchase: "60 dias" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Análises de Negócio</h1>
            <p className="text-muted-foreground">
              Insights detalhados sobre vendas, clientes e performance do negócio
            </p>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {salesMetrics.map((metric, index) => {
              const Icon = metric.icon;
              const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
              const trendColor = metric.trend === 'up' ? 'text-success' : 'text-error';
              
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-opacity-10 ${metric.title.includes('Receita') ? 'bg-primary/10' : metric.title.includes('Vendas') ? 'bg-accent/10' : metric.title.includes('Clientes') ? 'bg-data-flow/10' : 'bg-muted/10'}`}>
                        <Icon className={`w-6 h-6 ${metric.title.includes('Receita') ? 'text-primary' : metric.title.includes('Vendas') ? 'text-accent' : metric.title.includes('Clientes') ? 'text-data-flow' : 'text-muted-foreground'}`} />
                      </div>
                      <div className={`flex items-center space-x-1 ${trendColor}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{metric.change}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{metric.value}</h3>
                      <p className="text-sm text-muted-foreground">{metric.title}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Melhores Clientes</span>
                </CardTitle>
                <CardDescription>
                  Clientes com maior valor total de compras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.orders} pedidos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{customer.total}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          customer.segment === 'VIP' ? 'bg-primary/10 text-primary' :
                          customer.segment === 'Premium' ? 'bg-accent/10 text-accent' :
                          'bg-muted/10 text-muted-foreground'
                        }`}>
                          {customer.segment}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Segmentation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Segmentação Detalhada de Clientes</span>
                </CardTitle>
                <CardDescription>
                  Análise completa por idade, produtos e indústria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {customerSegments.map((segment, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg bg-background/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${segment.color}`}></div>
                          <span className="font-semibold text-lg">{segment.segment}</span>
                          <span className="text-sm text-muted-foreground">({segment.count} clientes)</span>
                        </div>
                        <span className="font-bold text-lg">{segment.revenue}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <p className="text-xs text-muted-foreground">Idade Média</p>
                          <p className="font-semibold">{segment.avgAge} anos</p>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <p className="text-xs text-muted-foreground">Produtos Top</p>
                          <p className="font-semibold text-xs">{segment.topProducts.join(", ")}</p>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <p className="text-xs text-muted-foreground">Indústria Principal</p>
                          <p className="font-semibold text-xs">{segment.industry}</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${segment.color} relative`}
                          style={{ width: `${segment.percentage}%` }}
                        >
                          <span className="absolute right-2 top-0 text-xs text-primary-foreground font-medium">
                            {segment.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Trend Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Tendência de Receita</span>
                </CardTitle>
                <CardDescription>Evolução mensal da receita</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Gráfico de tendência será exibido aqui</p>
                    <p className="text-sm text-muted-foreground mt-1">Baseado nos dados carregados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Worst Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5" />
                  <span>Clientes em Risco</span>
                </CardTitle>
                <CardDescription>
                  Clientes com baixo engajamento que precisam de atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {worstPerformers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg bg-error/5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center text-error font-semibold">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.orders} pedido(s) • Última compra: {customer.lastPurchase}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-error">{customer.total}</p>
                        <Button variant="outline" size="sm" className="mt-1">
                          Reativar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Recommendations */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recomendações Baseadas em IA</CardTitle>
              <CardDescription>
                Sugestões automáticas para melhorar a performance do negócio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-accent/20 rounded-lg bg-accent/5">
                  <h4 className="font-semibold mb-2 text-accent">💎 Foque nos VIPs</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Seus clientes VIP geram 36% da receita com apenas 5% da base. Crie ofertas exclusivas para este segmento.
                  </p>
                  <Button variant="outline" size="sm">Criar Campanha VIP</Button>
                </div>
                
                <div className="p-4 border border-warning/20 rounded-lg bg-warning/5">
                  <h4 className="font-semibold mb-2 text-warning">⚠️ Reative Inativos</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    89 clientes não compram há mais de 60 dias. Uma campanha de reativação pode recuperar 15-20% deles.
                  </p>
                  <Button variant="outline" size="sm">Campanha Winback</Button>
                </div>
                
                <div className="p-4 border border-data-flow/20 rounded-lg bg-data-flow/5">
                  <h4 className="font-semibold mb-2 text-data-flow">📈 Aumente Ticket Médio</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    O ticket médio caiu 2.1%. Estratégias de cross-selling podem aumentar em até R$ 50 por venda.
                  </p>
                  <Button variant="outline" size="sm">Ver Estratégias</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;