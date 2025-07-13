import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimePicker } from '@/components/ui/time-picker';
import { format } from 'date-fns';
import { 
  Users, 
  Calendar as CalendarIcon, 
  Star, 
  MapPin, 
  Clock,
  Edit,
  Download,
  CheckCircle,
  UserPlus,
  Car,
  Shield,
  Droplets,
  Sun,
  Heart,
  Package,
  StickyNote,
  Navigation,
  Mountain,
  Castle,
  Zap,
  UserCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { GoogleMaps } from '@/components/GoogleMaps';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export const GuideView: React.FC = () => {
  const { t, translateLocation } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guideId, setGuideId] = useState('');
  const [password, setPassword] = useState('');
  const [currentGuide, setCurrentGuide] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedTourist, setSelectedTourist] = useState('');
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [destinationNotes, setDestinationNotes] = useState('');
  const [packageStates, setPackageStates] = useState<{[key: string]: boolean}>({
    'T001': true,
    'T002': false,
    'T003': true
  });
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState([
    {
      id: 'dest1',
      day: 1,
      date: '2024-07-15',
      activity: 'Elephant Rock & Sunset',
      location: 'Jabal AlFil',
      time: '16:00 - 19:00',
      category: 'attraction',
      coordinates: { lat: 26.5814, lng: 37.6956 },
      notes: 'Best sunset viewing from the viewing platform. Bring a camera!'
    },
    {
      id: 'dest2',
      day: 2,
      date: '2024-07-16',
      activity: 'Hegra Archaeological Site',
      location: 'Madain Saleh',
      time: '08:00 - 12:00',
      category: 'heritage',
      coordinates: { lat: 26.7853, lng: 37.9542 },
      notes: 'Bring comfortable walking shoes. Photography is allowed in designated areas only.'
    },
    {
      id: 'dest3',
      day: 3,
      date: '2024-07-17',
      activity: 'Zip Line Adventure',
      location: 'Adventure Park',
      time: '10:00 - 13:00',
      category: 'adventure',
      coordinates: { lat: 26.6084, lng: 37.8456 },
      notes: 'Wear comfortable clothes and closed-toe shoes. Weight limit applies.'
    }
  ]);

  // Mock assignments - in real app this would come from database
  const mockAssignments = [
    { touristId: 'T001', guideId: 'guide123', status: 'active' },
    { touristId: 'T003', guideId: 'guide123', status: 'active' }
  ];

  // Filter tourists to show only those assigned to current guide
  const assignedTouristIds = mockAssignments
    .filter(assignment => assignment.guideId === guideId && assignment.status === 'active')
    .map(assignment => assignment.touristId);

  const mockTourists = [
    { id: 'T001', name: 'Ahmed Al-Rashid', status: 'Active' },
    { id: 'T003', name: 'Mohammed Hassan', status: 'Pending' }
  ].filter(tourist => assignedTouristIds.includes(tourist.id));

  const mockJourneyRequests: any[] = [];

  const mockDriverBookings: any[] = [];

  const mockRatings: any[] = [];

  const allLocations = itinerary.map(item => ({
    id: item.id,
    name: item.activity,
    category: item.category as 'heritage' | 'attraction' | 'adventure',
    coordinates: item.coordinates,
    description: item.activity,
    notes: item.notes
  }));

  const categorizedItinerary = {
    heritage: itinerary.filter(item => item.category === 'heritage'),
    attraction: itinerary.filter(item => item.category === 'attraction'),
    adventure: itinerary.filter(item => item.category === 'adventure')
  };

  const handleLogin = async () => {
    if (!guideId.trim() || !password.trim()) {
      toast({
        title: t('error'),
        description: 'Please enter both Guide ID and password',
        variant: 'destructive'
      });
      return;
    }

    setIsLoggingIn(true);

    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('guide_id', guideId.trim())
        .eq('password', password.trim())
        .single();

      if (error || !data) {
        toast({
          title: t('error'),
          description: 'Invalid Guide ID or password',
          variant: 'destructive'
        });
        return;
      }

      setCurrentGuide(data);
      setIsLoggedIn(true);
      toast({
        title: t('success'),
        description: `Welcome, ${data.name}!`
      });

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: t('error'),
        description: 'Login failed. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const assignSchedule = (requestId: string) => {
    toast({
      title: t('success'),
      description: 'Schedule assigned successfully!'
    });
  };

  const assignDriver = (bookingId: string) => {
    toast({
      title: t('success'),
      description: 'Driver assigned successfully!'
    });
  };

  const togglePackage = (touristId: string) => {
    setPackageStates(prev => ({
      ...prev,
      [touristId]: !prev[touristId]
    }));
    toast({
      title: t('success'),
      description: packageStates[touristId] ? t('packageDisabled') : t('packageEnabled')
    });
  };

  const openNotesDialog = (destination: any) => {
    setSelectedDestination(destination);
    setDestinationNotes(destination.notes || '');
    setShowNotesDialog(true);
  };

  const saveNotes = () => {
    if (selectedDestination) {
      setItinerary(prev => prev.map(item => 
        item.id === selectedDestination.id 
          ? { ...item, notes: destinationNotes }
          : item
      ));
      toast({
        title: t('success'),
        description: 'Notes saved successfully!'
      });
    }
    setShowNotesDialog(false);
  };

  const handleLocationUpdate = (locationId: string, coordinates: { lat: number; lng: number }) => {
    setItinerary(prev => prev.map(item => 
      item.id === locationId 
        ? { ...item, coordinates }
        : item
    ));
    toast({
      title: t('success'),
      description: 'Location updated successfully!'
    });
  };

  const toggleEdit = (itemId: string) => {
    setEditingItem(editingItem === itemId ? null : itemId);
  };

  const updateItineraryItem = (itemId: string, field: string, value: string) => {
    setItinerary(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, [field]: value }
        : item
    ));
  };

  const saveItineraryItem = (itemId: string) => {
    setEditingItem(null);
    toast({
      title: t('success'),
      description: 'Itinerary item updated successfully!'
    });
  };

  const addNewDay = () => {
    const nextDay = Math.max(...itinerary.map(item => item.day)) + 1;
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + nextDay - 1);
    
    const newItem = {
      id: `dest${Date.now()}`,
      day: nextDay,
      date: newDate.toISOString().split('T')[0],
      activity: 'New Activity',
      location: 'New Location',
      time: '09:00 - 12:00',
      category: 'attraction',
      coordinates: { lat: 26.6084, lng: 37.8456 },
      notes: ''
    };

    setItinerary(prev => [...prev, newItem]);
    setEditingItem(newItem.id);
    toast({
      title: t('success'),
      description: 'New day added to itinerary!'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'heritage': return Castle;
      case 'attraction': return Mountain;
      case 'adventure': return Zap;
      default: return MapPin;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'heritage': return t('heritageSites') || 'Heritage Sites';
      case 'attraction': return t('attractionPlaces') || 'Attraction Places';
      case 'adventure': return t('adventurousExperiences') || 'Adventurous Experiences';
      default: return 'Activities';
    }
  };

  const renderCategorySection = (category: string, items: any[]) => {
    const CategoryIcon = getCategoryIcon(category);
    
    return (
      <Card key={category} className="shadow-desert">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <CategoryIcon className="w-5 h-5" />
            <span>{getCategoryTitle(category)}</span>
            <Badge variant="secondary">{items.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="p-4 border border-border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <Input 
                    value={`${t('day')} ${item.day}`} 
                    readOnly 
                  />
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          editingItem !== item.id && "cursor-default"
                        )}
                        disabled={editingItem !== item.id}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {item.date ? format(new Date(item.date), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(item.date)}
                        onSelect={(date) => {
                          if (date) {
                            updateItineraryItem(item.id, 'date', date.toISOString().split('T')[0]);
                          }
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Input 
                    value={item.activity} 
                    onChange={(e) => updateItineraryItem(item.id, 'activity', e.target.value)}
                    readOnly={editingItem !== item.id}
                  />
                  <Input 
                    value={translateLocation(item.location)} 
                    onChange={(e) => updateItineraryItem(item.id, 'location', e.target.value)}
                    readOnly={editingItem !== item.id}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Select
                    value={item.category}
                    onValueChange={(value) => updateItineraryItem(item.id, 'category', value)}
                    disabled={editingItem !== item.id}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heritage">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Castle className="w-4 h-4" />
                          <span>{t('heritageSites') || 'Heritage Sites'}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="attraction">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Mountain className="w-4 h-4" />
                          <span>{t('attractionPlaces') || 'Attraction Places'}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="adventure">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Zap className="w-4 h-4" />
                          <span>{t('adventurousExperiences') || 'Adventurous Experiences'}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Clock className="w-4 h-4" />
                    {editingItem === item.id ? (
                      <TimePicker
                        value={item.time}
                        onChange={(time) => updateItineraryItem(item.id, 'time', time)}
                      />
                    ) : (
                      <Input value={item.time} readOnly />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => editingItem === item.id ? saveItineraryItem(item.id) : toggleEdit(item.id)}
                    >
                      <Edit className="w-4 h-4" />
                      <span className="ml-1 rtl:ml-0 rtl:mr-1">
                        {editingItem === item.id ? t('save') : t('edit')}
                      </span>
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openNotesDialog(item)}
                      className="flex items-center space-x-1 rtl:space-x-reverse"
                    >
                      <StickyNote className="w-4 h-4" />
                      <span>{t('addNotes')}</span>
                    </Button>
                    <Button size="sm" variant="outline">
                      <Navigation className="w-4 h-4" />
                      <span className="ml-1 rtl:ml-0 rtl:mr-1">{t('setLocation')}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
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
            <Button 
              onClick={handleLogin} 
              className="w-full"
              disabled={isLoggingIn}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            >
              {isLoggingIn ? 'Signing in...' : t('login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-20">
      {/* Profile Button - Top Left */}
      <div className="fixed top-6 left-6 z-50">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="shadow-lg hover-scale"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            >
              <UserCircle className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <UserCircle className="w-5 h-5" />
                <span>Profile Information</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Guide Name</label>
                <p className="text-lg font-semibold">{currentGuide?.name || 'Unknown Guide'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg">{currentGuide?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-lg">{currentGuide?.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Rating</label>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">{currentGuide?.rating || '0.0'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Specializations</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(currentGuide?.specializations || []).map((spec: string, index: number) => (
                    <Badge key={index} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{t('welcomeGuide')}</h2>
            <p className="text-muted-foreground">{t('guideId')}: {guideId}</p>
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

            {/* Google Maps for Guides */}
            {selectedTourist && (
              <GoogleMaps 
                locations={allLocations} 
                isGuideView={true}
                onLocationUpdate={handleLocationUpdate}
              />
            )}

            {/* Package Management */}
            <Card className="shadow-desert">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Package className="w-5 h-5" />
                  <span>{t('managePackages')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTourists.map((tourist) => (
                    <div key={tourist.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{tourist.name}</h4>
                          <p className="text-sm text-muted-foreground">{tourist.id}</p>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="text-sm">{packageStates[tourist.id] ? t('packageEnabled') : t('packageDisabled')}</span>
                          <Switch
                            checked={packageStates[tourist.id] || false}
                            onCheckedChange={() => togglePackage(tourist.id)}
                          />
                        </div>
                      </div>
                      
                      {packageStates[tourist.id] && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-secondary/30 rounded-lg">
                            <Droplets className="w-4 h-4 text-accent" />
                            <span className="text-sm">{t('packageItems.refreshments')}</span>
                          </div>
                          <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-secondary/30 rounded-lg">
                            <Sun className="w-4 h-4 text-accent" />
                            <span className="text-sm">{t('packageItems.sunshade')}</span>
                          </div>
                          <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-secondary/30 rounded-lg">
                            <Heart className="w-4 h-4 text-accent" />
                            <span className="text-sm">{t('packageItems.medical')}</span>
                          </div>
                          <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-secondary/30 rounded-lg">
                            <Shield className="w-4 h-4 text-accent" />
                            <span className="text-sm">{t('packageItems.special')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categorized Itinerary Management */}
            {selectedTourist && (
              <div className="space-y-6">
                {Object.entries(categorizedItinerary).map(([category, items]) => 
                  items.length > 0 && renderCategorySection(category, items)
                )}
                
                <Button variant="outline" className="w-full" onClick={addNewDay}>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {t('addNewDay')}
                </Button>
              </div>
            )}

            {/* Driver Booking Requests */}
            <Card className="shadow-desert">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Car className="w-5 h-5" />
                  <span>{t('driverBookingRequests')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDriverBookings.map((booking) => (
                    <div key={booking.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{booking.touristName}</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p className="flex items-center space-x-2 rtl:space-x-reverse">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{booking.date} at {booking.time}</span>
                            </p>
                            {booking.pickupLocation && (
                              <p className="flex items-center space-x-2 rtl:space-x-reverse">
                                <MapPin className="w-3 h-3" />
                                <span>{booking.pickupLocation}</span>
                              </p>
                            )}
                            {booking.specialRequest && (
                              <p className="text-sm">Special request: {booking.specialRequest}</p>
                            )}
                          </div>
                        </div>
                        <Button size="sm" onClick={() => assignDriver(booking.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {t('assignDriver')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                <CardTitle className="text-lg">{t('statistics')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('activeTourists')}</span>
                    <Badge variant="secondary">2</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('pendingRequests')}</span>
                    <Badge variant="outline">2</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('driverBookings')}</span>
                    <Badge variant="outline">2</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('averageRating')}</span>
                    <Badge variant="secondary">4.5 ⭐</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notes Dialog */}
        <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {t('guideNotes')} - {selectedDestination && translateLocation(selectedDestination.activity)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Textarea
                placeholder={t('addNotes')}
                value={destinationNotes}
                onChange={(e) => setDestinationNotes(e.target.value)}
                className="min-h-[120px]"
              />
              <Button onClick={saveNotes} className="w-full">
                {t('save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
