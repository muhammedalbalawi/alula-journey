import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminView } from './AdminView';
import { EnhancedAdminView } from './admin/EnhancedAdminView';
import { DriverRegistration } from './DriverRegistration';
import { AdminAuth } from './auth/AdminAuth';
import { 
  Shield, 
  Users, 
  Car, 
  ClipboardList
} from 'lucide-react';
import { User } from '@supabase/supabase-js';

export const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out'
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Error',
        description: 'Failed to log out properly',
        variant: 'destructive'
      });
    }
  };

  // Show login form if not authenticated
  if (!user) {
    return <AdminAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-blue-600/20">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-blue-800 mb-1 sm:mb-2">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Comprehensive management system for tour guides, requests, and operations
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
              >
                <Shield className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Different Admin Views */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10 sm:h-12 text-xs sm:text-sm">
            <TabsTrigger value="requests" className="flex items-center space-x-1 sm:space-x-2 px-1 sm:px-3">
              <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Tourist Requests</span>
              <span className="sm:hidden">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center space-x-1 sm:space-x-2 px-1 sm:px-3">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Guide Management</span>
              <span className="sm:hidden">Guides</span>
            </TabsTrigger>
            <TabsTrigger value="drivers" className="flex items-center space-x-1 sm:space-x-2 px-1 sm:px-3">
              <Car className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Driver Management</span>
              <span className="sm:hidden">Drivers</span>
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