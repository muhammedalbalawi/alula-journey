import { TourGuideView } from '@/components/TourGuideView';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function TourGuide() {
  return (
    <LanguageProvider>
      <div className="relative">
        {/* Back Button */}
        <div className="fixed top-6 left-6 z-50">
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tourist Platform
            </Button>
          </Link>
        </div>
        
        <TourGuideView />
      </div>
    </LanguageProvider>
  );
}