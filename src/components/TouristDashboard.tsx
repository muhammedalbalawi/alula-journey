import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { TouristSidebar } from './TouristSidebar';
import { TouristSchedules } from './tourist/TouristSchedules';
import { TouristPackages } from './tourist/TouristPackages';
import { TouristProfile } from './TouristProfile';
import { TouristExperiences } from './TouristExperiences';
import { useToast } from '@/hooks/use-toast';
import { Session } from '@supabase/supabase-js';

interface TouristDashboardProps {
  session: Session;
}

export const TouristDashboard: React.FC<TouristDashboardProps> = ({ session }) => {
  const [activeSection, setActiveSection] = useState('schedules');
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'schedules':
        return <TouristSchedules session={session} />;
      case 'packages':
        return <TouristPackages session={session} />;
      case 'profile':
        return <TouristProfile session={session} />;
      case 'experiences':
        return <TouristExperiences session={session} />;
      default:
        return <TouristSchedules session={session} />;
    }
  };

  return (
    <LanguageProvider>
      <div className="flex min-h-screen bg-background">
        <TouristSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
          userSession={session}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </LanguageProvider>
  );
};