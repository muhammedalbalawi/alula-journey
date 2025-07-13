import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, LogIn, Loader2, Eye, EyeOff, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TouristPasswordLoginProps {
  onLoginSuccess: (userId: string, session: any) => void;
}

interface LoginState {
  identifier: string;
  password: string;
  confirmPassword: string;
  method: 'phone' | 'email';
  isSignUp: boolean;
  showPassword: boolean;
  loading: boolean;
}

export function TouristPasswordLogin({ onLoginSuccess }: TouristPasswordLoginProps) {
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('email');
  const [loginState, setLoginState] = useState<LoginState>({
    identifier: '',
    password: '',
    confirmPassword: '',
    method: 'email',
    isSignUp: false,
    showPassword: false,
    loading: false,
  });

  const { toast } = useToast();

  // Update method when tab changes
  const handleTabChange = (method: 'phone' | 'email') => {
    setActiveTab(method);
    setLoginState(prev => ({ 
      ...prev, 
      method, 
      identifier: '',
      password: '',
      confirmPassword: ''
    }));
  };

  const validateInput = (): boolean => {
    if (!loginState.identifier.trim() || !loginState.password.trim()) {
      toast({
        title: 'Missing Information',
        description: `Please fill in all required fields.`,
        variant: 'destructive',
      });
      return false;
    }

    if (loginState.method === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginState.identifier)) {
        toast({
          title: 'Invalid Email',
          description: 'Please enter a valid email address.',
          variant: 'destructive',
        });
        return false;
      }
    } else {
      const digits = loginState.identifier.replace(/\D/g, '');
      if (digits.length < 9) {
        toast({
          title: 'Invalid Phone Number',
          description: 'Please enter a valid phone number.',
          variant: 'destructive',
        });
        return false;
      }
    }

    if (loginState.isSignUp && loginState.password !== loginState.confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Please ensure both password fields match.',
        variant: 'destructive',
      });
      return false;
    }

    if (loginState.password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    if (!validateInput()) return;

    setLoginState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginState.identifier,
        password: loginState.password,
      });

      if (error) throw error;

      if (data.user && data.session) {
        toast({
          title: 'Login Successful',
          description: 'Welcome back to AlUla Journey!',
        });
        
        onLoginSuccess(data.user.id, data.session);
      }

    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: 'Sign In Failed',
        description: error.message || 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoginState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSignUp = async () => {
    if (!validateInput()) return;

    setLoginState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email: loginState.identifier,
        password: loginState.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            user_type: 'tourist',
            full_name: 'Tourist User'
          }
        }
      });

      if (error) throw error;

      if (data.user && data.session) {
        toast({
          title: 'Account Created Successfully',
          description: 'Welcome to AlUla Journey!',
        });
        
        onLoginSuccess(data.user.id, data.session);
      } else {
        toast({
          title: 'Check Your Email',
          description: 'Please check your email to confirm your account before signing in.',
        });
        setLoginState(prev => ({ ...prev, isSignUp: false }));
      }

    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: 'Sign Up Failed',
        description: error.message || 'Unable to create account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoginState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSubmit = () => {
    if (loginState.isSignUp) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  const toggleAuthMode = () => {
    setLoginState(prev => ({
      ...prev,
      isSignUp: !prev.isSignUp,
      password: '',
      confirmPassword: ''
    }));
  };

  const togglePasswordVisibility = () => {
    setLoginState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  return (
    <Card className="w-full max-w-md glass-card animate-bounce-in">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl bg-gradient-to-r from-primary to-heritage-amber bg-clip-text text-transparent">
          {loginState.isSignUp ? 'Create Tourist Account' : 'Tourist Login'}
        </CardTitle>
        <p className="text-muted-foreground">
          {loginState.isSignUp 
            ? 'Join AlUla Journey today' 
            : 'Welcome back to AlUla Journey'
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center space-x-2" disabled>
              <Phone className="w-4 h-4" />
              <span>Phone (Soon)</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={loginState.identifier}
                onChange={(e) => setLoginState(prev => ({ ...prev, identifier: e.target.value }))}
                className="glass-effect"
                disabled={loginState.loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={loginState.showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginState.password}
                  onChange={(e) => setLoginState(prev => ({ ...prev, password: e.target.value }))}
                  className="glass-effect pr-10"
                  disabled={loginState.loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
                  disabled={loginState.loading}
                >
                  {loginState.showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {loginState.isSignUp && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type={loginState.showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={loginState.confirmPassword}
                  onChange={(e) => setLoginState(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="glass-effect"
                  disabled={loginState.loading}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="phone" className="space-y-4 mt-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Phone className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Phone authentication coming soon!
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={loginState.loading}
          variant="desert"
        >
          {loginState.loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {loginState.isSignUp ? 'Creating Account...' : 'Signing In...'}
            </>
          ) : (
            <>
              {loginState.isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </>
          )}
        </Button>

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAuthMode}
            disabled={loginState.loading}
            className="text-primary hover:text-primary/80"
          >
            {loginState.isSignUp 
              ? 'Already have an account? Sign in' 
              : 'New to AlUla Journey? Create account'
            }
          </Button>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <strong>Note:</strong> {loginState.isSignUp 
            ? 'You may need to verify your email address after signing up.' 
            : 'Use your email and password to access your tourist dashboard.'
          }
        </div>
      </CardContent>
    </Card>
  );
}