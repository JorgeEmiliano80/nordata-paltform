
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mail, Eye, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerActionsProps {
  customer: any;
  onAction?: (action: string, customerId: string) => void;
}

const CustomerActions: React.FC<CustomerActionsProps> = ({ customer, onAction }) => {
  const handleViewDetails = () => {
    toast.info(`Abriendo detalles de ${customer.name}`, {
      description: 'Función de vista detallada próximamente disponible'
    });
    onAction?.('view_details', customer.id);
  };

  const handleSendEmail = () => {
    toast.success(`Email enviado a ${customer.name}`, {
      description: `Mensaje enviado a ${customer.email}`
    });
    onAction?.('send_email', customer.id);
  };

  const handleReactivate = () => {
    toast.success(`Cliente ${customer.name} reactivado`, {
      description: 'Se ha iniciado una campaña de reactivación'
    });
    onAction?.('reactivate', customer.id);
  };

  return (
    <div className="flex justify-end space-x-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={handleViewDetails}>
            <Eye className="h-4 w-4 mr-1" />
            Ver Detalles
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
            <DialogDescription>
              Información completa de {customer.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Nombre</p>
                <p className="text-sm text-muted-foreground">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Teléfono</p>
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Ciudad</p>
                <p className="text-sm text-muted-foreground">{customer.city}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Segmento</p>
                <Badge variant="secondary">{customer.segment}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Estado</p>
                <Badge variant="secondary">{customer.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Total Compras</p>
                <p className="text-sm text-muted-foreground">
                  R$ {customer.totalPurchases?.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Pedidos</p>
                <p className="text-sm text-muted-foreground">{customer.orders}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="sm" onClick={handleSendEmail}>
        <Mail className="h-4 w-4 mr-1" />
        Enviar Email
      </Button>

      {customer.status === "Em Risco" && (
        <Button variant="default" size="sm" onClick={handleReactivate}>
          <UserCheck className="h-4 w-4 mr-1" />
          Reactivar
        </Button>
      )}
    </div>
  );
};

export default CustomerActions;
