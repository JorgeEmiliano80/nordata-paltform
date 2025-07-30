import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Bot, Sparkles, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';

const AI = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Asistente de IA</h1>
              <p className="text-muted-foreground">
                Herramientas de inteligencia artificial para análisis y automatización
              </p>
            </div>

            <Tabs defaultValue="assistant" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="assistant" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Asistente IA
                </TabsTrigger>
                <TabsTrigger value="automation" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Automatización
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assistant" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Chat con IA
                    </CardTitle>
                    <CardDescription>
                      Conversa con nuestro asistente de IA para obtener insights de tus datos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Asistente de IA en desarrollo
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="automation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Automatización de Procesos
                    </CardTitle>
                    <CardDescription>
                      Configura automatizaciones para tus flujos de trabajo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Herramientas de automatización en desarrollo
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Insights Inteligentes
                    </CardTitle>
                    <CardDescription>
                      Descubre patrones y tendencias en tus datos automáticamente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Generación de insights en desarrollo
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default AI;
