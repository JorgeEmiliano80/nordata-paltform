
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, X, AlertCircle, Shield } from 'lucide-react';
import { useFiles } from '@/hooks/useFiles';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadComplete?: (fileId: string) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  acceptedFileTypes = ['.csv', '.json', '.xlsx'],
  maxFileSize = 50 * 1024 * 1024, // 50MB
  className
}) => {
  const { uploadFile, uploading, validating } = useFiles();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationProgress, setValidationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationStats, setValidationStats] = useState<any>(null);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    setSuccess(false);
    setValidationStats(null);

    // Verificar archivos rechazados
    if (rejectedFiles.length > 0) {
      const rejectedReasons = rejectedFiles.map(file => 
        file.errors.map((err: any) => err.message).join(', ')
      );
      setError(`Archivos rechazados: ${rejectedReasons.join('; ')}`);
      return;
    }

    // Procesar el primer archivo
    const file = acceptedFiles[0];
    if (!file) return;

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
    }
  }, [uploadFile, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
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
          Sube archivos CSV, JSON o XLSX para su análisis. 
          {validating && " Validando estructura y contenido..."}
          {uploading && !validating && " Subiendo archivo..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área de drop */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
            (uploading || validating) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              {validating ? (
                <Shield className="h-6 w-6 text-primary animate-pulse" />
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
              <p className="text-xs text-muted-foreground">
                Tipos aceptados: {acceptedFileTypes.join(', ')} 
                <br />
                Tamaño máximo: {Math.round(maxFileSize / (1024 * 1024))}MB
                <br />
                <span className="text-primary font-medium">
                  ✓ Validación automática de estructura y contenido
                </span>
              </p>
            </div>
          </div>
        </div>

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

        {/* Mensaje de error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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
