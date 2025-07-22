import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Camera, Users, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Session } from '@supabase/supabase-js';

interface TouristExperience {
  id: string;
  user_id: string;
  photo_id: string;
  comment: string;
  location_name: string | null;
  destinations: string[] | null;
  rating: number;
  created_at: string;
  tourist_photos: {
    file_path: string;
    file_name: string;
    caption: string;
  };
}

interface TouristExperiencesProps {
  session: Session;
}

export const TouristExperiences: React.FC<TouristExperiencesProps> = ({ session }) => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<TouristExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real-time subscription to experiences
  useEffect(() => {
    fetchExperiences();

    // Set up real-time subscription
    const channel = supabase
      .channel('experiences-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tourist_experiences'
        },
        (payload) => {
          console.log('Experience change:', payload);
          fetchExperiences(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchExperiences = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('tourist_experiences')
        .select(`
          *,
          tourist_photos!inner(
            file_path,
            file_name,
            caption
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast({
        title: "Error loading experiences",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
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
          <h1 className="text-3xl font-bold mb-2">{t('myExperiences')}</h1>
          <p className="text-muted-foreground">
            {t('experienceGallery')}
          </p>
        </div>
        
        <Button
          onClick={fetchExperiences}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
      </div>

      {experiences.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noExperiencesYet')}</h3>
            <p className="text-muted-foreground">
              {t('experiencesWillAppear')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience) => (
            <Card key={experience.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={`${supabase.storage.from('tourist-photos').getPublicUrl(experience.tourist_photos.file_path).data.publicUrl}`}
                  alt={experience.tourist_photos.caption || 'Experience photo'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-black/70 text-white">
                    <div className="flex items-center gap-1">
                      {renderStars(experience.rating)}
                    </div>
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">
                  {experience.location_name || 'AlUla Experience'}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {experience.comment}
                </p>
                
                {experience.destinations && experience.destinations.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {experience.destinations.slice(0, 3).map((destination, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {destination}
                      </Badge>
                    ))}
                    {experience.destinations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{experience.destinations.length - 3} {t('more')}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{t('touristExperiences')}</span>
                  </div>
                  <span>
                    {new Date(experience.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};