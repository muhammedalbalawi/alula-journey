import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Save, Edit, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TouristProfileProps {
  userId: string;
}

interface ProfileData {
  full_name: string;
  gender: string;
  nationality: string;
  contact_info: string;
}

export function TouristProfile({ userId }: TouristProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    gender: '',
    nationality: '',
    contact_info: ''
  });
  const [originalData, setOriginalData] = useState<ProfileData>({
    full_name: '',
    gender: '',
    nationality: '',
    contact_info: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, gender, nationality, contact_info')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create a basic one
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            user_type: 'tourist'
          });
        
        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          // Set empty profile data after creation
          const profile = {
            full_name: '',
            gender: '',
            nationality: '',
            contact_info: ''
          };
          setProfileData(profile);
          setOriginalData(profile);
        }
        return;
      }

      if (error) throw error;

      if (data) {
        const profile = {
          full_name: data.full_name || '',
          gender: data.gender || '',
          nationality: data.nationality || '',
          contact_info: data.contact_info || ''
        };
        setProfileData(profile);
        setOriginalData(profile);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile information.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: profileData.full_name,
          gender: profileData.gender,
          nationality: profileData.nationality,
          contact_info: profileData.contact_info,
          user_type: 'tourist'
        });

      if (error) throw error;

      setOriginalData(profileData);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Tourist Profile</span>
        </CardTitle>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            variant="outline"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button
              onClick={handleSave}
              size="sm"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={handleCancel}
              size="sm"
              variant="outline"
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          {isEditing ? (
            <Input
              value={profileData.full_name}
              onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter your full name"
              disabled={loading}
            />
          ) : (
            <p className="text-sm text-muted-foreground px-3 py-2 bg-muted/50 rounded-md">
              {profileData.full_name || 'Not specified'}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Gender</label>
          {isEditing ? (
            <Select 
              value={profileData.gender} 
              onValueChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground px-3 py-2 bg-muted/50 rounded-md">
              {profileData.gender ? (profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1)) : 'Not specified'}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nationality</label>
          {isEditing ? (
            <Input
              value={profileData.nationality}
              onChange={(e) => setProfileData(prev => ({ ...prev, nationality: e.target.value }))}
              placeholder="Enter your nationality"
              disabled={loading}
            />
          ) : (
            <p className="text-sm text-muted-foreground px-3 py-2 bg-muted/50 rounded-md">
              {profileData.nationality || 'Not specified'}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Contact Information</label>
          {isEditing ? (
            <Input
              value={profileData.contact_info}
              onChange={(e) => setProfileData(prev => ({ ...prev, contact_info: e.target.value }))}
              placeholder="Phone number or additional contact info"
              disabled={loading}
            />
          ) : (
            <p className="text-sm text-muted-foreground px-3 py-2 bg-muted/50 rounded-md">
              {profileData.contact_info || 'Not specified'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}