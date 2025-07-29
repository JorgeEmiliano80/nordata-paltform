
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Bot, User, Brain, Zap, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';

const ChatbotPage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hola! Soy tu asistente de análisis de datos. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      type: 'user',
      content: '¿Puedes analizar las tendencias de ventas en mis datos?',
      timestamp: new Date().toISOString(),
    },
    {
      id: 3,
      type: 'bot',
      content: 'Por supuesto! He analizado tu archivo ventas_2024.csv. Las ventas muestran un crecimiento del 15% en el último trimestre, con un pico significativo en productos de tecnología.',
      timestamp: new Date().toISOString(),
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simular respuesta del bot
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot' as const,
        content: 'Entendido. Estoy procesando tu consulta con los datos disponibles...',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const quickQuestions = [
    '¿Cuáles son mis mejores productos?',
    'Analizar tendencias de clientes',
    'Mostrar insights de ventas',
    'Predicciones para el próximo mes',
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Asistente de IA
            </h1>
            <p className="text-muted-foreground text-lg">
              Consulte sobre sus datos con inteligencia artificial avanzada
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
                <CardHeader className="relative border-b border-border/50">
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-primary" />
                    Conversación
                  </CardTitle>
                  <CardDescription>
                    Asistente conectado con sus datos
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 p-0 relative">
                  <div className="h-full flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border border-border/50'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              {msg.type === 'user' ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Bot className="h-4 w-4 text-primary" />
                              )}
                              <span className="text-xs opacity-75">
                                {msg.type === 'user' ? 'Tú' : 'Asistente IA'}
                              </span>
                            </div>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Input */}
                    <div className="border-t border-border/50 p-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Pregunta sobre tus datos..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} className="shrink-0">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Questions */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-primary/5" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center text-lg">
                    <Zap className="h-5 w-5 mr-2 text-primary" />
                    Preguntas Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-3 hover:bg-accent/50"
                      onClick={() => setMessage(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Data Sources */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Fuentes de Datos
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      <span className="text-sm">ventas_2024.csv</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Activo
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-data-flow rounded-full" />
                      <span className="text-sm">inventario.xlsx</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Procesando
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      <span className="text-sm">clientes.json</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Activo
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* AI Capabilities */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-primary/5" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center text-lg">
                    <Brain className="h-5 w-5 mr-2 text-primary" />
                    Capacidades IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-2">
                  <div className="text-sm space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span>Análisis de tendencias</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span>Segmentación de clientes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span>Predicciones de ventas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span>Detección de anomalías</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
