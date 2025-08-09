import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Eye, EyeOff } from 'lucide-react';

interface GuideAuthProps {
  onAuthSuccess: (guideId: string, guideName: string) => void;
}

export const GuideAuth: React.FC<GuideAuthProps> = ({ onAuthSuccess }) => {
  const [guideId, setGuideId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the secure password verification function
      const { data, error } = await supabase.rpc('verify_guide_password', {
        guide_identifier: guideId,
        input_password: password
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: 'Login Failed',
          description: 'Authentication service error',
          variant: 'destructive'
        });
        return;
      }

      if (data === true) {
        // Get guide details
        const { data: guideData, error: guideError } = await supabase
          .from('guides')
          .select('id, name, guide_id')
          .eq('guide_id', guideId)
          .maybeSingle();

        if (guideError || !guideData) {
          toast({
            title: 'Login Failed',
            description: 'Could not retrieve guide information',
            variant: 'destructive'
          });
          return;
        }

        // Set session context for guide access
        await supabase.rpc('set_guide_session', {
          guide_uuid: guideData.id,
          guide_identifier: guideId
        });

        onAuthSuccess(guideId, guideData.name);
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${guideData.name}!`
        });
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid guide ID or password',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card animate-bounce-in">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-600/30 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <MapPin className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Guide Login
          </CardTitle>
          <p className="text-muted-foreground">Access your tour guide dashboard</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Guide ID</label>
              <Input
                placeholder="Enter your guide ID"
                value={guideId}
                onChange={(e) => setGuideId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              disabled={loading}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};