import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GuideEditor } from './GuideEditor';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Phone,
  Mail,
  Star,
  Languages,
  MapPin,
  Clock,
  DollarSign,
  Award,
  Filter,
  RefreshCw,
  Activity
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

export const EnhancedAdminView: React.FC = () => {
  const { toast } = useToast();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [guideToDelete, setGuideToDelete] = useState<Guide | null>(null);

  // Fetch guides on component mount and set up real-time updates
  useEffect(() => {
    fetchGuides();
    setupRealtimeUpdates();
  }, []);

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure default values for new fields
      const guidesWithDefaults = (data || []).map(guide => ({
        ...guide,
        languages: (guide as any).languages || ['English', 'Arabic'],
        availability_status: (guide as any).availability_status || 'available',
        hourly_rate: (guide as any).hourly_rate || 50,
        bio: (guide as any).bio || '',
        experience_years: (guide as any).experience_years || 1,
        certifications: (guide as any).certifications || ['AlUla Heritage Guide'],
        location: (guide as any).location || 'AlUla',
        specializations: guide.specializations || []
      }));
      
      setGuides(guidesWithDefaults);
    } catch (error: any) {
      console.error('Error fetching guides:', error);
      toast({
        title: 'Error',
        description: 'Failed to load guides.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const channel = supabase
      .channel('admin_guides_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guides'
        },
        (payload) => {
          console.log('Guide update received:', payload);
          fetchGuides(); // Refresh the list when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleCreateGuide = () => {
    setSelectedGuide(null);
    setIsEditorOpen(true);
  };

  const handleEditGuide = (guide: Guide) => {
    setSelectedGuide(guide);
    setIsEditorOpen(true);
  };

  const handleSaveGuide = (updatedGuide: Guide) => {
    if (selectedGuide) {
      // Update existing guide in the list
      setGuides(prev => 
        prev.map(g => g.id === updatedGuide.id ? updatedGuide : g)
      );
    } else {
      // Add new guide to the list
      setGuides(prev => [updatedGuide, ...prev]);
    }
    setIsEditorOpen(false);
    setSelectedGuide(null);
  };

  const handleDeleteGuide = (guide: Guide) => {
    setGuideToDelete(guide);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteGuide = async () => {
    if (!guideToDelete) return;

    try {
      const { error } = await supabase
        .from('guides')
        .delete()
        .eq('id', guideToDelete.id);

      if (error) throw error;

      setGuides(prev => prev.filter(g => g.id !== guideToDelete.id));
      toast({
        title: 'Success',
        description: 'Guide deleted successfully.'
      });
    } catch (error: any) {
      console.error('Error deleting guide:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete guide.',
        variant: 'destructive'
      });
    } finally {
      setDeleteDialogOpen(false);
      setGuideToDelete(null);
    }
  };

  // Filter guides based on search and filters
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = 
      guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.phone.includes(searchTerm) ||
      guide.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || guide.availability_status === statusFilter;
    
    const matchesLanguage = languageFilter === 'all' || 
      guide.languages.some(lang => lang.toLowerCase().includes(languageFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesLanguage;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      available: 'default',
      busy: 'secondary',
      offline: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getAvailableLanguages = () => {
    const languages = new Set<string>();
    guides.forEach(guide => 
      guide.languages.forEach(lang => languages.add(lang))
    );
    return Array.from(languages).sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Tour Guide Management</h2>
          <p className="text-muted-foreground">
            Comprehensive management of tour guide information and availability
          </p>
        </div>
        <Button onClick={handleCreateGuide}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Guide
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Total Guides</p>
                <p className="text-2xl font-bold">{guides.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="w-4 h-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Available</p>
                <p className="text-2xl font-bold">
                  {guides.filter(g => g.availability_status === 'available').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Busy</p>
                <p className="text-2xl font-bold">
                  {guides.filter(g => g.availability_status === 'busy').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500" />
              <div className="ml-2">
                <p className="text-sm font-medium">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {guides.length > 0 
                    ? (guides.reduce((sum, g) => sum + (g.rating || 0), 0) / guides.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search guides by name, email, phone, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>

            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                <SelectItem value="all">All Languages</SelectItem>
                {getAvailableLanguages().map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchGuides}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Guides List */}
      <Card>
        <CardHeader>
          <CardTitle>Tour Guides ({filteredGuides.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGuides.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold">No guides found</p>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || languageFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first tour guide'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGuides.map((guide) => (
                <div key={guide.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      {/* Basic Info */}
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold">{guide.name}</h3>
                          <p className="text-sm text-muted-foreground">{guide.guide_id}</p>
                        </div>
                        {getStatusBadge(guide.availability_status)}
                      </div>

                      {/* Contact & Location */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{guide.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{guide.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{guide.location}</span>
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="flex items-center space-x-2">
                        <Languages className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-1">
                          {guide.languages.map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Experience & Rating */}
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{guide.rating || 0} Rating</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4 text-muted-foreground" />
                          <span>{guide.experience_years} years exp.</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>{guide.hourly_rate} SAR/hour</span>
                        </div>
                      </div>

                      {/* Specializations */}
                      {guide.specializations && guide.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {guide.specializations.map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGuide(guide)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteGuide(guide)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guide Editor Dialog */}
      <GuideEditor
        guide={selectedGuide}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedGuide(null);
        }}
        onSave={handleSaveGuide}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {guideToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteGuide}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};