import { Button } from "@/components/ui/button";
import { ArrowRight, Database, Zap, Shield, BarChart3 } from "lucide-react";
import DataFlowAnimation from "@/components/DataFlowAnimation";
import heroImage from "@/assets/hero-data-flow.jpg";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: Database,
      title: "Data Ingestion",
      description: "Seamlessly import data from multiple sources with real-time processing capabilities."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process large datasets in seconds with our optimized pipeline architecture."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption and compliance standards."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Generate insights with powerful visualization and machine learning tools."
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
                DataStream
              </span>
            </div>
            <Link to="/dashboard">
              <Button variant="hero">
                Get Started
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
              Modern Data Processing Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform your data workflows with our intelligent processing platform. 
              Upload, process, and analyze data at scale with real-time insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/dashboard">
                <Button variant="hero" size="lg" className="text-lg px-8">
                  Start Processing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/upload">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Upload Data
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
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-xl text-muted-foreground">
                Everything you need for modern data processing
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
            <h2 className="text-4xl font-bold mb-4">Ready to transform your data?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of companies already using DataStream to process their data efficiently.
            </p>
            <Link to="/dashboard">
              <Button variant="hero" size="lg" className="text-lg px-12">
                Get Started Now
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
