import { Moon, Sun, User, LogOut } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';

/**
 * Top header containing theme toggle and user actions.
 */
export const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-card border-b">
      <div className="text-sm text-muted-foreground">
        Welcome back, <span className="font-medium text-foreground">Developer</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="w-px h-6 bg-border mx-2" />

        <div className="flex items-center gap-3 px-2 py-1 rounded-md hover:bg-muted cursor-pointer transition-colors group">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20">
            <User size={18} />
          </div>
          <button 
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
