
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
import { TouristPasswordLogin } from '@/components/TouristPasswordLogin';
import { supabase } from '@/integrations/supabase/client';

export const TouristView: React.FC = () => {
  const { t, translateLocation } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [touristId, setTouristId] = useState('');
  const [userSession, setUserSession] = useState<any>(null);
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

  const handleOTPLoginSuccess = (userId: string, session: any) => {
    setTouristId(userId);
    setUserSession(session);
    setIsLoggedIn(true);
    toast({
      title: t('success'),
      description: t('welcomeTourist')
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setTouristId('');
      setUserSession(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Check for existing session on component mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        setUserSession(session);
        setTouristId(session.user.id);
        setIsLoggedIn(true);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUserSession(session);
          setTouristId(session.user.id);
          setIsLoggedIn(true);
        } else if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setTouristId('');
          setUserSession(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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
    
    // Simulate sending reschedule request to guide's notification system
    console.log('Reschedule request sent to guide:', {
      touristName: 'Current Tourist',
      originalDestination: selectedDestination?.name,
      originalDate: selectedDestination?.date,
      originalTime: selectedDestination?.time,
      requestedDate: rescheduleData.date,
      requestedTime: rescheduleData.time,
      reason: rescheduleData.notes,
      timestamp: new Date().toISOString()
    });
    
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
          <div className="flex justify-center animate-bounce-in">
            <Button
              variant="outline"
              onClick={() => setShowExperiences(!showExperiences)}
              className="flex items-center space-x-2 rtl:space-x-reverse glass-effect hover:shadow-desert transition-all duration-300 hover:-translate-y-0.5"
            >
              <Users className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold">{t('touristExperiences')}</span>
              {showExperiences ? (
                <ChevronUp className="w-4 h-4 transition-transform duration-200" />
              ) : (
                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
              )}
            </Button>
          </div>

          {/* Collapsible Tourist Experiences Section */}
          {showExperiences && (
            <div className="animate-slide-up">
              <TouristExperiences />
            </div>
          )}

          {/* OTP Login Section */}
          <div className="flex justify-center">
            <div className="w-full max-w-md space-y-6 animate-slide-up">
              <TouristPasswordLogin onLoginSuccess={handleOTPLoginSuccess} />

              {/* Registration Button */}
              <Card className="glass-card hover:shadow-float transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full flex items-center space-x-2 rtl:space-x-reverse glass-effect hover:shadow-desert transition-all duration-300">
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
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-heritage-amber/10 border border-primary/20 glass-effect animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-heritage-amber bg-clip-text text-transparent mb-2">
                  {t('welcomeTourist')}
                </h2>
                <p className="text-muted-foreground">
                  Logged in with: <span className="font-medium text-primary">
                    {userSession?.user?.phone || userSession?.user?.email || 'OTP Login'}
                  </span>
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout} size="sm">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Google Maps */}
            <GoogleMaps locations={allLocations} />

            {/* Categorized Destinations */}
            {Object.entries(destinations).map(([category, items], index) => {
              const IconComponent = getCategoryIcon(category);
              return (
                <Card key={category} className="glass-card hover:shadow-float transition-all duration-300 hover:-translate-y-1 animate-slide-up" 
                      style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <span className="bg-gradient-to-r from-primary to-heritage-amber bg-clip-text text-transparent">
                        {t(`categories.${category}.name`)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {items.map((item, itemIndex) => (
                        <div key={item.id} 
                             className="p-4 bg-gradient-to-r from-secondary/50 to-accent/20 rounded-lg border border-border/30 hover:shadow-card transition-all duration-200 hover:-translate-y-0.5"
                             style={{ animationDelay: `${(index * items.length + itemIndex) * 0.05}s` }}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-foreground">{translateLocation(item.name)}</div>
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
                                <p className="text-xs leading-relaxed">{item.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse ml-4 rtl:ml-0 rtl:mr-4">
                              <Badge variant="outline" className="glass-effect">{item.date}</Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRescheduleDialog(item)}
                                className="flex items-center space-x-1 rtl:space-x-reverse glass-effect hover:shadow-card transition-all duration-200"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span className="text-xs">{t('reschedule')}</span>
                              </Button>
                              {item.notes && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => showDestinationNotes(item)}
                                  className="flex items-center space-x-1 rtl:space-x-reverse glass-effect hover:shadow-card transition-all duration-200"
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
            <Card className="glass-card overflow-hidden hover:shadow-float transition-all duration-300 hover:-translate-y-1 animate-bounce-in">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/30" />
                <div className="absolute inset-0 animate-pulse-glow opacity-50" />
                <CardContent className="relative pt-6 text-center">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4 backdrop-blur-sm">
                    <Camera className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-heritage-amber bg-clip-text text-transparent">
                    {t('captureYourMoment')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {t('captureDescription')}
                  </p>
                  <PhotoCaptureModal>
                    <Button 
                      variant="desert" 
                      size="lg" 
                      className="w-full flex items-center space-x-2 rtl:space-x-reverse hover:shadow-glow transition-all duration-300"
                    >
                      <Camera className="w-5 h-5" />
                      <span className="font-medium">{t('capturePhoto')}</span>
                    </Button>
                  </PhotoCaptureModal>
                </CardContent>
              </div>
            </Card>

            {/* Driver Booking */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <DriverBooking />
            </div>

            {/* Actions */}
            <Card className="glass-card hover:shadow-float transition-all duration-300 hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <CardContent className="pt-6 space-y-3">
                <Button onClick={openWhatsApp} className="w-full flex items-center space-x-2 rtl:space-x-reverse transition-all duration-200 hover:-translate-y-0.5" variant="desert">
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('contactGuide')}</span>
                </Button>
                <Button variant="outline" className="w-full flex items-center space-x-2 rtl:space-x-reverse glass-effect hover:shadow-card transition-all duration-200">
                  <Download className="w-4 h-4" />
                  <span>{t('downloadPdf')}</span>
                </Button>
                <Button variant="outline" className="w-full flex items-center space-x-2 rtl:space-x-reverse glass-effect hover:shadow-card transition-all duration-200">
                  <Navigation className="w-4 h-4" />
                  <span>{t('viewMap')}</span>
                </Button>
              </CardContent>
            </Card>

            {/* Rating */}
            <Card className="glass-card hover:shadow-float transition-all duration-300 hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <CardContent className="pt-6">
                <Dialog open={showRating} onOpenChange={setShowRating}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center space-x-2 rtl:space-x-reverse glass-effect hover:shadow-card transition-all duration-200">
                      <Star className="w-4 h-4" />
                      <span>{t('rateExperience')}</span>
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
