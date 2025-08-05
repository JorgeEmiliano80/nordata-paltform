
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Shield, Database, Brain, Users, FileText, BarChart3, ArrowRight, Sparkles, Zap, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MasterSetup from '@/components/MasterSetup';
import ClientsSection from '@/components/ClientsSection';
import BrainAnimation from '@/components/BrainAnimation';
import DataAnimation from '@/components/DataAnimation';
import LanguageSelector from '@/components/LanguageSelector';

const Index = () => {
  const [showSetup, setShowSetup] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Database className="h-8 w-8" />,
      title: t('landing.dataUpload'),
      description: t('landing.dataUploadDesc'),
      gradient: "from-data-flow to-primary",
      delay: "0ms"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: t('landing.advancedAI'),
      description: t('landing.advancedAIDesc'),
      gradient: "from-primary to-accent",
      delay: "100ms"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Gestión de Usuarios",
      description: "Panel administrativo para invitar y gestionar usuarios con roles específicos",
      gradient: "from-accent to-data-process",
      delay: "200ms"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: t('landing.visualization'),
      description: t('landing.visualizationDesc'),
      gradient: "from-data-process to-data-storage",
      delay: "300ms"
    }
  ];

  const handleLoginClick = () => {
    navigate('/login');
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Button variant="outline" onClick={() => setShowSetup(false)} className="mb-4 group">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180 transition-transform group-hover:-translate-x-1" />
              {t('common.back')}
            </Button>
          </div>
          <MasterSetup />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-grid-white/5 bg-[length:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Mouse follower effect */}
      <div 
        className="fixed w-8 h-8 bg-primary/20 rounded-full blur-md pointer-events-none transition-all duration-300 z-50"
        style={{
          left: mousePosition.x - 16,
          top: mousePosition.y - 16,
          transform: `scale(${mousePosition.x > 0 ? 1 : 0})`
        }}
      />

      {/* Header with Language Selector */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Nordata.AI
            </span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 px-4 text-center">
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Animated badge */}
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 animate-fade-in">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Plataforma de IA Avanzada
              </span>
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
            </div>

            {/* Main title with animated gradient */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%]">
                {t('landing.title')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('landing.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex justify-center items-center mt-12">
              <Button 
                size="lg" 
                className="group relative bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={handleLoginClick}
              >
                <span>{t('nav.login')}</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-md blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </Button>
            </div>
          </div>
        </div>

        {/* Brain Animation - Enhanced */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 opacity-30">
          <BrainAnimation />
        </div>

        {/* Data Animation */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-4xl opacity-60">
          <DataAnimation />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                Características Principales
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {t('landing.features')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una plataforma completa para el análisis y procesamiento inteligente de datos con IA
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group relative bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
                style={{ animationDelay: feature.delay }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="text-center relative z-10">
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <ClientsSection />

      {/* Footer */}
      <footer className="relative border-t border-border/50 py-12 px-4 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Nordata.AI
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2024 Nordata.AI - Plataforma de Análisis Inteligente de Datos
          </p>
          <div className="flex justify-center space-x-6 mt-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Términos de Servicio</a>
            <a href="#" className="hover:text-primary transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
