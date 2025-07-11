import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const AboutSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen p-4 pt-20">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 shadow-desert">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-primary mb-4">{t('about')}</CardTitle>
            <div className="w-16 h-1 bg-gradient-to-r from-desert-gold to-heritage-amber mx-auto"></div>
          </CardHeader>
        </Card>

        {/* Vision 2030 */}
        <Card className="shadow-desert">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 rtl:space-x-reverse text-xl">
              <Crown className="w-6 h-6 text-desert-gold" />
              <span>Saudi Vision 2030</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed text-foreground">
              {t('aboutContent.vision')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-desert-gold/20 text-stone-brown">
                Cultural Heritage
              </Badge>
              <Badge variant="secondary" className="bg-sunset-orange/20 text-stone-brown">
                Sustainable Tourism
              </Badge>
              <Badge variant="secondary" className="bg-heritage-amber/20 text-stone-brown">
                Digital Innovation
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Youth Empowerment */}
        <Card className="shadow-desert">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 rtl:space-x-reverse text-xl">
              <Users className="w-6 h-6 text-sunset-orange" />
              <span>Empowering Local Communities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed text-foreground">
              {t('aboutContent.youth')}
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Local Guides</div>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">200+</div>
                <div className="text-sm text-muted-foreground">Happy Tourists</div>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">15+</div>
                <div className="text-sm text-muted-foreground">Partner Businesses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Industry Enhancement */}
        <Card className="shadow-desert">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 rtl:space-x-reverse text-xl">
              <TrendingUp className="w-6 h-6 text-heritage-amber" />
              <span>Tourism Industry Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed text-foreground">
              {t('aboutContent.industry')}
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-desert-gold/10 to-transparent rounded-lg">
                <span className="font-medium">Digital Platform Integration</span>
                <Badge variant="outline">✓ Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-sunset-orange/10 to-transparent rounded-lg">
                <span className="font-medium">Multilingual Support</span>
                <Badge variant="outline">✓ Arabic & English</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-heritage-amber/10 to-transparent rounded-lg">
                <span className="font-medium">Quality Assurance</span>
                <Badge variant="outline">✓ 4.8/5 Rating</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="shadow-desert bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold mb-4">Experience the Magic of AlUla</h3>
            <p className="text-muted-foreground mb-4">
              Join us in discovering the ancient wonders and modern innovations of Saudi Arabia's crown jewel.
            </p>
            <div className="flex justify-center space-x-4 rtl:space-x-reverse">
              <Badge variant="secondary" className="px-4 py-2">
                UNESCO World Heritage
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                NEOM Project Partner
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};