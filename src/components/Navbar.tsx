
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/useRole';
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
  const { user, signOut } = useAuth();
  const { isAdmin, isClient, canAccessRoute } = useRole();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
  };

  // Don't show navigation menu if user is not authenticated
  if (!user) {
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

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Button asChild>
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

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

          {/* Navigation Menu - Role-based */}
          <NavigationMenu>
            <NavigationMenuList>
              {/* Dashboard - Show for clients and admins */}
              {(isClient || isAdmin) && canAccessRoute('/dashboard') && (
                <NavigationMenuItem>
                  <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
                    <Home className="w-4 h-4 mr-2" />
                    {t('nav.dashboard')}
                  </Link>
                </NavigationMenuItem>
              )}

              {/* Data Management - Show for clients and admins */}
              {(isClient || isAdmin) && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <Upload className="w-4 h-4 mr-2" />
                    {t('nav.data')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px]">
                      {canAccessRoute('/upload') && (
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
                      )}
                      {canAccessRoute('/pipelines') && (
                        <NavigationMenuLink asChild>
                          <Link
                            to="/pipelines"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{t('nav.pipelines')}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Manage your data pipelines
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      )}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}

              {/* Analytics - Different options for admins vs clients */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t('nav.analysis')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    {/* Client insights - available to both clients and admins */}
                    {canAccessRoute('/insights') && (
                      <NavigationMenuLink asChild>
                        <Link
                          to="/insights"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Insights</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Visualiza análisis y descubrimientos de tus datos
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    )}
                    
                    {/* Advanced analytics - admin only */}
                    {isAdmin && canAccessRoute('/analytics') && (
                      <NavigationMenuLink asChild>
                        <Link
                          to="/analytics"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{t('nav.analytics')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('analytics.subtitle')} (Admin)
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    )}
                    
                    {/* Customer management */}
                    {canAccessRoute('/customers') && (
                      <NavigationMenuLink asChild>
                        <Link
                          to="/customers"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{t('nav.customers')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Customer management and segments
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </div>
                </NavigationMenuContent>
              )}

              {/* Chatbot - Available to clients and admins */}
              {canAccessRoute('/chatbot') && (
                <NavigationMenuItem>
                  <Link to="/chatbot" className={navigationMenuTriggerStyle()}>
                    <Bot className="w-4 h-4 mr-2" />
                    {t('nav.chatbot')}
                  </Link>
                </NavigationMenuItem>
              )}

              {/* Admin Panel - Admin only */}
              {isAdmin && canAccessRoute('/admin') && (
                <NavigationMenuItem>
                  <Link to="/admin" className={navigationMenuTriggerStyle()}>
                    <Shield className="w-4 w-4 mr-2" />
                    {t('nav.admin')}
                  </Link>
                </NavigationMenuItem>
              )}

              {/* Settings - Available to all authenticated users */}
              {canAccessRoute('/settings') && (
                <NavigationMenuItem>
                  <Link to="/settings" className={navigationMenuTriggerStyle()}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('nav.settings')}
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {user.email}
                {isAdmin && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Admin
                  </span>
                )}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                {t('nav.logout')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
