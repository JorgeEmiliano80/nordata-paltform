import { Button } from "@/components/ui/button";
import { ArrowRight, Database, Zap, Shield, BarChart3 } from "lucide-react";
import DataFlowAnimation from "@/components/DataFlowAnimation";
import heroImage from "@/assets/hero-data-flow.jpg";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: Database,
      title: "Ingestão de Dados",
      description: "Importe dados de múltiplas fontes com processamento em tempo real."
    },
    {
      icon: Zap,
      title: "Velocidade Extrema",
      description: "Processe grandes datasets em segundos com nossa arquitetura otimizada."
    },
    {
      icon: Shield,
      title: "Segurança Empresarial",
      description: "Segurança de nível bancário com criptografia ponta-a-ponta."
    },
    {
      icon: BarChart3,
      title: "Análises Avançadas",
      description: "Gere insights com visualizações poderosas e ferramentas de machine learning."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                NordataPlatform
              </span>
            </div>
            <Link to="/login">
              <Button variant="hero">
                Começar Agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Plataforma Inteligente de Análise de Dados
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transforme seus fluxos de dados com nossa plataforma inteligente. 
              Faça upload, processe e analise dados em escala com insights em tempo real.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/login">
                <Button variant="hero" size="lg" className="text-lg px-8">
                  Começar Processamento
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Upload de Dados
                </Button>
              </Link>
            </div>

            <DataFlowAnimation />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Recursos Poderosos</h2>
              <p className="text-xl text-muted-foreground">
                Tudo que você precisa para análise moderna de dados
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="text-center p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-all duration-300 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Pronto para transformar seus dados?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Junte-se a milhares de empresas que já usam NordataPlatform para processar dados de forma eficiente.
            </p>
            <Link to="/login">
              <Button variant="hero" size="lg" className="text-lg px-12">
                Comece Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
