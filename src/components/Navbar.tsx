import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-primary">
              NORDATA.AI
            </Link>
            {user && (
              <div className="flex items-center space-x-6">
                <Link
                  to="/dashboard"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/upload"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Upload
                </Link>
                <Link
                  to="/chatbot"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  AI Assistant
                </Link>
                {isAdmin() && (
                  <>
                    <Link
                      to="/analytics"
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      Analytics
                    </Link>
                    <Link
                      to="/admin"
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      Admin
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                >
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
