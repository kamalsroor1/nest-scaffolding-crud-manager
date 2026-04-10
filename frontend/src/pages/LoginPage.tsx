import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

/**
 * Simple login page for development.
 * Accepts any credentials and sets a mock accessToken in localStorage.
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock login logic
    setTimeout(() => {
      localStorage.setItem('accessToken', 'mock-foundation-token');
      toast.success('Login successful!');
      navigate('/dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <div className="w-full max-w-md p-8 bg-card border rounded-lg shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 mb-4 rounded-full bg-primary text-primary-foreground">
            <Rocket size={32} />
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground text-center">
            Sign in to access your NestJS Dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>Mock login: Any email/password will work</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
