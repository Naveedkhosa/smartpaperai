import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      
      if (!success) {
        toast({
          title: 'Login Failed',
          description: 'Invalid username or password. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Login Error',
        description: 'An error occurred while trying to log in.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="text-white" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SmartPaper AI</h1>
          <p className="text-white/80">Transforming Education with Intelligence</p>
        </div>

        <Card className="glassmorphism-strong border-white/30 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-white text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/90">Username</Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="glass-input"
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">Password</Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button
                data-testid="button-login"
                type="submit"
                disabled={isLoading}
                className="w-full emerald-gradient text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 p-4 glassmorphism rounded-lg">
              <p className="text-white/80 text-sm text-center mb-3">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-white/70">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Teacher:</strong> teacher1 / teacher123</p>
                <p><strong>Student:</strong> student1 / student123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
