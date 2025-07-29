
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, TrendingUp } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import FilesList from '@/components/FilesList';

const UploadPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              {t('upload.fileManagement')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('upload.uploadProcessAnalyze')}
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {t('upload.uploadFile')}
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('upload.myFiles')}
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
                        {t('upload.analysisTypes')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{t('upload.statisticalAnalysis')}</h4>
                        <p className="text-xs text-muted-foreground">
                          {t('upload.statisticalAnalysisDesc')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{t('upload.patternDetection')}</h4>
                        <p className="text-xs text-muted-foreground">
                          {t('upload.patternDetectionDesc')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{t('upload.clustering')}</h4>
                        <p className="text-xs text-muted-foreground">
                          {t('upload.clusteringDesc')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{t('upload.recommendations')}</h4>
                        <p className="text-xs text-muted-foreground">
                          {t('upload.recommendationsDesc')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('upload.supportedFormatsTitle')}</CardTitle>
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
