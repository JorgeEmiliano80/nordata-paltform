
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from '@/components/FileUpload';
import FilesList from '@/components/FilesList';
import { Upload as UploadIcon, Files, Activity } from 'lucide-react';

const Upload = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Datos</h1>
          <p className="text-muted-foreground">
            Sube y gestiona tus archivos de datos para análisis
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <UploadIcon className="h-4 w-4" />
              Subir Archivos
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Files className="h-4 w-4" />
              Archivos Subidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadIcon className="h-5 w-5" />
                  Subir Nuevos Archivos
                </CardTitle>
                <CardDescription>
                  Arrastra y suelta archivos aquí o haz clic para explorar. Formatos soportados: CSV, JSON, XLSX
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Files className="h-5 w-5" />
                  Archivos Subidos
                </CardTitle>
                <CardDescription>
                  Gestiona y revisa el estado de tus archivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FilesList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Upload;
