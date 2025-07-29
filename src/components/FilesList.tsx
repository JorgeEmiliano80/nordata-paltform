
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, Download, Trash2, RefreshCw, Eye, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useFiles } from '@/hooks/useFiles';
import { useAuth } from '@/hooks/useAuth';

const FilesList = () => {
  const { user, isAdmin } = useAuth();
  const { files, loading, deleteFile, reprocessFile, downloadFile } = useFiles(user?.id);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Enviado</Badge>;
      case 'processing':
        return <Badge variant="default"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Processando</Badge>;
      case 'done':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Meus Arquivos
        </CardTitle>
        <CardDescription>
          Gerencie seus arquivos de dados e veja o status do processamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum arquivo encontrado
            </h3>
            <p className="text-gray-600">
              Faça upload do seu primeiro arquivo para começar
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Upload</TableHead>
                <TableHead>Insights</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {file.file_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{file.file_type.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(file.file_size)}</TableCell>
                  <TableCell>{getStatusBadge(file.status)}</TableCell>
                  <TableCell>{formatDate(file.uploaded_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span>{file.insights?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedFile(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Arquivo</DialogTitle>
                            <DialogDescription>
                              Informações detalhadas sobre {file.file_name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="font-medium">Nome:</p>
                                <p className="text-sm text-gray-600">{file.file_name}</p>
                              </div>
                              <div>
                                <p className="font-medium">Tipo:</p>
                                <p className="text-sm text-gray-600">{file.file_type.toUpperCase()}</p>
                              </div>
                              <div>
                                <p className="font-medium">Tamanho:</p>
                                <p className="text-sm text-gray-600">{formatFileSize(file.file_size)}</p>
                              </div>
                              <div>
                                <p className="font-medium">Status:</p>
                                {getStatusBadge(file.status)}
                              </div>
                            </div>
                            
                            {file.error_message && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="font-medium text-red-800">Erro:</p>
                                <p className="text-sm text-red-600">{file.error_message}</p>
                              </div>
                            )}

                            {file.insights && file.insights.length > 0 && (
                              <div>
                                <p className="font-medium mb-2">Insights Gerados:</p>
                                <div className="space-y-2">
                                  {file.insights.map((insight, index) => (
                                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                      <p className="font-medium text-blue-800">{insight.title}</p>
                                      {insight.description && (
                                        <p className="text-sm text-blue-600 mt-1">{insight.description}</p>
                                      )}
                                      <Badge variant="outline" className="mt-2">
                                        {insight.insight_type}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadFile(file.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      {(file.status === 'error' || isAdmin()) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => reprocessFile(file.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir "{file.file_name}"? 
                              Esta ação não pode ser desfeita e todos os insights relacionados serão perdidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteFile(file.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default FilesList;
