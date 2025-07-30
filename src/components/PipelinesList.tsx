
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Play, Pause, Edit, Trash2, MoreVertical, Search, Plus, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PipelineCreator from './PipelineCreator';

interface Pipeline {
  id: string;
  name: string;
  description: string;
  status: string;
  configuration: any;
  created_at: string;
  updated_at: string;
  dataset_id?: string;
}

const PipelinesList: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreator, setShowCreator] = useState(false);

  const fetchPipelines = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pipelines:', error);
        toast.error('Error al cargar pipelines');
        return;
      }

      setPipelines(data || []);
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      toast.error('Error al cargar pipelines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesSearch = searchTerm === '' || 
      pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pipeline.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || pipeline.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updatePipelineStatus = async (pipelineId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('pipelines')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', pipelineId);

      if (error) {
        console.error('Error updating pipeline:', error);
        toast.error('Error al actualizar pipeline');
        return;
      }

      toast.success('Pipeline actualizado exitosamente');
      fetchPipelines();
    } catch (error) {
      console.error('Error updating pipeline:', error);
      toast.error('Error al actualizar pipeline');
    }
  };

  const deletePipeline = async (pipelineId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este pipeline?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pipelines')
        .delete()
        .eq('id', pipelineId);

      if (error) {
        console.error('Error deleting pipeline:', error);
        toast.error('Error al eliminar pipeline');
        return;
      }

      toast.success('Pipeline eliminado exitosamente');
      fetchPipelines();
    } catch (error) {
      console.error('Error deleting pipeline:', error);
      toast.error('Error al eliminar pipeline');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'paused': return 'Pausado';
      case 'draft': return 'Borrador';
      case 'error': return 'Error';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mis Pipelines</h2>
          <p className="text-muted-foreground">
            Gestiona tus pipelines de procesamiento de datos
          </p>
        </div>
        <Button onClick={() => setShowCreator(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Pipeline
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pipelines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="paused">Pausado</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando pipelines...</p>
        </div>
      ) : filteredPipelines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay pipelines</h3>
            <p className="text-muted-foreground text-center mb-4">
              {pipelines.length === 0 
                ? 'Crea tu primer pipeline para comenzar a procesar datos.'
                : 'No se encontraron pipelines con los filtros actuales.'
              }
            </p>
            <Button onClick={() => setShowCreator(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Pipeline
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPipelines.map(pipeline => (
            <Card key={pipeline.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {pipeline.description || 'Sin descripción'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deletePipeline(pipeline.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getStatusColor(pipeline.status)}>
                    {getStatusLabel(pipeline.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(pipeline.updated_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {pipeline.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updatePipelineStatus(pipeline.id, 'paused')}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => updatePipelineStatus(pipeline.id, 'active')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Ejecutar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PipelineCreator
        open={showCreator}
        onOpenChange={setShowCreator}
        onSuccess={fetchPipelines}
      />
    </div>
  );
};

export default PipelinesList;
