
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { useChatbot } from '@/hooks/useChatbot';
import { useFiles } from '@/hooks/useFiles';
import { toast } from 'sonner';

interface DisplayMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, messages, loading } = useChatbot();
  const { files } = useFiles();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Transform ChatMessage to DisplayMessage format
  const displayMessages: DisplayMessage[] = messages.map(msg => ({
    id: msg.id,
    content: msg.message,
    isUser: msg.is_user_message,
    timestamp: msg.created_at
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      toast.error('Error al enviar mensaje');
    }
  };

  const hasData = files && files.length > 0;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asistente IA</h1>
          <p className="text-muted-foreground">
            Chatea con tus datos usando inteligencia artificial
          </p>
        </div>

        {!hasData && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">No hay datos disponibles</span>
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                Sube algunos archivos primero para poder hacer preguntas sobre tus datos.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ScrollArea ref={scrollAreaRef} className="h-96 pr-4">
                  <div className="space-y-4">
                    {displayMessages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>¡Hola! Soy tu asistente IA. Pregúntame sobre tus datos.</p>
                      </div>
                    )}
                    
                    {displayMessages.map((msg, index) => (
                      <div key={index} className="space-y-2">
                        <div className={`flex items-start gap-3 ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                          <div className={`rounded-full p-2 ${
                            msg.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            {msg.isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                          <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                            msg.isUser 
                              ? 'bg-primary text-primary-foreground ml-auto' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {loading && (
                      <div className="flex items-start gap-3">
                        <div className="rounded-full p-2 bg-muted">
                          <Bot className="h-4 w-4 animate-pulse" />
                        </div>
                        <div className="rounded-lg px-4 py-2 bg-muted">
                          <p className="text-sm">Pensando...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Pregúntame sobre tus datos..."
                    disabled={loading || !hasData}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading || !hasData || !message.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Datos Disponibles
              </CardTitle>
              <CardDescription>
                Archivos que puedes consultar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {files?.length > 0 ? (
                  files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.file_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {file.file_type?.toUpperCase()}
                          </Badge>
                          <Badge 
                            variant={file.status === 'done' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {file.status === 'done' ? 'Procesado' : 'Procesando'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay archivos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
