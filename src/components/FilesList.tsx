
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Play, 
  Trash2, 
  Eye, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { useFiles } from '@/hooks/useFiles';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const FilesList: React.FC = () => {
  const { files, loading, processFile, deleteFile, getFileInsights } = useFiles();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const handleProcessFile = async (fileId: string) => {
    setProcessingFiles(prev => new Set(prev).add(fileId));
    
    try {
      const result = await processFile(fileId);
      if (result.success) {
        // El archivo se actualizará automáticamente via refetch
      }
    } finally {
      setProcessingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingFiles(prev => new Set(prev).add(fileId));
    
    try {
      const result = await deleteFile(fileId);
      if (result.success) {
        // El archivo se eliminará automáticamente via refetch
      }
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleViewInsights = async (fileId: string) => {
    setSelectedFile(fileId);
    setLoadingInsights(true);
    
    try {
      const fileInsights = await getFileInsights(fileId);
      setInsights(fileInsights);
    } finally {
      setLoadingInsights(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploaded':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Subido
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Procesando
          </Badge>
        );
      case 'done':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completado
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No hay archivos subidos. Sube tu primer archivo para comenzar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Archivos</h2>
        <Badge variant="outline" className="text-sm">
          {files.length} archivo{files.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {files.map((file) => (
          <Card key={file.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{file.file_name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(file.uploaded_at), 'PPp', { locale: es })}
                      </span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(file.status)}
              </div>
            </CardHeader>

            <CardContent>
              {file.status === 'error' && file.error_message && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{file.error_message}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {/* Botón de procesar */}
                {file.status === 'uploaded' && (
                  <Button
                    onClick={() => handleProcessFile(file.id)}
                    disabled={processingFiles.has(file.id)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {processingFiles.has(file.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Procesar
                  </Button>
                )}

                {/* Botón de ver resultados */}
                {file.status === 'done' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewInsights(file.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Resultados
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Resultados de {file.file_name}</DialogTitle>
                        <DialogDescription>
                          Insights generados del procesamiento de datos
                        </DialogDescription>
                      </DialogHeader>
                      
                      {loadingInsights ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : insights.length > 0 ? (
                        <div className="space-y-4">
                          {insights.map((insight) => (
                            <Card key={insight.id} className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{insight.title}</h4>
                                <Badge variant="outline">{insight.insight_type}</Badge>
                              </div>
                              {insight.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {insight.description}
                                </p>
                              )}
                              {insight.confidence_score && (
                                <p className="text-xs text-muted-foreground">
                                  Confianza: {(insight.confidence_score * 100).toFixed(1)}%
                                </p>
                              )}
                              {insight.data && Object.keys(insight.data).length > 0 && (
                                <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                                  {JSON.stringify(insight.data, null, 2)}
                                </pre>
                              )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No se encontraron insights para este archivo
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                )}

                {/* Botón de descargar */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(file.storage_url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>

                {/* Botón de eliminar */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteFile(file.id)}
                  disabled={deletingFiles.has(file.id)}
                >
                  {deletingFiles.has(file.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FilesList;
