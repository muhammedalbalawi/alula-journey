import React, { useState, useEffect } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { TouristView } from '@/components/TouristView';
import { GuideView } from '@/components/GuideView';
import { AboutSection } from '@/components/AboutSection';
import { Button } from '@/components/ui/button';
import { Info, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import alulaBackground from '@/assets/alula-background.jpg';

type ViewType = 'tourist' | 'guide' | 'about';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>('tourist');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'tourist':
        return session ? <TouristView session={session} /> : <TouristView session={null} />;
      case 'guide':
        return <GuideView />;
      case 'about':
        return <AboutSection />;
      default:
        return session ? <TouristView session={session} /> : <TouristView session={null} />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen relative">
        {/* Background */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${alulaBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Header 
            currentView={currentView === 'about' ? 'tourist' : currentView} 
            onViewChange={(view) => setCurrentView(view)}
          />
          
          {/* Fixed Action Buttons */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2">
            <Link to="/admin">
              <Button
                variant="outline"
                size="sm"
                className="shadow-float"
                title="Admin Dashboard"
              >
                <Shield className="w-4 h-4" />
              </Button>
            </Link>
            {currentView === 'guide' && (
              <Link to="/guide">
                <Button
                  variant="outline"
                  size="sm"
                  className="shadow-float"
                  title="Tour Guide Dashboard"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Button
              variant={currentView === 'about' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView(currentView === 'about' ? 'tourist' : 'about')}
              className="shadow-float"
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>

          {renderView()}
        </div>
      </div>
    </LanguageProvider>
  );
};

export default Index;