
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MapLocation {
  id: string;
  name: string;
  category: 'heritage' | 'attraction' | 'adventure' | 'events';
  coordinates: { lat: number; lng: number };
  description?: string;
  notes?: string;
}

interface GoogleMapsProps {
  locations: MapLocation[];
  isGuideView?: boolean;
  onLocationUpdate?: (locationId: string, coordinates: { lat: number; lng: number }) => void;
}

export const GoogleMaps: React.FC<GoogleMapsProps> = ({ 
  locations, 
  isGuideView = false, 
  onLocationUpdate 
}) => {
  const { t, translateLocation } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);
  const [map, setMap] = useState<any>(null);

  const initializeMap = () => {
    if (!mapRef.current || !apiKey) return;

    // Create script element for Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Initialize map centered on AlUla
      const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 26.6085, lng: 37.9218 }, // AlUla coordinates
        zoom: 12,
        mapTypeId: 'hybrid'
      });

      setMap(mapInstance);

      // Add markers for each location
      locations.forEach((location) => {
        const marker = new (window as any).google.maps.Marker({
          position: location.coordinates,
          map: mapInstance,
          title: translateLocation(location.name),
          icon: {
            url: getCategoryIcon(location.category),
            scaledSize: new (window as any).google.maps.Size(30, 30)
          }
        });

        // Info window
        const infoWindow = new (window as any).google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">${translateLocation(location.name)}</h3>
              <p style="margin: 0 0 4px 0; color: #666;">${t(`categories.${location.category}.name`)}</p>
              ${location.description ? `<p style="margin: 0 0 4px 0;">${location.description}</p>` : ''}
              ${location.notes ? `<p style="margin: 0; font-style: italic; color: #888;">${t('notes')}: ${location.notes}</p>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
        });

        // For guide view, allow location updates
        if (isGuideView && onLocationUpdate) {
          marker.setDraggable(true);
          marker.addListener('dragend', () => {
            const position = marker.getPosition();
            onLocationUpdate(location.id, {
              lat: position.lat(),
              lng: position.lng()
            });
          });
        }
      });
    };

    document.head.appendChild(script);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      heritage: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      attraction: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      adventure: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      events: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png'
    };
    return icons[category as keyof typeof icons] || icons.attraction;
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setShowApiInput(false);
      initializeMap();
    }
  };

  if (showApiInput) {
    return (
      <Card className="shadow-desert">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <MapPin className="w-5 h-5" />
            <span>{t('viewMap')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2 rtl:space-x-reverse p-4 bg-yellow-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Google Maps API Key Required</p>
              <p className="text-yellow-700 mt-1">
                To display the interactive map, please enter your Google Maps API key. 
                You can get one from the Google Cloud Console.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter Google Maps API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button onClick={handleApiKeySubmit} className="w-full">
              Load Map
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-desert">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
          <MapPin className="w-5 h-5" />
          <span>{t('viewMap')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} className="w-full h-96 rounded-lg" />
        {isGuideView && (
          <p className="text-sm text-muted-foreground mt-2">
            Drag markers to update locations
          </p>
        )}
      </CardContent>
    </Card>
  );
};
