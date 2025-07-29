
import { supabase } from '@/integrations/supabase/client';

export const setupMasterUser = async () => {
  try {
    console.log('Ejecutando setup de usuario master...');
    
    const { data, error } = await supabase.functions.invoke('setup-master-user');
    
    if (error) {
      console.error('Error en setup-master-user:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Respuesta del setup:', data);
    
    if (data && data.success) {
      console.log('Usuario master configurado exitosamente');
      return { success: true, data };
    } else {
      console.error('Error en la respuesta:', data);
      return { success: false, error: data?.error || 'Error desconocido' };
    }
  } catch (error: any) {
    console.error('Error ejecutando setup:', error);
    return { success: false, error: error.message };
  }
};
