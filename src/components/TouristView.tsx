import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Phone, Star, MessageCircle, Download, Camera, Map, UserCheck, Users, Palette, Heart, ChevronRight, Share2, UserCircle, Star as StarIcon, MessageSquare, Calendar as CalendarIcon, AlertCircle, UserX } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PhotoCaptureModal } from './PhotoCaptureModal';
import { TouristProfile } from './TouristProfile';
import { TouristAlbum } from './TouristAlbum';
import { TouristExperiences } from './TouristExperiences';
import { GoogleMaps } from './GoogleMaps';
import { TouristSidebar } from './TouristSidebar';

interface TourActivity {
  id: number;
  day_number: number;
  date: string;
  activity_name: string;
  location: string;
  time: string;
  description?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

interface TouristProfile {
  id: string;
  full_name: string;
  gender: string;
  nationality: string;
  contact_info: string;
}

interface TouristViewProps {
  userSession: any;
  onLogout: () => void;
}

export const TouristView: React.FC<TouristViewProps> = ({ userSession, onLogout }) => {
  const { t, language } = useLanguage();
  const [tourActivities, setTourActivities] = useState<TourActivity[]>([]);
  const [assignedGuide, setAssignedGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [showExperiences, setShowExperiences] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<TourActivity | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [touristProfile, setTouristProfile] = useState<TouristProfile | null>(null);
  const [activeSection, setActiveSection] = useState('schedules');
  const scheduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTourActivities();
    fetchAssignedGuide();
    fetchTouristProfile();

    // Set up real-time subscription for tour activities
    const tourActivitiesSubscription = supabase
      .channel('tour_activities_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tour_activities',
          filter: `tourist_id=eq.${userSession?.user?.id}`
        },
        () => {
          fetchTourActivities();
        }
      )
      .subscribe();

    // Set up real-time subscription for tour assignments  
    const tourAssignmentsSubscription = supabase
      .channel('tour_assignments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public', 
          table: 'tour_assignments',
          filter: `tourist_id=eq.${userSession?.user?.id}`
        },
        () => {
          fetchAssignedGuide();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tourActivitiesSubscription);
      supabase.removeChannel(tourAssignmentsSubscription);
    };
  }, [userSession?.user?.id]);

  const fetchTourActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('created_by', userSession?.user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      // Transform the data to match TourActivity interface
      const transformedData = data?.map((item, index) => ({
        id: parseInt(item.id),
        day_number: index + 1,
        date: item.created_at,
        activity_name: item.activity_name,
        location: item.location_name || 'Location TBD',
        time: '09:00',
        description: item.description,
        notes: '',
        latitude: item.latitude,
        longitude: item.longitude
      })) || [];
      setTourActivities(transformedData);
    } catch (error) {
      console.error('Error fetching tour activities:', error);
      toast({
        title: "Error",
        description: "Failed to load tour activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedGuide = async () => {
    try {
      const { data, error } = await supabase
        .from('tour_assignments')
        .select(`
          *,
          guides(*)
        `)
        .eq('tourist_id', userSession?.user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setAssignedGuide(data?.guides || null);
    } catch (error) {
      console.error('Error fetching assigned guide:', error);
    }
  };

  const fetchTouristProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userSession?.user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching tourist profile:', error);
        return;
      }

      if (data) {
        // Transform the data to match TouristProfile interface
        const transformedProfile = {
          id: data.id,
          full_name: data.full_name || 'User',
          gender: 'not_specified',
          nationality: 'Not specified',
          contact_info: userSession?.user?.phone || userSession?.user?.email || ''
        };
        setTouristProfile(transformedProfile);
      }
    } catch (error) {
      console.error('Error fetching tourist profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const generatePDF = async () => {
    if (!scheduleRef.current) return;

    try {
      const canvas = await html2canvas(scheduleRef.current);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('tour-schedule.pdf');
      
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'schedules':
        return renderSchedulesSection();
      case 'packages':
        return renderPackagesSection();
      case 'profile':
        return <TouristProfile userSession={userSession} />;
      case 'experiences':
        return <TouristExperiences />;
      default:
        return renderSchedulesSection();
    }
  };

  const renderSchedulesSection = () => (
    <div className="space-y-6">
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
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={assignedGuide.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {assignedGuide.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-primary">{assignedGuide.name}</h3>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Available
                    </Badge>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.9</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{assignedGuide.specializations}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 rtl:space-x-reverse"
                  onClick={() => window.open(`tel:${assignedGuide.phone}`, '_self')}
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('call')}</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 rtl:space-x-reverse bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  onClick={() => window.open(`https://wa.me/${assignedGuide.phone}?text=${encodeURIComponent(t('whatsAppMsg'))}`, '_blank')}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('whatsApp')}</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-muted/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <UserX className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No Guide Assigned</h3>
              <p className="text-sm text-muted-foreground">
                A tour guide will be assigned to you soon. You'll receive a notification once assigned.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tour Schedule */}
      <div ref={scheduleRef}>
        <Card className="glass-card hover:shadow-float transition-all duration-300 animate-fade-in">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <span className="bg-gradient-to-r from-primary to-heritage-amber bg-clip-text text-transparent">
                  {t('itinerary')}
                </span>
              </CardTitle>
              <Button 
                onClick={generatePDF} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <Download className="w-4 h-4" />
                <span>{t('downloadPdf')}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                    <div className="h-20 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : tourActivities.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(
                  tourActivities.reduce((acc, activity) => {
                    if (!acc[activity.day_number]) {
                      acc[activity.day_number] = [];
                    }
                    acc[activity.day_number].push(activity);
                    return acc;
                  }, {} as Record<number, TourActivity[]>)
                ).map(([dayNumber, activities]) => (
                  <div key={dayNumber} className="space-y-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-3 py-1">
                        {t('day')} {dayNumber}
                      </Badge>
                      {activities[0]?.date && (
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(activities[0].date), 'PPP')}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid gap-4">
                      {activities.map((activity) => (
                        <Card key={activity.id} className="border border-border/50 hover:border-primary/30 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2 flex-1">
                                <h4 className="font-semibold text-lg">{activity.activity_name}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <MapPin className="w-4 h-4" />
                                    <span>{activity.location}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <Clock className="w-4 h-4" />
                                    <span>{activity.time}</span>
                                  </div>
                                </div>
                                {activity.description && (
                                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                                )}
                                {activity.notes && (
                                  <div className="p-3 bg-muted/20 rounded-lg">
                                    <p className="text-sm"><strong>Guide Notes:</strong> {activity.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                         </Card>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-4 bg-muted/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Schedule Available</h3>
                <p className="text-sm text-muted-foreground">
                  {assignedGuide 
                    ? "Your guide hasn't created your schedule yet. They will add activities soon!"
                    : "You'll see your itinerary here once a guide is assigned and creates your schedule."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPackagesSection = () => (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Badge className="mr-2">🎁</Badge>
            {t('touristPackage')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(t('packageItems')).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div 
      className={`min-h-screen ${language === 'ar' ? 'rtl' : 'ltr'}`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex">
        <TouristSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
          userSession={userSession}
        />
        
        <main className="flex-1 p-6 pt-20 overflow-auto">
          <div className="container mx-auto max-w-6xl">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};
