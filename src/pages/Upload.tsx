import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Database, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import Navbar from "@/components/Navbar";

interface ProcessedFile {
  file: File;
  data: any[];
  insights: string[];
  columns: string[];
  status: 'processing' | 'completed' | 'error';
}

const UploadPage = () => {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<ProcessedFile[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File): Promise<ProcessedFile> => {
    const processedFile: ProcessedFile = {
      file,
      data: [],
      insights: [],
      columns: [],
      status: 'processing'
    };

    try {
      let data: any[] = [];
      const fileType = file.name.split('.').pop()?.toLowerCase();

      if (fileType === 'csv') {
        // Process CSV
        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        data = result.data;
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        // Process Excel
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else if (fileType === 'json') {
        // Process JSON
        const text = await file.text();
        data = JSON.parse(text);
      }

      processedFile.data = data;
      processedFile.columns = data.length > 0 ? Object.keys(data[0]) : [];
      
      // Generate insights
      processedFile.insights = generateInsights(data, processedFile.columns);
      processedFile.status = 'completed';
      
    } catch (error) {
      processedFile.status = 'error';
      processedFile.insights = ['Erro ao processar arquivo. Verifique o formato.'];
    }

    return processedFile;
  };

  const generateInsights = (data: any[], columns: string[]): string[] => {
    const insights: string[] = [];
    
    if (data.length === 0) return ['Arquivo vazio'];

    insights.push(`📊 Total de registros: ${data.length.toLocaleString('pt-BR')}`);
    insights.push(`📋 Colunas identificadas: ${columns.length}`);

    // Detect sales/revenue columns
    const revenueColumns = columns.filter(col => 
      /valor|preco|price|revenue|vendas|total|amount/i.test(col)
    );
    if (revenueColumns.length > 0) {
      insights.push(`💰 Colunas de valores detectadas: ${revenueColumns.join(', ')}`);
      
      // Calculate total revenue if possible
      const totalRevenue = data.reduce((sum, row) => {
        const value = parseFloat(row[revenueColumns[0]]) || 0;
        return sum + value;
      }, 0);
      
      if (totalRevenue > 0) {
        insights.push(`💵 Receita total: R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      }
    }

    // Detect customer columns
    const customerColumns = columns.filter(col => 
      /cliente|customer|nome|name|email/i.test(col)
    );
    if (customerColumns.length > 0) {
      insights.push(`👥 Colunas de clientes identificadas: ${customerColumns.join(', ')}`);
      
      // Count unique customers
      const uniqueCustomers = new Set(data.map(row => row[customerColumns[0]]));
      insights.push(`🎯 Clientes únicos: ${uniqueCustomers.size.toLocaleString('pt-BR')}`);
    }

    // Detect date columns
    const dateColumns = columns.filter(col => 
      /data|date|created|updated/i.test(col)
    );
    if (dateColumns.length > 0) {
      insights.push(`📅 Colunas de data identificadas: ${dateColumns.join(', ')}`);
    }

    return insights;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      await processFiles(files);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ['csv', 'xlsx', 'xls', 'json'].includes(ext || '');
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Alguns arquivos foram ignorados",
        description: "Apenas arquivos CSV, Excel e JSON são suportados",
        variant: "destructive"
      });
    }

    for (const file of validFiles) {
      const processedFile = await processFile(file);
      setUploadedFiles(prev => [...prev, processedFile]);
      
      if (processedFile.status === 'completed') {
        toast({
          title: "Arquivo processado com sucesso",
          description: `${file.name} foi analisado e insights foram gerados`,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Upload de Dados</h1>
            <p className="text-muted-foreground">
              Carregue seus arquivos de dados para começar a análise. Suporte para CSV, Excel e JSON
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Upload de Arquivos</span>
                </CardTitle>
                <CardDescription>
                  Arraste e solte os arquivos ou clique para selecionar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                    dragActive 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Solte os arquivos aqui</p>
                  <p className="text-muted-foreground mb-4">
                    Ou clique para selecionar arquivos
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                    accept=".csv,.xlsx,.xls,.json"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer">
                      Procurar Arquivos
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* File Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Arquivos Processados</span>
                </CardTitle>
                <CardDescription>
                  Arquivos carregados e seus insights automáticos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum arquivo carregado ainda
                    </p>
                  ) : (
                    uploadedFiles.map((processedFile, index) => (
                      <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Database className="w-5 h-5 text-data-flow" />
                            <div>
                              <p className="font-medium">{processedFile.file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(processedFile.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          {processedFile.status === 'completed' && <CheckCircle className="w-5 h-5 text-success" />}
                          {processedFile.status === 'error' && <AlertCircle className="w-5 h-5 text-error" />}
                          {processedFile.status === 'processing' && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                        </div>
                        
                        {processedFile.insights.length > 0 && (
                          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                            <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-accent" />
                              <span>Insights Automáticos</span>
                            </h4>
                            <ul className="space-y-1">
                              {processedFile.insights.map((insight, i) => (
                                <li key={i} className="text-sm text-muted-foreground">{insight}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {uploadedFiles.some(f => f.status === 'completed') && (
                  <div className="mt-6">
                    <Button variant="hero" className="w-full">
                      Criar Dashboard Personalizado
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Fluxos de trabalho comuns para análise de dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Database className="w-8 h-8" />
                    <span>Validação de Dados</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <FileText className="w-8 h-8" />
                    <span>Conversão de Formato</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <CheckCircle className="w-8 h-8" />
                    <span>Verificação de Qualidade</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;