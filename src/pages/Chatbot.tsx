import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  MessageSquare,
  FileText,
  Loader2,
  AlertCircle,
  Info
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, loading, sending, sendMessage, fetchChatHistory, clearHistory } = useChatbot();
  const { files } = useFiles();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    fetchChatHistory(selectedFileId);
  }, [selectedFileId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    const messageToSend = message.trim();
    setMessage('');
    
    // Simulate message sending for now
    try {
      const simulatedResponse = `Gracias por tu mensaje: "${messageToSend}". Esta es una respuesta simulada del chatbot. El sistema de chat está funcionando correctamente.`;
      
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        user_id: 'current-user',
        message: messageToSend,
        is_user_message: true,
        created_at: new Date().toISOString(),
        file_id: selectedFileId
      };
      
      // Add bot response
      const botMessage = {
        id: (Date.now() + 1).toString(),
        user_id: 'current-user',
        message: simulatedResponse,
        is_user_message: false,
        created_at: new Date().toISOString(),
        file_id: selectedFileId
      };
      
      // For now, just show success toast
      toast.success('Mensaje enviado exitosamente');
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar mensaje');
      setMessage(messageToSend); // Restore message on error
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todo el historial de chat?')) {
      return;
    }
    
    toast.success('Historial eliminado');
  };

  const getProcessedFiles = () => {
    return files.filter(file => file.status === 'done');
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm', { locale: es });
  };

  const groupedMessages = messages.reduce((groups: any[], message, index) => {
    const prevMessage = messages[index - 1];
    const currentDate = new Date(message.created_at).toDateString();
    const prevDate = prevMessage ? new Date(prevMessage.created_at).toDateString() : null;

    if (currentDate !== prevDate) {
      groups.push({
        type: 'date',
        date: currentDate,
        messages: [message]
      });
    } else {
      groups[groups.length - 1].messages.push(message);
    }

    return groups;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Asistente IA
            </h1>
            <p className="text-muted-foreground text-lg">
              Chatea con tu asistente de análisis de datos
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
                      Chat
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {selectedFileId && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Archivo seleccionado
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearHistory}
                        disabled={messages.length === 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[500px] p-4">
                    {loading ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                              ¡Hola! Soy tu asistente de análisis de datos
                            </h3>
                            <p className="text-muted-foreground">
                              Puedo ayudarte con preguntas sobre tus archivos, insights y análisis de datos.
                            </p>
                          </div>
                        ) : (
                          <>
                            {groupedMessages.map((group, groupIndex) => (
                              <div key={groupIndex}>
                                {/* Date separator */}
                                <div className="flex justify-center my-4">
                                  <Badge variant="outline" className="text-xs">
                                    {format(new Date(group.date), 'PPP', { locale: es })}
                                  </Badge>
                                </div>

                                {/* Messages */}
                                {group.messages.map((msg: any) => (
                                  <div key={msg.id} className="space-y-2">
                                    {msg.is_user_message ? (
                                      <div className="flex justify-end">
                                        <div className="max-w-[70%] bg-primary text-primary-foreground rounded-lg p-3">
                                          <p className="text-sm">{msg.message}</p>
                                          <p className="text-xs opacity-70 mt-1">
                                            {formatMessageTime(msg.created_at)}
                                          </p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex justify-start">
                                        <div className="max-w-[70%] bg-muted rounded-lg p-3">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Bot className="h-4 w-4 text-primary" />
                                            <span className="text-xs font-medium">Asistente</span>
                                          </div>
                                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {formatMessageTime(msg.created_at)}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ))}
                            
                            {sending && (
                              <div className="flex justify-start">
                                <div className="max-w-[70%] bg-muted rounded-lg p-3">
                                  <div className="flex items-center gap-2">
                                    <Bot className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-medium">Asistente</span>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Escribiendo...
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        disabled={sending}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={!message.trim() || sending}>
                        {sending ? (
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
              {/* File Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contexto del Archivo</CardTitle>
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
                      : 'El asistente responderá preguntas generales sobre la plataforma'
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => setMessage('¿Cómo puedo subir un archivo?')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Subir archivo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => setMessage('¿Qué tipos de insights puedo obtener?')}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Tipos de insights
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => setMessage('¿Cómo funciona el procesamiento de datos?')}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Procesamiento
                  </Button>
                </CardContent>
              </Card>

              {/* Usage Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consejos de Uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <div>
                        <p className="font-medium">Selecciona un archivo</p>
                        <p className="text-muted-foreground text-xs">
                          Para obtener respuestas específicas sobre tus datos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <div>
                        <p className="font-medium">Sé específico</p>
                        <p className="text-muted-foreground text-xs">
                          Pregunta sobre patrones, tendencias o insights específicos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <div>
                        <p className="font-medium">Usa lenguaje natural</p>
                        <p className="text-muted-foreground text-xs">
                          No necesitas comandos especiales, solo pregunta normalmente
                        </p>
                      </div>
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
