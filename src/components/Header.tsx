import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe, User, UserCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';

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
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
            <img 
              src="/lovable-uploads/017f454e-2ae2-48c6-9dbe-0d5ff6000d09.png" 
              alt="Journew Logo" 
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
            />
            <h1 className="text-sm sm:text-xl font-bold text-foreground truncate">
              {language === 'ar' ? 'رحلة جديدة' : 'Journew'}
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-1 sm:space-x-3 rtl:space-x-reverse">
            {/* View Switcher - Hide text on mobile */}
            <div className="flex bg-secondary rounded-lg p-1">
              <Button
                variant={currentView === 'tourist' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('tourist')}
                className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse px-2 sm:px-3"
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">{t('touristView')}</span>
              </Button>
              <Button
                variant={currentView === 'guide' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('guide')}
                className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse px-2 sm:px-3"
              >
                <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">{t('guideView')}</span>
              </Button>
            </div>

            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse px-2 sm:px-3"
            >
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden lg:inline text-xs sm:text-sm">{t('language')}</span>
            </Button>

            {/* Theme Toggle */}
            <div className="scale-75 sm:scale-100">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};