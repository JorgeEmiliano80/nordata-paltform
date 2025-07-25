import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Database, BarChart3, Upload, Settings, Bot, Users } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Painel", icon: BarChart3 },
    { path: "/upload", label: "Upload", icon: Upload },
    { path: "/analytics", label: "Análises", icon: Database },
    { path: "/customers", label: "Clientes", icon: Users },
    { path: "/ai-assistant", label: "IA", icon: Bot },
    { path: "/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              DataFlow Pro
            </span>
          </Link>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          <Button variant="hero" size="sm">
            Começar Agora
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;