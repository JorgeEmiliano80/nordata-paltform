
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  user_id: string;
  file_id?: string;
  message: string;
  response?: string;
  is_user_message: boolean;
  created_at: string;
}

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchChatHistory = async (fileId?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: true });

      if (fileId) {
        query = query.eq('file_id', fileId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching chat history:', error);
        toast.error('Error al cargar historial de chat');
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Error al cargar historial de chat');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, fileId?: string) => {
    try {
      setSending(true);

      // Guardar mensaje del usuario
      const { data: userMessage, error: userError } = await supabase
        .from('chat_history')
        .insert({
          message,
          file_id: fileId,
          is_user_message: true
        })
        .select()
        .single();

      if (userError) {
        console.error('Error saving user message:', userError);
        toast.error('Error al enviar mensaje');
        return { success: false };
      }

      // Actualizar mensajes localmente
      setMessages(prev => [...prev, userMessage]);

      // Llamar al chatbot
      const { data: botResponse, error: botError } = await supabase.functions.invoke('chatbot', {
        body: {
          message,
          fileId,
          userId: userMessage.user_id
        }
      });

      if (botError) {
        console.error('Error calling chatbot:', botError);
        toast.error('Error al obtener respuesta del chatbot');
        return { success: false };
      }

      // Guardar respuesta del bot
      const { data: botMessage, error: botSaveError } = await supabase
        .from('chat_history')
        .insert({
          message: botResponse.response || 'Lo siento, no pude generar una respuesta.',
          file_id: fileId,
          is_user_message: false,
          response: botResponse.response
        })
        .select()
        .single();

      if (botSaveError) {
        console.error('Error saving bot response:', botSaveError);
        toast.error('Error al guardar respuesta del chatbot');
        return { success: false };
      }

      // Actualizar mensajes localmente
      setMessages(prev => [...prev, botMessage]);

      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar mensaje');
      return { success: false };
    } finally {
      setSending(false);
    }
  };

  const clearHistory = async (fileId?: string) => {
    try {
      let query = supabase.from('chat_history').delete();

      if (fileId) {
        query = query.eq('file_id', fileId);
      }

      const { error } = await query;

      if (error) {
        console.error('Error clearing chat history:', error);
        toast.error('Error al limpiar historial');
        return { success: false };
      }

      setMessages([]);
      toast.success('Historial limpiado exitosamente');
      return { success: true };
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast.error('Error al limpiar historial');
      return { success: false };
    }
  };

  return {
    messages,
    loading,
    sending,
    sendMessage,
    fetchChatHistory,
    clearHistory
  };
};
