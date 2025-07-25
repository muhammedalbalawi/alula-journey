import React, { useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { TouristView } from '@/components/TouristView';
import { GuideView } from '@/components/GuideView';
import { AboutSection } from '@/components/AboutSection';
import { Button } from '@/components/ui/button';
import { Info, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import alulaBackground from '@/assets/alula-background.jpg';

type ViewType = 'tourist' | 'guide' | 'about';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>('tourist');

  const renderView = () => {
    switch (currentView) {
      case 'tourist':
        return <TouristView />;
      case 'guide':
        return <GuideView />;
      case 'about':
        return <AboutSection />;
      default:
        return <TouristView />;
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
          
          {/* Fixed Action Buttons - Mobile responsive */}
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col space-y-2">
            <Link to="/admin">
              <Button
                variant="outline"
                size="sm"
                className="shadow-float w-10 h-10 sm:w-auto sm:h-auto sm:px-3"
                title="Admin Dashboard"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:ml-2 sm:inline">Admin</span>
              </Button>
            </Link>
            {currentView === 'guide' && (
              <Link to="/guide">
                <Button
                  variant="outline"
                  size="sm"
                  className="shadow-float w-10 h-10 sm:w-auto sm:h-auto sm:px-3"
                  title="Tour Guide Dashboard"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:ml-2 sm:inline">Guide</span>
                </Button>
              </Link>
            )}
            <Button
              variant={currentView === 'about' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView(currentView === 'about' ? 'tourist' : 'about')}
              className="shadow-float w-10 h-10 sm:w-auto sm:h-auto sm:px-3"
              title="About AlUla"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:ml-2 sm:inline">About</span>
            </Button>
          </div>

          {renderView()}
        </div>
      </div>
    </LanguageProvider>
  );
};

export default Index;
