import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminView } from './AdminView';
import { EnhancedAdminView } from './admin/EnhancedAdminView';
import { DriverRegistration } from './DriverRegistration';
import { 
  Shield, 
  Users, 
  Car, 
  ClipboardList
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleLogin = async () => {
    // Simple admin login check - in production, use proper authentication
    if (adminId === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      toast({
        title: 'Login Successful',
        description: 'Welcome to the admin dashboard'
      });
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid admin credentials',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminId('');
    setPassword('');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out'
    });
  };

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card animate-bounce-in">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-600/30 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Login
            </CardTitle>
            <p className="text-muted-foreground">Access the administration panel</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin ID</label>
              <Input
                placeholder="Enter admin ID"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-blue-600/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-blue-800 mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                  Comprehensive management system for tour guides, requests, and operations
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Shield className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Different Admin Views */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="requests" className="flex items-center space-x-2">
              <ClipboardList className="w-4 h-4" />
              <span>Tourist Requests</span>
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Guide Management</span>
            </TabsTrigger>
            <TabsTrigger value="drivers" className="flex items-center space-x-2">
              <Car className="w-4 h-4" />
              <span>Driver Management</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests" className="space-y-6">
            <AdminView />
          </TabsContent>
          
          <TabsContent value="guides" className="space-y-6">
            <EnhancedAdminView />
          </TabsContent>
          
          <TabsContent value="drivers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="w-5 h-5" />
                  <span>Driver Registration & Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DriverRegistration onClose={() => {}} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};