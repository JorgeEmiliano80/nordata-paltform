import { useState } from 'react';
import { Shield, Database, Brain, Users, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MasterSetup from '@/components/MasterSetup';
import ClientsSection from '@/components/ClientsSection';

const Index = () => {
  const [showSetup, setShowSetup] = useState(false);
  const features = [{
    icon: <Database className="h-8 w-8 text-primary" />,
    title: "Procesamiento Inteligente",
    description: "Procesamiento automático de archivos CSV, XLSX y JSON con insights generados por IA"
  }, {
    icon: <Brain className="h-8 w-8 text-primary" />,
    title: "Chatbot Personalizado",
    description: "Interactúa con tus datos a través de un chatbot inteligente basado en tus archivos"
  }, {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Gestión de Usuarios",
    description: "Panel administrativo para invitar y gestionar usuarios con roles específicos"
  }, {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: "Analytics Avanzados",
    description: "Visualización de datos y análisis detallado de todos los archivos procesados"
  }];

  if (showSetup) {
    return <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Button variant="outline" onClick={() => setShowSetup(false)} className="mb-4">
              ← Volver al Inicio
            </Button>
          </div>
          <MasterSetup />
        </div>
      </div>;
  }

  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/1a34d3c4-cb8e-427e-b062-a6af0a5e1f4d.png" 
                  alt="NordataPlatform" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                NordataPlatform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild>
                <a href="/login">Iniciar Sesión</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Análisis Inteligente de Datos
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Plataforma de análisis de datos con procesamiento automático, insights generados por IA 
              y chatbot personalizado para interactuar con tus datos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                <a href="/login">Acceder a la Plataforma</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Características Principales
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una plataforma completa para el análisis y procesamiento inteligente de datos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <ClientsSection />

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 NordataPlatform - Plataforma de Análisis Inteligente de Datos
          </p>
        </div>
      </footer>
    </div>;
};

export default Index;
