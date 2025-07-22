import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Session } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Clock, Users, DollarSign, RefreshCw, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PackageData {
  id: string;
  package_name: string;
  description: string;
  duration_hours: number;
  price: number;
  included_activities: string[];
  max_participants: number;
  difficulty_level: string;
  status: string;
  created_at: string;
}

interface TouristPackagesProps {
  session: Session;
}

export const TouristPackages: React.FC<TouristPackagesProps> = ({ session }) => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real-time subscription to packages
  useEffect(() => {
    fetchPackages();

    // Set up real-time subscription
    const channel = supabase
      .channel('packages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'packages'
        },
        (payload) => {
          console.log('Package change:', payload);
          fetchPackages(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPackages = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error loading packages",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleBookPackage = (packageId: string) => {
    // This would typically open a booking modal or navigate to booking page
    toast({
      title: "Booking feature coming soon",
      description: "Package booking will be available shortly",
    });
  };

  if (loading && !refreshing) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
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
          <h1 className="text-3xl font-bold mb-2">{t('packages')}</h1>
          <p className="text-muted-foreground">
            {t('discoverTourPackages')}
          </p>
        </div>
        
        <Button
          onClick={fetchPackages}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
      </div>

      {packages.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noPackagesAvailable')}</h3>
            <p className="text-muted-foreground">
              {t('packagesWillAppear')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{pkg.package_name}</CardTitle>
                  <Badge className={getDifficultyColor(pkg.difficulty_level)}>
                    {pkg.difficulty_level}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {pkg.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{pkg.duration_hours} {t('hours')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{t('maxParticipants')}: {pkg.max_participants}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-primary">${pkg.price}</span>
                  </div>
                </div>
                
                {pkg.included_activities && pkg.included_activities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('includedActivities')}:</h4>
                    <div className="flex flex-wrap gap-1">
                      {pkg.included_activities.slice(0, 3).map((activity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {activity}
                        </Badge>
                      ))}
                      {pkg.included_activities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pkg.included_activities.length - 3} {t('more')}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={() => handleBookPackage(pkg.id)}
                  className="w-full"
                >
                  <Star className="w-4 h-4 mr-2" />
                  {t('bookPackage')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};