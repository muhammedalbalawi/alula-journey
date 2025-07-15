
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  RotateCcw,
  UserCheck,
  Phone,
  Mail,
  UserX,
  UserPlus,
  FileText,
  Table,
  Edit,
  Save,
  X,
  Flag
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { DriverBooking } from '@/components/DriverBooking';
import { TouristExperiences } from '@/components/TouristExperiences';
import { GoogleMaps } from '@/components/GoogleMaps';
import { PhotoCaptureModal } from '@/components/PhotoCaptureModal';
import { TouristPasswordLogin } from '@/components/TouristPasswordLogin';
import { TouristAlbum } from '@/components/TouristAlbum';
import { TouristProfile } from '@/components/TouristProfile';
import { supabase } from '@/integrations/supabase/client';

export const TouristView: React.FC = () => {
  const { t, translateLocation } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [touristId, setTouristId] = useState('');
  const [userSession, setUserSession] = useState<any>(null);
  
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
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showActivityReschedule, setShowActivityReschedule] = useState(false);
  const [guideRating, setGuideRating] = useState(0);
  const [userGuideRating, setUserGuideRating] = useState<any>(null);
  const [assignedGuide, setAssignedGuide] = useState<any>(null);
  const [tourAssignment, setTourAssignment] = useState<any>(null);
  const [guideRequest, setGuideRequest] = useState<any>(null);
  const [tourActivities, setTourActivities] = useState<any[]>([]);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);

  // Dynamic tour activities from database
  const allLocations = tourActivities.map(activity => ({
    id: activity.id,
    name: activity.activity_name,
    location: activity.location_name,
    time: activity.scheduled_time,
    date: activity.scheduled_date,
    description: activity.description || activity.activity_name,
    notes: activity.notes || 'Contact your guide for more information.',
    coordinates: { lat: activity.latitude || 26.6084, lng: activity.longitude || 37.8456 },
    category: activity.category as 'heritage' | 'attraction' | 'adventure'
  }));

  // Categorized destinations
  const destinations = {
    heritage: allLocations.filter(d => d.category === 'heritage'),
    attraction: allLocations.filter(d => d.category === 'attraction'),
    adventure: allLocations.filter(d => d.category === 'adventure')
  };

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

  // Check for existing session and fetch guide request
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

  // Fetch guide request when user session changes and set up real-time updates
  useEffect(() => {
    if (userSession?.user?.id) {
    fetchGuideRequest();
    fetchTourActivities();
    fetchCountries();
    fetchPackages();
    fetchUserGuideRating();
    const cleanup = setupRealtimeUpdates();
    return cleanup;
    }
  }, [userSession]);

  const fetchGuideRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('guide_requests')
        .select(`
          *,
          guides (
            name,
            email,
            phone,
            rating,
            specializations
          )
        `)
        .eq('tourist_id', userSession?.user?.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const request = data[0];
        setGuideRequest(request);
        setAssignedGuide(request.guides);
        
        // Also fetch tour assignment for activities
        await fetchTourAssignment();
      } else {
        setGuideRequest(null);
        setAssignedGuide(null);
        setTourActivities([]);
      }
    } catch (error: any) {
      console.error('Error fetching guide request:', error);
    }
  };

  const fetchTourAssignment = async () => {
    try {
      const { data, error } = await supabase
        .from('tour_assignments')
        .select('*')
        .eq('tourist_id', userSession?.user?.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setTourAssignment(data);
      
      // Fetch activities after getting assignment
      if (data?.id) {
        fetchTourActivitiesForAssignment(data.id);
      }
    } catch (error: any) {
      console.error('Error fetching tour assignment:', error);
    }
  };

  const fetchTourActivities = async () => {
    try {
      if (!tourAssignment?.id) return;
      await fetchTourActivitiesForAssignment(tourAssignment.id);
    } catch (error: any) {
      console.error('Error fetching tour activities:', error);
    }
  };

  const fetchTourActivitiesForAssignment = async (assignmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('tour_assignment_id', assignmentId)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setTourActivities(data || []);
    } catch (error: any) {
      console.error('Error fetching activities for assignment:', error);
    }
  };

  const setupRealtimeUpdates = () => {
    const channel = supabase
      .channel('tourist-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guide_requests',
          filter: `tourist_id=eq.${userSession?.user?.id}`
        },
        () => {
          fetchGuideRequest();
        }
      )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activities',
            filter: `tourist_id=eq.${userSession?.user?.id}`
          },
          () => {
            fetchTourActivities();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'guide_ratings',
            filter: `tourist_id=eq.${userSession?.user?.id}`
          },
          () => {
            fetchUserGuideRating();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'guides'
          },
          () => {
            fetchGuideRequest(); // This will also update the guide's rating display
          }
        )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('country_name_en');

      if (error) throw error;
      setCountries(data || []);
    } catch (error: any) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      console.error('Error fetching packages:', error);
    }
  };

  const downloadActivitiesCSV = () => {
    const csvContent = [
      ['Activity Name', 'Location', 'Date', 'Time', 'Description', 'Status'],
      ...tourActivities.map(activity => [
        activity.activity_name,
        activity.location_name,
        activity.scheduled_date,
        activity.scheduled_time,
        activity.description || '',
        activity.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activities.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadActivitiesPDF = async () => {
    const pdf = new jsPDF();
    pdf.text('My Tour Activities', 20, 20);
    
    let yPosition = 40;
    tourActivities.forEach((activity, index) => {
      pdf.text(`${index + 1}. ${activity.activity_name}`, 20, yPosition);
      pdf.text(`   Location: ${activity.location_name}`, 20, yPosition + 10);
      pdf.text(`   Date: ${activity.scheduled_date} at ${activity.scheduled_time}`, 20, yPosition + 20);
      if (activity.description) {
        pdf.text(`   Description: ${activity.description}`, 20, yPosition + 30);
        yPosition += 50;
      } else {
        yPosition += 40;
      }
    });
    
    pdf.save('activities.pdf');
  };

  const editActivity = async (activityId: string, updatedData: any) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update(updatedData)
        .eq('id', activityId);

      if (error) throw error;

      toast({
        title: 'Activity Updated',
        description: 'The activity has been updated successfully.'
      });
      
      setEditingActivityId(null);
      setEditingActivity(null);
      fetchTourActivities();
    } catch (error: any) {
      console.error('Error updating activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update activity.',
        variant: 'destructive'
      });
    }
  };

  const handleGuideRequest = async () => {
    if (!comment.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a message with your guide request.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // First, ensure the user profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userSession?.user?.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: userSession?.user?.id,
            user_type: 'tourist'
          });
        
        if (createProfileError) {
          console.error('Error creating profile:', createProfileError);
          toast({
            title: 'Error',
            description: 'Failed to create user profile. Please try again.',
            variant: 'destructive',
          });
          return;
        }
      } else if (profileError) {
        throw profileError;
      }

      // Now submit the guide request
      const { error } = await supabase
        .from('guide_requests')
        .insert({
          tourist_id: userSession?.user?.id,
          request_message: comment.trim(),
          status: 'pending'
        });

      if (error) throw error;

      setComment('');
      toast({
        title: 'Request Submitted',
        description: 'Your guide request has been sent to the admin for review.',
      });
      
      // Refresh guide request status
      fetchGuideRequest();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit guide request.',
        variant: 'destructive',
      });
    }
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

  const openActivityRescheduleDialog = (activity: any) => {
    setSelectedActivity(activity);
    setShowActivityReschedule(true);
  };

  const handleActivityReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      toast({
        title: t('error'),
        description: 'Please select both date and time for rescheduling.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create reschedule request in database
      const { data: rescheduleRequest, error: rescheduleError } = await supabase
        .from('reschedule_requests')
        .insert({
          tourist_id: userSession?.user?.id,
          guide_id: assignedGuide?.id,
          tour_assignment_id: tourAssignment?.id,
          location_name: selectedActivity?.location_name,
          original_date: selectedActivity?.scheduled_date,
          original_time: selectedActivity?.scheduled_time,
          requested_date: format(rescheduleData.date, 'yyyy-MM-dd'),
          requested_time: rescheduleData.time,
          reason: rescheduleData.notes,
          status: 'pending'
        })
        .select()
        .single();

      if (rescheduleError) throw rescheduleError;

      // Send notification to tour guide
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: assignedGuide?.id,
          title: 'Reschedule Request',
          message: `Tourist has requested to reschedule "${selectedActivity?.activity_name}" from ${selectedActivity?.scheduled_date} at ${selectedActivity?.scheduled_time} to ${format(rescheduleData.date, 'yyyy-MM-dd')} at ${rescheduleData.time}. Reason: ${rescheduleData.notes || 'No reason provided'}`,
          notification_type: 'reschedule_request',
          related_id: rescheduleRequest.id,
          is_read: false
        });

      if (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Continue even if notification fails
      }

      setShowActivityReschedule(false);
      toast({
        title: t('success'),
        description: 'Reschedule request sent to your guide successfully!'
      });
      
      setRescheduleData({
        date: undefined,
        time: '',
        notes: ''
      });
    } catch (error: any) {
      console.error('Error creating reschedule request:', error);
      toast({
        title: t('error'),
        description: 'Failed to send reschedule request. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleGuideRating = async (rating: number) => {
    if (!assignedGuide || !userSession?.user?.id) {
      toast({
        title: t('error'),
        description: 'Please log in to rate your guide.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Check if user has already rated this guide
      const { data: existingRating, error: fetchError } = await supabase
        .from('guide_ratings')
        .select('*')
        .eq('tourist_id', userSession.user.id)
        .eq('guide_id', assignedGuide.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingRating) {
        // Update existing rating
        const { error: updateError } = await supabase
          .from('guide_ratings')
          .update({ 
            rating: rating,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRating.id);

        if (updateError) throw updateError;
      } else {
        // Create new rating
        const { error: insertError } = await supabase
          .from('guide_ratings')
          .insert({
            tourist_id: userSession.user.id,
            guide_id: assignedGuide.id,
            rating: rating,
            tour_assignment_id: tourAssignment?.id
          });

        if (insertError) throw insertError;
      }

      setGuideRating(rating);
      
      // Update guide's average rating
      await updateGuideAverageRating(assignedGuide.id);
      
      toast({
        title: t('success'),
        description: `You rated your guide ${rating} star${rating > 1 ? 's' : ''}!`
      });

    } catch (error: any) {
      console.error('Error submitting guide rating:', error);
      toast({
        title: t('error'),
        description: 'Failed to submit rating. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const updateGuideAverageRating = async (guideId: string) => {
    try {
      // Calculate new average rating for the guide
      const { data: ratings, error: ratingsError } = await supabase
        .from('guide_ratings')
        .select('rating')
        .eq('guide_id', guideId);

      if (ratingsError) throw ratingsError;

      if (ratings && ratings.length > 0) {
        const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
        
        // Update guide's rating in guides table
        const { error: updateError } = await supabase
          .from('guides')
          .update({ rating: parseFloat(averageRating.toFixed(1)) })
          .eq('id', guideId);

        if (updateError) throw updateError;
      }
    } catch (error: any) {
      console.error('Error updating guide average rating:', error);
    }
  };

  const fetchUserGuideRating = async () => {
    if (!assignedGuide || !userSession?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('guide_ratings')
        .select('rating')
        .eq('tourist_id', userSession.user.id)
        .eq('guide_id', assignedGuide.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setGuideRating(data.rating);
      }
    } catch (error: any) {
      console.error('Error fetching user guide rating:', error);
    }
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
                {tourActivities.length === 0 && assignedGuide && (
                  <p className="text-sm text-amber-600 mt-2">
                    Your guide hasn't created your schedule yet. They will add activities soon!
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={handleLogout} size="sm">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tour Guide Assignment Section */}
        <Card className="glass-card hover:shadow-float transition-all duration-300 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="p-2 bg-primary/10 rounded-lg">
                {assignedGuide ? (
                  <UserCheck className="w-5 h-5 text-primary" />
                ) : (
                  <UserX className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <span className="bg-gradient-to-r from-primary to-heritage-amber bg-clip-text text-transparent">
                {assignedGuide ? 'Your Assigned Tour Guide' : 'Tour Guide Status'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedGuide ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {assignedGuide.name || 'Professional Guide'}
                        </h3>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700">
                          Assigned
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {assignedGuide.phone && (
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{assignedGuide.phone}</span>
                          </div>
                        )}
                        
                        {assignedGuide.email && (
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{assignedGuide.email}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-foreground">{assignedGuide.rating || 4.8}/5.0 Rating</span>
                        </div>
                      </div>

                      {assignedGuide.specializations && assignedGuide.specializations.length > 0 && (
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-sm font-medium mb-2">Specializations:</p>
                          <div className="flex flex-wrap gap-1">
                            {assignedGuide.specializations.map((spec: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {/* Guide Rating Component */}
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800 flex-1 min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Rate Your Guide</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-muted-foreground">{assignedGuide.rating || 0}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 cursor-pointer transition-colors ${
                            star <= (guideRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                          }`}
                          onClick={() => handleGuideRating(star)}
                        />
                      ))}
                    </div>
                    {guideRating > 0 && (
                      <p className="text-xs text-muted-foreground">Thank you for rating your guide!</p>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`tel:${assignedGuide.phone}`, '_self')}
                    className="flex items-center space-x-1 rtl:space-x-reverse glass-effect hover:shadow-card"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Guide</span>
                  </Button>
                  <Button 
                    variant="desert" 
                    size="sm"
                    onClick={() => window.open(`https://wa.me/${assignedGuide.phone?.replace(/[^0-9]/g, '')}?text=Hello! I'm your assigned tourist from AlUla Journey. I'd like to discuss our tour plans.`, '_blank')}
                    className="flex items-center space-x-1 rtl:space-x-reverse"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Contact via WhatsApp</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Tour Guide Assigned Yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Request a professional tour guide to enhance your AlUla experience.
                    </p>
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700">
                      Ready to Request
                    </Badge>
                  </div>
                </div>
                
                {/* Guide Request Form */}
                <div className="space-y-4 p-4 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30">
                  <h3 className="font-medium">Request a Tour Guide</h3>
                  <Textarea
                    placeholder="Please describe your tour preferences, dates, and any special requirements..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button
                    onClick={handleGuideRequest}
                    className="w-full"
                    variant="desert"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Submit Guide Request
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Packages Section */}
        <Card className="glass-card hover:shadow-float transition-all duration-300 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-primary to-heritage-amber bg-clip-text text-transparent">
                Available Tour Packages
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{pkg.package_name}</h3>
                      <p className="text-muted-foreground">{pkg.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{pkg.price} SAR</div>
                      <div className="text-sm text-muted-foreground">{pkg.duration_hours} hours</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div><span className="font-medium">Max Participants:</span> {pkg.max_participants}</div>
                    <div><span className="font-medium">Difficulty:</span> {pkg.difficulty_level}</div>
                    <div><Badge variant="outline">{pkg.status}</Badge></div>
                  </div>
                  {pkg.included_activities && pkg.included_activities.length > 0 && (
                    <div className="mb-4">
                      <span className="font-medium text-sm">Included Activities:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pkg.included_activities.map((activity: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">{activity}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button className="w-full">Book This Package</Button>
                </div>
              ))}
              {packages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No packages available at the moment
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tourist Profile Section */}
        <div className="animate-slide-up">
          <TouristProfile userId={userSession?.user?.id} />
        </div>

        {/* Activities Table Section */}
        <Card className="glass-card hover:shadow-float transition-all duration-300 animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Table className="w-5 h-5 text-primary" />
                </div>
                <span className="bg-gradient-to-r from-primary to-heritage-amber bg-clip-text text-transparent">
                  My Activities Schedule
                </span>
                <Badge variant="outline">{tourActivities.length}</Badge>
              </CardTitle>
              
              {tourActivities.length > 0 && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadActivitiesCSV}
                    className="flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadActivitiesPDF}
                    className="flex items-center space-x-1"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download PDF</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {tourActivities.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <Table className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Activities Scheduled Yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {assignedGuide 
                      ? "Your guide will add activities to your schedule soon!"
                      : "Request a guide to start planning your activities."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium">Activity</th>
                      <th className="text-left p-3 font-medium">Location</th>
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Time</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tourActivities.map((activity, index) => (
                      <tr key={activity.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          {editingActivityId === activity.id ? (
                            <Input
                              value={editingActivity?.activity_name || activity.activity_name}
                              onChange={(e) => setEditingActivity({
                                ...editingActivity,
                                activity_name: e.target.value
                              })}
                              className="text-sm"
                            />
                          ) : (
                            <div>
                              <div className="font-medium">{activity.activity_name}</div>
                              {activity.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {activity.description}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          {editingActivityId === activity.id ? (
                            <Input
                              value={editingActivity?.location_name || activity.location_name}
                              onChange={(e) => setEditingActivity({
                                ...editingActivity,
                                location_name: e.target.value
                              })}
                              className="text-sm"
                            />
                          ) : (
                            activity.location_name
                          )}
                        </td>
                        <td className="p-3">
                          {editingActivityId === activity.id ? (
                            <Input
                              type="date"
                              value={editingActivity?.scheduled_date || activity.scheduled_date}
                              onChange={(e) => setEditingActivity({
                                ...editingActivity,
                                scheduled_date: e.target.value
                              })}
                              className="text-sm"
                            />
                          ) : (
                            new Date(activity.scheduled_date).toLocaleDateString()
                          )}
                        </td>
                        <td className="p-3">
                          {editingActivityId === activity.id ? (
                            <Input
                              type="time"
                              value={editingActivity?.scheduled_time || activity.scheduled_time}
                              onChange={(e) => setEditingActivity({
                                ...editingActivity,
                                scheduled_time: e.target.value
                              })}
                              className="text-sm"
                            />
                          ) : (
                            activity.scheduled_time
                          )}
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant={activity.status === 'completed' ? 'default' : 'outline'}
                            className={
                              activity.status === 'completed' ? 'bg-green-100 text-green-700 border-green-300' :
                              activity.status === 'planned' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                              'bg-orange-100 text-orange-700 border-orange-300'
                            }
                          >
                            {activity.status?.charAt(0).toUpperCase() + activity.status?.slice(1) || 'Pending'}
                          </Badge>
                        </td>
                        <td className="p-3">
                           <div className="flex space-x-1">
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={() => openActivityRescheduleDialog(activity)}
                               className="h-7 px-2 flex items-center space-x-1"
                             >
                               <RotateCcw className="w-3 h-3" />
                               <span className="text-xs">Reschedule</span>
                             </Button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

            {/* Photo Album Section */}
            <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <TouristAlbum />
            </div>
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

        {/* Activity Reschedule Dialog */}
        <Dialog open={showActivityReschedule} onOpenChange={setShowActivityReschedule}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reschedule Activity - {selectedActivity?.activity_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Original Schedule Info */}
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Current Schedule:</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedActivity?.scheduled_date} at {selectedActivity?.scheduled_time}
                </p>
                <p className="text-sm text-muted-foreground">
                  Location: {selectedActivity?.location_name}
                </p>
              </div>

              {/* Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">New Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {rescheduleData.date ? format(rescheduleData.date, "PPP") : <span>Select new date</span>}
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
                <label className="text-sm font-medium">New Time</label>
                <TimePicker
                  value={rescheduleData.time}
                  onChange={(time) => setRescheduleData({...rescheduleData, time})}
                />
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for Rescheduling</label>
                <Textarea
                  placeholder="Please provide a reason for rescheduling this activity..."
                  value={rescheduleData.notes}
                  onChange={(e) => setRescheduleData({...rescheduleData, notes: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>

              <Button onClick={handleActivityReschedule} className="w-full">
                Send Reschedule Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
