
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/login">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Login
            </Button>
          </Link>
        </div>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
          <CardHeader className="relative text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Política de Privacidad
            </CardTitle>
            <CardDescription className="text-lg">
              nordataplatform - Última actualización: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Información General</h2>
              <p className="text-muted-foreground mb-4">
                Esta política de privacidad describe cómo nordataplatform recopila, usa y protege 
                su información personal en cumplimiento con la Ley General de Protección de Datos 
                Personales de Brasil (LGPD) y la Ley 25.326 de Argentina.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Datos Recopilados</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Datos de Registro:</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Nombre completo</li>
                    <li>Dirección de correo electrónico</li>
                    <li>Nombre de la empresa</li>
                    <li>Sector de actividad</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Datos de Uso:</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Archivos subidos para análisis</li>
                    <li>Historial de conversaciones con el chatbot</li>
                    <li>Logs de actividad en la plataforma</li>
                    <li>Metadatos de procesamiento</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Propósito del Procesamiento</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Proporcionar servicios de análisis de datos</li>
                <li>Generar insights automáticos mediante IA</li>
                <li>Facilitar la comunicación a través del chatbot</li>
                <li>Mantener la seguridad y funcionalidad de la plataforma</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Base Legal</h2>
              <p className="text-muted-foreground mb-4">
                El procesamiento de sus datos personales se basa en:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Consentimiento explícito del usuario</li>
                <li>Cumplimiento de contrato</li>
                <li>Interés legítimo para la prestación del servicio</li>
                <li>Cumplimiento de obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Compartición de Datos</h2>
              <p className="text-muted-foreground mb-4">
                Sus datos pueden ser compartidos únicamente con:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Databricks (para procesamiento de archivos)</li>
                <li>Proveedores de servicios de nube (Supabase)</li>
                <li>Autoridades competentes cuando sea legalmente requerido</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Seguridad</h2>
              <p className="text-muted-foreground mb-4">
                Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Cifrado de datos en tránsito y en reposo</li>
                <li>Autenticación de dos factores</li>
                <li>Controles de acceso basados en roles</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Copias de seguridad regulares</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Sus Derechos</h2>
              <p className="text-muted-foreground mb-4">
                Conforme a la LGPD y Ley 25.326, usted tiene derecho a:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Acceder a sus datos personales</li>
                <li>Rectificar datos inexactos</li>
                <li>Solicitar la eliminación de sus datos</li>
                <li>Revocar el consentimiento</li>
                <li>Portabilidad de los datos</li>
                <li>Oposición al procesamiento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Retención de Datos</h2>
              <p className="text-muted-foreground mb-4">
                Los datos personales serán conservados durante el tiempo necesario para 
                cumplir con las finalidades descritas o conforme a los períodos 
                establecidos por la legislación aplicable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contacto</h2>
              <p className="text-muted-foreground mb-4">
                Para ejercer sus derechos o consultas sobre esta política, contacte:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium">Oficial de Protección de Datos</p>
                <p className="text-muted-foreground">Email: privacy@nordataplatform.com</p>
                <p className="text-muted-foreground">Teléfono: +55 11 0000-0000</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Actualizaciones</h2>
              <p className="text-muted-foreground">
                Esta política puede ser actualizada periódicamente. Las modificaciones 
                serán notificadas a través de la plataforma y por correo electrónico.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
