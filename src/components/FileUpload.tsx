
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useFiles } from '@/hooks/useFiles';
import { useAuth } from '@/hooks/useAuth';

const FileUpload = () => {
  const { user } = useAuth();
  const { uploadFile, uploading } = useFiles(user?.id);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      await uploadFile(file);
    }
  }, [uploadFile]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: uploading
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Arquivos
        </CardTitle>
        <CardDescription>
          Arraste e solte arquivos ou clique para selecionar. Formatos aceitos: CSV, Excel, JSON
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-300 hover:border-primary/50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-lg font-medium">Enviando arquivo...</p>
              <p className="text-sm text-muted-foreground">
                Por favor, aguarde enquanto processamos seu arquivo
              </p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-lg font-medium">Solte os arquivos aqui...</p>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">
                    Arraste e solte arquivos aqui
                  </p>
                  <p className="text-gray-600 mb-4">
                    ou clique para selecionar
                  </p>
                  <Button variant="outline">
                    Selecionar Arquivos
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {acceptedFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Arquivos Selecionados:</h4>
            <div className="space-y-2">
              {acceptedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Informações Importantes:</h4>
              <ul className="mt-2 text-sm text-blue-800 space-y-1">
                <li>• Tamanho máximo: 50MB por arquivo</li>
                <li>• Formatos aceitos: CSV, Excel (.xlsx, .xls), JSON</li>
                <li>• Processamento automático via Databricks</li>
                <li>• Você receberá notificações sobre o progresso</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
