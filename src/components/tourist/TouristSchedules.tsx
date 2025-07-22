import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Session } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Activity {
  id: string;
  activity_name: string;
  location_name: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  description: string;
  notes: string;
  status: string;
  category: string;
}

interface TouristSchedulesProps {
  session: Session;
}

export const TouristSchedules: React.FC<TouristSchedulesProps> = ({ session }) => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real-time subscription to activities
  useEffect(() => {
    fetchActivities();

    // Set up real-time subscription
    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `tourist_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Activity change:', payload);
          fetchActivities(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session.user.id]);

  const fetchActivities = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('tourist_id', session.user.id)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error loading activities",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('tourSchedules')}</h1>
          <p className="text-muted-foreground">
            {t('manageTourSchedules')}
          </p>
        </div>
        
        <Button
          onClick={fetchActivities}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noScheduleAvailable')}</h3>
            <p className="text-muted-foreground">
              {t('scheduleWillAppear')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>{activity.activity_name}</span>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(activity.scheduled_date), 'PPP')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {activity.scheduled_time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {activity.location_name}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {activity.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {activity.description}
                  </p>
                )}
                
                {activity.notes && (
                  <div className="bg-muted/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('guideNotes')}</span>
                    </div>
                    <p className="text-sm">{activity.notes}</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    {activity.duration_minutes && `${activity.duration_minutes} ${t('minutes')}`}
                    {activity.category && ` • ${activity.category}`}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};