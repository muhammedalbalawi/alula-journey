import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Shield, 
  CheckCircle,
  Clock,
  MessageSquare,
  Plus,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { GuideManagement } from './admin/GuideManagement';
import { DriverManagement } from './admin/DriverManagement';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Tourist {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  status: 'active' | 'pending' | 'assigned';
  assignedGuide?: string;
}

interface Guide {
  id: string;
  guide_id?: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  specializations: string[];
  status: 'available' | 'busy' | 'offline';
}

interface Assignment {
  id: string;
  touristId: string;
  guideId: string;
  tourName: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
}

interface GuideRequestAdmin {
  id: string;
  tourist_id: string;
  request_message: string;
  status: 'pending' | 'approved' | 'rejected';
  assigned_guide_id?: string;
  admin_response?: string;
  created_at: string;
  adults_count?: number;
  children_count?: number;
  profiles?: {
    full_name: string;
    contact_info: string;
    nationality: string;
    gender: string;
  };
  guides?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const AdminView: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [guideRequests, setGuideRequests] = useState<GuideRequestAdmin[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [selectedTourist, setSelectedTourist] = useState('');
  const [selectedGuide, setSelectedGuide] = useState('');
  const [tourName, setTourName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Reassignment states
  const [reassignmentDialogOpen, setReassignmentDialogOpen] = useState(false);
  const [reassignmentAssignmentId, setReassignmentAssignmentId] = useState<string>('');
  const [reassignmentNewGuideId, setReassignmentNewGuideId] = useState<string>('');
  const [reassignmentTouristId, setReassignmentTouristId] = useState<string>('');

  // Search functionality
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch data from database
  useEffect(() => {
    if (isLoggedIn) {
      console.log('Admin logged in, fetching all data...');
      fetchGuides();
      fetchGuideRequests();
      fetchAssignments();
      fetchTourists();
      setupRealtimeUpdates();
      
      setTimeout(() => {
        console.log('Secondary fetch to ensure all tourists are loaded...');
        fetchTourists();
      }, 1000);
    }
  }, [isLoggedIn]);

  const fetchTourists = async () => {
    try {
      console.log('Starting to fetch all tourists from database...');
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          contact_info,
          phone_number,
          nationality,
          gender,
          user_type,
          created_at
        `)
        .eq('user_type', 'tourist')
        .order('full_name', { ascending: true });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Raw profiles data from database:', profilesData);
      console.log('Number of tourist profiles found:', profilesData?.length || 0);

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('activities')
        .select('tourist_id, assignment_status, tour_guide_id')
        .in('assignment_status', ['pending', 'active'])
        .not('tour_name', 'is', null);

      if (assignmentsError) {
        console.warn('Could not fetch assignments:', assignmentsError);
      } else {
        console.log('Tour assignments data:', assignmentsData);
      }

      const assignmentMap = (assignmentsData || []).reduce((acc, assignment) => {
        acc[assignment.tourist_id] = {
          status: assignment.assignment_status,
          assignedGuide: 'Guide Assigned'
        };
        return acc;
      }, {} as Record<string, { status: string; assignedGuide: string }>);

      const formattedTourists: Tourist[] = (profilesData || []).map(profile => {
        const assignmentStatus = assignmentMap[profile.id]?.status;
        const status: 'active' | 'pending' | 'assigned' = 
          assignmentStatus === 'active' ? 'assigned' : 
          assignmentStatus === 'pending' ? 'pending' : 'active';
        
        const tourist = {
          id: profile.id,
          name: profile.full_name || 'Unnamed Tourist',
          email: profile.contact_info || '',
          phone: profile.phone_number || profile.contact_info || '',
          nationality: profile.nationality || 'Not specified',
          status,
          assignedGuide: assignmentMap[profile.id]?.assignedGuide || ''
        };
        console.log('Formatted tourist:', tourist);
        return tourist;
      });

      console.log('Final formatted tourists array:', formattedTourists);
      console.log('Total tourists being set in state:', formattedTourists.length);
      
      setTourists(formattedTourists);
      
      setTimeout(() => {
        console.log('Current tourists state after update:', formattedTourists.length);
      }, 100);
      
    } catch (error: any) {
      console.error('Error fetching tourists:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tourists. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          id,
          tourist_id,
          tour_guide_id,
          tour_name,
          start_date,
          end_date,
          assignment_status,
          created_at
        `)
        .not('tour_name', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedAssignments: Assignment[] = (data || []).map(item => ({
        id: item.id,
        touristId: item.tourist_id,
        guideId: item.tour_guide_id,
        tourName: item.tour_name || 'AlUla Heritage Tour',
        startDate: item.start_date,
        endDate: item.end_date,
        status: item.assignment_status as 'pending' | 'active' | 'completed',
        createdAt: item.created_at
      }));
      
      setAssignments(formattedAssignments);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch assignments',
        variant: 'destructive'
      });
    }
  };

