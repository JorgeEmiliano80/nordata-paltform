
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import FileUpload from '@/components/FileUpload';
import FilesList from '@/components/FilesList';

const UploadPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Gestión de Archivos
            </h1>
            <p className="text-muted-foreground text-lg">
              Sube, procesa y analiza tus datos con inteligencia artificial
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Subir Archivo
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Mis Archivos
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Form */}
                <div className="lg:col-span-2">
                  <FileUpload />
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5" />
                        Tipos de Análisis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Análisis Estadístico</h4>
                        <p className="text-xs text-muted-foreground">
                          Resúmenes, distribuciones y métricas básicas
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Detección de Patrones</h4>
                        <p className="text-xs text-muted-foreground">
                          Tendencias, estacionalidad y anomalías
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Clustering</h4>
                        <p className="text-xs text-muted-foreground">
                          Agrupación automática de datos similares
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Recomendaciones</h4>
                        <p className="text-xs text-muted-foreground">
                          Sugerencias basadas en tus datos
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Formatos Soportados</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        <span>CSV (Comma Separated Values)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        <span>JSON (JavaScript Object Notation)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        <span>XLSX (Excel)</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files">
              <FilesList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
