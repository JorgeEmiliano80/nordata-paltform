
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Mail, Link, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AdminUserInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteUser: (email: string, fullName: string, companyName: string, industry: string, temporaryPassword: string) => Promise<any>;
  loading: boolean;
}

const AdminUserInviteDialog: React.FC<AdminUserInviteDialogProps> = ({
  open,
  onOpenChange,
  onInviteUser,
  loading
}) => {
  const [inviteForm, setInviteForm] = useState({
    email: '',
    fullName: '',
    companyName: '',
    industry: '',
    temporaryPassword: '',
  });

  const [inviteResult, setInviteResult] = useState<any>(null);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInviteForm({ ...inviteForm, temporaryPassword: password });
  };

  const handleSubmit = async () => {
    if (!inviteForm.email || !inviteForm.fullName || !inviteForm.temporaryPassword) {
      toast.error('Email, nombre completo y contraseña son requeridos');
      return;
    }

    const result = await onInviteUser(
      inviteForm.email,
      inviteForm.fullName,
      inviteForm.companyName,
      inviteForm.industry,
      inviteForm.temporaryPassword
    );

    if (result.success) {
      setInviteResult(result);
    }
  };

  const handleClose = () => {
    setInviteForm({ email: '', fullName: '', companyName: '', industry: '', temporaryPassword: '' });
    setInviteResult(null);
    onOpenChange(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  if (inviteResult) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Usuario Creado Exitosamente</DialogTitle>
            <DialogDescription>
              El usuario ha sido creado. Comparte estos datos de acceso con {inviteForm.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {inviteResult.emailSent ? (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Mail className="h-5 w-5" />
                    Email Enviado Exitosamente
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Se envió un email automático a {inviteForm.email} con las credenciales de acceso.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <AlertCircle className="h-5 w-5" />
                    Envío Manual Requerido
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    El email automático falló. Comparte manualmente los datos de acceso con el usuario.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Credenciales de Acceso</CardTitle>
                <CardDescription>
                  Datos que el usuario necesita para acceder por primera vez
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Email de acceso</Label>
                    <div className="flex items-center gap-2">
                      <Input value={inviteForm.email} readOnly />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(inviteForm.email)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Contraseña temporal</Label>
                    <div className="flex items-center gap-2">
                      <Input value={inviteForm.temporaryPassword} readOnly />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(inviteForm.temporaryPassword)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>URL de acceso</Label>
                    <div className="flex items-center gap-2">
                      <Input value={`${window.location.origin}/login`} readOnly />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`${window.location.origin}/login`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Instrucciones para el usuario:</strong><br />
                    1. Accede a la URL de login<br />
                    2. Usa tu email y la contraseña temporal proporcionada<br />
                    3. Se te pedirá cambiar la contraseña en el primer acceso<br />
                    4. Completa tu perfil con la información de tu empresa
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Crea un usuario con acceso inmediato a la plataforma
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@empresa.com"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo *</Label>
            <Input
              id="fullName"
              placeholder="Juan Pérez"
              value={inviteForm.fullName}
              onChange={(e) => setInviteForm({...inviteForm, fullName: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Empresa</Label>
            <Input
              id="companyName"
              placeholder="Empresa SA"
              value={inviteForm.companyName}
              onChange={(e) => setInviteForm({...inviteForm, companyName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industria</Label>
            <Input
              id="industry"
              placeholder="Tecnología"
              value={inviteForm.industry}
              onChange={(e) => setInviteForm({...inviteForm, industry: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temporaryPassword">Contraseña Temporal *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="temporaryPassword"
                type="text"
                placeholder="Contraseña temporal"
                value={inviteForm.temporaryPassword}
                onChange={(e) => setInviteForm({...inviteForm, temporaryPassword: e.target.value})}
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={generatePassword}
                disabled={loading}
              >
                Generar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              El usuario deberá cambiar esta contraseña en su primer acceso
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserInviteDialog;
