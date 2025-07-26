import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Database, Users, Clock, BarChart3, Activity, Upload, Plus } from "lucide-react";
import DataFlowAnimation from "@/components/DataFlowAnimation";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from '@supabase/supabase-js';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState({
    totalDatasets: 0,
    activePipelines: 0,
    totalCustomers: 0,
    totalTransactions: 0
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Buscar perfil do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setUserProfile(profile);

        // Buscar dados do dashboard
        const [datasets, pipelines, customers, transactions] = await Promise.all([
          supabase.from('datasets').select('*', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('pipelines').select('*', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('customers').select('*', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('transactions').select('*', { count: 'exact' }).eq('user_id', user.id)
        ]);

        setDashboardData({
          totalDatasets: datasets.count || 0,
          activePipelines: pipelines.count || 0,
          totalCustomers: customers.count || 0,
          totalTransactions: transactions.count || 0
        });
      }
    };

    fetchUser();
  }, []);

  const handleCreatePipeline = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pipelines')
        .insert({
          user_id: user.id,
          name: `Pipeline ${Date.now()}`,
          description: 'Novo pipeline de análise de dados',
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Pipeline criado!",
        description: "Seu novo pipeline foi criado com sucesso.",
      });

      // Atualizar dados do dashboard
      setDashboardData(prev => ({
        ...prev,
        activePipelines: prev.activePipelines + 1
      }));

    } catch (error: any) {
      toast({
        title: "Erro ao criar pipeline",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const metrics = [
    { 
      title: "Datasets Carregados", 
      value: dashboardData.totalDatasets.toString(), 
      change: "+12%", 
      icon: Database, 
      color: "text-primary" 
    },
    { 
      title: "Pipelines Ativos", 
      value: dashboardData.activePipelines.toString(), 
      change: "+3", 
      icon: Activity, 
      color: "text-accent" 
    },
    { 
      title: "Total de Clientes", 
      value: dashboardData.totalCustomers.toString(), 
      change: "+5%", 
      icon: Users, 
      color: "text-success" 
    },
    { 
      title: "Transações", 
      value: dashboardData.totalTransactions.toString(), 
      change: "+8%", 
      icon: TrendingUp, 
      color: "text-warning" 
    },
  ];

  const recentActivity = [
    { type: "Pipeline Created", name: "Customer Segmentation", time: "2 minutes ago", status: "success" },
    { type: "Data Processed", name: "Sales Report Q4", time: "15 minutes ago", status: "success" },
    { type: "Alert", name: "High Memory Usage", time: "1 hour ago", status: "warning" },
    { type: "Pipeline Completed", name: "Inventory Sync", time: "2 hours ago", status: "success" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Bem-vindo{userProfile?.full_name ? `, ${userProfile.full_name}` : ''}!
            </h1>
            <p className="text-muted-foreground">
              {userProfile?.company_name && (
                <span className="font-medium">{userProfile.company_name}</span>
              )}
              {userProfile?.industry && userProfile?.company_name && " • "}
              {userProfile?.industry && (
                <span className="capitalize">{userProfile.industry}</span>
              )}
              <br />
              Monitore o desempenho da sua plataforma de análise de dados
            </p>
          </div>

          {/* Data Flow Animation */}
          <Card className="mb-8 overflow-hidden">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Real-time Data Flow</h2>
                <p className="text-muted-foreground">Live visualization of your data pipeline</p>
              </div>
              <DataFlowAnimation />
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-opacity-10 ${metric.color.replace('text-', 'bg-')}/10`}>
                        <Icon className={`w-6 h-6 ${metric.color}`} />
                      </div>
                      <span className={`text-sm font-medium ${metric.change.startsWith('+') ? 'text-success' : metric.change.startsWith('-') ? 'text-error' : 'text-muted-foreground'}`}>
                        {metric.change}
                      </span>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Processing Volume</span>
                </CardTitle>
                <CardDescription>Data processed over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Chart visualization coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Latest events in your data platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-success' : 
                        activity.status === 'warning' ? 'bg-warning' : 'bg-error'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.type}</p>
                        <p className="text-sm text-muted-foreground">{activity.name}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to get you started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="hero" 
                  className="h-auto p-6 flex flex-col items-center space-y-3"
                  onClick={() => navigate('/upload')}
                >
                  <Upload className="w-8 h-8" />
                  <div className="text-center">
                    <p className="font-semibold">Upload de Dados</p>
                    <p className="text-sm opacity-90">Inicie o processamento de novos datasets</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-6 flex flex-col items-center space-y-3"
                  onClick={handleCreatePipeline}
                >
                  <Plus className="w-8 h-8" />
                  <div className="text-center">
                    <p className="font-semibold">Criar Pipeline</p>
                    <p className="text-sm text-muted-foreground">Construa novos fluxos de dados</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-6 flex flex-col items-center space-y-3"
                  onClick={() => navigate('/analytics')}
                >
                  <BarChart3 className="w-8 h-8" />
                  <div className="text-center">
                    <p className="font-semibold">Ver Análises</p>
                    <p className="text-sm text-muted-foreground">Analise insights de processamento</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;