
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import Navbar from '@/components/Navbar';

const Unauthorized = () => {
  const { isAdmin, isClient } = useRole();

  const getRedirectPath = () => {
    if (isAdmin) return '/admin';
    if (isClient) return '/dashboard';
    return '/';
  };

  const getRedirectText = () => {
    if (isAdmin) return 'Ir ao Painel Admin';
    if (isClient) return 'Ir ao Dashboard';
    return 'Ir ao Início';
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Esta área requer privilégios específicos que sua conta atual não possui. 
              Entre em contato com o administrador se você acredita que isso é um erro.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link to={getRedirectPath()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {getRedirectText()}
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/">Voltar ao Início</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Unauthorized;
