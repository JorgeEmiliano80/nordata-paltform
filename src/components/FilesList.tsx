
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, Eye, Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFiles } from '@/hooks/useFiles';

const FilesList: React.FC = () => {
  const { files, isLoading, refetch, deleteFile, processFile } = useFiles();

  useEffect(() => {
    refetch();
  }, []);

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      refetch();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleProcess = async (fileId: string) => {
    try {
      await processFile(fileId);
      refetch();
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded': return <Upload className="h-4 w-4 text-primary" />;
      case 'processing': return <Clock className="h-4 w-4 text-warning animate-spin" />;
      case 'processed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'done': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-error" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'bg-primary/10 text-primary';
      case 'processing': return 'bg-warning/10 text-warning';
      case 'processed': return 'bg-success/10 text-success';
      case 'done': return 'bg-success/10 text-success';
      case 'error': return 'bg-error/10 text-error';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploaded': return 'Subido';
      case 'processing': return 'Procesando';
      case 'processed': return 'Completado';
      case 'done': return 'Completado';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Archivos</CardTitle>
          <CardDescription>Archivos subidos y procesados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Archivos</CardTitle>
        <CardDescription>
          Archivos subidos y procesados ({files.length})
        </CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay archivos</h3>
            <p className="text-muted-foreground">
              Sube tu primer archivo para comenzar el análisis
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(file.status)}
                  <div>
                    <h3 className="font-medium">{file.file_name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>{file.file_type}</span>
                      <span>
                        {format(new Date(file.uploaded_at), 'PPp', { locale: es })}
                      </span>
                    </div>
                    {file.error_message && (
                      <p className="text-sm text-error mt-1">
                        Error: {file.error_message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(file.status)}>
                    {getStatusText(file.status)}
                  </Badge>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    {file.status === 'uploaded' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleProcess(file.id)}
                      >
                        Procesar
                      </Button>
                    )}
                    {(file.status === 'processed' || file.status === 'done') && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilesList;
