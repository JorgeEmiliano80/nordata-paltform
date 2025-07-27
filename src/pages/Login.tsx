import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, BarChart3, Building2, Shield, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { User, Session } from '@supabase/supabase-js';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('token');
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [validatingToken, setValidatingToken] = useState(false);
  const navigate = useNavigate();
  
  const { user, signIn, signUp } = useAuth();

  // Verificar token de convite se presente
  useEffect(() => {
    if (invitationToken) {
      validateInvitationToken();
    }
  }, [invitationToken]);

  // Redirecionar se usuário já está logado
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateInvitationToken = async () => {
    if (!invitationToken) return;
    
    try {
      setValidatingToken(true);
      
      const { data, error } = await supabase
        .rpc('validate_invitation', { token: invitationToken });

      if (error) {
        toast.error('Erro ao validar convite');
        return;
      }

      if (data && typeof data === 'object' && 'valid' in data && data.valid) {
        setInvitationData(data);
        setEmail((data as any).email || '');
        setName((data as any).full_name || '');
        setCompany((data as any).company_name || '');
        setIndustry((data as any).industry || '');
        toast.success('Convite validado! Complete seu cadastro.');
      } else {
        toast.error((data as any)?.message || 'Token de convite inválido');
      }
    } catch (error: any) {
      console.error('Erro ao validar token:', error);
      toast.error('Erro ao validar convite');
    } finally {
      setValidatingToken(false);
    }
  };

  const industries = [
    "agronegocio",
    "varejo", 
    "automotriz",
    "industria",
    "ecommerce",
    "turismo",
    "tecnologia",
    "outros"
  ];

  const industryLabels: Record<string, string> = {
    agronegocio: "Agronegócio",
    varejo: "Varejo",
    automotriz: "Automotriz", 
    industria: "Indústria",
    ecommerce: "E-commerce",
    turismo: "Turismo",
    tecnologia: "TI",
    outros: "Outros"
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast.error(`Erro no login: ${error.message}`);
      } else {
        toast.success('Login realizado com sucesso!');
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se não há token de convite, não permitir cadastro público
    if (!invitationToken) {
      toast.error('Cadastro apenas por convite. Entre em contato com a administração.');
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await signUp(email, password, invitationToken);

      if (error) {
        toast.error(`Erro no cadastro: ${error.message}`);
      } else {
        toast.success('Conta criada com sucesso! Você já pode fazer login.');
        // Limpar token após uso bem-sucedido
        window.history.replaceState({}, document.title, '/login');
        setInvitationData(null);
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              NORDATA.AI
            </span>
          </div>
          <p className="text-muted-foreground">
            Plataforma inteligente de análise de dados para seu negócio
          </p>
          {invitationToken && (
            <div className="mt-4">
              <Alert className="border-primary/20 bg-primary/5">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  {validatingToken ? (
                    "Validando convite..."
                  ) : invitationData ? (
                    `Convite validado para ${invitationData.email}. Complete seu cadastro abaixo.`
                  ) : (
                    "Processando convite..."
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>
              {invitationToken ? 'Complete seu cadastro' : 'Acesse sua conta'}
            </CardTitle>
            <CardDescription>
              {invitationToken 
                ? 'Finalize a criação da sua conta com o convite recebido'
                : 'Entre com suas credenciais'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={invitationToken ? "register" : "login"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" disabled={validatingToken}>
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" disabled={validatingToken}>
                  {invitationToken ? 'Finalizar Cadastro' : 'Registrar'}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                {!invitationToken && (
                  <Alert className="mb-4 border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      O cadastro na plataforma NORDATA.AI é apenas por convite. 
                      Entre em contato com a administração para solicitar acesso.
                    </AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!!invitationData}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        id="company"
                        placeholder="Nome da empresa"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        disabled={!!invitationData}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Setor</Label>
                      <select
                        id="industry"
                        className="w-full h-10 px-3 py-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        disabled={!!invitationData}
                        required
                      >
                        <option value="">Selecione o setor</option>
                        {industries.map((ind) => (
                          <option key={ind} value={ind}>{industryLabels[ind]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!!invitationData}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Senha</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || (!invitationToken) || validatingToken}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    {loading ? "Criando conta..." : invitationToken ? "Finalizar Cadastro" : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
        </div>
      </div>
    </div>
  );
};

export default LoginPage;