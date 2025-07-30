
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Eye, Download, Filter, Search, FileText, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { useFiles } from '@/hooks/useFiles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

interface Insight {
  id: string;
  file_id: string;
  title: string;
  description: string;
  insight_type: string;
  confidence_score: number;
  data: any;
  created_at: string;
  file_name?: string;
}

const Insights = () => {
  const { files } = useFiles();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const fetchInsights = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('insights')
        .select(`
          *,
          files (file_name)
        `)
        .order('created_at', { ascending: false });

      if (selectedFile !== 'all') {
        query = query.eq('file_id', selectedFile);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching insights:', error);
        toast.error('Error al cargar insights');
        return;
      }

      const insightsWithFileNames = data.map(insight => ({
        ...insight,
        file_name: insight.files?.file_name || 'Archivo desconocido'
      }));

      setInsights(insightsWithFileNames || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Error al cargar insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [selectedFile]);

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = searchTerm === '' || 
      insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || insight.insight_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const insightTypes = [...new Set(insights.map(i => i.insight_type))];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'anomaly': return <TrendingDown className="h-4 w-4" />;
      case 'summary': return <FileText className="h-4 w-4" />;
      case 'pattern': return <BarChart3 className="h-4 w-4" />;
      case 'distribution': return <PieIcon className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderInsightVisualization = (insight: Insight) => {
    if (!insight.data || !insight.data.chart_data) return null;

    const chartData = insight.data.chart_data;

    switch (insight.insight_type) {
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Insights de Datos</h1>
              <p className="text-muted-foreground">
                Análisis automáticos y descubrimientos de tus archivos procesados
              </p>
            </div>
            <Button onClick={fetchInsights} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              {loading ? 'Cargando...' : 'Actualizar'}
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedFile} onValueChange={setSelectedFile}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por archivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los archivos</SelectItem>
                {files.map(file => (
                  <SelectItem key={file.id} value={file.id}>
                    {file.file_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de insight" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {insightTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredInsights.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay insights disponibles</h3>
                <p className="text-muted-foreground text-center">
                  {insights.length === 0 
                    ? 'Sube y procesa archivos para generar insights automáticos.'
                    : 'No se encontraron insights con los filtros actuales.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredInsights.map(insight => (
                <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.insight_type)}
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <CardDescription>
                            {insight.file_name} • {new Date(insight.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {insight.insight_type.charAt(0).toUpperCase() + insight.insight_type.slice(1)}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={getConfidenceColor(insight.confidence_score)}
                        >
                          {Math.round(insight.confidence_score * 100)}% confianza
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {insight.description}
                    </p>
                    
                    {renderInsightVisualization(insight)}
                    
                    {insight.data && insight.data.key_metrics && (
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(insight.data.key_metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Insights;
