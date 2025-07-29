import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Filter, Search, Mail, Phone, MapPin, Calendar, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import CustomerActions from "@/components/CustomerActions";
import { useState } from "react";
import { toast } from "sonner";

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("Todos");

  // Mock customer data
  const customers = [
    {
      id: 1,
      name: "Maria Silva",
      email: "maria.silva@email.com",
      phone: "(11) 99999-9999",
      city: "São Paulo",
      segment: "VIP",
      totalPurchases: 5240,
      orders: 12,
      lastPurchase: "2024-01-15",
      trend: "up",
      status: "Ativo"
    },
    {
      id: 2,
      name: "João Santos",
      email: "joao.santos@email.com",
      phone: "(21) 88888-8888",
      city: "Rio de Janeiro",
      segment: "Premium",
      totalPurchases: 4180,
      orders: 8,
      lastPurchase: "2024-01-10",
      trend: "up",
      status: "Ativo"
    },
    {
      id: 3,
      name: "Ana Costa",
      email: "ana.costa@email.com",
      phone: "(31) 77777-7777",
      city: "Belo Horizonte",
      segment: "Premium",
      totalPurchases: 3920,
      orders: 15,
      lastPurchase: "2024-01-12",
      trend: "up",
      status: "Ativo"
    },
    {
      id: 4,
      name: "Pedro Lima",
      email: "pedro.lima@email.com",
      phone: "(85) 66666-6666",
      city: "Fortaleza",
      segment: "Regular",
      totalPurchases: 3450,
      orders: 6,
      lastPurchase: "2023-12-20",
      trend: "down",
      status: "Inativo"
    },
    {
      id: 5,
      name: "Carla Souza",
      email: "carla.souza@email.com",
      phone: "(71) 55555-5555",
      city: "Salvador",
      segment: "Regular",
      totalPurchases: 2890,
      orders: 9,
      lastPurchase: "2024-01-08",
      trend: "stable",
      status: "Ativo"
    },
    {
      id: 6,
      name: "Roberto Dias",
      email: "roberto.dias@email.com",
      phone: "(47) 44444-4444",
      city: "Florianópolis",
      segment: "Novo",
      totalPurchases: 450,
      orders: 1,
      lastPurchase: "2023-10-15",
      trend: "down",
      status: "Em Risco"
    }
  ];

  const segments = ["Todos", "VIP", "Premium", "Regular", "Novo"];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = selectedSegment === "Todos" || customer.segment === selectedSegment;
    return matchesSearch && matchesSegment;
  });

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "VIP": return "bg-primary text-primary-foreground";
      case "Premium": return "bg-accent text-accent-foreground";
      case "Regular": return "bg-data-flow text-primary-foreground";
      case "Novo": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-success text-primary-foreground";
      case "Inativo": return "bg-warning text-primary-foreground";
      case "Em Risco": return "bg-error text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-success" />;
      case "down": return <TrendingDown className="w-4 h-4 text-error" />;
      default: return <div className="w-4 h-4" />; // stable
    }
  };

  const handleQuickAction = (action: string, description: string) => {
    toast.success(`Acción ejecutada: ${action}`, {
      description
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Gestão de Clientes</h1>
            <p className="text-muted-foreground">
              Analise, segmente e gerencie sua base de clientes
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Clientes</p>
                    <p className="text-2xl font-bold">892</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                    <p className="text-2xl font-bold text-success">756</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Médio</p>
                    <p className="text-2xl font-bold">R$ 2.450</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Em Risco</p>
                    <p className="text-2xl font-bold text-error">89</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-error" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center space-x-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar por nome, email ou cidade..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Filter className="w-5 h-5 text-muted-foreground" />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {segments.map((segment) => (
                    <Button
                      key={segment}
                      variant={selectedSegment === segment ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSegment(segment)}
                    >
                      {segment}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes ({filteredCustomers.length})</CardTitle>
              <CardDescription>
                Informações detalhadas dos seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-lg">{customer.name}</h3>
                            <Badge className={getSegmentColor(customer.segment)}>
                              {customer.segment}
                            </Badge>
                            <Badge className={getStatusColor(customer.status)}>
                              {customer.status}
                            </Badge>
                            {getTrendIcon(customer.trend)}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{customer.phone}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{customer.city}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-semibold text-lg">
                          R$ {customer.totalPurchases.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {customer.orders} pedidos
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Último: {new Date(customer.lastPurchase).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <CustomerActions customer={customer} />
                    </div>
                  </div>
                ))}
              </div>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum cliente encontrado com os filtros selecionados</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Insights */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Segmentação Inteligente</CardTitle>
                <CardDescription>Sugestões de segmentação baseadas em comportamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border border-primary/20 rounded-lg bg-primary/5">
                    <h4 className="font-semibold text-primary mb-1">Champions (VIP)</h4>
                    <p className="text-sm text-muted-foreground">
                      45 clientes • Compram frequentemente e gastam muito • 36% da receita
                    </p>
                  </div>
                  <div className="p-3 border border-accent/20 rounded-lg bg-accent/5">
                    <h4 className="font-semibold text-accent mb-1">Potenciais Leais (Premium)</h4>
                    <p className="text-sm text-muted-foreground">
                      178 clientes • Compram regularmente • Potencial para VIP
                    </p>
                  </div>
                  <div className="p-3 border border-warning/20 rounded-lg bg-warning/5">
                    <h4 className="font-semibold text-warning mb-1">Em Risco</h4>
                    <p className="text-sm text-muted-foreground">
                      89 clientes • Não compram há 60+ dias • Precisam de reativação
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximas Ações</CardTitle>
                <CardDescription>Recomendações para engajamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="default" 
                    className="w-full justify-start"
                    onClick={() => handleQuickAction("Campanha VIP", "Iniciando campanha para 45 clientes VIP")}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Campanha para Clientes VIP (45 clientes)
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleQuickAction("Programa Fidelidade", "Configurando programa para 178 clientes Premium")}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Programa de Fidelidade Premium (178 clientes)
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleQuickAction("Reativação", "Iniciando campanha de reativação para 89 clientes")}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Reativação de Inativos (89 clientes)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
