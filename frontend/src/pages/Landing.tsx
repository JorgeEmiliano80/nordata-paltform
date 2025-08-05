import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Database, Brain, Shield } from 'lucide-react';

const Landing: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('landing.title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t('landing.subtitle')}
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">{t('landing.login')}</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Database className="h-8 w-8 text-primary mb-2" />
              <CardTitle>{t('landing.dataUpload')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('landing.dataUploadDesc')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-8 w-8 text-primary mb-2" />
              <CardTitle>{t('landing.advancedAI')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('landing.advancedAIDesc')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>{t('landing.visualization')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('landing.visualizationDesc')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>{t('landing.security')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('landing.securityDesc')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;
