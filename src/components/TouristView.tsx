import React from 'react';
import { TouristDashboard } from './TouristDashboard';
import { Session } from '@supabase/supabase-js';

interface TouristViewProps {
  session: Session | null;
}

export const TouristView: React.FC<TouristViewProps> = ({ session }) => {
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-muted-foreground">You need to be signed in to access the tourist dashboard.</p>
        </div>
      </div>
    );
  }
  
  return <TouristDashboard session={session} />;
};