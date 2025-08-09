import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { User, Session } from '@supabase/supabase-js';

interface AdminAuthProps {
  onAuthSuccess: (user: User) => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAdminStatus(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            checkAdminStatus(session.user);
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        toast({
          title: 'Authentication Error',
          description: 'Failed to verify admin privileges',
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        onAuthSuccess(user);
        toast({
          title: 'Admin Access Granted',
          description: 'Welcome to the admin dashboard'
        });
      } else {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges',
          variant: 'destructive'
        });
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Error in admin check:', error);
      toast({
        title: 'Authentication Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message,
            variant: 'destructive'
          });
          return;
        }

        if (data.user) {
          checkAdminStatus(data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`
          }
        });

        if (error) {
          toast({
            title: 'Registration Failed',
            description: error.message,
            variant: 'destructive'
          });
          return;
        }

        toast({
          title: 'Registration Successful',
          description: 'Please check your email to confirm your account. Admin privileges must be granted separately.',
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: 'Authentication Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card animate-bounce-in">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-600/30 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {isLogin ? 'Admin Login' : 'Admin Registration'}
          </CardTitle>
          <p className="text-muted-foreground">
            {isLogin ? 'Access the administration panel' : 'Create an admin account'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={loading}
            >
              <Shield className="w-4 h-4 mr-2" />
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
            </Button>
          </form>
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin ? "Need to register?" : "Already have an account?"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};