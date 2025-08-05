
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
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuario no autenticado');
        return;
      }

      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (fileId) {
        query = query.eq('file_id', fileId);
      } else {
        query = query.is('file_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching chat history:', error);
        return;
      }

      console.log('Chat history loaded:', data?.length || 0, 'messages');
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, fileId?: string) => {
    try {
      setSending(true);
      console.log('Enviando mensaje:', message);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuario no autenticado');
        return { success: false };
      }

      // Crear mensaje del usuario
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        message,
        file_id: fileId,
        is_user_message: true,
        created_at: new Date().toISOString()
      };

      // Actualizar mensajes localmente primero
      setMessages(prev => [...prev, userMessage]);

      // Guardar mensaje del usuario en la base de datos
      const { data: savedUserMessage, error: userError } = await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
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

      // Actualizar el mensaje temporal con el ID real
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? savedUserMessage : msg
      ));

      // Llamar al chatbot
      console.log('Llamando al chatbot...');
      const { data: botResponse, error: botError } = await supabase.functions.invoke('chatbot', {
        body: {
          message,
          fileId,
          userId: user.id
        }
      });

      if (botError) {
        console.error('Error calling chatbot:', botError);
        toast.error('Error al obtener respuesta del chatbot');
        
        // Crear respuesta de error local
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          user_id: user.id,
          message: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
          is_user_message: false,
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, errorMessage]);
        return { success: false };
      }

      console.log('Respuesta del chatbot:', botResponse);

      // Guardar respuesta del bot
      const botMessageText = botResponse?.response || 'Lo siento, no pude generar una respuesta.';
      
      const { data: botMessage, error: botSaveError } = await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
          message: botMessageText,
          file_id: fileId,
          is_user_message: false,
          response: botMessageText
        })
        .select()
        .single();

      if (botSaveError) {
        console.error('Error saving bot response:', botSaveError);
        // Mostrar respuesta aunque no se guarde
        const localBotMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          user_id: user.id,
          message: botMessageText,
          response: botMessageText,
          is_user_message: false,
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, localBotMessage]);
      } else {
        // Actualizar con el mensaje guardado
        setMessages(prev => [...prev, botMessage]);
      }

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuario no autenticado');
        return { success: false };
      }

      let query = supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id);

      if (fileId) {
        query = query.eq('file_id', fileId);
      } else {
        query = query.is('file_id', null);
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
