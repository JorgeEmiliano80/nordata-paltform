import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChatbot } from '@/hooks/useChatbot';
import { useFiles } from '@/hooks/useFiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, FileText, Trash2, Bot, User } from 'lucide-react';
import { toast } from 'sonner';

const Chatbot = () => {
  const { user } = useAuth();
  const { files } = useFiles(user?.id);
  const [selectedFileId, setSelectedFileId] = useState<string | undefined>();
  const { messages, loading, sendMessage, clearChat, getChatSummary } = useChatbot(selectedFileId);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || loading) return;

    const message = messageInput.trim();
    setMessageInput('');
    await sendMessage(message);
  };

  const handleFileChange = (fileId: string) => {
    if (fileId === 'general') {
      setSelectedFileId(undefined);
    } else {
      setSelectedFileId(fileId);
    }
    clearChat();
  };

  const handleClearChat = () => {
    clearChat();
    toast.success('Conversa limpa');
  };

  const processedFiles = files.filter(file => file.status === 'done');
  const chatSummary = getChatSummary();
  const selectedFile = selectedFileId ? files.find(f => f.id === selectedFileId) : null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <MessageCircle className="h-8 w-8 mr-3 text-primary" />
            Assistente IA
          </h1>
          <p className="text-muted-foreground mt-2">
            Converse com nossa IA sobre seus dados e obtenha insights personalizados
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar com opções */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Contexto da Conversa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Arquivo:</label>
                  <Select value={selectedFileId || 'general'} onValueChange={handleFileChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Conversa Geral</SelectItem>
                      {processedFiles.map((file) => (
                        <SelectItem key={file.id} value={file.id}>
                          {file.file_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedFile && (
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium truncate">
                        {selectedFile.file_name}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Tipo: {selectedFile.file_type?.toUpperCase()}</p>
                      <p>Status: 
                        <Badge className="ml-1" variant="default">
                          Processado
                        </Badge>
                      </p>
                      <p>Insights: {selectedFile.insights?.length || 0}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Mensagens: {chatSummary.totalMessages}</p>
                    {chatSummary.lastMessageTime && (
                      <p>Última: {chatSummary.lastMessageTime}</p>
                    )}
                  </div>
                </div>

                {messages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearChat}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Chat
                  </Button>
                )}
              </CardContent>
            </Card>

            {processedFiles.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum arquivo processado ainda. Faça upload de arquivos para análises específicas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Área principal do chat */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Bot className="h-5 w-5 mr-2 text-primary" />
                      {selectedFile ? `Chat sobre ${selectedFile.file_name}` : 'Conversa Geral'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile 
                        ? 'Faça perguntas específicas sobre este arquivo'
                        : 'Conversa geral sobre a plataforma e seus dados'
                      }
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 flex flex-col h-full">
                {/* Área de mensagens */}
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                      <Bot className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          Bem-vindo ao Assistente IA!
                        </h3>
                        <p className="text-muted-foreground max-w-md">
                          {selectedFile 
                            ? `Faça perguntas sobre o arquivo "${selectedFile.file_name}" e seus insights.`
                            : 'Faça perguntas gerais sobre a plataforma, seus dados ou selecione um arquivo específico para análise.'
                          }
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Exemplos de perguntas:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          {selectedFile ? (
                            <>
                              <li>"Quais são os principais insights deste arquivo?"</li>
                              <li>"Há alguma anomalia nos dados?"</li>
                              <li>"Como posso interpretar estes resultados?"</li>
                            </>
                          ) : (
                            <>
                              <li>"Como funciona a plataforma?"</li>
                              <li>"Quantos arquivos eu já processei?"</li>
                              <li>"O que posso fazer com meus dados?"</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.isUser
                                ? 'bg-primary text-primary-foreground ml-4'
                                : 'bg-muted mr-4'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {message.isUser ? (
                                <User className="h-4 w-4 mt-1 flex-shrink-0" />
                              ) : (
                                <Bot className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                              )}
                              <div className="text-sm leading-relaxed">
                                {message.message}
                              </div>
                            </div>
                            <div className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg p-3 mr-4">
                            <div className="flex items-center space-x-2">
                              <Bot className="h-4 w-4 text-primary" />
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Input de mensagem */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={
                        selectedFile 
                          ? `Pergunte sobre ${selectedFile.file_name}...`
                          : 'Digite sua pergunta...'
                      }
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={loading || !messageInput.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;