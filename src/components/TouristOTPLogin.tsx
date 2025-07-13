import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone, Mail, Timer, RefreshCw, LogIn, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TouristOTPLoginProps {
  onLoginSuccess: (userId: string, session: any) => void;
}

interface OTPState {
  isOTPSent: boolean;
  identifier: string;
  method: 'phone' | 'email';
  otpCode: string;
  resendCount: number;
  canResend: boolean;
  cooldownTime: number;
  loading: boolean;
}

export function TouristOTPLogin({ onLoginSuccess }: TouristOTPLoginProps) {
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otpState, setOtpState] = useState<OTPState>({
    isOTPSent: false,
    identifier: '',
    method: 'phone',
    otpCode: '',
    resendCount: 0,
    canResend: true,
    cooldownTime: 0,
    loading: false,
  });

  const { toast } = useToast();

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpState.cooldownTime > 0) {
      interval = setInterval(() => {
        setOtpState(prev => {
          const newTime = prev.cooldownTime - 1;
          if (newTime <= 0) {
            return { ...prev, cooldownTime: 0, canResend: true };
          }
          return { ...prev, cooldownTime: newTime };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpState.cooldownTime]);

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // If it starts with 966 (Saudi Arabia), keep as is
    if (digits.startsWith('966')) {
      return `+${digits}`;
    }
    
    // If it starts with 05 (Saudi local), convert to international
    if (digits.startsWith('05')) {
      return `+966${digits.substring(1)}`;
    }
    
    // If it's 9 digits starting with 5, assume Saudi number
    if (digits.length === 9 && digits.startsWith('5')) {
      return `+966${digits}`;
    }
    
    // Otherwise, assume it needs +966 prefix
    return `+966${digits}`;
  };

  const sendOTP = async (method: 'phone' | 'email', identifier: string) => {
    if (otpState.resendCount >= 3) {
      toast({
        title: 'Maximum Attempts Reached',
        description: 'You have reached the maximum number of OTP requests. Please try again later.',
        variant: 'destructive',
      });
      return;
    }

    setOtpState(prev => ({ ...prev, loading: true }));

    try {
      let result;
      
      if (method === 'phone') {
        const formattedPhone = formatPhoneNumber(identifier);
        result = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
          options: {
            shouldCreateUser: true,
            data: {
              user_type: 'tourist',
              full_name: 'Tourist User'
            }
          }
        });
      } else {
        result = await supabase.auth.signInWithOtp({
          email: identifier,
          options: {
            shouldCreateUser: true,
            data: {
              user_type: 'tourist',
              full_name: 'Tourist User'
            }
          }
        });
      }

      if (result.error) {
        throw result.error;
      }

      setOtpState(prev => ({
        ...prev,
        isOTPSent: true,
        identifier,
        method,
        resendCount: prev.resendCount + 1,
        canResend: false,
        cooldownTime: 60,
        loading: false,
      }));

      toast({
        title: 'OTP Sent Successfully',
        description: `Verification code sent to your ${method === 'phone' ? 'phone number' : 'email address'}`,
      });

    } catch (error: any) {
      console.error('Error sending OTP:', error);
      setOtpState(prev => ({ ...prev, loading: false }));
      
      toast({
        title: 'Failed to Send OTP',
        description: error.message || 'Please check your details and try again.',
        variant: 'destructive',
      });
    }
  };

  const verifyOTP = async () => {
    if (otpState.otpCode.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a 6-digit verification code.',
        variant: 'destructive',
      });
      return;
    }

    setOtpState(prev => ({ ...prev, loading: true }));

    try {
      let result;
      
      if (otpState.method === 'phone') {
        result = await supabase.auth.verifyOtp({
          phone: formatPhoneNumber(otpState.identifier),
          token: otpState.otpCode,
          type: 'sms'
        });
      } else {
        result = await supabase.auth.verifyOtp({
          email: otpState.identifier,
          token: otpState.otpCode,
          type: 'email'
        });
      }

      if (result.error) {
        throw result.error;
      }

      if (result.data.user && result.data.session) {
        toast({
          title: 'Login Successful',
          description: 'Welcome to AlUla Journey!',
        });
        
        onLoginSuccess(result.data.user.id, result.data.session);
      }

    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setOtpState(prev => ({ ...prev, loading: false }));
      
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid verification code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSendOTP = () => {
    const identifier = activeTab === 'phone' ? phoneNumber : email;
    
    if (!identifier.trim()) {
      toast({
        title: 'Missing Information',
        description: `Please enter your ${activeTab === 'phone' ? 'phone number' : 'email address'}.`,
        variant: 'destructive',
      });
      return;
    }

    // Basic validation
    if (activeTab === 'phone') {
      const digits = identifier.replace(/\D/g, '');
      if (digits.length < 9) {
        toast({
          title: 'Invalid Phone Number',
          description: 'Please enter a valid phone number.',
          variant: 'destructive',
        });
        return;
      }
    } else {
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(identifier)) {
        toast({
          title: 'Invalid Email',
          description: 'Please enter a valid email address.',
          variant: 'destructive',
        });
        return;
      }
    }

    sendOTP(activeTab, identifier);
  };

  const handleResendOTP = () => {
    if (otpState.canResend && otpState.resendCount < 3) {
      sendOTP(otpState.method, otpState.identifier);
    }
  };

  const resetOTPState = () => {
    setOtpState({
      isOTPSent: false,
      identifier: '',
      method: 'phone',
      otpCode: '',
      resendCount: 0,
      canResend: true,
      cooldownTime: 0,
      loading: false,
    });
    setPhoneNumber('');
    setEmail('');
  };

  if (otpState.isOTPSent) {
    return (
      <Card className="w-full max-w-md glass-card animate-slide-up">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-to-r from-primary to-heritage-amber bg-clip-text text-transparent">
            Enter Verification Code
          </CardTitle>
          <p className="text-muted-foreground">
            Code sent to your {otpState.method === 'phone' ? 'phone number' : 'email'}
          </p>
          <p className="text-sm font-medium text-primary">
            {otpState.method === 'phone' ? formatPhoneNumber(otpState.identifier) : otpState.identifier}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otpState.otpCode}
              onChange={(value) => setOtpState(prev => ({ ...prev, otpCode: value }))}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={verifyOTP}
            className="w-full"
            disabled={otpState.otpCode.length !== 6 || otpState.loading}
            variant="desert"
          >
            {otpState.loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Verify & Login
              </>
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span>Resend attempts:</span>
              <Badge variant={otpState.resendCount >= 3 ? 'destructive' : 'secondary'}>
                {otpState.resendCount}/3
              </Badge>
            </div>
            
            {otpState.canResend && otpState.resendCount < 3 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendOTP}
                disabled={otpState.loading}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Resend Code
              </Button>
            ) : (
              otpState.cooldownTime > 0 && (
                <div className="flex items-center text-muted-foreground">
                  <Timer className="w-4 h-4 mr-1" />
                  <span>Resend in {otpState.cooldownTime}s</span>
                </div>
              )
            )}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={resetOTPState}
          >
            Change Number/Email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md glass-card animate-bounce-in">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl bg-gradient-to-r from-primary to-heritage-amber bg-clip-text text-transparent">
          Tourist Login
        </CardTitle>
        <p className="text-muted-foreground">Enter your details to receive a verification code</p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'phone' | 'email')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phone" className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Phone</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phone" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                placeholder="05XXXXXXXX or +966XXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="glass-effect"
              />
              <p className="text-xs text-muted-foreground">
                Saudi Arabia numbers supported. Enter with or without country code.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-effect"
              />
            </div>
          </TabsContent>

          <Button
            onClick={handleSendOTP}
            className="w-full mt-6"
            disabled={otpState.loading}
            variant="desert"
          >
            {otpState.loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Code...
              </>
            ) : (
              <>
                {activeTab === 'phone' ? <Phone className="w-4 h-4 mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                Send Verification Code
              </>
            )}
          </Button>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <strong>Note:</strong> You will receive a 6-digit verification code. 
            You can resend the code up to 3 times with a 60-second cooldown between attempts.
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
