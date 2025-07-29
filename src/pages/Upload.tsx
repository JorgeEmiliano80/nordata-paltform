
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Database, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import FileUpload from "@/components/FileUpload";
import FilesList from "@/components/FilesList";
import { useFiles } from "@/hooks/useFiles";
import { useAuth } from "@/hooks/useAuth";

const UploadPage = () => {
  const { user } = useAuth();
  const { getFileStats } = useFiles(user?.id);
  const stats = getFileStats();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Upload de Dados</h1>
            <p className="text-muted-foreground">
              Carregue seus arquivos de dados para análise automática e geração de insights
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Arquivos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.done} processados com sucesso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Processamento</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.processing}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.uploaded} aguardando processamento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Insights Gerados</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInsights}</div>
                <p className="text-xs text-muted-foreground">
                  Insights automáticos criados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Com Erro</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.error}</div>
                <p className="text-xs text-muted-foreground">
                  Necessitam reprocessamento
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <div>
              <FileUpload />
            </div>

            {/* Process Information */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Como Funciona</CardTitle>
                  <CardDescription>
                    Processo automático de análise de dados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium">Upload Seguro</h4>
                        <p className="text-sm text-gray-600">
                          Seu arquivo é enviado com segurança para nosso storage
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium">Processamento IA</h4>
                        <p className="text-sm text-gray-600">
                          Databricks processa seus dados usando inteligência artificial
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium">Insights Gerados</h4>
                        <p className="text-sm text-gray-600">
                          Receba insights automáticos e análises detalhadas
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium">Chat Interativo</h4>
                        <p className="text-sm text-gray-600">
                          Converse com a IA sobre seus dados processados
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Files List */}
          <div className="mt-8">
            <FilesList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
