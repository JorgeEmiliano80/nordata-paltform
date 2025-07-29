
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  MessageSquare,
  FileText,
  Loader2,
  Info,
  TrendingUp,
  Users,
  DollarSign,
  Lightbulb
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { useChatbot } from '@/hooks/useChatbot';
import { useFiles } from '@/hooks/useFiles';

const ChatbotPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, loading, sending, sendMessage, fetchChatHistory, clearHistory } = useChatbot();
  const { files } = useFiles();

  // Simulate messages with AI responses
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Olá! Sou seu assistente de IA para análise de dados. Posso ajudar você a entender melhor seus dados de vendas, segmentar clientes e gerar recomendações para seu negócio. Como posso ajudá-lo hoje?',
      timestamp: new Date()
    }
  ]);

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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: chatMessages.length + 1,
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      let response = "Entendi sua pergunta! Com base nos dados carregados, posso gerar uma análise detalhada. Para respostas mais precisas, certifique-se de que seus dados estão atualizados na seção de Upload.";
      
      // Simple keyword matching for demo
      const question = message.toLowerCase();
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
        id: chatMessages.length + 2,
        type: 'bot' as const,
        content: response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
  };

  const handleClearHistory = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todo el historial de chat?')) {
      return;
    }
    
    setChatMessages([{
      id: 1,
      type: 'bot',
      content: 'Olá! Sou seu assistente de IA para análise de dados. Posso ajudar você a entender melhor seus dados de vendas, segmentar clientes e gerar recomendações para seu negócio. Como posso ajudá-lo hoje?',
      timestamp: new Date()
    }]);
    
    toast.success('Historial eliminado');
  };

  const getProcessedFiles = () => {
    return files.filter(file => file.status === 'done');
  };

  const formatMessageTime = (timestamp: Date) => {
    return format(timestamp, 'HH:mm', { locale: es });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Assistente IA
            </h1>
            <p className="text-muted-foreground text-lg">
              Chat inteligente com recomendações baseadas nos seus dados de negócio
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[700px] flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Chat com IA
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {selectedFileId && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Arquivo selecionado
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearHistory}
                        disabled={chatMessages.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[500px] p-4">
                    <div className="space-y-4">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start space-x-2 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              msg.type === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-accent text-accent-foreground'
                            }`}>
                              {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            
                            <div className={`rounded-lg p-3 ${
                              msg.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}>
                              <div className="text-sm whitespace-pre-line">
                                {msg.content}
                              </div>
                              <div className="text-xs opacity-70 mt-1">
                                {formatMessageTime(msg.timestamp)}
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
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Digite sua pergunta sobre os dados do seu negócio..."
                        disabled={isLoading}
                        className="flex-1 min-h-[60px] resize-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      <Button 
                        type="submit" 
                        disabled={!message.trim() || isLoading}
                        variant="hero"
                        size="icon"
                        className="h-[60px] w-[60px]"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5" />
                    <span>Perguntas Rápidas</span>
                  </CardTitle>
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
                          <span className="text-sm font-normal">{question.text}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* File Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contexto do Arquivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar archivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Chat General</SelectItem>
                      {getProcessedFiles().map((file) => (
                        <SelectItem key={file.id} value={file.id}>
                          {file.file_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedFileId && selectedFileId !== 'general' 
                      ? 'El asistente responderá con contexto del archivo seleccionado'
                      : 'El asistente responderá preguntas generales sobre análisis de datos'
                    }
                  </p>
                </CardContent>
              </Card>

              {/* AI Capabilities */}
              <Card>
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

              {/* Usage Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dicas de Uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <div>
                        <p className="font-medium">Selecione um arquivo</p>
                        <p className="text-muted-foreground text-xs">
                          Para obter respostas específicas sobre seus dados
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <div>
                        <p className="font-medium">Seja específico</p>
                        <p className="text-muted-foreground text-xs">
                          Pergunte sobre padrões, tendências ou insights específicos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <div>
                        <p className="font-medium">Use linguagem natural</p>
                        <p className="text-muted-foreground text-xs">
                          Não precisa de comandos especiais, apenas pergunte normalmente
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Insights Summary */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Últimos Insights Gerados</CardTitle>
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
                    Taxa de retenção de 84% indica alta satisfação. Momento ideal para expansão de mercado.
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

export default ChatbotPage;
