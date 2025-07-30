
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, FileText, Trash2, Loader2 } from 'lucide-react';
import { useChatbot } from '@/hooks/useChatbot';
import { useFiles } from '@/hooks/useFiles';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';

const ChatInterface: React.FC = () => {
  const { files } = useFiles();
  const { messages, loading, sending, sendMessage, fetchChatHistory, clearHistory } = useChatbot();
  const { trackChatMessage } = useBehaviorTracking();
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatHistory(selectedFile || undefined);
  }, [selectedFile]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const messageToSend = inputMessage.trim();
    setInputMessage('');

    // Track chat message
    trackChatMessage(messageToSend, selectedFile || undefined);

    const result = await sendMessage(messageToSend, selectedFile || undefined);
    
    if (!result.success) {
      setInputMessage(messageToSend); // Restore message on error
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('¿Estás seguro de que quieres limpiar el historial de chat?')) {
      return;
    }

    await clearHistory(selectedFile || undefined);
  };

  const getMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const processedFiles = files.filter(file => file.status === 'done');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asistente IA</h2>
          <p className="text-muted-foreground">
            Chatea con tus datos y obtén insights personalizados
          </p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar historial
            </Button>
          )}
        </div>
      </div>

      {processedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contexto de archivo</CardTitle>
            <CardDescription>
              Selecciona un archivo para hacer preguntas específicas sobre sus datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedFile} onValueChange={setSelectedFile}>
              <SelectTrigger>
                <SelectValue placeholder="Conversación general (sin archivo específico)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Conversación general</SelectItem>
                {processedFiles.map(file => (
                  <SelectItem key={file.id} value={file.id}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{file.file_name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {file.status === 'done' ? 'Procesado' : file.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Card className="flex flex-col h-[600px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle>Chat</CardTitle>
              {selectedFile && (
                <Badge variant="outline">
                  {processedFiles.find(f => f.id === selectedFile)?.file_name}
                </Badge>
              )}
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando historial...
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">¡Hola! Soy tu asistente IA</h3>
                  <p className="text-muted-foreground max-w-md">
                    Puedo ayudarte a analizar tus datos, responder preguntas sobre tus archivos procesados y proporcionarte insights valiosos.
                  </p>
                  {selectedFile && (
                    <Badge className="mt-4">
                      Contexto: {processedFiles.find(f => f.id === selectedFile)?.file_name}
                    </Badge>
                  )}
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.is_user_message ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {message.is_user_message ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col gap-1 max-w-[80%] ${message.is_user_message ? 'items-end' : ''}`}>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.is_user_message
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">
                          {message.is_user_message ? message.message : (message.response || message.message)}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {getMessageTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              
              {sending && (
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm">Procesando tu mensaje...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                selectedFile 
                  ? `Pregunta sobre ${processedFiles.find(f => f.id === selectedFile)?.file_name}...`
                  : "Escribe tu mensaje..."
              }
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={!inputMessage.trim() || sending}>
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;
