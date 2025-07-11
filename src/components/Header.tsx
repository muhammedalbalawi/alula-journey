import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe, User, UserCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  currentView: 'tourist' | 'guide';
  onViewChange: (view: 'tourist' | 'guide') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-desert-gold to-heritage-amber flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">
              {language === 'ar' ? 'رحلة العُلا' : 'AlulaJourney'}
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* View Switcher */}
            <div className="flex bg-secondary rounded-lg p-1">
              <Button
                variant={currentView === 'tourist' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('tourist')}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <User className="w-4 h-4" />
                <span>{t('touristView')}</span>
              </Button>
              <Button
                variant={currentView === 'guide' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('guide')}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <UserCheck className="w-4 h-4" />
                <span>{t('guideView')}</span>
              </Button>
            </div>

            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Globe className="w-4 h-4" />
              <span>{t('language')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};