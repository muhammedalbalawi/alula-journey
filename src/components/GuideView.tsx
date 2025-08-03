import React, { useState, useEffect } from 'react';
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
  UserCircle,
  Trash2
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
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [showAddActivityDialog, setShowAddActivityDialog] = useState(false);
  const [showAddPackageDialog, setShowAddPackageDialog] = useState(false);
  const [touristPackages, setTouristPackages] = useState<any[]>([]);
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    included_activities: [] as string[]
  });
  const [newActivity, setNewActivity] = useState({
    date: '',
    category: 'attraction',
    activity: '',
    location: '',
    notes: '',
    startTime: '09:00',
    endTime: '12:00',
    duration: 180
  });

  const [assignedTourists, setAssignedTourists] = useState<any[]>([]);

  // Fetch assigned tourists when logged in
  useEffect(() => {
    if (isLoggedIn && currentGuide) {
      fetchAssignedTourists();
      fetchActivities();
      fetchTouristPackages();
      fetchDriverBookings();
      fetchAvailableDrivers();
      setupRealtimeUpdates();
    }
  }, [isLoggedIn, currentGuide]);

  const fetchTouristPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('created_by', currentGuide?.id);

      if (error) throw error;
      setTouristPackages(data || []);
    } catch (error: any) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchDriverBookings = async () => {
    try {
      // Get tourist IDs for this guide's assigned tourists
      const touristIds = assignedTourists.map(t => t.tourist_id);
      
      if (touristIds.length === 0) {
        setDriverBookings([]);
        return;
      }

      const { data, error } = await supabase
        .from('driver_bookings')
        .select(`
          *,
          profiles:tourist_id (
            full_name,
            contact_info
          )
        `)
        .in('tourist_id', touristIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDriverBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching driver bookings:', error);
    }
  };

  const fetchAvailableDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('status', 'available')
        .order('name', { ascending: true });

      if (error) throw error;
      setAvailableDrivers(data || []);
    } catch (error: any) {
      console.error('Error fetching available drivers:', error);
    }
  };

  const fetchAssignedTourists = async () => {
    try {
      console.log('Starting fetchAssignedTourists with guide:', currentGuide?.id);
      
      // Get only tourists assigned to this guide
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('tour_assignments')
        .select(`
          tourist_id, 
          status, 
          guide_id, 
          tour_name, 
          start_date, 
          end_date,
          profiles:tourist_id (
            id,
            full_name,
            contact_info,
            phone_number,
            nationality,
            gender
          )
        `)
        .eq('guide_id', currentGuide?.id)
        .in('status', ['pending', 'active']);

      console.log('Assignments query result:', { assignmentsData, assignmentsError });

      if (assignmentsError) {
        console.error('Error fetching assigned tourists:', assignmentsError);
        setAssignedTourists([]);
        return;
      }

      // Transform only assigned tourists
      const transformedTourists = (assignmentsData || []).map(assignment => {
        const tourist = assignment.profiles;
        return {
          id: `tourist-${assignment.tourist_id}`,
          tourist_id: assignment.tourist_id,
          status: assignment.status,
          tour_name: assignment.tour_name,
          start_date: assignment.start_date,
          end_date: assignment.end_date,
          profiles: {
            id: tourist?.id || assignment.tourist_id,
            full_name: tourist?.full_name || 'Unnamed Tourist',
            contact_info: tourist?.contact_info || tourist?.phone_number || 'No contact info',
            phone_number: tourist?.phone_number || tourist?.contact_info || '',
            nationality: tourist?.nationality || 'Not specified',
            gender: tourist?.gender || 'Not specified'
          }
        };
      });

      console.log('Final assigned tourists:', transformedTourists);
      console.log('Number of assigned tourists:', transformedTourists.length);
      
      setAssignedTourists(transformedTourists);
    } catch (error: any) {
      console.error('Error in fetchAssignedTourists:', error);
      setAssignedTourists([]);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('tour_guide_id', currentGuide?.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      
      const formattedData = (data || []).map((activity, index) => ({
        id: activity.id,
        day: index + 1,
        date: activity.scheduled_date,
        activity: activity.activity_name,
        location: activity.location_name,
        time: `${activity.scheduled_time} - ${calculateEndTime(activity.scheduled_time, activity.duration_minutes || 180)}`,
        category: activity.category || 'attraction',
        coordinates: { lat: activity.latitude || 26.6084, lng: activity.longitude || 37.8456 },
        notes: activity.notes || '',
        duration: activity.duration_minutes || 180,
        startTime: activity.scheduled_time,
        endTime: calculateEndTime(activity.scheduled_time, activity.duration_minutes || 180)
      }));
      
      setItinerary(formattedData);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
    }
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    startDate.setMinutes(startDate.getMinutes() + durationMinutes);
    return startDate.toTimeString().slice(0, 5);
  };

  const formatTo12Hour = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getAMPM = (time24: string) => {
    if (!time24) return '';
    const [hours] = time24.split(':').map(Number);
    return hours >= 12 ? 'PM' : 'AM';
  };

  const setupRealtimeUpdates = () => {
    const channel = supabase
      .channel('guide-assignments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tour_assignments',
          filter: `guide_id=eq.${currentGuide?.id}`
        },
        () => {
          fetchAssignedTourists();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchAssignedTourists(); // Refresh when tourist profiles update
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `tour_guide_id=eq.${currentGuide?.id}`
        },
        () => {
          fetchActivities();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_bookings'
        },
        () => {
          fetchDriverBookings();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drivers'
        },
        () => {
          fetchAvailableDrivers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addNewPackage = async () => {
    if (!selectedTourist || !newPackage.name.trim()) {
      toast({
        title: t('error'),
        description: 'Please select a tourist and enter package name',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('packages')
        .insert({
          package_name: newPackage.name,
          description: newPackage.description,
          price: parseFloat(newPackage.price) || 0,
          duration_hours: parseInt(newPackage.duration) || 1,
          included_activities: newPackage.included_activities,
          created_by: currentGuide?.id,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setTouristPackages(prev => [...prev, data]);
      setShowAddPackageDialog(false);
      
      // Reset form
      setNewPackage({
        name: '',
        description: '',
        price: '',
        duration: '',
        included_activities: []
      });

      toast({
        title: t('success'),
        description: 'Package added successfully!'
      });
    } catch (error: any) {
      console.error('Error adding package:', error);
      toast({
        title: t('error'),
        description: 'Failed to add package. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const mockTourists = assignedTourists.map(assignment => ({
    id: assignment.tourist_id,
    name: assignment.profiles?.full_name || 'Unknown Tourist',
    email: assignment.profiles?.contact_info || 'No contact info',
    contact_info: assignment.profiles?.phone_number || assignment.profiles?.contact_info || 'No contact info',
    nationality: assignment.profiles?.nationality || 'Unknown',
    status: assignment.status === 'active' ? 'Assigned' : 'Pending Assignment',
    tourName: assignment.tour_name || 'AlUla Heritage Tour',
    assignmentId: assignment.id
  }));

  const [driverBookings, setDriverBookings] = useState<any[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);

  const mockJourneyRequests: any[] = [];
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

      // Set session variable for RLS policies
      try {
        await supabase.rpc('set_guide_session' as any, { 
          guide_uuid: data.id, 
          guide_identifier: data.guide_id 
        });
      } catch (sessionError) {
        console.warn('Could not set guide session:', sessionError);
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

  const assignDriver = async (bookingId: string, driverId: string) => {
    try {
      const { error: bookingError } = await supabase
        .from('driver_bookings')
        .update({ 
          driver_id: driverId,
          status: 'assigned'
        })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      const { error: driverError } = await supabase
        .from('drivers')
        .update({ status: 'busy' })
        .eq('id', driverId);

      if (driverError) throw driverError;

      toast({
        title: t('success'),
        description: 'Driver assigned successfully!'
      });

      fetchDriverBookings();
      fetchAvailableDrivers();
    } catch (error: any) {
      console.error('Error assigning driver:', error);
      toast({
        title: t('error'),
        description: 'Failed to assign driver. Please try again.',
        variant: 'destructive'
      });
    }
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

  const saveItineraryItem = async (itemId: string) => {
    const item = itinerary.find(i => i.id === itemId);
    if (!item) return;

    try {
      await updateActivityInDB(itemId, item);
      setEditingItem(null);
      toast({
        title: t('success'),
        description: 'Activity updated successfully!'
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: 'Failed to update activity. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const addNewActivity = async () => {
    if (!newActivity.date || !newActivity.activity || !newActivity.location) {
      toast({
        title: t('error'),
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedTourist) {
      toast({
        title: t('error'),
        description: 'Please select a tourist first',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Get the tour assignment for the selected tourist
      const { data: assignment, error: assignmentError } = await supabase
        .from('tour_assignments')
        .select('id')
        .eq('tourist_id', selectedTourist)
        .eq('guide_id', currentGuide?.id)
        .eq('status', 'active')
        .single();

      if (assignmentError) {
        console.error('Assignment error:', assignmentError);
        toast({
          title: t('error'),
          description: 'No active tour assignment found for this tourist',
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase
        .from('activities')
        .insert({
          tour_guide_id: currentGuide?.id,
          tourist_id: selectedTourist,
          tour_assignment_id: assignment.id,
          activity_name: newActivity.activity,
          category: newActivity.category,
          location_name: newActivity.location,
          notes: newActivity.notes,
          scheduled_date: newActivity.date,
          scheduled_time: newActivity.startTime,
          duration_minutes: newActivity.duration,
          status: 'planned',
          created_by: currentGuide?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state immediately
      const newItem = {
        id: data.id,
        day: itinerary.length + 1,
        date: newActivity.date,
        activity: newActivity.activity,
        location: newActivity.location,
        time: `${newActivity.startTime} - ${newActivity.endTime}`,
        category: newActivity.category,
        coordinates: { lat: 26.6084, lng: 37.8456 },
        notes: newActivity.notes,
        duration: newActivity.duration,
        startTime: newActivity.startTime,
        endTime: newActivity.endTime
      };

      setItinerary(prev => [...prev, newItem]);
      setShowAddActivityDialog(false);
      
      // Reset form
      setNewActivity({
        date: '',
        category: 'attraction',
        activity: '',
        location: '',
        notes: '',
        startTime: '09:00',
        endTime: '12:00',
        duration: 180
      });

      toast({
        title: t('success'),
        description: 'New activity added successfully!'
      });
    } catch (error: any) {
      console.error('Error adding activity:', error);
      toast({
        title: t('error'),
        description: 'Failed to add activity. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      setItinerary(prev => prev.filter(item => item.id !== activityId));
      toast({
        title: t('success'),
        description: 'Activity deleted successfully!'
      });
    } catch (error: any) {
      console.error('Error deleting activity:', error);
      toast({
        title: t('error'),
        description: 'Failed to delete activity. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const updateActivityInDB = async (activityId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({
          activity_name: updates.activity,
          category: updates.category,
          location_name: updates.location,
          notes: updates.notes,
          scheduled_date: updates.date,
          scheduled_time: updates.startTime,
          duration_minutes: updates.duration
        })
        .eq('id', activityId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating activity:', error);
      throw error;
    }
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
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteActivity(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="ml-1 rtl:ml-0 rtl:mr-1">Remove</span>
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
    <div className="min-h-screen p-4 pt-20 pb-safe-area-inset-bottom">
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

      <div className="container mx-auto max-w-7xl space-y-6 px-safe-area-inset-x">
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
                    <SelectValue placeholder={t('selectTourist')}>
                      {selectedTourist ? mockTourists.find(t => t.id === selectedTourist)?.name || t('selectTourist') : t('selectTourist')}
                    </SelectValue>
                  </SelectTrigger>
                   <SelectContent className="max-h-60 overflow-y-auto">
                     {mockTourists.length > 0 ? (
                       mockTourists.map((tourist) => (
                         <SelectItem key={tourist.id} value={tourist.id}>
                           <div className="flex flex-col text-left py-1">
                             <span className="font-medium text-foreground">{tourist.name}</span>
                             <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                               <span>{tourist.nationality}</span>
                               <span>•</span>
                               <span>{tourist.contact_info}</span>
                               <Badge 
                                 variant={tourist.status.includes('Assigned') ? 'default' : 'secondary'}
                                 className="ml-auto text-xs"
                               >
                                 {tourist.status}
                               </Badge>
                             </div>
                           </div>
                         </SelectItem>
                       ))
                     ) : (
                       <SelectItem value="no-tourists" disabled>
                         <span className="text-muted-foreground italic">No tourists assigned yet</span>
                       </SelectItem>
                     )}
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
            {selectedTourist && (
              <Card className="shadow-desert">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Package className="w-5 h-5" />
                      <span>{t('managePackages')}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddPackageDialog(true)}
                      className="flex items-center space-x-2"
                    >
                      <Package className="w-4 h-4" />
                      <span>Add a Package</span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Selected Tourist Info */}
                    {(() => {
                      const tourist = mockTourists.find(t => t.id === selectedTourist);
                      return tourist ? (
                        <div className="p-4 border border-border rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-semibold">{tourist.name}</h4>
                              <p className="text-sm text-muted-foreground">{tourist.contact_info}</p>
                              <p className="text-xs text-muted-foreground">{tourist.nationality}</p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {tourist.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <span className="text-sm">{packageStates[tourist.id] ? t('packageEnabled') : t('packageDisabled')}</span>
                              <Switch
                                checked={packageStates[tourist.id] || false}
                                onCheckedChange={() => togglePackage(tourist.id)}
                              />
                            </div>
                          </div>
                          
                          {/* Tourist's Packages */}
                          <div className="space-y-3">
                            <h5 className="font-medium text-sm">Packages for {tourist.name}:</h5>
                            {touristPackages.length > 0 ? (
                              <div className="grid grid-cols-1 gap-3">
                                {touristPackages.map((pkg) => (
                                  <div key={pkg.id} className="p-3 bg-secondary/30 rounded-lg border">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h6 className="font-medium">{pkg.package_name}</h6>
                                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                          <span>Price: ${pkg.price}</span>
                                          <span>Duration: {pkg.duration_hours}h</span>
                                        </div>
                                      </div>
                                      <Badge variant="secondary">Active</Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No packages assigned to this tourist yet.</p>
                            )}
                          </div>
                          
                          {packageStates[tourist.id] && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
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
                      ) : null;
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categorized Itinerary Management */}
            {selectedTourist && (
              <div className="space-y-6">
                {Object.entries(categorizedItinerary).map(([category, items]) => 
                  items.length > 0 && renderCategorySection(category, items)
                )}
                
                <Button 
                  variant="default" 
                  className="w-full" 
                  onClick={() => setShowAddActivityDialog(true)}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Add New Activities
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
                  {driverBookings.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No driver booking requests</p>
                  ) : (
                    driverBookings.map((booking) => (
                      <div key={booking.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-semibold">{booking.profiles?.full_name || 'Tourist'}</h4>
                              <Badge variant={booking.status === 'pending' ? 'outline' : 'default'}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p className="flex items-center space-x-2 rtl:space-x-reverse">
                                <CalendarIcon className="w-3 h-3" />
                                <span>{booking.booking_date} at {booking.booking_time}</span>
                              </p>
                              <p className="flex items-center space-x-2 rtl:space-x-reverse">
                                <MapPin className="w-3 h-3" />
                                <span>From: {booking.pickup_location}</span>
                              </p>
                              <p className="flex items-center space-x-2 rtl:space-x-reverse">
                                <MapPin className="w-3 h-3" />
                                <span>To: {booking.destination}</span>
                              </p>
                              {booking.special_requests && (
                                <p className="text-sm">Special request: {booking.special_requests}</p>
                              )}
                            </div>
                          </div>
                          {booking.status === 'pending' && (
                            <div className="flex flex-col space-y-2 min-w-[200px]">
                              <Select onValueChange={(driverId) => assignDriver(booking.id, driverId)}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select driver" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableDrivers.map((driver) => (
                                    <SelectItem key={driver.id} value={driver.id}>
                                      {driver.name} - {driver.car_model}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {booking.status === 'assigned' && (
                            <Badge variant="default" className="ml-2">
                              Driver Assigned
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
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
                    <Badge variant="secondary">{mockTourists.filter(t => t.status.includes('Assigned')).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('pendingRequests')}</span>
                    <Badge variant="outline">{mockTourists.filter(t => t.status.includes('Pending')).length}</Badge>
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

        {/* Add Activity Dialog */}
        <Dialog open={showAddActivityDialog} onOpenChange={setShowAddActivityDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newActivity.date ? format(new Date(newActivity.date), "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newActivity.date ? new Date(newActivity.date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setNewActivity(prev => ({
                            ...prev,
                            date: date.toISOString().split('T')[0]
                          }));
                        }
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Activity Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type of Activity *</label>
                <Select
                  value={newActivity.category}
                  onValueChange={(value) => setNewActivity(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heritage">
                      <div className="flex items-center space-x-2">
                        <Castle className="w-4 h-4" />
                        <span>Heritage Sites</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="attraction">
                      <div className="flex items-center space-x-2">
                        <Mountain className="w-4 h-4" />
                        <span>Attraction Places</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="adventure">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Adventurous Experiences</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Activity Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Name of Activity *</label>
                <Input
                  placeholder="Enter activity name"
                  value={newActivity.activity}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, activity: e.target.value }))}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location *</label>
                <Input
                  placeholder="Enter location"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              {/* Time Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <div className="flex space-x-2">
                    <Input
                      type="time"
                      value={newActivity.startTime}
                      onChange={(e) => {
                        const startTime = e.target.value;
                        const endTime = calculateEndTime(startTime, newActivity.duration);
                        setNewActivity(prev => ({ 
                          ...prev, 
                          startTime,
                          endTime
                        }));
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    min="30"
                    step="30"
                    value={newActivity.duration}
                    onChange={(e) => {
                      const duration = parseInt(e.target.value) || 180;
                      const endTime = calculateEndTime(newActivity.startTime, duration);
                      setNewActivity(prev => ({ 
                        ...prev, 
                        duration,
                        endTime
                      }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={formatTo12Hour(newActivity.endTime)}
                      readOnly
                      className="bg-muted flex-1"
                    />
                    <Badge variant="outline" className="px-2 py-1">
                      {getAMPM(newActivity.endTime)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Add any additional notes or instructions"
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={() => setShowAddActivityDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={addNewActivity}
                  className="flex-1"
                >
                  Add Activity
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Package Dialog */}
        <Dialog open={showAddPackageDialog} onOpenChange={setShowAddPackageDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add a Pack</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              {/* Package Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Package Name *</label>
                <Input
                  placeholder="Enter package name"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe what's included in this package"
                  value={newPackage.description}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              {/* Price and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price ($)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={newPackage.price}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (hours)</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={newPackage.duration}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, duration: e.target.value }))}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={() => setShowAddPackageDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={addNewPackage}
                  className="flex-1"
                >
                  Add New Pack
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
