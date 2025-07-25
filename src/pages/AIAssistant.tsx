import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, User, Lightbulb, TrendingUp, Users, DollarSign, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Olá! Sou seu assistente de IA para análise de dados. Posso ajudar você a entender melhor seus dados de vendas, segmentar clientes e gerar recomendações para seu negócio. Como posso ajudá-lo hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    {
      icon: TrendingUp,
      text: "Como estão minhas vendas este mês?",
      category: "Performance"
    },
    {
      icon: Users,
      text: "Quais são meus melhores clientes?",
      category: "Clientes"
    },
    {
      icon: DollarSign,
      text: "Como posso aumentar minha receita?",
      category: "Estratégia"
    },
    {
      icon: Lightbulb,
      text: "Que insights você pode gerar dos meus dados?",
      category: "Insights"
    }
  ];

  const aiResponses = {
    vendas: `📊 **Análise de Vendas Atual:**

**Performance do Mês:**
• Receita total: R$ 248.500 (+12.5% vs mês anterior)
• Número de vendas: 1.245 (+8.2%)
• Ticket médio: R$ 199 (-2.1%)

**Tendências identificadas:**
✅ Crescimento consistente em produtos premium
⚠️ Leve queda no ticket médio - considere estratégias de upselling
📈 Pico de vendas nas terças e quartas-feiras

**Recomendação:** Foque em aumentar o valor médio por transação através de ofertas complementares.`,

    clientes: `👥 **Análise de Clientes:**

**Seus Top 5 Clientes:**
1. **Maria Silva** - R$ 5.240 (12 pedidos) - Segmento VIP
2. **João Santos** - R$ 4.180 (8 pedidos) - Segmento Premium  
3. **Ana Costa** - R$ 3.920 (15 pedidos) - Segmento Premium
4. **Pedro Lima** - R$ 3.450 (6 pedidos) - Segmento Regular
5. **Carla Souza** - R$ 2.890 (9 pedidos) - Segmento Regular

**Insights importantes:**
• 45 clientes VIP geram 36% da sua receita total
• 89 clientes estão inativos há mais de 60 dias
• Taxa de retenção: 84% (excelente!)

**Ação recomendada:** Crie um programa de fidelidade para clientes Premium que podem virar VIP.`,

    receita: `💰 **Estratégias para Aumentar Receita:**

**Oportunidades Identificadas:**

**1. Segmentação VIP (Potencial: +R$ 45k/mês)**
• Seus clientes VIP têm alto engajamento
• Crie ofertas exclusivas e lançamentos antecipados
• Programa de cashback de 3-5%

**2. Reativação de Inativos (Potencial: +R$ 12k/mês)**
• 89 clientes inativos representam oportunidade perdida
• Campanha "volta que eu te explico" com 15% desconto
• Email marketing personalizado

**3. Cross-selling Inteligente (Potencial: +R$ 28k/mês)**
• Análise mostra que 67% dos clientes compram apenas 1 categoria
• Recomendações automáticas baseadas no histórico
• Bundles com desconto progressivo

**Prioridade:** Comece com reativação - ROI mais rápido!`,

    insights: `🔍 **Insights Avançados dos Seus Dados:**

**Padrões Descobertos:**

**🕐 Comportamento Temporal:**
• Pico de vendas: Terça-feira 14h-16h
• Melhor dia da semana: Quarta-feira
• Sazonalidade: Crescimento de 23% no final do mês

**🎯 Segmentação Comportamental:**
• **Champions (5%):** Compram frequentemente, alto valor
• **Potenciais Leais (20%):** Boa frequência, valor médio
• **Em Risco (10%):** Eram bons, mas estão sumindo

**📊 Correlações Interessantes:**
• Clientes de SP gastam 34% mais que média nacional
• Produtos acima de R$ 300 têm taxa conversão 2x maior
• Reviews 5⭐ aumentam recompra em 67%

**🚀 Oportunidade Oculta:**
Clientes que compram categoria A + B gastam 145% mais. Crie campanhas cruzadas!`
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      let response = "Entendi sua pergunta! Com base nos dados carregados, posso gerar uma análise detalhada. Para respostas mais precisas, certifique-se de que seus dados estão atualizados na seção de Upload.";
      
      // Simple keyword matching for demo
      const question = inputMessage.toLowerCase();
      if (question.includes('venda') || question.includes('receita') || question.includes('faturamento')) {
        response = aiResponses.vendas;
      } else if (question.includes('cliente') || question.includes('consumidor')) {
        response = aiResponses.clientes;
      } else if (question.includes('aumentar') || question.includes('melhorar') || question.includes('estratégia')) {
        response = aiResponses.receita;
      } else if (question.includes('insight') || question.includes('análise') || question.includes('padrão')) {
        response = aiResponses.insights;
      }

      const botMessage = {
        id: messages.length + 2,
        type: 'bot' as const,
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Assistente de IA</h1>
            <p className="text-muted-foreground">
              Chat inteligente com recomendações baseadas nos seus dados de negócio
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Quick Actions Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5" />
                    <span>Perguntas Rápidas</span>
                  </CardTitle>
                  <CardDescription>
                    Clique para fazer perguntas comuns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {quickQuestions.map((question, index) => {
                      const Icon = question.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full h-auto p-3 text-left flex flex-col items-start space-y-1"
                          onClick={() => handleQuickQuestion(question.text)}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <span className="text-xs text-muted-foreground">{question.category}</span>
                          </div>
                          <span className="text-sm">{question.text}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* AI Capabilities */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Capacidades da IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span>Análise de Performance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-accent" />
                      <span>Segmentação de Clientes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-data-flow" />
                      <span>Otimização de Receita</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-4 h-4 text-warning" />
                      <span>Insights Preditivos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="w-5 h-5" />
                    <span>Chat com IA</span>
                  </CardTitle>
                  <CardDescription>
                    Converse com o assistente para obter insights dos seus dados
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.type === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-accent text-accent-foreground'
                          }`}>
                            {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>
                          
                          <div className={`rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <div className="text-sm whitespace-pre-line">
                              {message.content}
                            </div>
                            <div className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Digite sua pergunta sobre os dados do seu negócio..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="min-h-[60px] resize-none"
                      />
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      variant="hero"
                      size="icon"
                      className="h-[60px] w-[60px]"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Insights Summary */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Últimos Insights Gerados</CardTitle>
              <CardDescription>
                Resumo das principais descobertas da IA baseadas nos seus dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                  <h4 className="font-semibold text-primary mb-2">🎯 Oportunidade Detectada</h4>
                  <p className="text-sm text-muted-foreground">
                    Clientes VIP podem ser expandidos através de programa de indicação. Potencial de +R$ 45k/mês.
                  </p>
                </div>
                
                <div className="p-4 border border-warning/20 rounded-lg bg-warning/5">
                  <h4 className="font-semibold text-warning mb-2">⚠️ Alerta de Risco</h4>
                  <p className="text-sm text-muted-foreground">
                    89 clientes inativos há 60+ dias. Risco de churn de R$ 12k em receita recorrente.
                  </p>
                </div>
                
                <div className="p-4 border border-success/20 rounded-lg bg-success/5">
                  <h4 className="font-semibold text-success mb-2">✅ Tendência Positiva</h4>
                  <p className="text-sm text-muted-foreground">
                    Taxa de retenção de 84% indica alta satisfação. Momento ideal para expansion de mercado.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;