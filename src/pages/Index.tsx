
import { useState } from 'react';
import { Shield, Database, Brain, Users, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MasterSetup from '@/components/MasterSetup';

const Index = () => {
  const [showSetup, setShowSetup] = useState(false);

  const features = [
    {
      icon: <Database className="h-8 w-8 text-primary" />,
      title: "Procesamiento Inteligente",
      description: "Procesamiento automático de archivos CSV, XLSX y JSON con insights generados por IA"
    },
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "Chatbot Personalizado",
      description: "Interactúa con tus datos a través de un chatbot inteligente basado en tus archivos"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Gestión de Usuarios",
      description: "Panel administrativo para invitar y gestionar usuarios con roles específicos"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Analytics Avanzados",
      description: "Visualización de datos y análisis detallado de todos los archivos procesados"
    }
  ];

  if (showSetup) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Button 
              variant="outline" 
              onClick={() => setShowSetup(false)}
              className="mb-4"
            >
              ← Volver al Inicio
            </Button>
          </div>
          <MasterSetup />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">NORDATA.AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setShowSetup(true)}
              >
                Setup Master
              </Button>
              <Button asChild>
                <a href="/login">Iniciar Sesión</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Análisis Inteligente de Datos
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Plataforma de análisis de datos con procesamiento automático, insights generados por IA 
              y chatbot personalizado para interactuar con tus datos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/login">Acceder a la Plataforma</a>
              </Button>
              <Button size="lg" variant="outline" onClick={() => setShowSetup(true)}>
                Configurar Sistema
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Características Principales</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una plataforma completa para el análisis y procesamiento inteligente de datos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Acceso de Demostración</h3>
              <p className="text-lg text-muted-foreground">
                Prueba la plataforma con las credenciales de demostración del usuario master
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Usuario Master
                  </CardTitle>
                  <CardDescription>
                    Acceso completo con permisos de administrador
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> iamjorgear80@gmail.com</p>
                    <p><strong>Contraseña:</strong> Jorge41304254#</p>
                  </div>
                  <Button className="w-full mt-4" asChild>
                    <a href="/login">Iniciar Sesión como Master</a>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Configuración Inicial
                  </CardTitle>
                  <CardDescription>
                    Configura el usuario master en la base de datos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Si es la primera vez que usas la plataforma, ejecuta el setup del usuario master.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowSetup(true)}
                  >
                    Ejecutar Setup Master
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 NORDATA.AI - Plataforma de Análisis Inteligente de Datos
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
