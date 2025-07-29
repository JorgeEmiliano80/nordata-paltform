
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Zap, CheckCircle, Clock, AlertCircle, Database, Brain } from 'lucide-react';
import Navbar from '@/components/Navbar';

const UploadPage = () => {
  const [files, setFiles] = useState([
    { id: 1, name: 'ventas_2024.csv', status: 'done', size: '2.3 MB', uploadedAt: '2024-01-15' },
    { id: 2, name: 'inventario.xlsx', status: 'processing', size: '1.8 MB', uploadedAt: '2024-01-15' },
    { id: 3, name: 'clientes.json', status: 'uploaded', size: '945 KB', uploadedAt: '2024-01-14' },
    { id: 4, name: 'productos.csv', status: 'error', size: '3.2 MB', uploadedAt: '2024-01-14' },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded': return <Clock className="h-4 w-4 text-warning" />;
      case 'processing': return <Zap className="h-4 w-4 text-data-flow animate-pulse" />;
      case 'done': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'bg-warning/10 text-warning border-warning/20';
      case 'processing': return 'bg-data-flow/10 text-data-flow border-data-flow/20';
      case 'done': return 'bg-success/10 text-success border-success/20';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const stats = {
    total: files.length,
    done: files.filter(f => f.status === 'done').length,
    processing: files.filter(f => f.status === 'processing').length,
    uploaded: files.filter(f => f.status === 'uploaded').length,
    error: files.filter(f => f.status === 'error').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Gestión de Archivos
            </h1>
            <p className="text-muted-foreground text-lg">
              Cargue y procese sus datos con inteligencia artificial
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Archivos cargados</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-data-flow/5 to-primary/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Procesando</CardTitle>
                <Zap className="h-4 w-4 text-data-flow" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.processing}</div>
                <p className="text-xs text-muted-foreground">En Databricks</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-success/5 to-primary/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completados</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.done}</div>
                <p className="text-xs text-muted-foreground">Listos para uso</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 to-warning/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Con Error</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.error}</div>
                <p className="text-xs text-muted-foreground">Requieren atención</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-primary" />
                  Subir Archivo
                </CardTitle>
                <CardDescription>
                  Formatos soportados: CSV, XLSX, JSON
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Arrastra y suelta tu archivo aquí, o haz clic para seleccionar
                  </p>
                  <Button variant="outline">
                    Seleccionar Archivo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Process Info */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-primary/5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-primary" />
                  Proceso de Análisis
                </CardTitle>
                <CardDescription>
                  Cómo procesamos sus datos
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Carga Segura</h4>
                    <p className="text-sm text-muted-foreground">
                      Archivo cifrado y almacenado en Supabase
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-data-flow/10 rounded-full flex items-center justify-center">
                    <span className="text-data-flow font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Procesamiento IA</h4>
                    <p className="text-sm text-muted-foreground">
                      Databricks analiza con algoritmos avanzados
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                    <span className="text-success font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Insights Generados</h4>
                    <p className="text-sm text-muted-foreground">
                      Resultados disponibles para consulta
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Files List */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-primary" />
                Archivos Recientes
              </CardTitle>
              <CardDescription>
                Estado de procesamiento de sus archivos
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border/50 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(file.status)}
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.size} • {file.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getStatusColor(file.status)}>
                        {file.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
