
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, BarChart3, PieChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';

const Insights = () => {
  const { t } = useTranslation();

  // Mock data for insights
  const insights = [
    {
      title: 'Crecimiento de Usuarios',
      value: '+12%',
      description: 'Incremento en el último mes',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Usuarios Activos',
      value: '1,284',
      description: 'Usuarios activos este mes',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Archivos Procesados',
      value: '3,247',
      description: 'Total de archivos procesados',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      title: 'Tasa de Éxito',
      value: '94.2%',
      description: 'Archivos procesados exitosamente',
      icon: PieChart,
      color: 'text-orange-600'
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Insights</h1>
              <p className="text-muted-foreground">
                Análisis y métricas clave de la plataforma
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {insights.map((insight, index) => {
                const IconComponent = insight.icon;
                return (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {insight.title}
                      </CardTitle>
                      <IconComponent className={`h-4 w-4 ${insight.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{insight.value}</div>
                      <p className="text-xs text-muted-foreground">
                        {insight.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análisis Detallado</CardTitle>
                <CardDescription>
                  Insights más profundos sobre el uso de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Los insights detallados se están cargando...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Insights;