  const setupRealtimeUpdates = () => {
    const channel = supabase
      .channel('admin-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guide_requests'
        },
        () => {
          console.log('Guide requests changed, refreshing...');
          fetchGuideRequests();
          fetchTourists();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change detected:', payload);
          if ((payload.new as any)?.user_type === 'tourist' || (payload.old as any)?.user_type === 'tourist') {
            fetchTourists();
          }
          fetchGuideRequests();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        () => {
          console.log('Tour assignments changed, refreshing...');
          fetchTourists();
          fetchAssignments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guides'
        },
        () => {
          console.log('Guides changed, refreshing...');
          fetchGuides();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuides((data || []).map(item => ({
        ...item,
        status: item.status as 'available' | 'busy' | 'offline'
      })));
    } catch (error: any) {
      console.error('Error fetching guides:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch guides',
        variant: 'destructive'
      });
    }
  };

  const fetchGuideRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('guide_requests')
        .select(`
          *,
          profiles (
            full_name,
            contact_info,
            nationality,
            gender
          ),
          guides (
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuideRequests((data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected'
      })));
    } catch (error: any) {
      console.error('Error fetching guide requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch guide requests',
        variant: 'destructive'
      });
    }
  };

  const handleLogin = () => {
    if (adminId === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      toast({
        title: 'Login Successful',
        description: 'Welcome to the Admin Dashboard!'
      });
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Try admin/admin123',
        variant: 'destructive'
      });
    }
  };

  const handleAssignGuide = async () => {
    if (!selectedTourist || !selectedGuide || !tourName || !startDate || !endDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([{
          tourist_id: selectedTourist,
          tour_guide_id: selectedGuide,
          tour_name: tourName,
          start_date: startDate,
          end_date: endDate,
          assignment_status: 'active',
          activity_name: 'Tour Assignment',
          location_name: 'AlUla',
          category: 'heritage',
          scheduled_date: startDate,
          scheduled_time: '09:00:00',
          duration_minutes: 480,
          status: 'planned'
        }])
        .select()
        .single();

      if (error) throw error;

      try {
        await supabase.functions.invoke('send-assignment-notification', {
          body: {
            touristId: selectedTourist,
            guideId: selectedGuide,
            tourName,
            startDate,
            endDate
          }
        });
      } catch (emailError) {
        console.error('Error sending notification emails:', emailError);
      }

      const newAssignment: Assignment = {
        id: data.id,
        touristId: selectedTourist,
        guideId: selectedGuide,
        tourName,
        startDate,
        endDate,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      setAssignments(prev => [...prev, newAssignment]);

      setSelectedTourist('');
      setSelectedGuide('');
      setTourName('');
      setStartDate('');
      setEndDate('');

      toast({
        title: 'Assignment Created',
        description: 'Tour guide assigned successfully and notifications sent!'
      });
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create assignment',
        variant: 'destructive'
      });
    }
  };

  const removeAssignment = (assignmentId: string) => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    toast({
      title: 'Assignment Removed',
      description: 'Assignment has been removed successfully.'
    });
  };

  const handleRequestResponse = async (requestId: string, status: 'approved' | 'rejected', guideId?: string, response?: string) => {
    try {
      const updateData: any = {
        status,
        admin_response: response || ''
      };

      if (status === 'approved' && guideId) {
        updateData.assigned_guide_id = guideId;
      }

      const { error } = await supabase
        .from('guide_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      if (status === 'approved' && guideId) {
        const request = guideRequests.find(r => r.id === requestId);
        if (request) {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() + 1);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 2);

          await supabase
            .from('activities')
            .insert([{
              tourist_id: request.tourist_id,
              tour_guide_id: guideId,
              tour_name: 'AlUla Heritage Tour',
              start_date: startDate.toISOString().split('T')[0],
              end_date: endDate.toISOString().split('T')[0],
              assignment_status: 'active',
              activity_name: 'Tour Assignment',
              location_name: 'AlUla',
              category: 'heritage',
              scheduled_date: startDate.toISOString().split('T')[0],
              scheduled_time: '09:00:00',
              duration_minutes: 480,
              status: 'planned'
            }]);
        }
      }

      fetchGuideRequests();
      fetchAssignments();
      fetchTourists();

      toast({
        title: 'Request Updated',
        description: `Request ${status} successfully!`
      });
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'active':
      case 'assigned':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTouristName = (touristId: string) => {
    const tourist = tourists.find(t => t.id === touristId);
    return tourist?.name || 'Unknown Tourist';
  };

  const getGuideName = (guideId: string) => {
    const guide = guides.find(g => g.id === guideId);
    return guide?.name || 'Unknown Guide';
  };

  const openTouristReassignmentDialog = (touristId: string) => {
    setReassignmentTouristId(touristId);
    setReassignmentDialogOpen(true);
  };

  const updateAssignmentStatus = async (assignmentId: string, status: 'active' | 'completed') => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ assignment_status: status })
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(prev => 
        prev.map(a => 
          a.id === assignmentId 
            ? { ...a, status: status as 'pending' | 'active' | 'completed' }
            : a
        )
      );

      toast({
        title: 'Status Updated',
        description: `Assignment ${status}!`
      });
    } catch (error: any) {
      console.error('Error updating assignment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update assignment status',
        variant: 'destructive'
      });
    }
  };

  const filteredRequests = guideRequests.filter(request =>
    request.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.request_message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.profiles?.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-effect">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Portal
            </CardTitle>
            <p className="text-muted-foreground">
              Sign in to access the administration dashboard
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin ID</label>
              <Input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter admin ID"
                className="glass-effect transition-all duration-200 focus:shadow-glow"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="glass-effect transition-all duration-200 focus:shadow-glow"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full hover:shadow-glow transition-all duration-300"
              disabled={!adminId || !password}
            >
              Sign In
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Demo credentials: admin / admin123
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-blue-600/20">
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold text-blue-800 mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage tour guide assignments and monitor activities</p>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="guides">Guide Management</TabsTrigger>
            <TabsTrigger value="drivers">Driver Management</TabsTrigger>
            <TabsTrigger value="requests">Tourist Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Tourists</p>
                    <p className="text-xl font-semibold">{tourists.length}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Available Guides</p>
                    <p className="text-xl font-semibold">{guides.filter(g => g.status === 'available').length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Assignments</p>
                    <p className="text-xl font-semibold">{assignments.filter(a => a.status === 'pending').length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Tours</p>
                    <p className="text-xl font-semibold">{assignments.filter(a => a.status === 'active').length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assignment Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Assign Tour Guide</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Tourist</label>
                    <Select value={selectedTourist} onValueChange={setSelectedTourist}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a tourist">
                          {selectedTourist ? (
                            <div className="flex flex-col text-left">
                              <span className="font-medium">{tourists.find(t => t.id === selectedTourist)?.name || 'Unknown Tourist'}</span>
                              <span className="text-xs text-muted-foreground">{tourists.find(t => t.id === selectedTourist)?.email}</span>
                            </div>
                          ) : (
                            "Choose a tourist"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {tourists.length > 0 ? (
                          tourists.map((tourist) => (
                            <SelectItem key={tourist.id} value={tourist.id}>
                              <div className="flex flex-col text-left py-1">
                                <span className="font-medium text-foreground">{tourist.name}</span>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <span>{tourist.nationality}</span>
                                  <span>•</span>
                                  <span>{tourist.phone || tourist.email}</span>
                                  <Badge 
                                    variant={tourist.status === 'assigned' ? 'default' : tourist.status === 'pending' ? 'secondary' : 'outline'}
                                    className="ml-auto text-xs"
                                  >
                                    {tourist.status}
                                  </Badge>
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-tourists" disabled>
                            <span className="text-muted-foreground italic">No tourists available</span>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Guide</label>
                    <Select value={selectedGuide} onValueChange={setSelectedGuide}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a guide" />
                      </SelectTrigger>
                      <SelectContent>
                        {guides.filter(g => g.status === 'available').map((guide) => (
                          <SelectItem key={guide.id} value={guide.id}>
                            {guide.name} - ⭐ {guide.rating} ({guide.specializations.join(', ')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tour Name</label>
                    <Input
                      placeholder="Enter tour name"
                      value={tourName}
                      onChange={(e) => setTourName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={handleAssignGuide} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                  </Button>
                </CardContent>
              </Card>

              {/* Current Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Current Assignments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{assignment.tourName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {getTouristName(assignment.touristId)} → {getGuideName(assignment.guideId)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {assignment.startDate} to {assignment.endDate}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            {getStatusBadge(assignment.status)}
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openTouristReassignmentDialog(assignment.touristId)}
                                className="text-blue-600 hover:text-blue-700"
                                title="Reassign Guide"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeAssignment(assignment.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {assignment.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => updateAssignmentStatus(assignment.id, 'active')}
                            >
                              Activate
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tourists List */}
            <Card>
              <CardHeader>
                <CardTitle>All Tourists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tourists.map((tourist) => (
                    <div key={tourist.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{tourist.name}</h4>
                          <p className="text-sm text-muted-foreground">{tourist.email}</p>
                          <p className="text-sm text-muted-foreground">{tourist.phone}</p>
                          <p className="text-sm text-muted-foreground">{tourist.nationality}</p>
                        </div>
                        {getStatusBadge(tourist.status)}
                      </div>
                      {tourist.assignedGuide && (
                        <p className="text-sm text-blue-600">
                          Guide: {getGuideName(tourist.assignedGuide)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides">
            <GuideManagement />
          </TabsContent>

          <TabsContent value="drivers">
            <DriverManagement />
          </TabsContent>

          <TabsContent value="requests">
            {/* Guide Requests Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Tourist Requests</span>
                </CardTitle>
                <div className="flex items-center space-x-2 mt-4">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{request.profiles?.full_name || 'Unknown Tourist'}</h4>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.profiles?.nationality} • {request.profiles?.contact_info}
                          </p>
                          <p className="text-sm mb-2">{request.request_message}</p>
                          {request.adults_count && (
                            <p className="text-xs text-muted-foreground">
                              Adults: {request.adults_count} {request.children_count ? `• Children: ${request.children_count}` : ''}
                            </p>
                          )}
                          {request.admin_response && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                              <strong>Admin Response:</strong> {request.admin_response}
                            </div>
                          )}
                          {request.guides && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                              <strong>Assigned Guide:</strong> {request.guides.name} ({request.guides.email})
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Select onValueChange={(guideId) => handleRequestResponse(request.id, 'approved', guideId)}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Assign Guide" />
                            </SelectTrigger>
                            <SelectContent>
                              {guides.filter(g => g.status === 'available').map((guide) => (
                                <SelectItem key={guide.id} value={guide.id}>
                                  {guide.name} - ⭐ {guide.rating}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestResponse(request.id, 'rejected', undefined, 'Request rejected by admin')}
                            className="text-red-600 hover:text-red-700"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};