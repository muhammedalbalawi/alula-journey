
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Camera, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const TouristExperiences: React.FC = () => {
  const { t } = useLanguage();

  const mockExperiences = [
    {
      id: 1,
      touristName: 'Ahmed Al-Rashid',
      rating: 5,
      comment: 'Incredible journey through AlUla! The guide was knowledgeable and the historical sites were breathtaking.',
      image: '/placeholder.svg',
      destinations: ['Hegra', 'Elephant Rock', 'Old Town']
    },
    {
      id: 2,
      touristName: 'Sarah Johnson',
      rating: 4,
      comment: 'Amazing experience! Loved the sunset at Elephant Rock. Well organized tour with great attention to detail.',
      image: '/placeholder.svg',
      destinations: ['Dadan', 'Mirror\'s Edge', 'Arts District']
    },
    {
      id: 3,
      touristName: 'Mohammed Hassan',
      rating: 5,
      comment: 'Perfect blend of history and adventure. The guides were professional and the locations were stunning.',
      image: '/placeholder.svg',
      destinations: ['Sharaan Reserve', 'Hegra', 'Old Town']
    }
  ];

  const mockPhotos = [
    { id: 1, url: '/placeholder.svg', caption: 'Sunset at Elephant Rock' },
    { id: 2, url: '/placeholder.svg', caption: 'Hegra Archaeological Site' },
    { id: 3, url: '/placeholder.svg', caption: 'AlUla Old Town' },
    { id: 4, url: '/placeholder.svg', caption: 'Desert Adventure' },
    { id: 5, url: '/placeholder.svg', caption: 'Cultural Experience' },
    { id: 6, url: '/placeholder.svg', caption: 'Mountain Views' }
  ];

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-24 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                  <p className="text-white text-xs text-center px-2">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tourist Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockExperiences.map((experience) => (
          <Card key={experience.id} className="shadow-desert">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Tourist Info */}
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{experience.touristName}</h4>
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
                  src={experience.image}
                  alt={`${experience.touristName}'s experience`}
                  className="w-full h-32 object-cover rounded-lg"
                />

                {/* Comment */}
                <p className="text-sm text-muted-foreground">{experience.comment}</p>

                {/* Destinations */}
                <div className="flex flex-wrap gap-1">
                  {experience.destinations.map((destination, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {destination}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
