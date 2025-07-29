
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo futurista */}
      <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-background to-warning/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.1)_1px,_transparent_0)] bg-[length:20px_20px] opacity-20" />
      
      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl text-center">
        <CardHeader className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <AlertTriangle className="h-16 w-16 text-warning animate-pulse" />
              <div className="absolute inset-0 h-16 w-16 bg-warning/20 rounded-full blur-md animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-6xl font-bold bg-gradient-to-r from-warning to-destructive bg-clip-text text-transparent">
              404
            </CardTitle>
            <CardDescription className="text-lg">
              Página no encontrada
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            La página que está buscando no existe o ha sido movida.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver Atrás
            </Button>
            
            <Link to="/dashboard" className="block">
              <Button 
                variant="hero"
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir al Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
