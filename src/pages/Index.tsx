import React, { useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { TouristView } from '@/components/TouristView';
import { GuideView } from '@/components/GuideView';
import { AboutSection } from '@/components/AboutSection';
import { Button } from '@/components/ui/button';
import { Info, Settings } from 'lucide-react';
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
          
          {/* Fixed Action Buttons */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2">
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
