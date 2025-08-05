
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '@/services/authService';

const MasterSetup = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSetup = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Crear usuario master usando el servicio de auth
      const response = await authService.createMasterUser({
        email: 'iamjorgear80@gmail.com',
        password: 'Jorge41304254#',
        full_name: 'Jorge Emiliano',
        role: 'admin'
      });

      if (response.success) {
        setResult({
          success: true,
          message: 'Usuario master configurado exitosamente. Ahora puedes iniciar sesión con las credenciales del master.'
        });
      } else {
        setResult({
          success: false,
          message: response.message || 'Error al configurar usuario master'
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Error inesperado'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Setup Usuario Master</CardTitle>
          <CardDescription>
            Configura el usuario administrador principal de NordataPlatform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert className={`mb-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                {result.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Credenciales del Master:</h4>
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> iamjorgear80@gmail.com<br />
                <strong>Contraseña:</strong> Jorge41304254#<br />
                <strong>Nombre:</strong> Jorge Emiliano
              </p>
            </div>

            <Button 
              onClick={handleSetup} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Configurando...' : 'Configurar Usuario Master'}
            </Button>

            {result?.success && (
              <div className="text-center">
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/login'}
                  className="w-full"
                >
                  Ir a Login
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterSetup;
