import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Globe, Bell, Shield, Database, Bot } from "lucide-react";
import Navbar from "@/components/Navbar";

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie suas preferências e configurações da plataforma
            </p>
          </div>

          <div className="space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Configurações Gerais</span>
                </CardTitle>
                <CardDescription>
                  Configurações básicas da sua conta e plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Nome da Empresa</Label>
                    <Input id="company" placeholder="Sua empresa" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Setor</Label>
                    <Input id="industry" placeholder="E-commerce, Varejo, etc." />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Ative o tema escuro para a interface
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Análise Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Gerar insights automaticamente ao carregar dados
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Data Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Configurações de Dados</span>
                </CardTitle>
                <CardDescription>
                  Configure como seus dados são processados e analisados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda Principal</Label>
                  <Input id="currency" defaultValue="BRL" placeholder="BRL, USD, EUR..." />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Detectar Colunas Automaticamente</Label>
                    <p className="text-sm text-muted-foreground">
                      Identificar automaticamente colunas de vendas, clientes, etc.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Segmentação Inteligente</Label>
                    <p className="text-sm text-muted-foreground">
                      Segmentar clientes automaticamente por comportamento
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* AI Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>Configurações de IA</span>
                </CardTitle>
                <CardDescription>
                  Configure o assistente de IA e recomendações inteligentes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Assistente de IA Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar chatbot para recomendações baseadas em dados
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Recomendações Automáticas</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber sugestões automáticas de otimização
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-frequency">Frequência de Análise</Label>
                  <Input id="ai-frequency" defaultValue="Diária" placeholder="Diária, Semanal, Mensal" />
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notificações</span>
                </CardTitle>
                <CardDescription>
                  Configure alertas e notificações importantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alertas de Performance</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar sobre mudanças significativas nas vendas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Novos Insights</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificação quando novos insights forem descobertos
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Relatórios Semanais</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber resumo semanal por email
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Segurança</span>
                </CardTitle>
                <CardDescription>
                  Configurações de segurança e privacidade dos dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Criptografia Avançada</Label>
                    <p className="text-sm text-muted-foreground">
                      Usar criptografia adicional para dados sensíveis
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Fazer backup automático dos dados processados
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention">Período de Retenção (dias)</Label>
                  <Input id="retention" defaultValue="365" type="number" />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button variant="outline">Cancelar</Button>
              <Button variant="hero">Salvar Configurações</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;