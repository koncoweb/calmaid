import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, LogOut } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title: string;
  showBack?: boolean;
  backTo?: string;
}

const Layout = ({ children, title, showBack = false, backTo }: LayoutProps) => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-teal-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBack && (
              <button 
                onClick={handleBack}
                className="p-1 rounded-full hover:bg-teal-500 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>

          <div className="flex items-center">
            {currentUser && (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm bg-teal-700 px-3 py-1 rounded-full hover:bg-teal-800 transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
