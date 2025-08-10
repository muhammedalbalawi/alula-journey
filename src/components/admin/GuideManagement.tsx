import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GuideEditor } from './GuideEditor';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Users,
  Star,
  Phone,
  Mail,
  MapPin,
  Languages,
  Award,
  Clock,
  DollarSign
} from 'lucide-react';

interface Guide {
  id: string;
  guide_id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  specializations: string[];
  status: string;
  languages: string[];
  availability_status: string;
  hourly_rate: number;
  bio: string;
  experience_years: number;
  certifications: string[];
  location: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  password?: string;
}

export const GuideManagement: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<any>(null);
  const { toast } = useToast();

  // Create Guide Form states
  const [newGuideName, setNewGuideName] = useState('');
  const [newGuideEmail, setNewGuideEmail] = useState('');
  const [newGuidePhone, setNewGuidePhone] = useState('');
  const [newGuideId, setNewGuideId] = useState('');
  const [newGuidePassword, setNewGuidePassword] = useState('');
  const [newGuideSpecializations, setNewGuideSpecializations] = useState('');
  const [newGuideStatus, setNewGuideStatus] = useState('available');
  const [isCreatingGuide, setIsCreatingGuide] = useState(false);

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuides((data || []).map(item => ({
        ...item,
        guide_id: item.guide_id || '',
        availability_status: item.availability_status || item.status || 'available',
        specializations: item.specializations || [],
        languages: item.languages || ['English', 'Arabic'],
        certifications: item.certifications || [],
        hourly_rate: item.hourly_rate || 50,
        experience_years: item.experience_years || 1,
        bio: item.bio || '',
        location: item.location || 'AlUla'
      })));
    } catch (error: any) {
      console.error('Error fetching guides:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch guides',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleCreateGuide = async () => {
    if (!newGuideName || !newGuideEmail || !newGuidePhone || !newGuideId || !newGuidePassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsCreatingGuide(true);
    try {
      const { data, error } = await supabase
        .from('guides')
        .insert([{
          guide_id: newGuideId,
          name: newGuideName,
          email: newGuideEmail,
          phone: newGuidePhone,
          password: newGuidePassword,
          status: newGuideStatus,
          specializations: newGuideSpecializations.split(',').map(s => s.trim()).filter(s => s),
          rating: 0,
          languages: ['English', 'Arabic'],
          availability_status: newGuideStatus,
          hourly_rate: 50,
          experience_years: 1,
          certifications: ['AlUla Heritage Guide'],
          location: 'AlUla',
          bio: ''
        }])
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Guide created successfully'
      });
      
      // Reset form
      setNewGuideName('');
      setNewGuideEmail('');
      setNewGuidePhone('');
      setNewGuideId('');
      setNewGuidePassword('');
      setNewGuideSpecializations('');
      setNewGuideStatus('available');
      
      fetchGuides();
    } catch (error: any) {
      console.error('Error creating guide:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create guide',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingGuide(false);
    }
  };

  const handleDeleteGuide = async (guideId: string) => {
    if (!confirm('Are you sure you want to delete this guide?')) return;

    try {
      const { error } = await supabase
        .from('guides')
        .delete()
        .eq('id', guideId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Guide deleted successfully'
      });
      
      fetchGuides();
    } catch (error: any) {
      console.error('Error deleting guide:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete guide',
        variant: 'destructive'
      });
    }
  };

  const handleStatusChange = async (guideId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('guides')
        .update({ 
          status: newStatus,
          availability_status: newStatus 
        })
        .eq('id', guideId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Guide status updated successfully'
      });
      
      fetchGuides();
    } catch (error: any) {
      console.error('Error updating guide status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update guide status',
        variant: 'destructive'
      });
    }
  };

  const handleEditGuide = (guide: Guide) => {
    // Convert to GuideEditor format
    const editorGuide = {
      ...guide,
      availability_status: guide.availability_status as 'available' | 'busy' | 'offline'
    };
    setEditingGuide(editorGuide);
    setIsEditorOpen(true);
  };

  const handleGuideUpdate = (updatedGuide: any) => {
    // Convert the updated guide to match our local interface
    const localGuide: Guide = {
      ...updatedGuide,
      guide_id: updatedGuide.guide_id || '',
      status: updatedGuide.status || updatedGuide.availability_status || 'available',
      availability_status: updatedGuide.availability_status || updatedGuide.status || 'available'
    };
    setGuides(prev => prev.map(g => g.id === localGuide.id ? localGuide : g));
    setEditingGuide(null);
    setIsEditorOpen(false);
    fetchGuides(); // Refresh the guides list
  };

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (guide.guide_id && guide.guide_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || guide.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-green-100 text-green-800">Available</Badge>;
      case 'busy':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Busy</Badge>;
      case 'offline':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Offline</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: guides.length,
    available: guides.filter(g => g.status === 'available').length,
    busy: guides.filter(g => g.status === 'busy').length,
    offline: guides.filter(g => g.status === 'offline').length,
    avgRating: guides.length > 0 ? (guides.reduce((sum, g) => sum + g.rating, 0) / guides.length).toFixed(1) : '0.0',
    avgRate: guides.length > 0 ? (guides.reduce((sum, g) => sum + g.hourly_rate, 0) / guides.length).toFixed(0) : '0'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading guides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Guide Management</h2>
          <p className="text-muted-foreground">Manage tour guides and their assignments</p>
        </div>
        
        <Button onClick={() => {
          setEditingGuide(null);
          setIsEditorOpen(true);
        }} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Guide
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Guides</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.busy}</div>
              <p className="text-xs text-muted-foreground">Busy</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.offline}</div>
              <p className="text-xs text-muted-foreground">Offline</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{stats.avgRating}</div>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.avgRate}</div>
              <p className="text-xs text-muted-foreground">Avg Rate/Hr</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Guide Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create New Tour Guide</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              placeholder="Guide Name*" 
              value={newGuideName}
              onChange={(e) => setNewGuideName(e.target.value)}
            />
            <Input 
              placeholder="Guide ID*" 
              value={newGuideId}
              onChange={(e) => setNewGuideId(e.target.value)}
              className="font-mono"
            />
            <Input 
              placeholder="Email*" 
              type="email" 
              value={newGuideEmail}
              onChange={(e) => setNewGuideEmail(e.target.value)}
            />
            <Input 
              placeholder="Phone*" 
              value={newGuidePhone}
              onChange={(e) => setNewGuidePhone(e.target.value)}
            />
            <Input 
              placeholder="Password*" 
              type="password" 
              value={newGuidePassword}
              onChange={(e) => setNewGuidePassword(e.target.value)}
            />
            <Select value={newGuideStatus} onValueChange={setNewGuideStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <div className="md:col-span-2">
              <Input 
                placeholder="Specializations (comma separated)" 
                value={newGuideSpecializations}
                onChange={(e) => setNewGuideSpecializations(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={handleCreateGuide} 
            className="w-full"
            disabled={isCreatingGuide}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreatingGuide ? 'Creating...' : 'Create Guide'}
          </Button>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Guides Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Tour Guides ({filteredGuides.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGuides.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No guides found</h3>
              <p className="text-muted-foreground mb-4">
                {guides.length === 0 
                  ? "No guides have been created yet." 
                  : "No guides match your current filters."}
              </p>
              {guides.length === 0 && (
                <Button onClick={() => {
                  setEditingGuide(null);
                  setIsEditorOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Guide
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guide Info</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Specializations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuides.map((guide) => (
                    <TableRow key={guide.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{guide.name}</div>
                          {guide.guide_id && (
                            <div className="text-sm text-muted-foreground font-mono">
                              ID: {guide.guide_id}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {guide.location}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {guide.email}
                          </div>
                          <div className="text-sm flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {guide.phone}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {guide.hourly_rate} SAR/hr
                          </div>
                          <div className="text-sm flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {guide.experience_years} years exp.
                          </div>
                          <div className="text-sm flex items-center gap-1">
                            <Languages className="w-3 h-3" />
                            {guide.languages.slice(0, 2).join(', ')}
                            {guide.languages.length > 2 && '...'}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {guide.specializations.slice(0, 2).map((spec, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {guide.specializations.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{guide.specializations.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Select
                          value={guide.status}
                          onValueChange={(value) => handleStatusChange(guide.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="busy">Busy</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{guide.rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditGuide(guide)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteGuide(guide.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guide Editor Dialog */}
      <GuideEditor
        guide={editingGuide}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingGuide(null);
        }}
        onSave={handleGuideUpdate}
      />
    </div>
  );
};