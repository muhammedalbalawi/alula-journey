import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Calendar, 
  Star, 
  MapPin, 
  Clock,
  Edit,
  Download,
  CheckCircle,
  UserPlus
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

export const GuideView: React.FC = () => {
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guideId, setGuideId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTourist, setSelectedTourist] = useState('');

  const mockTourists = [
    { id: 'T001', name: 'Ahmed Al-Rashid', status: 'Active' },
    { id: 'T002', name: 'Sarah Johnson', status: 'Active' },
    { id: 'T003', name: 'Mohammed Hassan', status: 'Pending' }
  ];

  const mockJourneyRequests = [
    {
      id: 'R001',
      fullName: 'Fatima Al-Zahra',
      contact: '+966501234567',
      nationality: 'Saudi Arabia',
      specialNeeds: 'Wheelchair accessible locations preferred',
      status: 'pending'
    },
    {
      id: 'R002',
      fullName: 'John Smith',
      contact: 'john.smith@email.com',
      nationality: 'United States',
      specialNeeds: 'Vegetarian meals',
      status: 'pending'
    }
  ];

  const mockRatings = [
    { tourist: 'Ahmed Al-Rashid', rating: 5, comment: 'Excellent guide, very knowledgeable!' },
    { tourist: 'Sarah Johnson', rating: 4, comment: 'Great experience, learned a lot about AlUla history.' }
  ];

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
    }
  ];

  const handleLogin = () => {
    if (guideId.trim() && password.trim()) {
      setIsLoggedIn(true);
      toast({
        title: t('success'),
        description: 'Welcome back, Tour Guide!'
      });
    }
  };

  const assignSchedule = (requestId: string) => {
    toast({
      title: t('success'),
      description: 'Schedule assigned successfully!'
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-desert">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">{t('guideLogin')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder={t('guideId')}
              value={guideId}
              onChange={(e) => setGuideId(e.target.value)}
            />
            <Input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handleLogin} className="w-full">
              {t('login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-20">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-primary mb-2">Welcome, Tour Guide</h2>
            <p className="text-muted-foreground">Guide ID: {guideId}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tourist Selection */}
            <Card className="shadow-desert">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Users className="w-5 h-5" />
                  <span>{t('selectTourist')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedTourist} onValueChange={setSelectedTourist}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectTourist')} />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTourists.map((tourist) => (
                      <SelectItem key={tourist.id} value={tourist.id}>
                        {tourist.name} ({tourist.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Itinerary Management */}
            {selectedTourist && (
              <Card className="shadow-desert">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Calendar className="w-5 h-5" />
                    <span>{t('editItinerary')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockItinerary.map((item) => (
                      <div key={item.day} className="p-4 border border-border rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Input value={`${t('day')} ${item.day}`} readOnly />
                          <Input value={item.date} />
                          <Input value={item.activity} />
                          <Input value={item.location} />
                        </div>
                        <div className="mt-2 flex items-center space-x-2 rtl:space-x-reverse">
                          <Clock className="w-4 h-4" />
                          <Input value={item.time} className="flex-1" />
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Add New Day
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Journey Requests */}
            <Card className="shadow-desert">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <UserPlus className="w-5 h-5" />
                  <span>{t('journeyRequests')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockJourneyRequests.map((request) => (
                    <div key={request.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{request.fullName}</h4>
                          <p className="text-sm text-muted-foreground">{request.contact}</p>
                          <p className="text-sm text-muted-foreground">Nationality: {request.nationality}</p>
                          {request.specialNeeds && (
                            <p className="text-sm text-muted-foreground">Special needs: {request.specialNeeds}</p>
                          )}
                        </div>
                        <Button size="sm" onClick={() => assignSchedule(request.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {t('assignSchedule')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="shadow-desert">
              <CardContent className="pt-6 space-y-3">
                <Button variant="outline" className="w-full flex items-center space-x-2 rtl:space-x-reverse">
                  <Download className="w-4 h-4" />
                  <span>{t('downloadPdf')}</span>
                </Button>
              </CardContent>
            </Card>

            {/* Ratings */}
            <Card className="shadow-desert">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Star className="w-5 h-5" />
                  <span>{t('viewRatings')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRatings.map((rating, index) => (
                    <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{rating.tourist}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{rating.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tourist Stats */}
            <Card className="shadow-desert">
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Tourists</span>
                    <Badge variant="secondary">2</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Requests</span>
                    <Badge variant="outline">2</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Rating</span>
                    <Badge variant="secondary">4.5 ⭐</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};