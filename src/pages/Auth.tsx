import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const { user, loading, signUp, signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <Sparkles className="text-primary animate-pulse" size={48} />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast.success('Account created! Check your email to confirm.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back!');
      }
    } catch (err: unknown) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center p-4">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="text-primary" size={32} />
            <h1 className="font-display text-4xl font-bold glow-text text-foreground">GlassDo</h1>
          </div>
          <p className="text-muted-foreground">Your glassmorphic task manager</p>
        </div>

        <div className="glass-strong rounded-2xl p-6 border-white/10">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6 text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label className="text-foreground/70 text-xs mb-1.5 block">Display Name</Label>
                <Input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="glass border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}
            <div>
              <Label className="text-foreground/70 text-xs mb-1.5 block">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="glass border-white/10 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground/70 text-xs mb-1.5 block">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="glass border-white/10 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-display font-semibold gap-2"
            >
              {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
              {submitting ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
