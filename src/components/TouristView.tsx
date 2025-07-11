
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimePicker } from '@/components/ui/time-picker';
import { format } from 'date-fns';
import { 
  MapPin, 
  MessageCircle, 
  Download, 
  Star,
  Plus,
  Camera,
  Upload,
  Image
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { toast } from '@/hooks/use-toast';
import { GoogleMaps } from './GoogleMaps';
import { cn } from '@/lib/utils';

export const TouristView: React.FC = () => {
  const { t, translateLocation } = useLanguage();
  const { socket } = useWebSocket();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [touristId, setTouristId] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [rescheduleData, setRescheduleData] = useState({
    date: undefined as Date | undefined,
    time: '',
    notes: ''
  });
  const [registrationData, setRegistrationData] = useState({
    fullName: '',
    contact: '',
    nationality: '',
    specialNeeds: ''
  });

  useEffect(() => {
    if (socket) {
      socket.on('ITINERARY_UPDATE', (data) => {
        // Handle itinerary updates
        toast({
          title: t('itineraryUpdated'),
          description: t('itineraryUpdateReceived')
        });
      });

      socket.on('NOTES_UPDATE', (data) => {
        // Handle notes updates
        toast({
          title: t('notesUpdated'),
          description: t('notesUpdateReceived')
        });
      });

      socket.on('PACKAGE_UPDATE', (data) => {
        // Handle package updates
        toast({
          title: t('packageUpdated'),
          description: data.isActive ? t('packageEnabled') : t('packageDisabled')
        });
      });

      socket.on('LOCATION_UPDATE', (data) => {
        // Handle location updates
        toast({
          title: t('locationUpdated'),
          description: t('locationUpdateReceived')
        });
      });
    }

    return () => {
      if (socket) {
        socket.off('ITINERARY_UPDATE');
        socket.off('NOTES_UPDATE');
        socket.off('PACKAGE_UPDATE');
        socket.off('LOCATION_UPDATE');
      }
    };
  }, [socket, t]);

  const handleLogin = () => {
    if (touristId.trim()) {
      setIsLoggedIn(true);
      toast({
        title: t('success'),
        description: t('welcomeTourist')
      });
    }
  };

  const handleRegistration = () => {
    setShowRegistration(false);
    toast({
      title: t('success'),
      description: t('registrationSuccess')
    });
    setRegistrationData({
      fullName: '',
      contact: '',
      nationality: '',
      specialNeeds: ''
    });
  };

  const handleRating = () => {
    setShowRating(false);
    toast({
      title: t('success'),
      description: t('ratingSubmitted')
    });
    setRating(0);
    setComment('');
  };

  const handlePhotoCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Handle camera stream
      stream.getTracks().forEach(track => track.stop());
      toast({
        title: t('success'),
        description: t('photoCaptured')
      });
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: t('error'),
        description: t('cameraError'),
        variant: 'destructive'
      });
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle photo upload
      toast({
        title: t('success'),
        description: t('photoUploaded')
      });
    }
  };

  const openRescheduleDialog = (destination: any) => {
    setSelectedDestination(destination);
    setShowReschedule(true);
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/966581828132', '_blank');
  };

  const showDestinationNotes = (destination: any) => {
    setSelectedDestination(destination);
    setShowNotes(true);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      {!isLoggedIn ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('touristLogin')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder={t('touristId')}
              value={touristId}
              onChange={(e) => setTouristId(e.target.value)}
            />
            <div className="flex justify-between gap-4">
              <Button onClick={handleLogin} className="flex-1">{t('login')}</Button>
              <Button
                variant="outline"
                onClick={() => setShowRegistration(true)}
                className="flex-1"
              >
                {t('register')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                {t('captureMemories')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPhotoDialog(true)}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {t('takePhoto')}
                </Button>
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <Button variant="outline" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    {t('uploadPhoto')}
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          <GoogleMaps
            locations={[
              {
                id: 'hegra',
                name: 'Hegra',
                category: 'heritage',
                coordinates: { lat: 26.7917, lng: 37.9544 }
              },
              {
                id: 'elephant-rock',
                name: 'Elephant Rock',
                category: 'attraction',
                coordinates: { lat: 26.6318, lng: 37.5913 }
              }
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" onClick={openWhatsApp}>
              <MessageCircle className="mr-2 h-4 w-4" />
              {t('contactGuide')}
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t('downloadGuide')}
            </Button>
          </div>
        </div>
      )}

      {/* Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('capturePhoto')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handlePhotoCapture}
            >
              <Camera className="mr-2 h-4 w-4" />
              {t('takeNewPhoto')}
            </Button>
            <label className="block w-full">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <Button variant="outline" className="w-full">
                <Image className="mr-2 h-4 w-4" />
                {t('chooseFromGallery')}
              </Button>
            </label>
          </div>
        </DialogContent>
      </Dialog>

      {/* Other existing dialogs */}
    </div>
  );
};
