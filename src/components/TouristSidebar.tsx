import React, { useState } from 'react';
import { Calendar, Package, User, Camera, Menu, X, LogOut, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';

interface TouristSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  userSession: any;
}

export const TouristSidebar: React.FC<TouristSidebarProps> = ({
  activeSection,
  onSectionChange,
  onLogout,
  userSession
}) => {
  const { language, setLanguage, t } = useLanguage();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: 'schedules',
      label: t('tourSchedules'),
      icon: Calendar,
      emoji: '🗓️'
    },
    {
      id: 'packages',
      label: t('packages'),
      icon: Package,
      emoji: '🎁'
    },
    {
      id: 'profile',
      label: t('myProfile'),
      icon: User,
      emoji: '👤'
    },
    {
      id: 'experiences',
      label: t('myExperiences'),
      icon: Camera,
      emoji: '📸'
    }
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <Button
          onClick={toggleSidebar}
          variant="outline"
          size="sm"
          className="fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      )}

      {/* Overlay for mobile */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? 'fixed' : 'sticky'} 
          top-0 h-screen bg-background border-r border-border/50 backdrop-blur-sm
          transition-all duration-300 ease-in-out z-40
          ${isMobile 
            ? (isCollapsed ? '-translate-x-full' : 'translate-x-0 w-72') 
            : (isCollapsed ? 'w-16' : 'w-72')
          }
          ${language === 'ar' && !isMobile 
            ? (isCollapsed ? 'border-l border-r-0' : 'border-l border-r-0') 
            : ''
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant="outline" 
                    className="bg-primary/10 text-primary border-primary/30 px-3 py-1"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {t('touristProfile')}
                  </Badge>
                </div>
              )}
              
              {!isMobile && (
                <Button
                  onClick={toggleSidebar}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              )}
            </div>

            {!isCollapsed && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground truncate">
                  {userSession?.user?.phone || userSession?.user?.email || 'OTP Login'}
                </p>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 py-4">
            <nav className="space-y-2 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200 text-left
                      ${isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      }
                      ${language === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}
                    `}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{item.emoji}</span>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    {!isCollapsed && (
                      <span className="font-medium truncate">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border/50 space-y-2">
            {/* Language Toggle */}
            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="sm"
              className={`w-full ${isCollapsed ? 'p-2' : 'justify-start'}`}
            >
              <Globe className="w-4 h-4" />
              {!isCollapsed && (
                <span className="ml-2">{t('language')}</span>
              )}
            </Button>

            {/* Logout */}
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className={`w-full text-destructive hover:bg-destructive/10 hover:text-destructive ${isCollapsed ? 'p-2' : 'justify-start'}`}
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && (
                <span className="ml-2">Logout</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};