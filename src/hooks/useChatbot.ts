import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  message: string;
  response: string | null;
  is_user_message: boolean;
  created_at: string;
  file_id?: string;
}

export interface ChatConversation {
  message: string;
  response: string;
  timestamp: string;
  isUser: boolean;
}

export const useChatbot = (fileId?: string) => {
  const [messages, setMessages] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (fileId) {
      fetchChatHistory();
    } else {
      fetchRecentChatHistory();
    }
  }, [fileId]);

  const fetchChatHistory = async () => {
    try {
      const query = supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: true });

      if (fileId) {
        query.eq('file_id', fileId);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        return;
      }

      setChatHistory(data || []);
      
      // Converter para formato de conversa
      const conversations: ChatConversation[] = [];
      (data || []).forEach(item => {
        conversations.push({
          message: item.message,
          response: item.response || '',
          timestamp: item.created_at,
          isUser: true
        });
        
        if (item.response) {
          conversations.push({
            message: item.response,
            response: '',
            timestamp: item.created_at,
            isUser: false
          });
        }
      });

      setMessages(conversations);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    }
  };

  const fetchRecentChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .is('file_id', null)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Erro ao buscar histórico geral:', error);
        return;
      }

      setChatHistory(data || []);
      
      const conversations: ChatConversation[] = [];
      (data || []).forEach(item => {
        conversations.push({
          message: item.message,
          response: item.response || '',
          timestamp: item.created_at,
          isUser: true
        });
        
        if (item.response) {
          conversations.push({
            message: item.response,
            response: '',
            timestamp: item.created_at,
            isUser: false
          });
        }
      });

      setMessages(conversations);
    } catch (error) {
      console.error('Erro ao buscar histórico geral:', error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setLoading(true);

      // Adicionar mensagem do usuário imediatamente
      const userMessage: ChatConversation = {
        message: message,
        response: '',
        timestamp: new Date().toISOString(),
        isUser: true
      };
      setMessages(prev => [...prev, userMessage]);

      // Preparar histórico para contexto
      const recentHistory = messages.slice(-10).filter(m => !m.isUser).map(m => ({
        message: m.message,
        response: m.response
      }));

      // Chamar edge function do chatbot
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: {
          message,
          fileId,
          conversationHistory: recentHistory
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success && data?.response) {
        // Adicionar resposta do assistente
        const assistantMessage: ChatConversation = {
          message: data.response,
          response: '',
          timestamp: new Date().toISOString(),
          isUser: false
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Resposta inválida do chatbot');
      }

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error(`Erro no chatbot: ${error.message}`);
      
      // Adicionar mensagem de erro
      const errorMessage: ChatConversation = {
        message: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        response: '',
        timestamp: new Date().toISOString(),
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const getChatSummary = () => {
    const totalMessages = messages.filter(m => m.isUser).length;
    const lastMessageTime = messages.length > 0 
      ? new Date(messages[messages.length - 1].timestamp).toLocaleString('pt-BR')
      : null;

    return {
      totalMessages,
      lastMessageTime,
      hasMessages: messages.length > 0
    };
  };

  return {
    messages,
    loading,
    chatHistory,
    sendMessage,
    clearChat,
    getChatSummary,
    fetchChatHistory
  };
};