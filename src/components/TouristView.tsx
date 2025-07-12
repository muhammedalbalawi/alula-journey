
import React, { useState } from 'react';
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
  Calendar as CalendarIcon,
  Clock,
  Navigation,
  StickyNote,
  Landmark,
  Camera,
  Mountain,
  Users,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { DriverBooking } from '@/components/DriverBooking';
import { TouristExperiences } from '@/components/TouristExperiences';
import { GoogleMaps } from '@/components/GoogleMaps';
import { PhotoCaptureModal } from '@/components/PhotoCaptureModal';

export const TouristView: React.FC = () => {
  const { t, translateLocation } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [touristId, setTouristId] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showExperiences, setShowExperiences] = useState(false);
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

  // Categorized destinations
  const destinations = {
    heritage: [
      {
        id: 'h1',
        name: 'Hegra Archaeological Site',
        location: 'Hegra',
        time: '08:00 - 12:00',
        date: '2024-07-16',
        description: 'Explore the ancient Nabatean tombs and archaeological wonders',
        notes: 'Bring comfortable walking shoes. Photography is allowed in designated areas only.',
        coordinates: { lat: 26.7853, lng: 37.9542 }
      },
      {
        id: 'h2',
        name: 'Dadan Archaeological Site',
        location: 'Dadan',
        time: '09:00 - 11:00',
        date: '2024-07-17',
        description: 'Ancient capital of the Dadanite and Lihyanite kingdoms',
        notes: 'Early morning visit recommended for better lighting.',
        coordinates: { lat: 26.6469, lng: 37.9278 }
      }
    ],
    attraction: [
      {
        id: 'a1',
        name: 'Elephant Rock',
        location: 'Jabal AlFil',
        time: '16:00 - 19:00',
        date: '2024-07-15',
        description: 'Witness the spectacular sunset at the iconic elephant-shaped rock formation',
        notes: 'Best sunset viewing from the viewing platform. Bring a camera!',
        coordinates: { lat: 26.5814, lng: 37.6956 }
      },
      {
        id: 'a2',
        name: 'AlUla Old Town',
        location: 'Historical District',
        time: '09:00 - 13:00',
        date: '2024-07-17',
        description: 'Walk through the historic mudbrick buildings and traditional architecture',
        notes: 'Traditional coffee will be served during the visit.',
        coordinates: { lat: 26.6085, lng: 37.9218 }
      }
    ],
    adventure: [
      {
        id: 'ad1',
        name: 'Desert Safari',
        location: 'Sharaan Nature Reserve',
        time: '14:00 - 18:00',
        date: '2024-07-18',
        description: 'Thrilling desert adventure with wildlife spotting',
        notes: 'All safety equipment provided. Minimum age requirement: 12 years.',
        coordinates: { lat: 26.5289, lng: 37.8742 }
      }
    ]
  };

  const allLocations = [
    ...destinations.heritage.map(d => ({ ...d, category: 'heritage' as const })),
    ...destinations.attraction.map(d => ({ ...d, category: 'attraction' as const })),
    ...destinations.adventure.map(d => ({ ...d, category: 'adventure' as const }))
  ];

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
      description: 'Rating submitted successfully!'
    });
    setRating(0);
    setComment('');
  };

  const handleReschedule = () => {
    setShowReschedule(false);
    toast({
      title: t('success'),
      description: t('rescheduleSuccess')
    });
    setRescheduleData({
      date: undefined,
      time: '',
      notes: ''
    });
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

  const getCategoryIcon = (category: string) => {
    const icons = {
      heritage: Landmark,
      attraction: Camera,
      adventure: Mountain
    };
    return icons[category as keyof typeof icons] || Camera;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen p-4 pt-20">
        <div className="container mx-auto max-w-6xl space-y-8">
          {/* Tourist Experiences Icon Section */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowExperiences(!showExperiences)}
              className="flex items-center space-x-2 rtl:space-x-reverse shadow-desert"
            >
              <Users className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold">{t('touristExperiences')}</span>
              {showExperiences ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Collapsible Tourist Experiences Section */}
          {showExperiences && (
            <div className="animate-fade-in">
              <TouristExperiences />
            </div>
          )}

          {/* Login Section */}
          <div className="flex justify-center">
            <div className="w-full max-w-md space-y-6">
              {/* Login Card */}
              <Card className="shadow-desert">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-primary">{t('touristLogin')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder={t('touristId')}
                    value={touristId}
                    onChange={(e) => setTouristId(e.target.value)}
                    className="text-center"
                  />
                  <Button onClick={handleLogin} className="w-full">
                    {t('login')}
                  </Button>
                </CardContent>
              </Card>

              {/* Registration Button */}
              <Card className="shadow-desert">
                <CardContent className="pt-6">
                  <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full flex items-center space-x-2 rtl:space-x-reverse">
                        <Plus className="w-4 h-4" />
                        <span>{t('registerJourney')}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t('registerJourney')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <Input
                          placeholder={t('fullName')}
                          value={registrationData.fullName}
                          onChange={(e) => setRegistrationData({...registrationData, fullName: e.target.value})}
                        />
                        <Input
                          placeholder={t('contactInfo')}
                          value={registrationData.contact}
                          onChange={(e) => setRegistrationData({...registrationData, contact: e.target.value})}
                        />
                        <Input
                          placeholder={t('nationality')}
                          value={registrationData.nationality}
                          onChange={(e) => setRegistrationData({...registrationData, nationality: e.target.value})}
                        />
                        <Textarea
                          placeholder={t('specialNeeds')}
                          value={registrationData.specialNeeds}
                          onChange={(e) => setRegistrationData({...registrationData, specialNeeds: e.target.value})}
                          className="min-h-[80px]"
                        />
                        <Button onClick={handleRegistration} className="w-full">
                          {t('submit')}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-20">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{t('welcomeTourist')}</h2>
            <p className="text-muted-foreground">{t('touristId')}: {touristId}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Google Maps */}
            <GoogleMaps locations={allLocations} />

            {/* Categorized Destinations */}
            {Object.entries(destinations).map(([category, items]) => {
              const IconComponent = getCategoryIcon(category);
              return (
                <Card key={category} className="shadow-desert">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                      <IconComponent className="w-5 h-5" />
                      <span>{t(`categories.${category}.name`)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="p-4 bg-secondary/50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold">{translateLocation(item.name)}</div>
                              <div className="text-sm text-muted-foreground space-y-1 mt-2">
                                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                  <span className="flex items-center space-x-1 rtl:space-x-reverse">
                                    <MapPin className="w-3 h-3" />
                                    <span>{translateLocation(item.location)}</span>
                                  </span>
                                  <span className="flex items-center space-x-1 rtl:space-x-reverse">
                                    <Clock className="w-3 h-3" />
                                    <span>{item.time}</span>
                                  </span>
                                </div>
                                <p className="text-xs">{item.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse ml-4 rtl:ml-0 rtl:mr-4">
                              <Badge variant="outline">{item.date}</Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRescheduleDialog(item)}
                                className="flex items-center space-x-1 rtl:space-x-reverse"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span className="text-xs">{t('reschedule')}</span>
                              </Button>
                              {item.notes && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => showDestinationNotes(item)}
                                  className="flex items-center space-x-1 rtl:space-x-reverse"
                                >
                                  <StickyNote className="w-3 h-3" />
                                  <span className="text-xs">{t('viewNotes')}</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Capture Your Moment */}
            <Card className="shadow-desert overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/30" />
                <CardContent className="relative pt-6 text-center">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2 text-primary">
                    {t('captureYourMoment')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {t('captureDescription')}
                  </p>
                  <PhotoCaptureModal>
                    <Button 
                      variant="desert" 
                      size="lg" 
                      className="w-full flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <Camera className="w-5 h-5" />
                      <span className="font-medium">{t('capturePhoto')}</span>
                    </Button>
                  </PhotoCaptureModal>
                </CardContent>
              </div>
            </Card>

            {/* Driver Booking */}
            <DriverBooking />

            {/* Actions */}
            <Card className="shadow-desert">
              <CardContent className="pt-6 space-y-3">
                <Button onClick={openWhatsApp} className="w-full flex items-center space-x-2 rtl:space-x-reverse">
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('contactGuide')}</span>
                </Button>
                <Button variant="outline" className="w-full flex items-center space-x-2 rtl:space-x-reverse">
                  <Download className="w-4 h-4" />
                  <span>{t('downloadPdf')}</span>
                </Button>
                <Button variant="outline" className="w-full flex items-center space-x-2 rtl:space-x-reverse">
                  <Navigation className="w-4 h-4" />
                  <span>{t('viewMap')}</span>
                </Button>
              </CardContent>
            </Card>

            {/* Rating */}
            <Card className="shadow-desert">
              <CardContent className="pt-6">
                <Dialog open={showRating} onOpenChange={setShowRating}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center space-x-2 rtl:space-x-reverse">
                      <Star className="w-4 h-4" />
                      <span>{t('rateGuide')}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('rateGuide')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="flex justify-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-8 h-8 cursor-pointer ${
                              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                            }`}
                            onClick={() => setRating(star)}
                          />
                        ))}
                      </div>
                      <Textarea
                        placeholder={t('comment')}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <Button onClick={handleRating} className="w-full">
                        {t('submitRating')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notes Dialog */}
        <Dialog open={showNotes} onOpenChange={setShowNotes}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('notes')} - {selectedDestination && translateLocation(selectedDestination.name)}</DialogTitle>
            </DialogHeader>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">{selectedDestination?.notes}</p>
            </div>
          </DialogContent>
        </Dialog>
        {/* Reschedule Dialog */}
        <Dialog open={showReschedule} onOpenChange={setShowReschedule}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('reschedule')} - {selectedDestination && translateLocation(selectedDestination.name)}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('selectDate')}</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {rescheduleData.date ? format(rescheduleData.date, "PPP") : <span>{t('selectDate')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={rescheduleData.date}
                      onSelect={(date) => setRescheduleData({...rescheduleData, date})}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('selectTime')}</label>
                <TimePicker
                  value={rescheduleData.time}
                  onChange={(time) => setRescheduleData({...rescheduleData, time})}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('notes')}</label>
                <Textarea
                  placeholder={t('rescheduleNotes')}
                  value={rescheduleData.notes}
                  onChange={(e) => setRescheduleData({...rescheduleData, notes: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>

              <Button onClick={handleReschedule} className="w-full">
                {t('submitReschedule')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
