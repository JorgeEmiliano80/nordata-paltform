
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileValidator, ValidationResult, CUSTOMER_DATA_CONFIG } from '@/validators/fileValidator';
import { errorHandler } from '@/lib/errorHandler';

export interface FileRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_url: string;
  status: 'uploaded' | 'processing' | 'done' | 'error';
  created_at: string;
  updated_at: string;
  uploaded_at: string;
  processed_at: string | null;
  error_message: string | null;
  databricks_job_id: string | null;
  metadata: any;
}

// Configuración estricta de validación
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel', 
  'application/json'
];

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.json'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);

  // Validación estricta previa al upload
  const validateFileStrict = (file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    console.log('🔍 Validación estricta:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });
    
    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`Archivo excede el tamaño máximo de ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    
    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push(`Tipo de archivo no válido: ${file.type}`);
    }
    
    // Validar extensión
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      errors.push(`Extensión de archivo no válida: ${fileExtension}`);
    }
    
    // Validar que el archivo no esté vacío
    if (file.size === 0) {
      errors.push('El archivo está vacío');
    }
    
    // Validar correspondencia MIME type - extensión
    const mimeExtensionMap: { [key: string]: string[] } = {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json']
    };
    
    const allowedExtensions = mimeExtensionMap[file.type];
    if (allowedExtensions && !allowedExtensions.includes(fileExtension)) {
      errors.push(`El tipo de archivo no coincide con su extensión`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setValidating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        errorHandler.handleError(
          new Error('Usuario no autenticado'), 
          { category: 'authentication', operation: 'upload' }
        );
        return { success: false };
      }

      console.log('🔍 Iniciando validación estricta del archivo...');
      
      // VALIDACIÓN ESTRICTA PREVIA
      const strictValidation = validateFileStrict(file);
      if (!strictValidation.isValid) {
        console.error('❌ Validación estricta falló:', strictValidation.errors);
        
        errorHandler.handleError(
          new Error(`Archivo no válido: ${strictValidation.errors.join('; ')}`),
          {
            category: 'validation',
            operation: 'strict_validation',
            fileName: file.name,
            userId: user.id,
            technicalDetails: {
              fileType: file.type,
              fileSize: file.size,
              errors: strictValidation.errors
            }
          }
        );
        
        return { 
          success: false, 
          validationErrors: strictValidation.errors.map(error => ({ message: error }))
        };
      }

      console.log('✅ Validación estricta exitosa, procediendo con validación profunda...');

      // Realizar validación profunda del contenido
      const validator = new FileValidator(CUSTOMER_DATA_CONFIG);
      const validationResult: ValidationResult = await validator.validateFile(file);
      
      setValidating(false);

      if (!validationResult.isValid) {
        console.error('❌ Validación de contenido falló:', validationResult.errors);
        
        const processedError = errorHandler.handleValidationError(
          validationResult.errors, 
          {
            category: 'validation',
            operation: 'content_validation',
            fileName: file.name,
            userId: user.id
          }
        );
        
        return { 
          success: false, 
          validationErrors: validationResult.errors,
          validationStats: validationResult.stats 
        };
      }

      // Mostrar advertencias si las hay
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        validationResult.warnings.forEach(warning => {
          errorHandler.showWarning(warning);
        });
      }

      // Mostrar estadísticas de validación
      if (validationResult.stats) {
        console.log('📊 Estatísticas do arquivo:', validationResult.stats);
        errorHandler.showSuccess(
          `Arquivo validado: ${validationResult.stats.totalRows} linhas, ${validationResult.stats.totalColumns} colunas`
        );
      }

      console.log('✅ Arquivo validado corretamente, procedendo com upload...');

      // Subir archivo a Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('data-files')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        errorHandler.handleError(uploadError, {
          category: 'upload',
          operation: 'storage_upload',
          fileName: file.name,
          userId: user.id
        });
        return { success: false };
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('data-files')
        .getPublicUrl(fileName);

      // Guardar información del archivo en la base de datos con metadata de validación
      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_url: publicUrl,
          status: 'uploaded',
          metadata: {
            original_name: file.name,
            upload_timestamp: new Date().toISOString(),
            validation_stats: validationResult.stats,
            validation_warnings: validationResult.warnings,
            strict_validation_passed: true,
            content_validation_passed: true,
            file_hash: await generateFileHash(file),
            browser_validation: {
              mime_type: file.type,
              file_extension: '.' + file.name.split('.').pop()?.toLowerCase(),
              last_modified: new Date(file.lastModified).toISOString()
            }
          }
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error saving file record:', dbError);
        errorHandler.handleError(dbError, {
          category: 'supabase',
          operation: 'save_file_record',
          fileName: file.name,
          userId: user.id
        });
        return { success: false };
      }

      errorHandler.showSuccess('Arquivo enviado e validado com sucesso');
      return { 
        success: true, 
        fileId: fileRecord.id,
        validationResult
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      errorHandler.handleError(error, {
        category: 'upload',
        operation: 'upload_file',
        fileName: file.name
      });
      return { success: false };
    } finally {
      setUploading(false);
      setValidating(false);
    }
  };

  // Generar hash simple del archivo para verificación de integridad
  const generateFileHash = async (file: File): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.warn('Error generating file hash:', error);
      return 'hash_unavailable';
    }
  };

  return {
    uploading,
    validating,
    uploadFile
  };
};
