import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomerSegmentation, ClientSegment } from '@/hooks/useCustomerSegmentation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useToast } from "@/hooks/use-toast";

const ClientSegmentsDashboard = () => {
  const { 
    loading, 
    clientSegments, 
    fetchClientSegments, 
    calculateSegmentation 
  } = useCustomerSegmentation();
  const [segments, setSegments] = useState<ClientSegment[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    const data = await fetchClientSegments();
    setSegments(data);
  };

  const handleRecalculateSegmentation = async () => {
    const result = await calculateSegmentation();
    if (result.success) {
      await loadSegments();
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Panel de Segmentación de Clientes</h2>
        <Button onClick={handleRecalculateSegmentation} disabled={loading}>
          {loading ? 'Calculando...' : 'Recalcular Segmentación'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Segments */}
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total de Segmentos</div>
          <div className="text-2xl font-bold">{segments.length}</div>
        </Card>

        {/* Average Score */}
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Score Promedio</div>
          <div className="text-2xl font-bold">
            {segments.length > 0 
              ? Math.round(
                  segments.reduce((sum, s) => sum + (Number((s as any).score) || 0), 0) / segments.length
                )
              : 0
            }
          </div>
        </Card>

        {/* High Value Clients */}
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Clientes Premium/VIP</div>
          <div className="text-2xl font-bold">
            {segments.filter(s => (s as any).segment === 'premium' || (s as any).segment === 'vip').length}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Table>
        <TableCaption>Lista detallada de segmentos de clientes.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Nombre del Segmento</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Clientes</TableHead>
            <TableHead>Actualizado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {segments.map((segment) => (
            <TableRow key={segment.segment_id}>
              <TableCell className="font-medium">{segment.segment_id}</TableCell>
              <TableCell>{segment.segment_name}</TableCell>
              <TableCell>{segment.segment_description}</TableCell>
              <TableCell>{segment.profiles?.company_name}</TableCell>
              <TableCell>{segment.segment_updated_at}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientSegmentsDashboard;
