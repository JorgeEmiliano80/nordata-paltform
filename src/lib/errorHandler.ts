
import { toast } from "@/hooks/use-toast";

export type ErrorCategory = 
  | 'validation' 
  | 'network' 
  | 'authentication' 
  | 'authorization' 
  | 'supabase' 
  | 'databricks' 
  | 'file_processing' 
  | 'upload' 
  | 'unknown';

export interface ErrorContext {
  category: ErrorCategory;
  operation?: string;
  fileId?: string;
  fileName?: string;
  userId?: string;
  technicalDetails?: any;
}

export interface ProcessedError {
  userMessage: string;
  category: ErrorCategory;
  shouldRetry: boolean;
  technicalMessage?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Procesa y clasifica errores para mostrar mensajes apropiados al usuario
   */
  public processError(error: any, context: ErrorContext): ProcessedError {
    const processedError = this.categorizeError(error, context);
    
    // Log técnico para debugging
    this.logError(error, context, processedError);
    
    return processedError;
  }

  /**
   * Maneja errores mostrando toast al usuario y retornando información procesada
   */
  public handleError(error: any, context: ErrorContext): ProcessedError {
    const processedError = this.processError(error, context);
    
    // Mostrar toast al usuario
    toast({
      variant: "destructive",
      title: this.getErrorTitle(processedError.category),
      description: processedError.userMessage,
    });

    return processedError;
  }

  /**
   * Maneja errores de validación con detalles específicos
   */
  public handleValidationError(validationErrors: any[], context: ErrorContext): ProcessedError {
    const errorMessages = validationErrors
      .slice(0, 3)
      .map(error => error.message)
      .join('\n');
    
    const userMessage = `Erro de validação:\n${errorMessages}`;
    
    if (validationErrors.length > 3) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: `${userMessage}\n... e mais ${validationErrors.length - 3} erros`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: userMessage,
      });
    }

    const processedError: ProcessedError = {
      userMessage,
      category: 'validation',
      shouldRetry: false,
      technicalMessage: JSON.stringify(validationErrors)
    };

    this.logError(validationErrors, context, processedError);
    
    return processedError;
  }

  /**
   * Muestra toast de éxito
   */
  public showSuccess(message: string, title?: string) {
    toast({
      title: title || "Sucesso",
      description: message,
    });
  }

  /**
   * Muestra toast de advertencia
   */
  public showWarning(message: string, title?: string) {
    toast({
      title: title || "Atenção",
      description: message,
    });
  }

  private categorizeError(error: any, context: ErrorContext): ProcessedError {
    const errorMessage = error?.message || error?.toString() || 'Erro desconhecido';
    const errorCode = error?.code;

    // Errores de red
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('NetworkError')) {
      return {
        userMessage: "Erro de conexão. Verifique sua internet e tente novamente.",
        category: 'network',
        shouldRetry: true,
        technicalMessage: errorMessage
      };
    }

    // Errores de autenticación
    if (errorCode === 'PGRST301' || errorMessage.includes('JWT') || errorMessage.includes('unauthorized')) {
      return {
        userMessage: "Sessão expirada. Faça login novamente.",
        category: 'authentication',
        shouldRetry: false,
        technicalMessage: errorMessage
      };
    }

    // Errores de autorización
    if (errorCode === 'PGRST116' || errorMessage.includes('permission') || errorMessage.includes('acesso negado')) {
      return {
        userMessage: "Você não tem permissão para realizar esta ação.",
        category: 'authorization',
        shouldRetry: false,
        technicalMessage: errorMessage
      };
    }

    // Errores de Supabase
    if (errorCode?.startsWith('PGRST') || errorMessage.includes('supabase')) {
      return {
        userMessage: "Erro no servidor. Tente novamente em alguns momentos.",
        category: 'supabase',
        shouldRetry: true,
        technicalMessage: errorMessage
      };
    }

    // Errores específicos por contexto
    switch (context.category) {
      case 'validation':
        return {
          userMessage: "Arquivo com formato inválido. Verifique os dados e tente novamente.",
          category: 'validation',
          shouldRetry: false,
          technicalMessage: errorMessage
        };

      case 'upload':
        if (errorMessage.includes('file size') || errorMessage.includes('tamanho')) {
          return {
            userMessage: "Arquivo muito grande. O limite é de 50MB.",
            category: 'upload',
            shouldRetry: false,
            technicalMessage: errorMessage
          };
        }
        return {
          userMessage: "Erro ao fazer upload do arquivo. Tente novamente.",
          category: 'upload',
          shouldRetry: true,
          technicalMessage: errorMessage
        };

      case 'file_processing':
        return {
          userMessage: "Erro ao processar o arquivo. Verifique o formato e tente novamente.",
          category: 'file_processing',
          shouldRetry: true,
          technicalMessage: errorMessage
        };

      case 'databricks':
        return {
          userMessage: "Erro no processamento de dados. Nossa equipe foi notificada.",
          category: 'databricks',
          shouldRetry: true,
          technicalMessage: errorMessage
        };

      default:
        return {
          userMessage: "Ops! Algo deu errado. Tente novamente.",
          category: 'unknown',
          shouldRetry: true,
          technicalMessage: errorMessage
        };
    }
  }

  private getErrorTitle(category: ErrorCategory): string {
    switch (category) {
      case 'validation': return "Erro de Validação";
      case 'network': return "Erro de Conexão";
      case 'authentication': return "Erro de Autenticação";
      case 'authorization': return "Acesso Negado";
      case 'supabase': return "Erro no Servidor";
      case 'databricks': return "Erro de Processamento";
      case 'file_processing': return "Erro ao Processar Arquivo";
      case 'upload': return "Erro no Upload";
      default: return "Erro";
    }
  }

  private logError(error: any, context: ErrorContext, processedError: ProcessedError) {
    console.group(`🚨 [${context.category.toUpperCase()}] ${context.operation || 'Error'}`);
    console.error('User Message:', processedError.userMessage);
    console.error('Technical Details:', error);
    if (context.fileId) console.log('File ID:', context.fileId);
    if (context.fileName) console.log('File Name:', context.fileName);
    if (context.userId) console.log('User ID:', context.userId);
    if (context.technicalDetails) console.log('Context:', context.technicalDetails);
    console.groupEnd();
  }
}

// Instancia singleton
export const errorHandler = ErrorHandler.getInstance();
