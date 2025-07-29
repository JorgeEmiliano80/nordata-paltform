
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { 
  Shield, 
  Upload, 
  MessageSquare, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown,
  Database,
  BarChart3,
  Users
} from 'lucide-react';

const Navbar = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: BarChart3,
      adminOnly: false 
    },
    { 
      name: 'Upload', 
      href: '/upload', 
      icon: Upload,
      adminOnly: false 
    },
    { 
      name: 'Chatbot', 
      href: '/chatbot', 
      icon: MessageSquare,
      adminOnly: false 
    },
    { 
      name: 'Admin Panel', 
      href: '/admin', 
      icon: Users,
      adminOnly: true 
    },
  ];

  const filteredNavItems = navigationItems.filter(item => 
    !item.adminOnly || isAdmin()
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center group">
              <div className="relative">
                <Shield className="h-8 w-8 text-primary transition-all duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 h-8 w-8 bg-primary/20 rounded-full blur-sm transition-all duration-300 group-hover:bg-primary/30" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                nordataplatform
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent/50 ${
                    isActive 
                      ? 'bg-accent text-accent-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAdmin() && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Admin
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{profile?.full_name || 'Usuario'}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
