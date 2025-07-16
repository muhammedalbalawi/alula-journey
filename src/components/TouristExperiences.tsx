
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Camera, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

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
    caption: string | null;
  };
  profiles: {
    full_name: string | null;
  } | null;
}

export const TouristExperiences: React.FC = () => {
  const { t } = useLanguage();
  const [experiences, setExperiences] = useState<TouristExperience[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('tourist_experiences')
        .select(`
          *,
          tourist_photos!inner (
            file_path,
            file_name,
            caption
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get user profiles separately to avoid join issues
      const experiencesWithProfiles = await Promise.all(
        (data || []).map(async (experience) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', experience.user_id)
            .single();
          
          return {
            ...experience,
            profiles: profileData
          };
        })
      );
      
      setExperiences(experiencesWithProfiles);
    } catch (error) {
      console.error('Error fetching tourist experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();

    // Set up real-time updates for new experiences
    const channel = supabase
      .channel('tourist_experiences_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tourist_experiences'
        },
        () => {
          fetchExperiences();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('tourist-photos')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-bold text-primary">{t('touristExperiences')}</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('previousTourists')}
        </p>
      </div>

      {/* Experience Gallery */}
      <Card className="shadow-desert">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <Camera className="w-5 h-5" />
            <span>{t('experienceGallery')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {experiences.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No shared experiences yet. Be the first to share your AlUla journey!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {experiences.map((experience) => (
                <div key={experience.id} className="relative group">
                  <img
                    src={getImageUrl(experience.tourist_photos.file_path)}
                    alt={experience.tourist_photos.caption || 'Tourist experience'}
                    className="w-full h-24 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                    <p className="text-white text-xs text-center px-2">{experience.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tourist Reviews */}
      {experiences.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience) => (
            <Card key={experience.id} className="shadow-desert">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Tourist Info */}
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">
                      {experience.profiles?.full_name || 'Anonymous Tourist'}
                    </h4>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= experience.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Experience Image */}
                  <img
                    src={getImageUrl(experience.tourist_photos.file_path)}
                    alt={`${experience.profiles?.full_name || 'Tourist'}'s experience`}
                    className="w-full h-32 object-cover rounded-lg"
                  />

                  {/* Comment */}
                  <p className="text-sm text-muted-foreground">{experience.comment}</p>

                  {/* Destinations */}
                  {experience.destinations && experience.destinations.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {experience.destinations.map((destination, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {destination}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Location */}
                  {experience.location_name && (
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {experience.location_name}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
