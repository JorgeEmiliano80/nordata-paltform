import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
const Navbar = () => {
  const {
    user,
    signOut,
    isAdmin
  } = useAuth();
  const handleSignOut = async () => {
    await signOut();
  };
  return <nav className="bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        
      </div>
    </nav>;
};
export default Navbar;