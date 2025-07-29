
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Upload, 
  BarChart3, 
  Users, 
  MessageCircle, 
  Bot, 
  Settings, 
  Shield,
  Activity
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/1a34d3c4-cb8e-427e-b062-a6af0a5e1f4d.png" 
              alt="NordataPlatform" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              NordataPlatform
            </span>
          </Link>

          {/* Navigation Menu */}
          {user && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
                    <Home className="w-4 h-4 mr-2" />
                    {t('nav.dashboard')}
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <Upload className="w-4 h-4 mr-2" />
                    {t('nav.data')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px]">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/upload"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{t('nav.uploadFiles')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('upload.subtitle')}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/pipelines"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{t('nav.pipelines')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Gestiona tus flujos de datos
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {t('nav.analysis')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px]">
                      {isAdmin() && (
                        <NavigationMenuLink asChild>
                          <Link
                            to="/analytics"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{t('nav.analytics')}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {t('analytics.subtitle')}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      )}
                      <NavigationMenuLink asChild>
                        <Link
                          to="/customers"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{t('nav.customers')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Gestión de clientes y segmentos
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <Bot className="w-4 h-4 mr-2" />
                    {t('nav.ai')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px]">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/chatbot"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{t('nav.chatbot')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('chatbot.subtitle')}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/ai-assistant"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{t('nav.aiAssistant')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Asistente de análisis de datos
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {isAdmin() && (
                  <NavigationMenuItem>
                    <Link to="/admin" className={navigationMenuTriggerStyle()}>
                      <Shield className="w-4 h-4 mr-2" />
                      {t('nav.admin')}
                    </Link>
                  </NavigationMenuItem>
                )}

                <NavigationMenuItem>
                  <Link to="/settings" className={navigationMenuTriggerStyle()}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('nav.settings')}
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <Button asChild>
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
