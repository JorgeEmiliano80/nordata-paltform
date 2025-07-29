
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Database, Brain, Shield } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Plataforma de Análisis de Datos
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Transforma tus datos en insights valiosos con inteligencia artificial
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/register">Comenzar Gratis</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Database className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Carga de Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sube archivos CSV, JSON y XLSX para análisis automático
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-8 w-8 text-primary mb-2" />
              <CardTitle>IA Avanzada</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Procesamiento inteligente con Databricks y machine learning
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Visualización</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Dashboards interactivos y reportes en tiempo real
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Seguridad</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Protección de datos y cumplimiento normativo garantizado
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;
