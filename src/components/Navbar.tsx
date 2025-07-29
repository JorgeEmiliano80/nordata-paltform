
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Menu, LogOut, User, Shield, Upload, MessageSquare, TrendingUp, Settings, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { icon: TrendingUp, label: 'Dashboard', path: '/dashboard' },
    { icon: Upload, label: 'Upload', path: '/upload' },
    { icon: MessageSquare, label: 'Chat IA', path: '/chatbot' },
    { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
    ...(isAdmin() ? [{ icon: Users, label: 'Admin', path: '/admin' }] : []),
    { icon: Settings, label: 'Configurações', path: '/settings' }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-gray-900">NORDATA.AI</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex md:items-center md:space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {profile?.full_name || user?.email}
                  </p>
                  <p className="text-gray-500">{profile?.company_name}</p>
                </div>
              </div>
              {isAdmin() && (
                <Badge variant="default" className="bg-blue-500">
                  Admin
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>

            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2 p-4 border-b">
                    <User className="h-5 w-5 text-gray-500" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {profile?.full_name || user?.email}
                      </p>
                      <p className="text-gray-500">{profile?.company_name}</p>
                    </div>
                    {isAdmin() && (
                      <Badge variant="default" className="bg-blue-500">
                        Admin
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    {navItems.map((item) => (
                      <Button
                        key={item.path}
                        variant="ghost"
                        onClick={() => {
                          navigate(item.path);
                          setIsOpen(false);
                        }}
                        className="justify-start"
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Button>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
