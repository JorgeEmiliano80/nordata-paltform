
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, X, AlertCircle, Shield, FileX } from 'lucide-react';
import { useFiles } from '@/hooks/useFiles';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadComplete?: (fileId: string) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  className?: string;
}

interface ValidationError {
  type: 'file_type' | 'file_size' | 'file_extension' | 'mime_type';
  message: string;
  fileName: string;
}

// Configuración estricta de tipos de archivo permitidos
const ALLOWED_FILE_TYPES = {
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/json': ['.json']
};

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.json'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  acceptedFileTypes = ALLOWED_EXTENSIONS,
  maxFileSize = MAX_FILE_SIZE,
  className
}) => {
  const { uploadFile, uploading, validating } = useFiles();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationProgress, setValidationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationStats, setValidationStats] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // Validación estricta de archivos
  const validateFile = (file: File): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Validar tamaño
    if (file.size > maxFileSize) {
      errors.push({
        type: 'file_size',
        message: `El archivo excede el tamaño máximo de ${Math.round(maxFileSize / (1024 * 1024))}MB. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        fileName: file.name
      });
    }
    
    // Validar extensión
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      errors.push({
        type: 'file_extension',
        message: `Extensión de archivo no válida: ${fileExtension}. Extensiones permitidas: ${ALLOWED_EXTENSIONS.join(', ')}`,
        fileName: file.name
      });
    }
    
    // Validar tipo MIME
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      errors.push({
        type: 'mime_type',
        message: `Tipo de archivo no válido: ${file.type}. Tipos permitidos: CSV, Excel (XLS/XLSX), JSON`,
        fileName: file.name
      });
    }
    
    // Validar correspondencia entre MIME type y extensión
    const allowedExtensionsForMime = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];
    if (allowedExtensionsForMime && !allowedExtensionsForMime.includes(fileExtension)) {
      errors.push({
        type: 'file_type',
        message: `El tipo de archivo no coincide con su extensión. Archivo: ${file.type}, Extensión: ${fileExtension}`,
        fileName: file.name
      });
    }
    
    return errors;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    setSuccess(false);
    setValidationStats(null);
    setValidationErrors([]);
    setCurrentFile(null);

    // Verificar archivos rechazados por react-dropzone
    if (rejectedFiles.length > 0) {
      const rejectedMessages = rejectedFiles.map(file => {
        const errorMessages = file.errors.map((err: any) => {
          if (err.code === 'file-too-large') {
            return `Archivo muy grande: ${formatFileSize(file.file.size)} (máximo: ${Math.round(maxFileSize / (1024 * 1024))}MB)`;
          }
          if (err.code === 'file-invalid-type') {
            return `Tipo de archivo no válido: ${file.file.type}`;
          }
          return err.message;
        });
        return `${file.file.name}: ${errorMessages.join(', ')}`;
      });
      
      setError(`Archivos rechazados:\n${rejectedMessages.join('\n')}`);
      return;
    }

    // Procesar el primer archivo
    const file = acceptedFiles[0];
    if (!file) return;

    setCurrentFile(file);

    // Validación estricta personalizada
    const fileValidationErrors = validateFile(file);
    
    if (fileValidationErrors.length > 0) {
      setValidationErrors(fileValidationErrors);
      setError(`Archivo inválido: ${fileValidationErrors.map(e => e.message).join('; ')}`);
      setCurrentFile(null);
      return;
    }

    try {
      // Simular progreso de validación
      setValidationProgress(0);
      const validationInterval = setInterval(() => {
        setValidationProgress(prev => {
          if (prev >= 90) {
            clearInterval(validationInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 200);

      // Simular progreso de subida después de validación
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const result = await uploadFile(file);

      clearInterval(validationInterval);
      clearInterval(progressInterval);
      setValidationProgress(100);
      setUploadProgress(100);

      if (result.success) {
        setSuccess(true);
        if (result.validationResult?.stats) {
          setValidationStats(result.validationResult.stats);
        }
        if (onUploadComplete && result.fileId) {
          onUploadComplete(result.fileId);
        }
      } else {
        const errorMsg = result.validationErrors 
          ? `Errores de validación: ${result.validationErrors.slice(0, 2).map(e => e.message).join('; ')}`
          : 'Error al subir el archivo';
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error inesperado al subir el archivo');
    } finally {
      if (!success) {
        setCurrentFile(null);
      }
    }
  }, [uploadFile, onUploadComplete, maxFileSize, success]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES,
    maxSize: maxFileSize,
    multiple: false,
    disabled: uploading || validating
  });

  const resetUpload = () => {
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    setValidationProgress(0);
    setValidationStats(null);
    setValidationErrors([]);
    setCurrentFile(null);
  };

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir Archivo
          {(validating || uploading) && (
            <Shield className="h-4 w-4 text-primary animate-pulse" />
          )}
        </CardTitle>
        <CardDescription>
          Sube archivos CSV, Excel (XLS/XLSX) o JSON para su análisis. 
          {validating && " Validando estructura y contenido..."}
          {uploading && !validating && " Subiendo archivo..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Información de archivo actual */}
        {currentFile && !error && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">{currentFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(currentFile.size)} • {currentFile.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Válido</span>
              </div>
            </div>
          </div>
        )}

        {/* Área de drop */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
            (uploading || validating) && "opacity-50 cursor-not-allowed",
            validationErrors.length > 0 && "border-destructive bg-destructive/5"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              {validating ? (
                <Shield className="h-6 w-6 text-primary animate-pulse" />
              ) : validationErrors.length > 0 ? (
                <FileX className="h-6 w-6 text-destructive" />
              ) : (
                <FileText className="h-6 w-6 text-primary" />
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragActive
                  ? "Suelta el archivo aquí"
                  : validating
                  ? "Validando archivo..."
                  : uploading
                  ? "Subiendo archivo..."
                  : "Arrastra y suelta un archivo aquí, o haz clic para seleccionar"
                }
              </p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  <strong>Tipos aceptados:</strong> CSV, Excel (XLS/XLSX), JSON
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Tamaño máximo:</strong> {Math.round(maxFileSize / (1024 * 1024))}MB
                </p>
                <p className="text-xs text-primary font-medium">
                  ✓ Validación automática de estructura y contenido
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Errores de validación detallados */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <FileX className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Archivo no válido:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Progreso de validación */}
        {validating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Validando archivo...
              </span>
              <span>{validationProgress}%</span>
            </div>
            <Progress value={validationProgress} className="w-full" />
          </div>
        )}

        {/* Progreso de subida */}
        {uploading && !validating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subiendo archivo...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Estadísticas de validación */}
        {validationStats && success && (
          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="font-medium mb-1">Archivo validado exitosamente:</div>
              <div className="text-sm">
                • {validationStats.totalRows} filas procesadas
                <br />
                • {validationStats.totalColumns} columnas detectadas
                {validationStats.emptyRows > 0 && (
                  <>
                    <br />
                    • {validationStats.emptyRows} filas vacías omitidas
                  </>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Mensaje de error general */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="whitespace-pre-line">{error}</div>
            </AlertDescription>
          </Alert>
        )}

        {/* Mensaje de éxito */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Archivo subido y validado exitosamente
            </AlertDescription>
          </Alert>
        )}

        {/* Botón de reset */}
        {(error || success) && (
          <Button
            variant="outline"
            onClick={resetUpload}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Subir Otro Archivo
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
