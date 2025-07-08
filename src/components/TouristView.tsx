import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, 
  MessageCircle, 
  Download, 
  Star, 
  Shield, 
  Droplets, 
  Sun, 
  Heart,
  Plus,
  Calendar,
  Clock,
  Navigation
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

export const TouristView: React.FC = () => {
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [touristId, setTouristId] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [registrationData, setRegistrationData] = useState({
    fullName: '',
    contact: '',
    nationality: '',
    specialNeeds: ''
  });

  const mockItinerary = [
    {
      day: 1,
      date: '2024-07-15',
      activity: 'Elephant Rock & Sunset',
      location: 'Jabal AlFil',
      time: '16:00 - 19:00'
    },
    {
      day: 2,
      date: '2024-07-16',
      activity: 'Hegra Archaeological Site',
      location: 'Madain Saleh',
      time: '08:00 - 12:00'
    },
    {
      day: 3,
      date: '2024-07-17',
      activity: 'AlUla Old Town',
      location: 'Historical District',
      time: '09:00 - 13:00'
    }
  ];

  const suggestedPlaces = [
    'Dadan Archaeological Site',
    'Mirror\'s Edge',
    'Sharaan Nature Reserve',
    'AlUla Arts District'
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

  const openWhatsApp = () => {
    window.open('https://wa.me/966501234567', '_blank');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
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
    );
  }

  return (
    <div className="min-h-screen p-4 pt-20">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{t('welcomeTourist')}</h2>
            <p className="text-muted-foreground">Tourist ID: {touristId}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Itinerary */}
            <Card className="shadow-desert">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Calendar className="w-5 h-5" />
                  <span>{t('itinerary')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockItinerary.map((item) => (
                    <div key={item.day} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div>
                        <div className="font-semibold">{t('day')} {item.day} - {item.activity}</div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-4 rtl:space-x-reverse mt-1">
                          <span className="flex items-center space-x-1 rtl:space-x-reverse">
                            <MapPin className="w-3 h-3" />
                            <span>{item.location}</span>
                          </span>
                          <span className="flex items-center space-x-1 rtl:space-x-reverse">
                            <Clock className="w-3 h-3" />
                            <span>{item.time}</span>
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline">{item.date}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tourist Package */}
            <Card className="shadow-desert">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Shield className="w-5 h-5" />
                  <span>{t('touristPackage')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-secondary/30 rounded-lg">
                    <Droplets className="w-5 h-5 text-accent" />
                    <span className="text-sm">{t('packageItems.refreshments')}</span>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-secondary/30 rounded-lg">
                    <Sun className="w-5 h-5 text-accent" />
                    <span className="text-sm">{t('packageItems.sunshade')}</span>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-secondary/30 rounded-lg">
                    <Heart className="w-5 h-5 text-accent" />
                    <span className="text-sm">{t('packageItems.medical')}</span>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-secondary/30 rounded-lg">
                    <Shield className="w-5 h-5 text-accent" />
                    <span className="text-sm">{t('packageItems.special')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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

            {/* Suggested Places */}
            <Card className="shadow-desert">
              <CardHeader>
                <CardTitle className="text-lg">{t('suggestedPlaces')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suggestedPlaces.map((place, index) => (
                    <Badge key={index} variant="secondary" className="block text-center py-2">
                      {place}
                    </Badge>
                  ))}
                </div>
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
      </div>
    </div>
  );
};