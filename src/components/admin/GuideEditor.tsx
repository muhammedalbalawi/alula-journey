import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Save, 
  X, 
  Edit, 
  Phone, 
  Mail, 
  Star, 
  MapPin, 
  Languages, 
  Clock,
  DollarSign,
  Award,
  Calendar
} from 'lucide-react';

interface Guide {
  id: string;
  guide_id: string;
  name: string;
  email: string;
  phone: string;
  languages: string[];
  availability_status: 'available' | 'busy' | 'offline';
  hourly_rate: number;
  bio: string;
  experience_years: number;
  certifications: string[];
  location: string;
  specializations: string[];
  rating: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface GuideEditorProps {
  guide: Guide | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (guide: Guide) => void;
}

const AVAILABLE_LANGUAGES = [
  'Arabic',
  'English', 
  'French',
  'German',
  'Spanish',
  'Italian',
  'Chinese',
  'Japanese',
  'Korean',
  'Hindi',
  'Urdu'
];

const SPECIALIZATION_OPTIONS = [
  'Heritage Tours',
  'Adventure Tourism',
  'Archaeological Sites',
  'Cultural Heritage',
  'Desert Safari',
  'Photography Tours',
  'Hiking & Trekking',
  'Historical Sites',
  'Art & Culture',
  'Culinary Tours',
  'Astronomy Tours',
  'Wellness Tourism'
];

const CERTIFICATION_OPTIONS = [
  'AlUla Heritage Guide',
  'Adventure Tourism Certificate',
  'First Aid Certified',
  'Desert Safety Training',
  'Archaeological Tour Guide',
  'Cultural Heritage Specialist',
  'Photography Guide Certified',
  'Wilderness First Aid',
  'Professional Tour Guide License',
  'Language Translation Certificate'
];

export const GuideEditor: React.FC<GuideEditorProps> = ({
  guide,
  isOpen,
  onClose,
  onSave
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Guide>>({
    name: '',
    email: '',
    phone: '',
    languages: ['English', 'Arabic'],
    availability_status: 'available',
    hourly_rate: 50,
    bio: '',
    experience_years: 1,
    certifications: ['AlUla Heritage Guide'],
    location: 'AlUla',
    specializations: [],
    status: 'available'
  });

  useEffect(() => {
    if (guide) {
      setFormData({
        ...guide,
        languages: guide.languages || ['English', 'Arabic'],
        certifications: guide.certifications || ['AlUla Heritage Guide'],
        specializations: guide.specializations || []
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        languages: ['English', 'Arabic'],
        availability_status: 'available',
        hourly_rate: 50,
        bio: '',
        experience_years: 1,
        certifications: ['AlUla Heritage Guide'],
        location: 'AlUla',
        specializations: [],
        status: 'available'
      });
    }
  }, [guide]);

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages?.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...(prev.languages || []), language]
    }));
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations?.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...(prev.specializations || []), specialization]
    }));
  };

  const handleCertificationToggle = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.includes(certification)
        ? prev.certifications.filter(c => c !== certification)
        : [...(prev.certifications || []), certification]
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields (Name, Email, Phone).',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.languages || formData.languages.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one language.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const guideData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        languages: formData.languages,
        availability_status: formData.availability_status,
        hourly_rate: formData.hourly_rate,
        bio: formData.bio || '',
        experience_years: formData.experience_years || 1,
        certifications: formData.certifications || [],
        location: formData.location || 'AlUla',
        specializations: formData.specializations || [],
        status: formData.status || 'available',
        updated_at: new Date().toISOString()
      };

      if (guide?.id) {
        // Update existing guide
        const { data, error } = await supabase
          .from('guides')
          .update(guideData)
          .eq('id', guide.id)
          .select()
          .single();

        if (error) throw error;
        const updatedGuide = { ...formData, ...data } as Guide;
        onSave(updatedGuide);
        toast({
          title: 'Success',
          description: 'Guide information updated successfully!'
        });
      } else {
        // Create new guide
        const { data, error } = await supabase
          .from('guides')
          .insert({
            ...guideData,
            guide_id: `guide_${Date.now()}`,
            password: 'defaultpassword123', // You should generate a secure password
            rating: 0,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        const newGuide = { ...formData, ...data } as Guide;
        onSave(newGuide);
        toast({
          title: 'Success',
          description: 'New guide created successfully!'
        });
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving guide:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save guide information.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>{guide ? 'Edit Guide Information' : 'Create New Guide'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Guide's full name"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="guide@example.com"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+966123456789"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="AlUla"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Availability Status</label>
                <Select
                  value={formData.availability_status}
                  onValueChange={(value: 'available' | 'busy' | 'offline') => 
                    setFormData(prev => ({ ...prev, availability_status: value }))
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hourly Rate (SAR)</label>
                <Input
                  type="number"
                  value={formData.hourly_rate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
                  placeholder="50"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Experience Years</label>
                <Input
                  type="number"
                  value={formData.experience_years || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                  placeholder="2"
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Languages className="w-5 h-5" />
                <span>Languages Spoken *</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {AVAILABLE_LANGUAGES.map((language) => (
                  <div key={language} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lang-${language}`}
                      checked={formData.languages?.includes(language) || false}
                      onCheckedChange={() => handleLanguageToggle(language)}
                      disabled={loading}
                    />
                    <label 
                      htmlFor={`lang-${language}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {language}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">Selected languages:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.languages?.map((lang) => (
                    <Badge key={lang} variant="secondary">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Specializations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SPECIALIZATION_OPTIONS.map((specialization) => (
                  <div key={specialization} className="flex items-center space-x-2">
                    <Checkbox
                      id={`spec-${specialization}`}
                      checked={formData.specializations?.includes(specialization) || false}
                      onCheckedChange={() => handleSpecializationToggle(specialization)}
                      disabled={loading}
                    />
                    <label 
                      htmlFor={`spec-${specialization}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {specialization}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Certifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CERTIFICATION_OPTIONS.map((certification) => (
                  <div key={certification} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cert-${certification}`}
                      checked={formData.certifications?.includes(certification) || false}
                      onCheckedChange={() => handleCertificationToggle(certification)}
                      disabled={loading}
                    />
                    <label 
                      htmlFor={`cert-${certification}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {certification}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about this guide's background, experience, and expertise..."
                rows={4}
                disabled={loading}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Guide'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};