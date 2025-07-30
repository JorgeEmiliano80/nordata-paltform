
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Users, Search, Filter, MoreVertical, Mail, Phone, Calendar, DollarSign, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Customer {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  segment?: string;
  risk_level: string;
  total_spent: number;
  total_orders: number;
  last_purchase_date?: string;
  created_at: string;
}

const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        toast.error('Error al cargar clientes');
        return;
      }

      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === '' || 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSegment = segmentFilter === 'all' || customer.segment === segmentFilter;
    const matchesRisk = riskFilter === 'all' || customer.risk_level === riskFilter;
    
    return matchesSearch && matchesSegment && matchesRisk;
  });

  const uniqueSegments = [...new Set(customers.map(c => c.segment).filter(Boolean))];
  const uniqueRiskLevels = [...new Set(customers.map(c => c.risk_level))];

  const getSegmentColor = (segment: string | undefined) => {
    switch (segment) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'regular': return 'bg-green-100 text-green-800';
      case 'new': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'alto': return 'bg-red-100 text-red-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'bajo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Base de Clientes</h2>
          <p className="text-muted-foreground">
            Gestiona y analiza tu cartera de clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por segmento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los segmentos</SelectItem>
            {uniqueSegments.map(segment => (
              <SelectItem key={segment} value={segment}>
                {segment?.charAt(0).toUpperCase() + segment?.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por riesgo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            {uniqueRiskLevels.map(risk => (
              <SelectItem key={risk} value={risk}>
                Riesgo {risk}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Users className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Cargando clientes...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay clientes</h3>
            <p className="text-muted-foreground text-center">
              {customers.length === 0 
                ? 'Importa un archivo con datos de clientes para comenzar.'
                : 'No se encontraron clientes con los filtros actuales.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{customer.name || 'Sin nombre'}</CardTitle>
                      <CardDescription>{customer.email || 'Sin email'}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Contactar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className="h-4 w-4 mr-2" />
                        Llamar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {customer.segment && (
                        <Badge className={getSegmentColor(customer.segment)}>
                          {customer.segment.charAt(0).toUpperCase() + customer.segment.slice(1)}
                        </Badge>
                      )}
                      <Badge className={getRiskColor(customer.risk_level)}>
                        Riesgo {customer.risk_level}
                      </Badge>
                    </div>
                    {customer.age && (
                      <span className="text-sm text-muted-foreground">
                        {customer.age} años
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">${customer.total_spent.toLocaleString()}</p>
                        <p className="text-muted-foreground">Total gastado</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{customer.total_orders}</p>
                        <p className="text-muted-foreground">Pedidos</p>
                      </div>
                    </div>
                  </div>

                  {customer.last_purchase_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Última compra: {new Date(customer.last_purchase_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    ID: {customer.customer_id}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomersList;
