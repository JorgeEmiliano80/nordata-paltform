
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Database, 
  Mail, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const AdminSystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoProcessFiles: true,
    maintenanceMode: false,
    maxFileSize: '100',
    allowedFileTypes: 'csv,xlsx,json,pdf',
    systemMessage: '',
    databricksIntegration: true,
    invitationExpiry: '7'
  });

  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    // Simular guardado de configuraciones
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Configuraciones guardadas exitosamente');
    setLoading(false);
  };

  const handleTestConnection = async () => {
    setLoading(true);
    // Simular prueba de conexión
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Conexión exitosa con todos los servicios');
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Estado del Sistema
          </CardTitle>
          <CardDescription>
            Monitoreo de servicios críticos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Base de Datos</div>
                <div className="text-sm text-green-600">Operativa</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Databricks</div>
                <div className="text-sm text-green-600">Conectado</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Email Service</div>
                <div className="text-sm text-green-600">Activo</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleTestConnection} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Probar Conexiones
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configuraciones Generales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Notificaciones por Email</Label>
                  <p className="text-sm text-muted-foreground">Enviar notificaciones automáticas</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoProcessFiles">Auto-procesamiento</Label>
                  <p className="text-sm text-muted-foreground">Procesar archivos automáticamente</p>
                </div>
                <Switch
                  id="autoProcessFiles"
                  checked={settings.autoProcessFiles}
                  onCheckedChange={(checked) => setSettings({...settings, autoProcessFiles: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceMode">Modo Mantenimiento</Label>
                  <p className="text-sm text-muted-foreground">Bloquear acceso temporal</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="maxFileSize">Tamaño Máximo de Archivo (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="allowedFileTypes">Tipos de Archivo Permitidos</Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes}
                  onChange={(e) => setSettings({...settings, allowedFileTypes: e.target.value})}
                  placeholder="csv,xlsx,json,pdf"
                />
              </div>

              <div>
                <Label htmlFor="invitationExpiry">Expiración de Invitaciones (días)</Label>
                <Input
                  id="invitationExpiry"
                  type="number"
                  value={settings.invitationExpiry}
                  onChange={(e) => setSettings({...settings, invitationExpiry: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="systemMessage">Mensaje del Sistema</Label>
            <Textarea
              id="systemMessage"
              value={settings.systemMessage}
              onChange={(e) => setSettings({...settings, systemMessage: e.target.value})}
              placeholder="Mensaje que aparecerá en el dashboard de usuarios"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Configuraciones de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Las configuraciones de seguridad están gestionadas automáticamente por Supabase Auth. 
              Los tokens de sesión se renuevan automáticamente y las políticas RLS están activas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          <Save className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Guardando...' : 'Guardar Configuraciones'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSystemSettings;
